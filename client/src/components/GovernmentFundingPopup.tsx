import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GovernmentFundingPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dismissTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if user has already seen the popup in this session
    const hasSeenPopup = sessionStorage.getItem('fundingPopupSeen');
    
    if (!hasSeenPopup) {
      // Show popup after 3 seconds
      const timer = setTimeout(() => {
        setIsVisible(true);
        // Auto-dismiss after 30 seconds of no interaction
        dismissTimeoutRef.current = setTimeout(() => {
          handleClose();
        }, 30000);
      }, 3000);

      return () => {
        clearTimeout(timer);
        if (dismissTimeoutRef.current) {
          clearTimeout(dismissTimeoutRef.current);
        }
      };
    }
  }, []);

  const resetDismissTimer = () => {
    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current);
    }
    dismissTimeoutRef.current = setTimeout(() => {
      handleClose();
    }, 30000);
  };

  const handleClose = () => {
    setIsVisible(false);
    // Remember that user has seen the popup in this session
    sessionStorage.setItem('fundingPopupSeen', 'true');
    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current);
    }
  };

  const handleLearnMore = () => {
    handleClose();
    // Scroll to contact section
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: -400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -400, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed left-4 top-1/2 -translate-y-1/2 z-50 w-80 bg-white rounded-lg shadow-2xl border-2 border-primary/20 p-6"
          onMouseEnter={resetDismissTimer}
          onMouseLeave={resetDismissTimer}
          onClick={resetDismissTimer}
        >
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Header */}
          <div className="text-center mb-4">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Star className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-heading font-bold text-gray-900">
              Government Funding Available!
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              We accept both <strong>15 and 30 hours Government Funding</strong> to make quality childcare more accessible.
            </p>
          </div>

          {/* Funding options */}
          <div className="space-y-3 mb-5">
            <div className="bg-primary/5 rounded-lg p-3">
              <div className="flex items-start space-x-3">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">15 Hours Funding</h4>
                  <p className="text-xs text-gray-600">Available for all 3 & 4 year olds</p>
                </div>
              </div>
            </div>
            
            <div className="bg-primary/5 rounded-lg p-3">
              <div className="flex items-start space-x-3">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">30 Hours Funding</h4>
                  <p className="text-xs text-gray-600">For eligible working families</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action button */}
          <Button onClick={handleLearnMore} className="w-full text-sm">
            Learn More
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}