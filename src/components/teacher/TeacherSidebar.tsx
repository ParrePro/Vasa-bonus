import { Button } from "@/components/ui/button";
import { Award, PlusCircle, Users, CheckCircle, Settings } from "lucide-react";

type View = "give-points" | "create-class" | "join-class" | "fulfilled" | "settings";

interface TeacherSidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const TeacherSidebar = ({ currentView, onViewChange }: TeacherSidebarProps) => {
  return (
    <aside className="w-64 border-r bg-card p-4 space-y-2">
      <div className="mb-8">
        <h2 className="text-lg font-semibold px-3">Navigation</h2>
      </div>
      
      <Button
        variant={currentView === "give-points" ? "default" : "ghost"}
        className="w-full justify-start"
        onClick={() => onViewChange("give-points")}
      >
        <Award className="w-4 h-4 mr-2" />
        My Classes
      </Button>

      <Button
        variant={currentView === "create-class" ? "default" : "ghost"}
        className="w-full justify-start"
        onClick={() => onViewChange("create-class")}
      >
        <PlusCircle className="w-4 h-4 mr-2" />
        Create Class
      </Button>

      <Button
        variant={currentView === "join-class" ? "default" : "ghost"}
        className="w-full justify-start"
        onClick={() => onViewChange("join-class")}
      >
        <Users className="w-4 h-4 mr-2" />
        Join Class
      </Button>

      <Button
        variant={currentView === "fulfilled" ? "default" : "ghost"}
        className="w-full justify-start"
        onClick={() => onViewChange("fulfilled")}
      >
        <CheckCircle className="w-4 h-4 mr-2" />
        Fulfilled Rewards
      </Button>

      <div className="pt-4 mt-4 border-t">
        <Button
          variant={currentView === "settings" ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => onViewChange("settings")}
        >
          <Settings className="w-4 h-4 mr-2" />
          Account Settings
        </Button>
      </div>
    </aside>
  );
};

export default TeacherSidebar;
