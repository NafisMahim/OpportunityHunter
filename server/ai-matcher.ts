import { GoogleGenAI } from "@google/genai";
import type { Opportunity, User } from "../shared/schema";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface MatchingResult {
  opportunityId: number;
  relevancyScore: number;
  matchReason: string;
}

export class AIOpportunityMatcher {
  async matchOpportunitiesToUser(user: User, opportunities: Opportunity[]): Promise<MatchingResult[]> {
    if (!user.major && !user.minor) {
      return [];
    }

    try {
      console.log(`Using AI to match ${opportunities.length} opportunities for ${user.major || user.minor}`);
      
      // For large datasets, use fallback matching to avoid rate limits
      if (opportunities.length > 50) {
        console.log(`Large dataset (${opportunities.length} opportunities), using enhanced fallback matching`);
        return this.strictFallbackMatching(user, opportunities);
      }

      // Process opportunities in smaller batches to avoid timeouts
      const batchSize = 8;
      const allResults: MatchingResult[] = [];
      
      for (let i = 0; i < opportunities.length; i += batchSize) {
        const batch = opportunities.slice(i, i + batchSize);
        try {
          const batchResults = await this.analyzeOpportunityBatch(user, batch);
          allResults.push(...batchResults);
          // Add delay between batches to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.log(`Batch ${i / batchSize + 1} failed, using fallback for remaining opportunities`);
          const fallbackResults = this.strictFallbackMatching(user, opportunities.slice(i));
          allResults.push(...fallbackResults);
          break;
        }
      }
      
      // Remove duplicates and filter results (MUCH MORE AGGRESSIVE)
      const uniqueResults = this.removeDuplicatesByTitle(allResults, opportunities);
      const filteredResults = uniqueResults
        .filter(result => result.relevancyScore >= 70)
        .sort((a, b) => b.relevancyScore - a.relevancyScore);
        
      console.log(`AI analysis complete: ${filteredResults.length} relevant opportunities found`);
      return filteredResults;
      
    } catch (error) {
      console.error('AI matching failed, using fallback:', error);
      return this.strictFallbackMatching(user, opportunities);
    }
  }

  private async analyzeOpportunityBatch(user: User, opportunities: Opportunity[]): Promise<MatchingResult[]> {
    const systemPrompt = `You are an expert academic advisor. Analyze each opportunity for relevance to the student's specific academic field.

Student Profile:
- Major: ${user.major || "Not specified"}
- Minor: ${user.minor || "Not specified"}

IMPORTANT INSTRUCTIONS:
1. Be STRICT with scoring - Only score 70+ if the opportunity is truly relevant to their specific academic field
2. Consider ANY academic field the student enters, not just common majors
3. Look for direct connections between the opportunity and their field of study
4. For creative fields (art, design, etc.), look for creative/visual elements
5. For technical fields, look for technical/analytical components
6. For business fields, look for leadership/entrepreneurship aspects
7. For humanities, look for research/writing/cultural elements

Respond with JSON:
{
  "matches": [
    {
      "opportunityId": number,
      "relevancyScore": number,
      "matchReason": "specific explanation of how this opportunity relates to [major/minor] field"
    }
  ]
}`;

    const opportunitiesText = opportunities.map(opp => 
      `ID: ${opp.id}
Title: ${opp.title}
Type: ${opp.type}
Organization: ${opp.organization}
Description: ${opp.description.substring(0, 400)}
Tags: ${opp.tags.join(', ')}
---`
    ).join('\n\n');

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            matches: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  opportunityId: { type: "number" },
                  relevancyScore: { type: "number" },
                  matchReason: { type: "string" }
                },
                required: ["opportunityId", "relevancyScore", "matchReason"]
              }
            }
          },
          required: ["matches"]
        }
      },
      contents: `Analyze these opportunities for academic relevance:\n\n${opportunitiesText}`,
    });

    const result = JSON.parse(response.text || "{}");
    return result.matches || [];
  }

  private strictFallbackMatching(user: User, opportunities: Opportunity[]): MatchingResult[] {
    const userMajor = (user.major || "").toLowerCase().trim();
    const userMinor = (user.minor || "").toLowerCase().trim();
    
    const results: MatchingResult[] = [];

    for (const opp of opportunities) {
      const oppText = `${opp.title} ${opp.description} ${opp.organization} ${opp.tags.join(' ')}`.toLowerCase();
      
      let maxScore = 0;
      let bestReason = "";
      let matchedTerms: string[] = [];
      
      // Check major match - use direct keyword matching and related terms
      if (userMajor) {
        const majorKeywords = this.generateKeywordsForField(userMajor);
        const matchedKeywords = majorKeywords.filter(keyword => oppText.includes(keyword));
        
        if (matchedKeywords.length > 0) {
          const score = Math.min(95, 75 + (matchedKeywords.length * 3));
          if (score > maxScore) {
            maxScore = score;
            matchedTerms = matchedKeywords;
            bestReason = `Directly relevant to ${user.major} - mentions ${matchedKeywords.slice(0, 3).join(', ')}`;
          }
        }
      }

      // Check minor match
      if (userMinor && maxScore < 85) {
        const minorKeywords = this.generateKeywordsForField(userMinor);
        const matchedKeywords = minorKeywords.filter(keyword => oppText.includes(keyword));
        
        if (matchedKeywords.length > 0) {
          const score = Math.min(85, 70 + (matchedKeywords.length * 2));
          if (score > maxScore) {
            maxScore = score;
            matchedTerms = matchedKeywords;
            bestReason = `Related to your minor in ${user.minor} - involves ${matchedKeywords.slice(0, 2).join(', ')}`;
          }
        }
      }

      // Only include opportunities with 70+ relevancy
      if (maxScore >= 70) {
        results.push({
          opportunityId: opp.id,
          relevancyScore: maxScore,
          matchReason: bestReason || `Relevant to your academic interests in ${user.major || user.minor}`
        });
      }
    }

    return results.sort((a, b) => b.relevancyScore - a.relevancyScore);
  }

  private generateKeywordsForField(field: string): string[] {
    const fieldLower = field.toLowerCase();
    
    // Base keywords - the field itself and common variations
    const baseKeywords = [
      fieldLower,
      fieldLower.replace(/\s+/g, ''), // Remove spaces
      ...fieldLower.split(' '), // Individual words
    ];

    // Predefined keyword sets for known fields
    const fieldKeywords: { [key: string]: string[] } = {
      'biology': ['biology', 'biological', 'biomedical', 'life sciences', 'genetics', 'molecular', 'cellular', 'ecology', 'microbiology', 'biochemistry', 'biotechnology', 'medical', 'health', 'anatomy', 'physiology', 'pre-med', 'research', 'lab', 'science'],
      'computer science': ['computer', 'programming', 'coding', 'software', 'tech', 'technology', 'ai', 'artificial intelligence', 'machine learning', 'cybersecurity', 'web development', 'app development', 'data science', 'engineering', 'programming'],
      'chemistry': ['chemistry', 'chemical', 'organic', 'inorganic', 'analytical', 'pharmaceutical', 'drug', 'molecule', 'synthesis', 'lab', 'research', 'science'],
      'physics': ['physics', 'physical', 'quantum', 'mechanics', 'astronomy', 'astrophysics', 'engineering', 'research', 'science'],
      'mathematics': ['mathematics', 'math', 'statistics', 'calculus', 'algebra', 'geometry', 'data science', 'analytics', 'quantitative', 'finance'],
      'business': ['business', 'entrepreneurship', 'marketing', 'finance', 'economics', 'management', 'consulting', 'startup', 'leadership', 'commerce'],
      'psychology': ['psychology', 'psychological', 'mental health', 'behavioral', 'cognitive', 'therapy', 'counseling', 'social work', 'research'],
      'engineering': ['engineering', 'mechanical', 'electrical', 'civil', 'aerospace', 'biomedical engineering', 'robotics', 'automation', 'design', 'manufacturing'],
      'english': ['english', 'literature', 'writing', 'journalism', 'communications', 'media', 'publishing', 'creative writing', 'humanities'],
      'art': ['art', 'design', 'creative', 'visual', 'graphic design', 'painting', 'sculpture', 'digital art', 'photography', 'animation'],
      'history': ['history', 'historical', 'archaeology', 'anthropology', 'humanities', 'cultural', 'museum'],
      'political science': ['political', 'politics', 'government', 'policy', 'international relations', 'law', 'legal', 'public service'],
      'economics': ['economics', 'economic', 'finance', 'business', 'market', 'trade', 'policy'],
      'sociology': ['sociology', 'social', 'society', 'community', 'research', 'humanities'],
      'philosophy': ['philosophy', 'philosophical', 'ethics', 'logic', 'humanities'],
      'education': ['education', 'teaching', 'pedagogy', 'curriculum', 'school'],
      'nursing': ['nursing', 'nurse', 'healthcare', 'medical', 'patient care', 'health'],
      'medicine': ['medicine', 'medical', 'doctor', 'physician', 'healthcare', 'clinical', 'patient'],
      'law': ['law', 'legal', 'attorney', 'lawyer', 'court', 'justice', 'policy'],
      'journalism': ['journalism', 'journalist', 'media', 'news', 'reporting', 'communications'],
      'music': ['music', 'musical', 'composition', 'performance', 'audio', 'sound'],
      'theater': ['theater', 'theatre', 'drama', 'performance', 'acting', 'stage'],
      'film': ['film', 'cinema', 'movie', 'video', 'production', 'media'],
      'anthropology': ['anthropology', 'anthropological', 'cultural', 'society', 'research'],
      'architecture': ['architecture', 'architectural', 'design', 'building', 'construction'],
      'environmental science': ['environmental', 'environment', 'ecology', 'sustainability', 'conservation', 'climate']
    };

    // Find matching predefined keywords
    for (const [key, keywords] of Object.entries(fieldKeywords)) {
      if (fieldLower.includes(key) || key.includes(fieldLower) || 
          fieldLower.split(' ').some(word => key.includes(word))) {
        baseKeywords.push(...keywords);
        break;
      }
    }

    // Add common academic terms
    baseKeywords.push('research', 'study', 'program', 'academic', 'scholarship', 'education');

    // Remove duplicates and filter out very short words
    return [...new Set(baseKeywords)].filter(keyword => keyword.length > 2);
  }

  private removeDuplicates(results: MatchingResult[]): MatchingResult[] {
    const seen = new Set<number>();
    const seenTitles = new Map<string, number>();
    
    return results.filter(result => {
      // Remove exact duplicates by ID
      if (seen.has(result.opportunityId)) {
        return false;
      }
      
      // Remove similar titles (aggressive duplicate detection)
      const cleanTitle = result.opportunityId.toString(); // We'll check against actual opportunities
      for (const [existingTitle, existingScore] of seenTitles.entries()) {
        if (this.areTitlesSimilar(existingTitle, cleanTitle)) {
          // Keep the one with higher score
          if (result.relevancyScore > existingScore) {
            // Remove the previous one and add this one
            seenTitles.delete(existingTitle);
            seenTitles.set(cleanTitle, result.relevancyScore);
            seen.add(result.opportunityId);
            return true;
          } else {
            return false; // Skip this duplicate
          }
        }
      }
      
      seen.add(result.opportunityId);
      seenTitles.set(cleanTitle, result.relevancyScore);
      return true;
    });
  }
  
  private removeDuplicatesByTitle(results: MatchingResult[], opportunities: Opportunity[]): MatchingResult[] {
    const seen = new Set<number>();
    const seenTitlePatterns = new Set<string>();
    
    return results.filter(result => {
      // Skip if we've already seen this exact opportunity ID
      if (seen.has(result.opportunityId)) {
        return false;
      }
      
      // Find the actual opportunity
      const opportunity = opportunities.find(o => o.id === result.opportunityId);
      if (!opportunity) return false;
      
      // Create a normalized pattern for the title
      const normalizedTitle = this.normalizeTitle(opportunity.title);
      const titlePattern = `${normalizedTitle}|${opportunity.organization.toLowerCase()}`;
      
      // Check if we've seen a similar title pattern
      for (const existingPattern of seenTitlePatterns) {
        if (this.arePatternsSimlar(titlePattern, existingPattern)) {
          console.log(`DUPLICATE DETECTED: "${opportunity.title}" matches existing pattern`);
          return false; // Skip this duplicate
        }
      }
      
      seen.add(result.opportunityId);
      seenTitlePatterns.add(titlePattern);
      return true;
    });
  }
  
  private normalizeTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  private arePatternsSimlar(pattern1: string, pattern2: string): boolean {
    const [title1, org1] = pattern1.split('|');
    const [title2, org2] = pattern2.split('|');
    
    // Same organization and similar titles = duplicate
    if (org1 === org2) {
      const words1 = title1.split(/\s+/);
      const words2 = title2.split(/\s+/);
      const intersection = words1.filter(word => words2.includes(word));
      const similarity = intersection.length / Math.max(words1.length, words2.length);
      return similarity > 0.6; // 60% word overlap = duplicate
    }
    
    return false;
  }



  private fallbackMatching(user: User, opportunities: Opportunity[]): MatchingResult[] {
    const userKeywords = [
      ...(user.major ? user.major.toLowerCase().split(' ') : []),
      ...(user.minor ? user.minor.toLowerCase().split(' ') : [])
    ];

    return opportunities.map(opp => {
      const oppText = `${opp.title} ${opp.description} ${opp.tags.join(' ')}`.toLowerCase();
      
      let score = 30; // Base score
      let matchedKeywords: string[] = [];
      
      userKeywords.forEach(keyword => {
        if (keyword.length > 2 && oppText.includes(keyword)) {
          score += 20;
          matchedKeywords.push(keyword);
        }
      });

      // Boost for STEM fields
      if (user.major && ['computer science', 'engineering', 'mathematics', 'physics', 'chemistry', 'biology'].some(field => 
        user.major!.toLowerCase().includes(field.toLowerCase()))) {
        if (oppText.includes('stem') || oppText.includes('tech') || oppText.includes('science')) {
          score += 15;
        }
      }

      return {
        opportunityId: opp.id,
        relevancyScore: Math.min(100, score),
        matchReason: matchedKeywords.length > 0 
          ? `Matches your interests in ${matchedKeywords.join(', ')}`
          : "General opportunity for high school students"
      };
    });
  }
}

export const aiMatcher = new AIOpportunityMatcher();