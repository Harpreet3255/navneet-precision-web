import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogPortal,
  DialogOverlay,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ComingSoonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ComingSoonDialog: React.FC<ComingSoonDialogProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-navneet-dark">Client Maintenance Portal</DialogTitle>
          <DialogDescription className="text-lg text-navneet-gray">
            Coming Soon!
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="mb-4 text-navneet-gray">
            We're currently developing our client maintenance portal to provide you with a seamless experience for tracking and managing your maintenance services.
          </p>
          <p className="text-navneet-gray">
            The portal will allow you to schedule maintenance visits, track service history, access maintenance reports, and communicate directly with our service team.
          </p>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Link
            to="/#contact"
            onClick={() => onOpenChange(false)}
            className="bg-navneet-orange hover:bg-navneet-orange/90 text-white px-6 py-2 rounded-md transition-colors inline-flex items-center justify-center"
          >
            Contact Us
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ComingSoonDialog;
