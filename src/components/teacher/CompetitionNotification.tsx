import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, X, Zap } from "lucide-react";

interface CompetitionNotificationProps {
  onDismiss?: () => void;
}

const CompetitionNotification = ({ onDismiss }: CompetitionNotificationProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    // Calculate days until April 30
    const today = new Date();
    const deadline = new Date(2026, 3, 30); // April 30, 2026 (month is 0-indexed)
    const timeDiff = deadline.getTime() - today.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
    setDaysLeft(Math.max(0, daysRemaining));
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <Card className="border-2 border-yellow-500/50 bg-gradient-to-r from-yellow-50 to-orange-50 mb-6">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-1">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-yellow-900 mb-1">
                🎉 Teacher Points Competition
              </h3>
              <p className="text-sm text-yellow-800 mb-3">
                Great news! Your point-giving activity is now being recorded on the <span className="font-semibold">School Leaderboard</span>. 
                This is a friendly competition to see which teacher gives the most points to students!
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <div>
                  <p className="text-xs font-semibold text-yellow-700 mb-1">COMPETITION DETAILS</p>
                  <p className="text-sm font-bold text-yellow-900">
                    <Zap className="w-4 h-4 inline mr-1" />
                    Every point you give counts!
                  </p>
                </div>
                <div className="border-l border-yellow-300 pl-4">
                  <p className="text-xs font-semibold text-yellow-700 mb-1">TIME REMAINING</p>
                  <p className="text-lg font-bold text-yellow-900">
                    {daysLeft} days
                  </p>
                  <p className="text-xs text-yellow-700">Until April 30th</p>
                </div>
              </div>
              <p className="text-xs text-yellow-700 mt-3">
                The winner will be announced on April 30th! Check the Developer's School Stats to see the leaderboard.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="ml-2 text-yellow-700 hover:text-yellow-900"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompetitionNotification;
