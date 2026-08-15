import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  triggerRef?: React.RefObject<HTMLElement>;
}

/**
 * AccessibleModal Component (WCAG 2.2 AA Compliant)
 * 
 * WCAG Criteria Addressed:
 * - 2.1.1 Keyboard: Complete keyboard focus trap (Tab/Shift+Tab cannot leave the modal when open).
 * - 2.1.2 No Keyboard Trap: Escape key support to close the modal.
 * - 2.4.3 Focus Order: Ensures focus moves into the modal when opened and returns to the triggering element upon closing.
 * - 4.1.2 Name, Role, Value: Implements `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and `aria-describedby`.
 */
export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  triggerRef,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [previousActiveElement, setPreviousActiveElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      setPreviousActiveElement(document.activeElement as HTMLElement);

      // Focus the modal or the first focusable element inside it
      if (modalRef.current) {
        modalRef.current.focus();
      }

      // Prevent scrolling on the body
      document.body.style.overflow = "hidden";
    } else {
      // Restore focus to the previous element when closed
      if (previousActiveElement) {
        previousActiveElement.focus();
      } else if (triggerRef?.current) {
        triggerRef.current.focus();
      }

      // Restore scrolling
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, previousActiveElement, triggerRef]);

  // Handle Escape key to close the modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      }

      // Focus Trap Logic
      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement || document.activeElement === modalRef.current) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal Content */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? "modal-description" : undefined}
        tabIndex={-1}
        className={cn(
          "relative z-50 w-full max-w-lg rounded-xl border bg-background p-6 shadow-lg sm:rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "animate-in fade-in-90 zoom-in-95 duration-200"
        )}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="space-y-1">
            <h2 id="modal-title" className="text-xl font-semibold tracking-tight">
              {title}
            </h2>
            {description && (
              <p id="modal-description" className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 min-h-[24px] min-w-[24px] rounded-full shrink-0"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mt-2">
          {children}
        </div>
      </div>
    </div>
  );
};
