import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { User } from "@shared/schema";

interface HeaderProps {
  user?: User;
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="relative z-50 border-b border-primary/30 bg-cyber-dark/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-[hsl(328,100%,54%)] rounded-lg animate-neon-pulse"></div>
              <h1 className="text-xl font-bold neon-text">OpportunityFinder</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8 ml-8">
              <a href="#dashboard" className="text-primary hover:text-white transition-colors">
                Dashboard
              </a>
              <a href="#opportunities" className="text-gray-300 hover:text-primary transition-colors">
                Opportunities
              </a>
              <a href="#profile" className="text-gray-300 hover:text-primary transition-colors">
                Profile
              </a>
              <a href="#analytics" className="text-gray-300 hover:text-primary transition-colors">
                Analytics
              </a>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <Button variant="ghost" size="sm" className="relative text-gray-300 hover:text-primary">
              <Bell className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[hsl(328,100%,54%)] rounded-full text-xs flex items-center justify-center animate-pulse">
                3
              </span>
            </Button>
            
            {/* User Avatar */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-[hsl(328,100%,54%)] to-[hsl(120,100%,50%)] rounded-full"></div>
              <span className="hidden md:block text-sm font-medium">
                {user?.name || "Loading..."}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
