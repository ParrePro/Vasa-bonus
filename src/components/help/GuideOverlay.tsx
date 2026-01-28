import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, ChevronRight, ChevronLeft } from "lucide-react";

export interface GuideStep {
  title: string;
  description: string;
  target?: string; // CSS selector for element to highlight
  position?: "top" | "bottom" | "left" | "right";
  highlightPadding?: number;
}

interface GuideOverlayProps {
  isOpen: boolean;
  steps: GuideStep[];
  onClose: () => void;
  title: string;
}

const GuideOverlay = ({
  isOpen,
  steps,
  onClose,
  title,
}: GuideOverlayProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (isOpen && steps.length > 0) {
      const step = steps[currentStep];
      if (step.target) {
        const element = document.querySelector(step.target);
        if (element) {
          const rect = element.getBoundingClientRect();
          setHighlightRect(rect);
        }
      }
    }
  }, [isOpen, currentStep, steps]);

  if (!isOpen || steps.length === 0) {
    return null;
  }

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const padding = step.highlightPadding || 8;
  const tooltipStyles: React.CSSProperties = {};

  if (highlightRect) {
    const position = step.position || "bottom";

    if (position === "bottom") {
      tooltipStyles.top = `${highlightRect.bottom + padding + window.scrollY}px`;
      tooltipStyles.left = `${highlightRect.left + highlightRect.width / 2}px`;
      tooltipStyles.transform = "translateX(-50%)";
    } else if (position === "top") {
      tooltipStyles.top = `${highlightRect.top - padding + window.scrollY}px`;
      tooltipStyles.left = `${highlightRect.left + highlightRect.width / 2}px`;
      tooltipStyles.transform = "translateX(-50%) translateY(-100%)";
    } else if (position === "right") {
      tooltipStyles.top = `${highlightRect.top + highlightRect.height / 2 + window.scrollY}px`;
      tooltipStyles.left = `${highlightRect.right + padding}px`;
      tooltipStyles.transform = "translateY(-50%)";
    } else if (position === "left") {
      tooltipStyles.top = `${highlightRect.top + highlightRect.height / 2 + window.scrollY}px`;
      tooltipStyles.left = `${highlightRect.left - padding}px`;
      tooltipStyles.transform = "translateY(-50%) translateX(-100%)";
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <>
      {/* Overlay backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40"
        onClick={onClose}
        aria-label="Close guide"
      />

      {/* Highlight box */}
      {highlightRect && (
        <div
          className="fixed z-50 border-2 border-primary shadow-lg rounded-lg pointer-events-none"
          style={{
            top: `${highlightRect.top - (step.highlightPadding || 8) + window.scrollY}px`,
            left: `${highlightRect.left - (step.highlightPadding || 8)}px`,
            width: `${highlightRect.width + (step.highlightPadding || 8) * 2}px`,
            height: `${highlightRect.height + (step.highlightPadding || 8) * 2}px`,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.4)",
          }}
        />
      )}

      {/* Tooltip */}
      <Card
        className="fixed z-50 p-4 max-w-sm shadow-2xl border-primary/50"
        style={tooltipStyles}
      >
        <div className="space-y-4">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-primary">{step.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {step.description}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 w-2 rounded-full transition-colors ${
                    i === currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={isFirstStep}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            {isLastStep ? (
              <Button size="sm" onClick={onClose}>
                Done
              </Button>
            ) : (
              <Button size="sm" onClick={handleNext}>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </>
  );
};

export default GuideOverlay;
