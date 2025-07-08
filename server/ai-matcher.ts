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
      return opportunities.map(opp => ({
        opportunityId: opp.id,
        relevancyScore: 50,
        matchReason: "No academic preferences specified"
      }));
    }

    try {
      const systemPrompt = `You are an expert academic advisor specializing in matching high school students to relevant opportunities.

User Profile:
- Major: ${user.major || "Not specified"}
- Minor: ${user.minor || "Not specified"}

Your task is to analyze each opportunity and determine how relevant it is to this student's academic interests. Consider:
1. Direct field relevance to major/minor
2. Transferable skills and knowledge
3. Career pathway alignment
4. Academic preparation value

For each opportunity, provide a relevancy score (0-100) and a brief reason.

Respond with JSON in this exact format:
{
  "matches": [
    {
      "opportunityId": number,
      "relevancyScore": number,
      "matchReason": "brief explanation"
    }
  ]
}`;

      const opportunitiesText = opportunities.map(opp => 
        `ID: ${opp.id}
Title: ${opp.title}
Type: ${opp.type}
Organization: ${opp.organization}
Description: ${opp.description.substring(0, 300)}
Tags: ${opp.tags.join(', ')}
---`
      ).join('\n');

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
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
        contents: `Analyze these opportunities for the student:\n\n${opportunitiesText}`,
      });

      const result = JSON.parse(response.text || "{}");
      return result.matches || [];
      
    } catch (error) {
      console.error('AI matching error:', error);
      // Fallback to basic keyword matching
      return this.fallbackMatching(user, opportunities);
    }
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