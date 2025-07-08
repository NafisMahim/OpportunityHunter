import { useState } from "react";
import { Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { SearchFilters as SearchFiltersType } from "@/lib/types";

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  onExport: (format: "csv" | "json") => void;
  resultCount: number;
  newCount: number;
  onImportNewStuyvesant?: () => void;
  isImportingNewStuyvesant?: boolean;
}

export default function SearchFilters({
  filters,
  onFiltersChange,
  onExport,
  resultCount,
  newCount,
  onImportNewStuyvesant,
  isImportingNewStuyvesant,
}: SearchFiltersProps) {
  const [autoApply, setAutoApply] = useState(false);

  const handleFilterChange = (key: keyof SearchFiltersType, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <section id="search-section" className="mb-8">
      <div className="opportunity-card rounded-xl p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search opportunities..."
                value={filters.query}
                onChange={(e) => handleFilterChange("query", e.target.value)}
                className="pl-12 bg-cyber-dark border-primary/30 text-white focus:border-primary focus:ring-primary"
              />
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
              <SelectTrigger className="w-[140px] bg-cyber-dark border-primary/30 text-white focus:border-primary focus:ring-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-cyber-dark border-primary/30">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="job">Jobs</SelectItem>
                <SelectItem value="internship">Internships</SelectItem>
                <SelectItem value="grant">Grants</SelectItem>
                <SelectItem value="scholarship">Scholarships</SelectItem>
                <SelectItem value="competition">Competitions</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.source} onValueChange={(value) => handleFilterChange("source", value)}>
              <SelectTrigger className="w-[140px] bg-cyber-dark border-primary/30 text-white focus:border-primary focus:ring-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-cyber-dark border-primary/30">
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="Grants.gov">Grants.gov</SelectItem>
                <SelectItem value="AngelList">AngelList</SelectItem>
                <SelectItem value="Fastweb">Fastweb</SelectItem>
                <SelectItem value="CollegeVine">CollegeVine</SelectItem>
                <SelectItem value="Google Careers">Google Careers</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
              <SelectTrigger className="w-[180px] bg-cyber-dark border-primary/30 text-white focus:border-primary focus:ring-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-cyber-dark border-primary/30">
                <SelectItem value="relevancy">Relevancy: High to Low</SelectItem>
                <SelectItem value="date">Date: Newest First</SelectItem>
                <SelectItem value="deadline">Deadline: Soonest First</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Import New Stuyvesant Button */}
            {onImportNewStuyvesant && (
              <Button
                variant="outline"
                onClick={onImportNewStuyvesant}
                disabled={isImportingNewStuyvesant}
                className="bg-primary/20 border-primary/30 text-primary hover:bg-primary/20 hover:shadow-lg hover:shadow-primary/30"
              >
                🏫 {isImportingNewStuyvesant ? "Importing..." : "Import 899 New Opportunities"}
              </Button>
            )}
            
            {/* Export Button */}
            <Button
              variant="outline"
              onClick={() => onExport("json")}
              className="bg-[hsl(120,100%,50%)]/20 border-[hsl(120,100%,50%)]/30 text-[hsl(120,100%,50%)] hover:bg-[hsl(120,100%,50%)]/20 hover:shadow-lg hover:shadow-[hsl(120,100%,50%)]/30"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        
        {/* Results Summary */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <span className="text-gray-300">{resultCount} opportunities found</span>
            <span className="text-[hsl(120,100%,50%)]">{newCount} new since last check</span>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="auto-apply" className="text-sm text-gray-400">
              Auto-apply:
            </Label>
            <Switch
              id="auto-apply"
              checked={autoApply}
              onCheckedChange={setAutoApply}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
