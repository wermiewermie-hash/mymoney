import { Menu, Plus, TrendingUp, Target, Wallet, Sparkles } from 'lucide-react';
import splashImage from 'figma:asset/55e7760cadc7ed914731026b6310ff4e8252991e.png';
import imgMyProgress from 'figma:asset/fabdb3143d370089bb19fccafe4aaa3e4c004562.png';
import imgWhatIOwn from 'figma:asset/69444ef31be0f1c5b6089fd39f95e4c964529fb3.png';
import imgTypesOfMoney from 'figma:asset/b9b9950ef4c186e7bdd6237f8362f9deb2db47c3.png';
import imgSavingsGoal from 'figma:asset/dcc9736b6c40c21c90cc199d0eb3f6d6c42bd5f2.png';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Screen } from '../App';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Area, AreaChart } from 'recharts';
import { motion } from 'motion/react';
import { useCurrency } from '../utils/currency';

interface HomePageProps {
  onNavigate: (screen: Screen) => void;
  onMenuOpen: () => void;
}

const netWorthData = [
  { name: 'Stocks', value: 402, color: '#52C41A' },
  { name: 'Savings', value: 350, color: '#00BCD4' },
  { name: 'Cash', value: 75, color: '#FFC107' },
];

// Asset breakdown for "What you have" pie chart
const assetBreakdown = [
  { name: 'Google', value: 180, color: '#52C41A' },
  { name: 'VTI', value: 222, color: '#00BCD4' },
  { name: 'Savings', value: 350, color: '#9C27B0' },
  { name: 'Cash', value: 75, color: '#FFC107' },
];

const timelineData = [
  { month: 'Jan', value: 650 },
  { month: 'Feb', value: 720 },
  { month: 'Mar', value: 680 },
  { month: 'Apr', value: 750 },
  { month: 'May', value: 827 },
];

export function HomePage({ onNavigate, onMenuOpen }: HomePageProps) {
  const { formatAmount } = useCurrency();
  const totalNetWorth = netWorthData.reduce((sum, item) => sum + item.value, 0);
  const goalProgress = (350 / 450) * 100;

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="px-6 pt-8 pb-0">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuOpen}
            className="rounded-full bg-gradient-to-br from-[#FFA93D] to-[#FFD740] hover:opacity-90 text-white shadow-md"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-white text-2xl font-lora font-medium [text-shadow:rgba(0,0,0,0.1)_0px_4px_6px]">My Money</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate('add-asset')}
            className="rounded-full bg-gradient-to-br from-[#FFA93D] to-[#FFD740] hover:opacity-90 text-white shadow-md"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>

        {/* Total Net Worth Card */}
        <div className="relative h-[240px] mb-4">
          {/* Decorative animated sparkles */}
          <motion.div 
            className="absolute left-[20px] top-[10px]"
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Sparkles className="w-8 h-8 text-[#FFA93D] fill-[#FFD740]" />
          </motion.div>
          <motion.div 
            className="absolute right-[25px] top-[15px]"
            animate={{ 
              y: [0, -8, 0],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          >
            <Sparkles className="w-8 h-8 text-[#FFA93D] fill-[#FFD740]" />
          </motion.div>
          <motion.div 
            className="absolute left-[45px] bottom-[35px]"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3
            }}
          >
            <Sparkles className="w-8 h-8 text-[#FFA93D] fill-[#FFD740]" />
          </motion.div>
          <motion.div 
            className="absolute right-[40px] bottom-[40px]"
            animate={{ 
              rotate: [0, -15, 15, 0],
              scale: [1, 1.15, 1]
            }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.8
            }}
          >
            <Sparkles className="w-8 h-8 text-[#FFA93D] fill-[#FFD740]" />
          </motion.div>
          <motion.div 
            className="absolute left-[15px] top-[95px]"
            animate={{ 
              x: [0, 5, -5, 0],
              rotate: [0, 5, -5, 0],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.2
            }}
          >
            <Sparkles className="w-8 h-8 text-[#FFA93D] fill-[#FFD740]" />
          </motion.div>
          <motion.div 
            className="absolute right-[15px] top-[65px]"
            animate={{ 
              rotate: [0, 20, -20, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 2.7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.0
            }}
          >
            <Sparkles className="w-8 h-8 text-[#FFA93D] fill-[#FFD740]" />
          </motion.div>
          <motion.div 
            className="absolute left-[35%] top-[5px]"
            animate={{ 
              y: [0, 6, 0],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 3.3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.6
            }}
          >
            <Sparkles className="w-8 h-8 text-[#FFA93D] fill-[#FFD740]" />
          </motion.div>
          <motion.div 
            className="absolute right-[60px] bottom-[15px]"
            animate={{ 
              x: [0, -4, 4, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 2.9,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.4
            }}
          >
            <Sparkles className="w-8 h-8 text-[#FFA93D] fill-[#FFD740]" />
          </motion.div>
          <motion.div 
            className="absolute left-[60%] bottom-[20px]"
            animate={{ 
              rotate: [0, -10, 10, 0],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 3.1,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.7
            }}
          >
            <Sparkles className="w-8 h-8 text-[#FFA93D] fill-[#FFD740]" />
          </motion.div>
          <motion.div 
            className="absolute left-[25%] bottom-[50px]"
            animate={{ 
              y: [0, -5, 0],
              scale: [1, 1.15, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 3.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.9
            }}
          >
            <Sparkles className="w-8 h-8 text-[#FFA93D] fill-[#FFD740]" />
          </motion.div>

          <div className="absolute bottom-0 h-[170px] left-0 rounded-[24px] w-full border-[0.592px] border-[rgba(0,0,0,0.1)] border-solid shadow-[0px_8px_8px_0px_rgba(0,0,0,0.14)]" style={{ backgroundImage: 'linear-gradient(rgb(255, 255, 255) 0%, rgb(255, 248, 225) 100%)' }}>
            <div className="text-center pt-[67px] pb-6">
              <div className="text-5xl text-[#5C4033] mb-1 font-lora font-medium">{formatAmount(totalNetWorth)}</div>
              <h2 className="text-[#5C4033]">Total</h2>
            </div>
          </div>
          
          {/* Illustration */}
          <div className="absolute h-[116px] left-1/2 top-0 -translate-x-1/2 w-[116px] overflow-hidden">
            <img 
              alt="Money illustration" 
              className="w-[140%] h-[140%] object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" 
              src={splashImage} 
            />
          </div>
        </div>
      </div>

      {/* Content Cards */}
      <div className="px-6 space-y-4">
        {/* History */}
        <div className="rounded-[24px] p-6 border-[0.592px] border-[rgba(0,0,0,0.1)] border-solid shadow-[0px_8px_8px_0px_rgba(0,0,0,0.14)]" style={{ backgroundImage: 'linear-gradient(rgb(255, 255, 255) 0%, rgb(255, 248, 225) 100%)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden">
              <img 
                alt="" 
                className="w-[124.5px] h-[78px] object-cover object-center" 
                style={{ transform: 'translate(calc(-50% + 24px), calc(-22% + 12px))' }}
                src={imgMyProgress} 
              />
            </div>
            <div>
              <h3 className="text-[#5C4033]">My Progress</h3>
            </div>
          </div>
          
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#52C41A" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#52C41A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8B7355', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8B7355', fontSize: 12 }}
                  width={40}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#52C41A" 
                  strokeWidth={3}
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* What you have - Pie Chart */}
        <div className="rounded-[24px] p-6 border-[0.592px] border-[rgba(0,0,0,0.1)] border-solid shadow-[0px_8px_8px_0px_rgba(0,0,0,0.14)]" style={{ backgroundImage: 'linear-gradient(rgb(255, 255, 255) 0%, rgb(255, 248, 225) 100%)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden">
              <img 
                alt="" 
                className="w-[124.5px] h-[78px] object-cover object-center" 
                style={{ transform: 'translate(calc(-50% + 24px), calc(-18% + 12px))' }}
                src={imgWhatIOwn} 
              />
            </div>
            <div>
              <h3 className="text-[#5C4033]">What I own</h3>
            </div>
          </div>
          
          {/* Pie Chart */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {assetBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {assetBreakdown.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-[#5C4033]">{item.name} {formatAmount(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* My Money */}
        <div className="rounded-[24px] p-6 border-[0.592px] border-[rgba(0,0,0,0.1)] border-solid shadow-[0px_8px_8px_0px_rgba(0,0,0,0.14)]" style={{ backgroundImage: 'linear-gradient(rgb(255, 255, 255) 0%, rgb(255, 248, 225) 100%)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden">
              <img 
                alt="" 
                className="w-[100.5px] h-[63px] object-cover object-center" 
                style={{ transform: 'translate(calc(-50% + 24px), calc(-12% + 12px))' }}
                src={imgTypesOfMoney} 
              />
            </div>
            <div>
              <h3 className="text-[#5C4033]">Types of money</h3>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[#F0F9FF] rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-lg">🔤</span>
                </div>
                <div>
                  <p className="text-[#5C4033] font-medium">Google</p>
                  <p className="text-sm text-[#8B7355]">2 shares</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[#5C4033]">{formatAmount(180)}</p>
                <p className="text-sm text-[#52C41A]">+12%</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-[#F0F9FF] rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-lg">📊</span>
                </div>
                <div>
                  <p className="text-[#5C4033]">VTI</p>
                  <p className="text-sm text-[#8B7355]">200 shares</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[#5C4033]">{formatAmount(222)}</p>
                <p className="text-sm text-[#52C41A]">+8%</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#F0FDF4] rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-lg">💵</span>
                </div>
                <div>
                  <p className="text-[#5C4033]">Cash</p>
                  <p className="text-sm text-[#8B7355]">Savings</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[#5C4033]">{formatAmount(425)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Savings Goal Card */}
        <div 
          className="rounded-[24px] p-6 border-[0.592px] border-[rgba(0,0,0,0.1)] border-solid shadow-[0px_8px_8px_0px_rgba(0,0,0,0.14)] cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => onNavigate('goal')}
          style={{ backgroundImage: 'linear-gradient(rgb(255, 255, 255) 0%, rgb(255, 248, 225) 100%)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden">
              <img 
                alt="" 
                className="w-[119.25px] h-[74.25px] object-cover object-center" 
                style={{ transform: 'translate(calc(-50% + 24px), calc(-17% + 12px))' }}
                src={imgSavingsGoal} 
              />
            </div>
            <div>
              <h3 className="text-[#5C4033]">Savings Goal</h3>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-2xl text-[#5C4033] font-lora font-medium">{formatAmount(350)}</span>
              <span className="text-[#8B7355]">of {formatAmount(450)}</span>
            </div>
            
            <Progress value={goalProgress} className="h-3" />
            
            <div className="flex items-center gap-2 justify-center p-3 bg-gradient-to-r from-[#FFF3E0] to-[#FFE4C4] rounded-2xl">
              <span className="text-2xl">🎮</span>
              <p className="text-sm text-[#8B5A3C]">Only {formatAmount(100)} more to go!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
