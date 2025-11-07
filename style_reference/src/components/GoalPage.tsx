import { ArrowLeft, Star, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Screen } from '../App';
import { useCurrency } from '../utils/currency';

interface GoalPageProps {
  onNavigate: (screen: Screen) => void;
  onMenuOpen: () => void;
}

export function GoalPage({ onNavigate, onMenuOpen }: GoalPageProps) {
  const { formatAmount } = useCurrency();
  const goalAmount = 450;
  const currentAmount = 350;
  const remainingAmount = goalAmount - currentAmount;
  const progressPercentage = (currentAmount / goalAmount) * 100;

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate('home')}
            className="rounded-full bg-gradient-to-br from-[#FFA93D] to-[#FFD740] hover:opacity-90 text-white shadow-md"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-white text-2xl font-lora font-medium [text-shadow:rgba(0,0,0,0.1)_0px_4px_6px]">My Goal</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      {/* Goal Illustration */}
      <div className="px-6 mb-6">
        <Card className="kids-card relative overflow-hidden bg-gradient-to-br from-white via-[#F0F9FF] to-[#E3F2FD]">
          {/* Decorative stars */}
          <div className="absolute top-4 right-4">
            <Star className="w-6 h-6 text-[#FFC107] fill-[#FFC107] animate-pulse" />
          </div>
          <div className="absolute top-12 right-16">
            <Star className="w-4 h-4 text-[#FFC107] fill-[#FFC107] animate-pulse" style={{ animationDelay: '0.2s' }} />
          </div>
          <div className="absolute top-8 left-8">
            <Star className="w-5 h-5 text-[#FFC107] fill-[#FFC107] animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>

          {/* Console Illustration */}
          <div className="relative py-12 flex justify-center items-center">
            <div className="relative">
              {/* Main console body - larger and more detailed */}
              <div className="w-64 h-40 bg-gradient-to-br from-[#5C4033] via-[#8B5A3C] to-[#5C4033] rounded-3xl shadow-2xl relative overflow-hidden">
                {/* Screen area */}
                <div className="absolute top-3 left-3 right-3 h-20 bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1e] rounded-2xl border-4 border-[#4a3829] shadow-inner">
                  {/* Screen content */}
                  <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                    {/* Game scene */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#4A90E2] to-[#2E5C8A]">
                      {/* Clouds */}
                      <div className="absolute top-1 left-4 w-6 h-3 bg-white/40 rounded-full"></div>
                      <div className="absolute top-2 right-8 w-8 h-3 bg-white/30 rounded-full"></div>
                      {/* Ground */}
                      <div className="absolute bottom-0 left-0 right-0 h-6 bg-[#52C41A]"></div>
                      {/* Character */}
                      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                        <div className="w-4 h-6 bg-[#FF6B6B] rounded-sm"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* D-pad */}
                <div className="absolute bottom-6 left-8 w-14 h-14">
                  <div className="relative w-full h-full">
                    {/* Vertical bar */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-12 bg-gradient-to-b from-[#2d2d2d] to-[#1a1a1a] rounded"></div>
                    {/* Horizontal bar */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-5 bg-gradient-to-r from-[#2d2d2d] to-[#1a1a1a] rounded"></div>
                    {/* Center circle */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#1a1a1a] rounded-full"></div>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="absolute bottom-8 right-8 flex gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-[#FF6B6B] to-[#d94444] rounded-full shadow-lg border-2 border-[#4a3829]"></div>
                  <div className="w-6 h-6 bg-gradient-to-br from-[#52C41A] to-[#389E0D] rounded-full shadow-lg border-2 border-[#4a3829]"></div>
                </div>
                
                {/* Small buttons */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
                  <div className="w-8 h-2 bg-[#2d2d2d] rounded-full"></div>
                  <div className="w-8 h-2 bg-[#2d2d2d] rounded-full"></div>
                </div>
              </div>
              
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-radial from-[#FFC107]/20 to-transparent blur-xl -z-10"></div>
            </div>
          </div>

          <div className="text-center pt-4">
            <h2 className="text-[#5C4033] mb-2">Video Game Console</h2>
            <p className="text-[#8B7355]">The ultimate gaming experience!</p>
          </div>
        </Card>
      </div>

      {/* Progress Section */}
      <div className="px-6 space-y-4">
        <Card className="kids-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-[#8B7355] mb-1">Current Savings</p>
              <div className="text-4xl text-[#5C4033] font-lora font-medium">{formatAmount(currentAmount)}</div>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#8B7355] mb-1">Goal</p>
              <div className="text-[18px] text-[#5C4033]">{formatAmount(goalAmount)}</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2 mb-6">
            <Progress value={progressPercentage} className="h-4" />
            <div className="flex justify-between text-sm text-[#8B7355]">
              <span>{Math.round(progressPercentage)}% complete</span>
              <span>{formatAmount(remainingAmount)} to go</span>
            </div>
          </div>

          {/* Milestone indicator */}
          <div className="bg-gradient-to-r from-[#FFF3E0] to-[#FFE4C4] rounded-2xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FFC107] to-[#FFA000] rounded-full flex items-center justify-center shadow-md flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[#8B5A3C]">You're almost there!</p>
              <p className="text-sm text-[#8B7355]">Keep saving to reach your goal</p>
            </div>
          </div>
        </Card>

        {/* Action Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="kids-card text-center cursor-pointer hover:shadow-xl transition-all">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#52C41A] to-[#389E0D] rounded-2xl mb-3 shadow-md">
              <span className="text-2xl">💵</span>
            </div>
            <p className="text-[#5C4033]">Add Money</p>
          </Card>

          <Card className="kids-card text-center cursor-pointer hover:shadow-xl transition-all">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#00BCD4] to-[#0097A7] rounded-2xl mb-3 shadow-md">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-[#5C4033]">View History</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
