import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, GripHorizontal } from "lucide-react";
import { useLocation } from "react-router-dom";

export interface GuideStep {
  id: string;
  title: string;
  instruction: string; // What the user should do
  position?: "top" | "bottom" | "left" | "right" | "center";
  waitFor?: {
    type: "navigation" | "element-click" | "custom" | "event";
    value?: string; // URL path, element selector, or custom key
  };
}

interface SmartGuideOverlayProps {
  isOpen: boolean;
  steps: GuideStep[];
  onClose: () => void;
  onStepComplete?: (stepId: string) => void;
  onGuideComplete?: () => void;
}

const SmartGuideOverlay = ({
  isOpen,
  steps,
  onClose,
  onStepComplete,
  onGuideComplete,
}: SmartGuideOverlayProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const location = useLocation();
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Initialize position on mount
  useEffect(() => {
    if (isOpen) {
      setPosition({ x: window.innerWidth / 2 - 200, y: window.innerHeight / 2 - 150 });
      setCurrentStep(0);
    }
  }, [isOpen]);

  // Auto-advance based on navigation
  useEffect(() => {
    if (!isOpen || steps.length === 0) return;

    const step = steps[currentStep];
    if (step.waitFor?.type === "navigation") {
      if (location.pathname.includes(step.waitFor.value || "")) {
        // User navigated to the right page, auto-advance
        if (currentStep < steps.length - 1) {
          setTimeout(() => {
            setCurrentStep(currentStep + 1);
            onStepComplete?.(step.id);
          }, 500);
        }
      }
    }
  }, [location.pathname, isOpen, currentStep, steps, onStepComplete]);

  // Listen for element clicks
  useEffect(() => {
    if (!isOpen || steps.length === 0) return;

    const step = steps[currentStep];
    if (step.waitFor?.type === "element-click" && step.waitFor.value) {
      const handleElementClick = (e: Event) => {
        const target = e.target as HTMLElement;
        const selector = step.waitFor?.value;
        
        if (target.matches(selector!) || target.closest(selector!)) {
          // User clicked the right element
          if (currentStep < steps.length - 1) {
            setTimeout(() => {
              setCurrentStep(currentStep + 1);
              onStepComplete?.(step.id);
            }, 300);
          } else {
            // Last step - show completion
            setTimeout(() => {
              onGuideComplete?.();
              onClose();
            }, 300);
          }
        }
      };

      document.addEventListener("click", handleElementClick, true);
      return () => document.removeEventListener("click", handleElementClick, true);
    }
  }, [isOpen, currentStep, steps, onStepComplete, onGuideComplete, onClose]);

  // Listen for custom events
  useEffect(() => {
    if (!isOpen || steps.length === 0) return;

    const step = steps[currentStep];
    if (step.waitFor?.type === "event" && step.waitFor.value) {
      const handleCustomEvent = (e: Event) => {
        const customEvent = e as CustomEvent;
        if (customEvent.detail?.action === step.waitFor.value) {
          if (currentStep < steps.length - 1) {
            setTimeout(() => {
              setCurrentStep(currentStep + 1);
              onStepComplete?.(step.id);
            }, 500);
          } else {
            // Last step - show completion
            setTimeout(() => {
              onGuideComplete?.();
              onClose();
            }, 500);
          }
        }
      };

      document.addEventListener("guide-event", handleCustomEvent as EventListener);
      return () => document.removeEventListener("guide-event", handleCustomEvent as EventListener);
    }
  }, [isOpen, currentStep, steps, onStepComplete, onGuideComplete, onClose]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!isOpen || steps.length === 0) {
    return null;
  }

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (isLastStep) {
      onGuideComplete?.();
      onClose();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    onClose();
  };

  return (
    <>
      {/* Non-blocking semi-transparent background */}
      <div
        className="fixed inset-0 z-40 bg-black/20 pointer-events-none"
        aria-label="Guide background"
      />

      {/* Draggable Tooltip */}
      <Card
        ref={tooltipRef}
        className="fixed z-50 p-6 max-w-md shadow-2xl border-primary/50 pointer-events-auto cursor-move"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          userSelect: isDragging ? "none" : "auto",
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Drag Handle */}
        <div
          className="flex items-center gap-2 mb-4 pb-3 border-b cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        >
          <GripHorizontal className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-semibold">Drag to move</span>
        </div>

        <div className="space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-primary">{step.title}</h3>
              <p className="text-sm text-foreground mt-2 leading-relaxed">
                {step.instruction}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              aria-label="Close guide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>

          {/* Help text */}
          {step.waitFor?.type === "element-click" && (
            <p className="text-xs text-primary/80 italic">
              ✓ Guide will continue when you click on the element
            </p>
          )}
          {step.waitFor?.type === "navigation" && (
            <p className="text-xs text-primary/80 italic">
              ✓ Guide will continue when you navigate
            </p>
          )}
          {step.waitFor?.type === "event" && (
            <p className="text-xs text-primary/80 italic">
              ✓ Guide will continue when you complete the action
            </p>
          )}

          {/* Action buttons */}
          {(!step.waitFor || step.waitFor.type === "custom") && (
            <Button onClick={handleNext} className="w-full">
              {isLastStep ? (
                <>
                  Done <ChevronRight className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          )}
        </div>
      </Card>
    </>
  );
};

export default SmartGuideOverlay;
