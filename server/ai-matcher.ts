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
      return [];  // Return empty array instead of showing everything
    }

    // Use more aggressive fallback matching for now - AI is too slow
    return this.strictFallbackMatching(user, opportunities);
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