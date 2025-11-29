import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Info } from "lucide-react";

interface TierBadgeProps {
  tier: 'basic' | 'silver' | 'gold' | 'ruby';
  tierPoints: number;
}

const TierBadge = ({ tier, tierPoints }: TierBadgeProps) => {
  const getTierConfig = () => {
    switch (tier) {
      case 'ruby':
        return {
          label: 'Ruby',
          tierColor: 'text-red-600',
          borderColor: 'border-red-200',
          bgColor: 'bg-red-50',
          progress: 100,
          nextThreshold: 200,
          currentThreshold: 200,
          currentFavicon: '/favicon-ruby.png',
          nextFavicon: '/favicon-ruby.png',
        };
      case 'gold':
        return {
          label: 'Gold',
          tierColor: 'text-yellow-600',
          borderColor: 'border-yellow-200',
          bgColor: 'bg-yellow-50',
          progress: ((tierPoints - 100) / 100) * 100,
          nextThreshold: 200,
          currentThreshold: 100,
          currentFavicon: '/favicon-gold.png',
          nextFavicon: '/favicon-ruby.png',
        };
      case 'silver':
        return {
          label: 'Silver',
          tierColor: 'text-slate-500',
          borderColor: 'border-slate-200',
          bgColor: 'bg-slate-50',
          progress: ((tierPoints - 50) / 50) * 100,
          nextThreshold: 100,
          currentThreshold: 50,
          currentFavicon: '/favicon-silver.png',
          nextFavicon: '/favicon-gold.png',
        };
      default:
        return {
          label: 'Basic',
          tierColor: 'text-blue-600',
          borderColor: 'border-blue-200',
          bgColor: 'bg-blue-50',
          progress: (tierPoints / 50) * 100,
          nextThreshold: 50,
          currentThreshold: 0,
          currentFavicon: '/favicon.png',
          nextFavicon: '/favicon-silver.png',
        };
    }
  };

  const config = getTierConfig();
  const pointsUntilNext = config.nextThreshold - tierPoints;

  return (
    <Card className={`border-2 ${config.borderColor} overflow-hidden ${config.bgColor} relative`}>
      <Popover>
        <PopoverTrigger asChild>
          <button className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-black/10 transition-colors z-10">
            <Info className="w-5 h-5 text-muted-foreground hover:text-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">About Tier Points</h4>
            <p className="text-sm text-muted-foreground">
              Tier points track your overall progress in VasaBonus. Unlike Vasa Points (which you spend on rewards), tier points accumulate permanently!
            </p>
            <div className="space-y-2 border-t pt-3">
              <p className="text-sm font-medium">How to earn tier points:</p>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <p>
                  • <span className="font-semibold text-foreground">+1 tier point</span> every time your teacher awards you Vasa Points
                </p>
                <p>
                  • <span className="font-semibold text-foreground">+3 tier points</span> when you gift a reward to a classmate 🎁
                </p>
              </div>
            </div>
            <div className="space-y-2 border-t pt-3">
              <p className="text-sm font-medium">Tier Levels:</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <img src="/favicon.png" alt="Basic" className="w-5 h-5" />
                  <span className="text-sm"><span className="text-blue-600 font-medium">Basic</span> — 0-49 tier points</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src="/favicon-silver.png" alt="Silver" className="w-5 h-5" />
                  <span className="text-sm"><span className="text-slate-500 font-medium">Silver</span> — 50-99 tier points</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src="/favicon-gold.png" alt="Gold" className="w-5 h-5" />
                  <span className="text-sm"><span className="text-yellow-600 font-medium">Gold</span> — 100-199 tier points</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src="/favicon-ruby.png" alt="Ruby" className="w-5 h-5" />
                  <span className="text-sm"><span className="text-red-600 font-medium">Ruby</span> — 200+ tier points</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground border-t pt-2">
              Higher tiers unlock a more premium visual experience!
            </p>
          </div>
        </PopoverContent>
      </Popover>
      <CardContent className="p-4 space-y-4">
        {/* Current Tier Display with Logo */}
        <div className="flex items-center justify-center gap-3">
          <img 
            src={config.currentFavicon} 
            alt={`${config.label} tier badge`}
            className="w-16 h-16"
          />
        </div>

        {/* Tier Text */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">You are currently tier</p>
          <p className="text-xl font-bold">
            <span className="text-black">VasaBonus </span>
            <span className={config.tierColor}>{config.label}</span>
          </p>
        </div>

        {/* Tier Points Display */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Tier Points</span>
          <span className={`text-lg font-bold ${config.tierColor}`}>
            {tierPoints}
          </span>
        </div>

        {/* Progress Bar with Favicon Logos */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            {/* Current Tier Favicon */}
            <img 
              src={config.currentFavicon} 
              alt={`Current tier icon`}
              className="w-10 h-10"
            />
            {/* Progress Bar */}
            <div className="flex-1">
              <Progress value={Math.min(config.progress, 100)} className="h-3" />
            </div>
            {/* Next Tier Favicon */}
            <img 
              src={config.nextFavicon} 
              alt={`Next tier icon`}
              className="w-10 h-10"
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{config.currentThreshold} pts</span>
            <span className="font-medium">
              {tier === 'ruby'
                ? '🎉 Max Tier Reached!'
                : `${pointsUntilNext} points to ${
                    tier === 'basic'
                      ? 'Silver'
                      : tier === 'silver'
                      ? 'Gold'
                      : 'Ruby'
                  }`}
            </span>
            <span>{config.nextThreshold} pts</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TierBadge;
