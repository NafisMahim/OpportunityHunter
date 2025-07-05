import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, DollarSign, Calendar, Building } from "lucide-react";
import type { Opportunity } from "@shared/schema";
import { OPPORTUNITY_TYPE_COLORS, getRelevancyLevel, RELEVANCY_COLORS } from "@/lib/types";

interface OpportunityCardProps {
  opportunity: Opportunity;
  userId: number;
}

export default function OpportunityCard({ opportunity, userId }: OpportunityCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [autoApply, setAutoApply] = useState(false);
  const queryClient = useQueryClient();

  const applyMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/applications", {
        userId,
        opportunityId: opportunity.id,
        status: "applied",
        autoApplied: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "activities"] });
    },
  });

  const autoApplyMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/auto-apply", {
        userId,
        opportunityId: opportunity.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "activities"] });
    },
  });

  const handleApply = () => {
    if (autoApply) {
      autoApplyMutation.mutate();
    } else {
      // Open external link
      window.open(opportunity.url, "_blank");
      applyMutation.mutate();
    }
  };

  const relevancyLevel = getRelevancyLevel(opportunity.relevancyScore || 0);
  const typeColors = OPPORTUNITY_TYPE_COLORS[opportunity.type as keyof typeof OPPORTUNITY_TYPE_COLORS] || "bg-gray-500/20 text-gray-400";

  return (
    <div className="opportunity-card rounded-xl p-6 relative group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Badge className={typeColors}>
            {opportunity.type}
          </Badge>
          <span className={`text-xs font-medium ${RELEVANCY_COLORS[relevancyLevel]}`}>
            {opportunity.relevancyScore}% Match
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsBookmarked(!isBookmarked)}
          className={`text-gray-400 hover:text-[hsl(328,100%,54%)] transition-colors ${
            isBookmarked ? "text-[hsl(328,100%,54%)]" : ""
          }`}
        >
          <Heart className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
        </Button>
      </div>
      
      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary transition-colors line-clamp-2">
        {opportunity.title}
      </h3>
      <p className="text-gray-300 text-sm mb-4 line-clamp-3">
        {opportunity.description}
      </p>
      
      <div className="space-y-2 mb-4">
        {opportunity.location && (
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300">{opportunity.location}</span>
          </div>
        )}
        
        {(opportunity.salary || opportunity.amount || opportunity.prize) && (
          <div className="flex items-center space-x-2 text-sm">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span className="text-[hsl(120,100%,50%)] font-semibold">
              {opportunity.salary || opportunity.amount || opportunity.prize}
            </span>
          </div>
        )}
        
        {opportunity.deadline && (
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300">
              {opportunity.deadline.includes("Apply by") || opportunity.deadline.includes("Deadline")
                ? opportunity.deadline
                : `Deadline: ${opportunity.deadline}`}
            </span>
          </div>
        )}

        {opportunity.organization && (
          <div className="flex items-center space-x-2 text-sm">
            <Building className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300">{opportunity.organization}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{opportunity.source}</span>
        <div className="flex items-center space-x-2">
          <label className="flex items-center space-x-1">
            <Checkbox
              checked={autoApply}
              onCheckedChange={(checked) => setAutoApply(checked as boolean)}
              className="border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <span className="text-xs text-gray-400">Auto-apply</span>
          </label>
          <Button
            onClick={handleApply}
            disabled={applyMutation.isPending || autoApplyMutation.isPending}
            className="bg-gradient-to-r from-primary to-[hsl(328,100%,54%)] text-white text-sm font-medium hover:shadow-lg hover:shadow-primary/30"
          >
            {applyMutation.isPending || autoApplyMutation.isPending ? "Applying..." : "Apply Now"}
          </Button>
        </div>
      </div>
    </div>
  );
}
