import { Settings, LogOut } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from './ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Screen } from '../App';
import { useCurrency } from '../utils/currency';

interface SideMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (screen: Screen) => void;
}

export function SideMenu({ open, onOpenChange, onNavigate }: SideMenuProps) {
  const { currency, setCurrency, formatAmount } = useCurrency();
  
  const menuItems = [
    { label: 'Home', screen: 'home' as Screen, emoji: '🏠' },
    { label: 'My Money', screen: 'home' as Screen, emoji: '💵' },
    { label: 'Add money', screen: 'add-asset' as Screen, emoji: '➕' },
    { label: 'Goals', screen: 'goal' as Screen, emoji: '🎯' },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="left" 
        className="w-[300px] bg-white border-r-0 p-0"
      >
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <SheetDescription className="sr-only">Access your profile and navigate to different sections of the app</SheetDescription>
        
        {/* Profile Section */}
        <div className="bg-gradient-to-br from-[#FF9933] to-[#FFA93D] pt-6 pb-8 flex flex-col items-center">
          <Avatar className="w-20 h-20 border-4 border-white shadow-lg mb-6">
            <AvatarImage src="https://api.dicebear.com/7.x/adventurer/svg?seed=Felix" />
            <AvatarFallback className="bg-white text-[#5C4033] text-2xl">AK</AvatarFallback>
          </Avatar>
          
          <div className="text-white text-center mb-6">
            <h3 className="text-[28px] leading-[28px] mb-1 font-lora font-medium">Ahi</h3>
            <p className="text-sm text-white/90 leading-[20px]">Total {formatAmount(827)}</p>
          </div>
          
          {/* Currency Toggle */}
          <div className="inline-flex bg-[#FFF3E0] rounded-full relative h-8 w-[118px]">
            <button
              onClick={() => setCurrency('USD')}
              className={`relative z-10 flex-1 rounded-full text-xs font-semibold transition-colors flex items-center justify-center ${
                currency === 'USD'
                  ? 'text-white'
                  : 'text-[#8B7355]'
              }`}
            >
              USD
            </button>
            <button
              onClick={() => setCurrency('JPY')}
              className={`relative z-10 flex-1 rounded-full text-xs font-semibold transition-colors flex items-center justify-center ${
                currency === 'JPY'
                  ? 'text-white'
                  : 'text-[#8B7355]'
              }`}
            >
              JPY
            </button>
            <div
              className="absolute top-1 bottom-1 w-[54px] bg-gradient-to-b from-[#FFA93D] to-[#FFD740] rounded-full shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] transition-all duration-200 ease-in-out"
              style={{ 
                left: currency === 'USD' ? '4px' : '60px'
              }}
            />
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="px-6 pt-8 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-5 p-2 rounded-2xl hover:bg-[#FFF3E0]/50 transition-colors"
              onClick={() => onNavigate(item.screen)}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-[#FFF3E0] to-[#FFE4C4] rounded-3xl flex items-center justify-center shrink-0">
                <span className="text-xl leading-none">{item.emoji}</span>
              </div>
              <span className="text-sm text-[#5C4033]">{item.label}</span>
            </button>
          ))}
        </div>

        <Separator className="mx-6 mt-8 bg-[rgba(0,0,0,0.08)]" />

        {/* Settings Options */}
        <div className="px-6 pt-8 space-y-2">
          <button className="w-full flex items-center gap-5 px-3 py-3.5 rounded-2xl hover:bg-[#FFF3E0]/50 transition-colors">
            <Settings className="h-4 w-4 text-[#8B7355]" />
            <span className="text-sm text-[#5C4033]">Settings</span>
          </button>

          <button className="w-full flex items-center gap-5 px-3 py-3.5 rounded-2xl hover:bg-[#FFEBEE]/50 transition-colors">
            <LogOut className="h-4 w-4 text-[#FF6B6B]" />
            <span className="text-sm text-[#FF6B6B]">Log Out</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
