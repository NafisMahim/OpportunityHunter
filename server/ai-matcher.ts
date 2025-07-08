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
    const userMajor = (user.major || "").toLowerCase();
    const userMinor = (user.minor || "").toLowerCase();
    
    // Create specific keywords for different majors
    const fieldKeywords: { [key: string]: string[] } = {
      biology: ['biology', 'biological', 'biomedical', 'life sciences', 'genetics', 'molecular', 'cellular', 'ecology', 'evolution', 'microbiology', 'biochemistry', 'biotechnology', 'medical', 'health', 'anatomy', 'physiology', 'pre-med', 'research', 'lab', 'science'],
      chemistry: ['chemistry', 'chemical', 'organic', 'inorganic', 'analytical', 'physical chemistry', 'materials', 'pharmaceutical', 'drug', 'molecule', 'synthesis', 'lab', 'research', 'science'],
      physics: ['physics', 'physical', 'quantum', 'mechanics', 'thermodynamics', 'optics', 'astronomy', 'astrophysics', 'engineering', 'materials', 'research', 'science'],
      mathematics: ['mathematics', 'math', 'statistics', 'calculus', 'algebra', 'geometry', 'data science', 'analytics', 'actuarial', 'quantitative', 'finance', 'economics'],
      'computer science': ['computer', 'programming', 'coding', 'software', 'tech', 'technology', 'ai', 'artificial intelligence', 'machine learning', 'cybersecurity', 'web development', 'app development', 'data science', 'engineering'],
      engineering: ['engineering', 'mechanical', 'electrical', 'civil', 'chemical engineering', 'aerospace', 'biomedical engineering', 'robotics', 'automation', 'design', 'manufacturing'],
      psychology: ['psychology', 'psychological', 'mental health', 'behavioral', 'cognitive', 'therapy', 'counseling', 'social work', 'research'],
      business: ['business', 'entrepreneurship', 'marketing', 'finance', 'economics', 'management', 'consulting', 'startup', 'leadership'],
      english: ['english', 'literature', 'writing', 'journalism', 'communications', 'media', 'publishing', 'creative writing', 'humanities'],
      art: ['art', 'design', 'creative', 'visual', 'graphic design', 'painting', 'sculpture', 'digital art', 'photography', 'animation'],
      history: ['history', 'historical', 'archaeology', 'anthropology', 'humanities', 'cultural', 'museum', 'archives'],
      political_science: ['political science', 'politics', 'government', 'policy', 'international relations', 'law', 'legal', 'public service', 'diplomacy']
    };

    const results: MatchingResult[] = [];

    for (const opp of opportunities) {
      const oppText = `${opp.title} ${opp.description} ${opp.organization} ${opp.tags.join(' ')}`.toLowerCase();
      
      let maxScore = 0;
      let bestReason = "";
      
      // Check major match
      if (userMajor) {
        const majorKey = this.findMatchingFieldKey(userMajor, fieldKeywords);
        if (majorKey && fieldKeywords[majorKey]) {
          const matchedKeywords = fieldKeywords[majorKey].filter(keyword => oppText.includes(keyword));
          if (matchedKeywords.length > 0) {
            const score = Math.min(95, 70 + (matchedKeywords.length * 5));
            if (score > maxScore) {
              maxScore = score;
              bestReason = `Directly relevant to ${user.major} - mentions ${matchedKeywords.slice(0, 3).join(', ')}`;
            }
          }
        }
      }

      // Check minor match
      if (userMinor && maxScore < 80) {
        const minorKey = this.findMatchingFieldKey(userMinor, fieldKeywords);
        if (minorKey && fieldKeywords[minorKey]) {
          const matchedKeywords = fieldKeywords[minorKey].filter(keyword => oppText.includes(keyword));
          if (matchedKeywords.length > 0) {
            const score = Math.min(80, 60 + (matchedKeywords.length * 4));
            if (score > maxScore) {
              maxScore = score;
              bestReason = `Related to your minor in ${user.minor} - involves ${matchedKeywords.slice(0, 2).join(', ')}`;
            }
          }
        }
      }

      // Only include opportunities with 70+ relevancy (much stricter)
      if (maxScore >= 70) {
        results.push({
          opportunityId: opp.id,
          relevancyScore: maxScore,
          matchReason: bestReason || `Relevant to your academic interests in ${user.major}`
        });
      }
    }

    return results.sort((a, b) => b.relevancyScore - a.relevancyScore);
  }

  private findMatchingFieldKey(userField: string, fieldKeywords: { [key: string]: string[] }): string | null {
    const field = userField.toLowerCase();
    
    // Exact match first
    if (fieldKeywords[field]) return field;
    
    // Partial match
    for (const [key, keywords] of Object.entries(fieldKeywords)) {
      if (field.includes(key) || keywords.some(keyword => field.includes(keyword))) {
        return key;
      }
    }
    
    return null;
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