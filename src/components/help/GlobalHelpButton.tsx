import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useLocation } from "react-router-dom";

interface GlobalHelpButtonProps {
  onStartGuide: (guideId: string) => void;
}

const GlobalHelpButton = ({ onStartGuide }: GlobalHelpButtonProps) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Only show on relevant pages
  const isTeacherPage = location.pathname.includes("/teacher");
  const isDeveloperPage = location.pathname.includes("/developer");
  const isRelevantPage = isTeacherPage || isDeveloperPage;

  if (!isRelevantPage) {
    return null;
  }

  const guides = [
    {
      id: "give-points",
      label: "How to Give Points",
      description: "Step-by-step guide to awarding points",
    },
    {
      id: "create-reward",
      label: "How to Create a Reward",
      description: "Learn how to set up student rewards",
    },
    {
      id: "create-campaign",
      label: "How to Create a Campaign",
      description: "Guide to campaigns and point multipliers",
    },
  ];

  const handleSelectGuide = (guideId: string) => {
    onStartGuide(guideId);
    setOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            title="Help"
          >
            <HelpCircle className="w-5 h-5 mr-2" />
            Help
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-base font-semibold">
            What do you need help with?
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {guides.map((guide) => (
            <DropdownMenuItem
              key={guide.id}
              onClick={() => handleSelectGuide(guide.id)}
              className="flex flex-col items-start cursor-pointer py-2"
            >
              <span className="font-medium">{guide.label}</span>
              <span className="text-xs text-muted-foreground">
                {guide.description}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default GlobalHelpButton;
