import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/header";
import UserProfile from "@/components/user-profile";
import SearchFilters from "@/components/search-filters";
import OpportunityCard from "@/components/opportunity-card";
import ActivityFeed from "@/components/activity-feed";
import LoadingModal from "@/components/loading-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Opportunity, User } from "@shared/schema";
import type { SearchFilters as SearchFiltersType } from "@/lib/types";

export default function Dashboard() {
  const [searchFilters, setSearchFilters] = useState<SearchFiltersType>({
    query: "",
    type: "all",
    source: "all",
    location: "",
    sortBy: "relevancy",
  });
  const [isScrapingModalOpen, setIsScrapingModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const queryClient = useQueryClient();
  
  // Current user (hardcoded for demo, would come from auth)
  const currentUserId = 1;

  // Fetch user data
  const { data: user } = useQuery<User>({
    queryKey: ["/api/users/1"],
  });

  // Fetch opportunities with search and filters
  const { data: opportunities = [], isLoading: opportunitiesLoading } = useQuery<Opportunity[]>({
    queryKey: ["/api/opportunities", searchFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchFilters.query) params.append("search", searchFilters.query);
      if (searchFilters.type !== "all") params.append("type", searchFilters.type);
      if (searchFilters.source !== "all") params.append("source", searchFilters.source);
      if (searchFilters.location) params.append("location", searchFilters.location);
      
      const response = await fetch(`/api/opportunities?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch opportunities");
      return response.json();
    },
  });

  // Pagination
  const totalPages = Math.ceil(opportunities.length / itemsPerPage);
  const paginatedOpportunities = opportunities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Start scraping mutation
  const scrapeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/scrape", { userId: currentUserId });
    },
    onSuccess: () => {
      setIsScrapingModalOpen(true);
      setTimeout(() => {
        setIsScrapingModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
        queryClient.invalidateQueries({ queryKey: ["/api/users/1/activities"] });
      }, 5000);
    },
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async (format: "csv" | "json") => {
      const response = await fetch(`/api/users/${currentUserId}/export?format=${format}`);
      if (!response.ok) throw new Error("Export failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `opportunities.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });

  const handleStartScraping = () => {
    scrapeMutation.mutate();
  };

  const handleExport = (format: "csv" | "json") => {
    exportMutation.mutate(format);
  };

  return (
    <>
      <Header user={user} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Profile Section */}
        <UserProfile 
          user={user} 
          onStartScraping={handleStartScraping}
          isScrapingLoading={scrapeMutation.isPending}
        />

        {/* Search and Filter Section */}
        <SearchFilters
          filters={searchFilters}
          onFiltersChange={setSearchFilters}
          onExport={handleExport}
          resultCount={opportunities.length}
          newCount={23} // Mock new count
        />

        {/* Opportunities Grid */}
        <section id="opportunities-section" className="mb-12">
          {opportunitiesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="opportunity-card rounded-xl p-6 animate-pulse">
                  <div className="h-4 bg-gray-700 rounded mb-4"></div>
                  <div className="h-6 bg-gray-700 rounded mb-2"></div>
                  <div className="h-20 bg-gray-700 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedOpportunities.map((opportunity) => (
                  <OpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    userId={currentUserId}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="bg-cyber-dark border-primary/30 text-gray-300 hover:text-primary hover:border-primary"
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          onClick={() => setCurrentPage(page)}
                          className={
                            currentPage === page
                              ? "bg-primary text-white"
                              : "bg-cyber-dark border-primary/30 text-gray-300 hover:text-primary hover:border-primary"
                          }
                        >
                          {page}
                        </Button>
                      );
                    })}
                    {totalPages > 5 && (
                      <>
                        <span className="text-gray-400">...</span>
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage(totalPages)}
                          className="bg-cyber-dark border-primary/30 text-gray-300 hover:text-primary hover:border-primary"
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="bg-cyber-dark border-primary/30 text-gray-300 hover:text-primary hover:border-primary"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Activity Feed */}
        <ActivityFeed userId={currentUserId} />
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button
          onClick={handleStartScraping}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-[hsl(328,100%,54%)] shadow-lg hover:shadow-xl hover:shadow-primary/50 animate-float"
          disabled={scrapeMutation.isPending}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Loading Modal */}
      <LoadingModal 
        isOpen={isScrapingModalOpen} 
        onClose={() => setIsScrapingModalOpen(false)} 
      />
    </>
  );
}
