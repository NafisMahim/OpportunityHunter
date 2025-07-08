import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Brain, GraduationCap } from "lucide-react";
import type { User } from "@shared/schema";

interface UserProfileProps {
  user?: User;
  onStartImport: () => void;
  isImportLoading: boolean;
}

export default function UserProfile({ user, onStartImport, isImportLoading }: UserProfileProps) {
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    major: user?.major || "",
    minor: user?.minor || "",
  });

  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PUT", `/api/users/${user?.id}`, data);
    },
    onSuccess: () => {
      // Invalidate both user profile and opportunities to refresh AI matching results
      queryClient.invalidateQueries({ queryKey: ["/api/users/1"] });
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileData);
  };

  const getCompletionPercentage = () => {
    const fields = [
      profileData.name,
      profileData.email,
      profileData.major,
      profileData.minor,
    ];
    const completedFields = fields.filter(Boolean).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  return (
    <section id="profile-section" className="mb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information Card */}
        <div className="lg:col-span-2 opportunity-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-[hsl(328,100%,54%)] rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-primary">Academic Profile</h2>
                <p className="text-sm text-gray-400">Tell us your major and minor for AI-powered matching</p>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className="bg-[hsl(120,100%,50%)]/20 text-[hsl(120,100%,50%)] border-[hsl(120,100%,50%)]/30"
            >
              {getCompletionPercentage()}% Complete
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-gray-300">Full Name</Label>
              <Input
                value={profileData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="bg-cyber-dark border-primary/30 text-white focus:border-primary focus:ring-primary"
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <Label className="text-gray-300">Email</Label>
              <Input
                type="email"
                value={profileData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="bg-cyber-dark border-primary/30 text-white focus:border-primary focus:ring-primary"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <Label className="text-gray-300 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Major Field of Study
              </Label>
              <Input
                value={profileData.major}
                onChange={(e) => handleInputChange("major", e.target.value)}
                className="bg-cyber-dark border-primary/30 text-white focus:border-primary focus:ring-primary"
                placeholder="e.g., Computer Science, Biology, Business"
              />
              <p className="text-xs text-gray-500 mt-1">What you're planning to study in college</p>
            </div>
            
            <div>
              <Label className="text-gray-300 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Minor Field of Study (Optional)
              </Label>
              <Input
                value={profileData.minor}
                onChange={(e) => handleInputChange("minor", e.target.value)}
                className="bg-cyber-dark border-primary/30 text-white focus:border-primary focus:ring-primary"
                placeholder="e.g., Mathematics, Psychology, Art"
              />
              <p className="text-xs text-gray-500 mt-1">Secondary area of interest</p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-primary/10 border border-primary/30 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-primary">AI-Powered Matching</h4>
            </div>
            <p className="text-sm text-gray-300">
              Our AI analyzes your academic interests and finds opportunities perfectly tailored to your major and minor. 
              The more specific you are, the better your matches will be.
            </p>
          </div>

          <div className="mt-6">
            <Button 
              onClick={handleSaveProfile}
              disabled={updateProfileMutation.isPending}
              className="bg-gradient-to-r from-primary to-[hsl(328,100%,54%)] text-white hover:shadow-lg hover:shadow-primary/30 text-lg px-8 py-3"
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Academic Profile"}
            </Button>
          </div>
        </div>
        
        {/* AI Matching Controls */}
        <div className="opportunity-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-[hsl(328,100%,54%)] to-primary rounded-full flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[hsl(328,100%,54%)]">Smart Discovery</h3>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="p-3 bg-cyber-dark/50 rounded-lg border border-primary/20">
              <h4 className="font-medium text-gray-300 mb-1">Academic Matching</h4>
              <p className="text-sm text-gray-400">AI finds opportunities related to your major and minor</p>
            </div>
            <div className="p-3 bg-cyber-dark/50 rounded-lg border border-primary/20">
              <h4 className="font-medium text-gray-300 mb-1">Relevancy Scoring</h4>
              <p className="text-sm text-gray-400">Each opportunity gets a personalized match score</p>
            </div>
            <div className="p-3 bg-cyber-dark/50 rounded-lg border border-primary/20">
              <h4 className="font-medium text-gray-300 mb-1">Smart Filtering</h4>
              <p className="text-sm text-gray-400">Only see opportunities that matter to you</p>
            </div>
          </div>
          
          {/* Load Programs Button */}
          <div className="mt-8 pt-6 border-t border-primary/30">
            <Button
              onClick={onStartImport}
              disabled={isImportLoading}
              className="w-full bg-gradient-to-r from-primary to-[hsl(328,100%,54%)] text-white hover:shadow-lg hover:shadow-primary/50 neon-glow text-lg py-3"
            >
              {isImportLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Loading Programs...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Find My Opportunities
                </div>
              )}
            </Button>
            <p className="text-xs text-gray-400 mt-2 text-center">AI will analyze opportunities for your academic interests</p>
          </div>
        </div>
      </div>
    </section>
  );
}
