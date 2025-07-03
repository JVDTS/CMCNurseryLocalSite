import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function GovernmentFundingPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already seen the popup in this session
    const hasSeenPopup = sessionStorage.getItem('fundingPopupSeen');
    
    if (!hasSeenPopup) {
      // Show popup after 3 seconds
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Remember that user has seen the popup in this session
    sessionStorage.setItem('fundingPopupSeen', 'true');
  };

  const handleLearnMore = () => {
    handleClose();
    // Scroll to contact section or navigate to contact page
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md border-2 border-primary/20">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Star className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-xl font-heading font-bold text-center">
            Government Funding Available!
          </DialogTitle>
          <DialogDescription className="text-center text-base mt-2">
            We're delighted to accept both <strong>15 and 30 hours Government Funding</strong> to help make quality childcare more accessible for your family.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="bg-primary/5 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-sm">15 Hours Funding</h4>
                <p className="text-sm text-muted-foreground">Available for all 3 & 4 year olds</p>
              </div>
            </div>
          </div>
          
          <div className="bg-primary/5 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-sm">30 Hours Funding</h4>
                <p className="text-sm text-muted-foreground">For eligible working families</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-6">
          <Button onClick={handleLearnMore} className="flex-1">
            Learn More
          </Button>
          <Button variant="outline" onClick={handleClose} className="flex-1">
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}