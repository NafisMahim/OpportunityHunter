import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { User } from "@shared/schema";
import { OPPORTUNITY_TYPE_ICONS } from "@/lib/types";

interface UserProfileProps {
  user?: User;
  onStartScraping: () => void;
  isScrapingLoading: boolean;
}

export default function UserProfile({ user, onStartScraping, isScrapingLoading }: UserProfileProps) {
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    location: user?.location || "",
    experienceLevel: user?.experienceLevel || "",
    skills: user?.skills || [],
    preferences: user?.preferences || [],
  });
  const [newSkill, setNewSkill] = useState("");

  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PUT", `/api/users/${user?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/1"] });
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      const updatedSkills = [...profileData.skills, newSkill.trim()];
      setProfileData(prev => ({ ...prev, skills: updatedSkills }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updatedSkills = profileData.skills.filter(skill => skill !== skillToRemove);
    setProfileData(prev => ({ ...prev, skills: updatedSkills }));
  };

  const handlePreferenceChange = (preference: string, checked: boolean) => {
    const updatedPreferences = checked
      ? [...profileData.preferences, preference]
      : profileData.preferences.filter(p => p !== preference);
    setProfileData(prev => ({ ...prev, preferences: updatedPreferences }));
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileData);
  };

  const getCompletionPercentage = () => {
    const fields = [
      profileData.name,
      profileData.email,
      profileData.location,
      profileData.experienceLevel,
      profileData.skills.length > 0,
      profileData.preferences.length > 0,
    ];
    const completedFields = fields.filter(Boolean).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const opportunityTypes = [
    { id: "jobs", label: "Jobs", icon: "💼" },
    { id: "internships", label: "Internships", icon: "🎓" },
    { id: "grants", label: "Grants", icon: "💰" },
    { id: "scholarships", label: "Scholarships", icon: "🏆" },
    { id: "competitions", label: "Competitions", icon: "🎯" },
  ];

  return (
    <section id="profile-section" className="mb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information Card */}
        <div className="lg:col-span-2 opportunity-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-primary">Profile Setup</h2>
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
              />
            </div>
            
            <div>
              <Label className="text-gray-300">Email</Label>
              <Input
                type="email"
                value={profileData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="bg-cyber-dark border-primary/30 text-white focus:border-primary focus:ring-primary"
              />
            </div>
            
            <div>
              <Label className="text-gray-300">Location</Label>
              <Input
                value={profileData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className="bg-cyber-dark border-primary/30 text-white focus:border-primary focus:ring-primary"
              />
            </div>
            
            <div>
              <Label className="text-gray-300">Experience Level</Label>
              <Select 
                value={profileData.experienceLevel} 
                onValueChange={(value) => handleInputChange("experienceLevel", value)}
              >
                <SelectTrigger className="bg-cyber-dark border-primary/30 text-white focus:border-primary focus:ring-primary">
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent className="bg-cyber-dark border-primary/30">
                  <SelectItem value="Entry Level (0-2 years)">Entry Level (0-2 years)</SelectItem>
                  <SelectItem value="Mid-Level (3-5 years)">Mid-Level (3-5 years)</SelectItem>
                  <SelectItem value="Senior Level (5+ years)">Senior Level (5+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Skills Section */}
          <div className="mt-6">
            <Label className="text-gray-300 mb-3 block">Skills & Technologies</Label>
            <div className="flex flex-wrap gap-2 mb-4">
              {profileData.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="bg-primary/20 text-primary border-primary/30 flex items-center gap-1"
                >
                  {skill}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleRemoveSkill(skill)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddSkill()}
                className="bg-cyber-dark border-primary/30 text-white focus:border-primary focus:ring-primary"
              />
              <Button 
                onClick={handleAddSkill}
                variant="outline"
                className="border-primary/30 text-primary hover:bg-primary/10"
              >
                Add
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <Button 
              onClick={handleSaveProfile}
              disabled={updateProfileMutation.isPending}
              className="bg-gradient-to-r from-primary to-[hsl(328,100%,54%)] text-white hover:shadow-lg hover:shadow-primary/30"
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </div>
        
        {/* Opportunity Preferences */}
        <div className="opportunity-card rounded-xl p-6">
          <h3 className="text-xl font-bold text-[hsl(328,100%,54%)] mb-6">Opportunity Preferences</h3>
          
          <div className="space-y-4">
            {opportunityTypes.map((type) => (
              <label key={type.id} className="flex items-center space-x-3 cursor-pointer group">
                <Checkbox
                  checked={profileData.preferences.includes(type.id)}
                  onCheckedChange={(checked) => handlePreferenceChange(type.id, checked as boolean)}
                  className="border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{type.icon}</span>
                  <span className="text-white group-hover:text-primary transition-colors">
                    {type.label}
                  </span>
                </div>
              </label>
            ))}
          </div>
          
          {/* Scraping Controls */}
          <div className="mt-8 pt-6 border-t border-primary/30">
            <h4 className="text-lg font-semibold text-[hsl(120,100%,50%)] mb-4">Auto-Scraping</h4>
            <Button
              onClick={onStartScraping}
              disabled={isScrapingLoading}
              className="w-full bg-gradient-to-r from-primary to-[hsl(328,100%,54%)] text-white hover:shadow-lg hover:shadow-primary/50 neon-glow"
            >
              {isScrapingLoading ? "Scraping..." : "Start Scraping"}
            </Button>
            <p className="text-xs text-gray-400 mt-2 text-center">Last scan: 2 hours ago</p>
          </div>
        </div>
      </div>
    </section>
  );
}
