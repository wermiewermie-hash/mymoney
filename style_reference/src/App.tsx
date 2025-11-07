import { useState } from 'react';
import { HomePage } from './components/HomePage';
import { AddAssetPage } from './components/AddAssetPage';
import { GoalPage } from './components/GoalPage';
import { SideMenu } from './components/SideMenu';
import { CurrencyProvider } from './utils/currency';

export type Screen = 'home' | 'add-asset' | 'goal';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [menuOpen, setMenuOpen] = useState(false);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomePage onNavigate={setCurrentScreen} onMenuOpen={() => setMenuOpen(true)} />;
      case 'add-asset':
        return <AddAssetPage onNavigate={setCurrentScreen} onMenuOpen={() => setMenuOpen(true)} />;
      case 'goal':
        return <GoalPage onNavigate={setCurrentScreen} onMenuOpen={() => setMenuOpen(true)} />;
      default:
        return <HomePage onNavigate={setCurrentScreen} onMenuOpen={() => setMenuOpen(true)} />;
    }
  };

  return (
    <CurrencyProvider>
      <div className="min-h-screen">
        {renderScreen()}
        <SideMenu 
          open={menuOpen} 
          onOpenChange={setMenuOpen}
          onNavigate={(screen) => {
            setCurrentScreen(screen);
            setMenuOpen(false);
          }}
        />
      </div>
    </CurrencyProvider>
  );
}
