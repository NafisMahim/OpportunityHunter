import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface LoadingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoadingModal({ isOpen, onClose }: LoadingModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-cyber-dark border-primary/30 text-white max-w-md">
        <DialogTitle className="text-xl font-bold text-primary text-center">Scraping Real Opportunities</DialogTitle>
        <DialogDescription className="text-gray-300 text-center">
          Scanning Grants.gov, AngelList, and Fastweb for authentic opportunities...
        </DialogDescription>
        
        <div className="text-center p-4">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-[hsl(328,100%,54%)] rounded-full mx-auto mb-4 flex items-center justify-center">
            <div className="w-12 h-12 bg-cyber-black rounded-full animate-spin">
              <div className="w-2 h-2 bg-white rounded-full mt-2 ml-2"></div>
            </div>
          </div>
          
          <Progress 
            value={65} 
            className="w-full mb-4 bg-cyber-dark"
          />
          
          <div className="text-sm text-gray-400 space-y-1">
            <p>✓ Grants.gov - Government grants and research funding</p>
            <p>🔄 AngelList - Startup jobs and internships</p>
            <p>⏳ Fastweb - Scholarships and educational opportunities</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
