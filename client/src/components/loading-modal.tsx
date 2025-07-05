import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface LoadingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoadingModal({ isOpen, onClose }: LoadingModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-cyber-dark border-primary/30 text-white max-w-md">
        <div className="text-center p-4">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-[hsl(328,100%,54%)] rounded-full mx-auto mb-4 flex items-center justify-center">
            <div className="w-12 h-12 bg-cyber-black rounded-full animate-spin">
              <div className="w-2 h-2 bg-white rounded-full mt-2 ml-2"></div>
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-primary mb-2">Scraping Opportunities</h3>
          <p className="text-gray-300 mb-4">Finding the best matches for your profile...</p>
          
          <Progress 
            value={45} 
            className="w-full mb-4 bg-cyber-dark"
          />
          
          <p className="text-sm text-gray-400">Processed 127 of 284 sources</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
