export type OpportunityType = 'job' | 'internship' | 'grant' | 'scholarship' | 'competition';

export interface SearchFilters {
  query: string;
  type: string;
  source: string;
  location: string;
  sortBy: string;
}

export interface UserPreferences {
  opportunityTypes: OpportunityType[];
  autoApply: boolean;
  locations: string[];
  minRelevancyScore: number;
}

export interface ExportOptions {
  format: 'csv' | 'json';
  includeApplications: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export const OPPORTUNITY_TYPE_ICONS = {
  job: '💼',
  internship: '🎓',
  grant: '💰',
  scholarship: '🏆',
  competition: '🎯',
} as const;

export const OPPORTUNITY_TYPE_COLORS = {
  job: 'bg-blue-500/20 text-blue-400',
  internship: 'bg-green-500/20 text-green-400',
  grant: 'bg-pink-500/20 text-pink-400',
  scholarship: 'bg-yellow-500/20 text-yellow-400',
  competition: 'bg-purple-500/20 text-purple-400',
} as const;

export const RELEVANCY_COLORS = {
  high: 'text-green-400',
  medium: 'text-orange-400',
  low: 'text-pink-400',
} as const;

export function getRelevancyLevel(score: number): 'high' | 'medium' | 'low' {
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  return 'low';
}

export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
}
