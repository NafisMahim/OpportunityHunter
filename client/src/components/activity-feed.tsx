import { useQuery } from "@tanstack/react-query";
import type { Activity } from "@shared/schema";
import { formatTimeAgo } from "@/lib/types";

interface ActivityFeedProps {
  userId: number;
}

export default function ActivityFeed({ userId }: ActivityFeedProps) {
  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/users", userId, "activities"],
    refetchInterval: 5000, // Poll every 5 seconds for real-time updates
  });

  const getActivityColor = (type: string) => {
    switch (type) {
      case "scrape":
        return "bg-[hsl(120,100%,50%)]";
      case "apply":
        return "bg-primary";
      case "error":
        return "bg-yellow-400";
      default:
        return "bg-gray-400";
    }
  };

  if (isLoading) {
    return (
      <section id="activity-section" className="mt-12">
        <div className="opportunity-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[hsl(328,100%,54%)]">Real-time Activity</h2>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[hsl(120,100%,50%)] rounded-full animate-pulse"></div>
              <span className="text-sm text-[hsl(120,100%,50%)]">Live</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-3 bg-cyber-dark/50 rounded-lg animate-pulse">
                <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-600 rounded mb-2"></div>
                  <div className="h-3 bg-gray-600 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="activity-section" className="mt-12">
      <div className="opportunity-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[hsl(328,100%,54%)]">Real-time Activity</h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-[hsl(120,100%,50%)] rounded-full animate-pulse"></div>
            <span className="text-sm text-[hsl(120,100%,50%)]">Live</span>
          </div>
        </div>
        
        <div className="space-y-4 max-h-64 overflow-y-auto">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No recent activity. Start scraping to see updates here.
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-3 bg-cyber-dark/50 rounded-lg">
                <div className={`w-2 h-2 ${getActivityColor(activity.type)} rounded-full`}></div>
                <div className="flex-1">
                  <p className="text-sm text-white">{activity.message}</p>
                  <p className="text-xs text-gray-400">
                    {formatTimeAgo(new Date(activity.createdAt!))}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
