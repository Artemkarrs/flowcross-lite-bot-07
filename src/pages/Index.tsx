import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import ClickerGame from '@/components/games/ClickerGame';
import EnhancedCasesGame from '@/components/games/EnhancedCasesGame';
import Inventory from '@/components/Inventory';
import BankingApp from '@/components/BankingApp';
import Cards from '@/components/Cards';
import AppLoader from '@/components/AppLoader';
import GemCounter from '@/components/GemCounter';
import GemCollector from '@/components/GemCollector';
import GameDataManager from '@/components/GameDataManager';
import AppleDemo from '@/components/apple/AppleDemo';
import { enableAutoSave, loadAllGameData } from '@/lib/localdb';
import { Play, Gamepad, MessageCircle, CreditCard, Info } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isLoading, setIsLoading] = useState(true);

  // Инициализация системы сохранений
  useEffect(() => {
    // Загрузить все данные при запуске
    loadAllGameData();
    // Включить автосохранение
    enableAutoSave();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'clicker':
        return <div className="animate-slide-in-right"><ClickerGame /></div>;
      case 'cases':
        return <div className="animate-fade-in"><EnhancedCasesGame /></div>;
      case 'inventory':
        return <div className="animate-scale-in"><Inventory /></div>;
      case 'bank':
        return <div className="animate-fade-in"><BankingApp /></div>;
      case 'cards':
        return <div className="animate-slide-in-left"><Cards /></div>;
      case 'data':
        return <div className="animate-scale-in"><GameDataManager /></div>;
      case 'apple':
        return <div className="animate-fade-in"><AppleDemo /></div>;
      default:
        return <div className="animate-fade-in"><HomeContent /></div>;
    }
  };

  if (isLoading) {
    return <AppLoader onComplete={() => setIsLoading(false)} />;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden enhanced-bg">
      <div className="relative z-10 flex flex-col h-screen max-w-md mx-auto">
        <GemCounter />
        <main className="flex-1 p-4 pb-28 overflow-y-auto">
          <div className="fade-in">
            {renderContent()}
          </div>
        </main>
        
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
};

// Particles component
const ParticlesBackground = () => {
  const [particles, setParticles] = useState<Array<{id: number, left: number, delay: number}>>([]);

  useEffect(() => {
    const particleArray = Array.from({length: 15}, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 20
    }));
    setParticles(particleArray);
  }, []);

  return (
    <div className="particles">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.left}%`,
            animationDelay: `${particle.delay}s`
          }}
        />
      ))}
    </div>
  );
};

// Stars component
const Stars = () => {
  const [stars, setStars] = useState<Array<{id: number, top: number, left: number, delay: number}>>([]);

  useEffect(() => {
    const starArray = Array.from({length: 20}, (_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 4
    }));
    setStars(starArray);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none">
      {stars.map(star => (
        <div
          key={star.id}
          className="star"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            animationDelay: `${star.delay}s`
          }}
        />
      ))}
    </div>
  );
};

const HomeContent = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">
          FlowCross Bot
        </h1>
        <p className="text-muted-foreground text-sm opacity-80">
          Поддержка игроков FlowCross Launcher
        </p>
      </div>

      {/* Main Container */}
      <Card className="glass p-6 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="glass p-6 card-hover ripple cursor-pointer">
            <div className="flex flex-col items-center space-y-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Play className="w-7 h-7 text-primary animate-pulse" />
              </div>
              <span className="text-sm font-medium">Кликер</span>
            </div>
          </Card>
          
          <Card className="glass p-6 card-hover ripple cursor-pointer">
            <div className="flex flex-col items-center space-y-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Gamepad className="w-7 h-7 text-primary animate-pulse" style={{animationDelay: '0.5s'}} />
              </div>
              <span className="text-sm font-medium">Кейсы</span>
            </div>
          </Card>
          
          <Card className="glass p-6 card-hover ripple cursor-pointer">
            <div className="flex flex-col items-center space-y-3">
              <div className="p-2 rounded-full bg-primary/10">
                <CreditCard className="w-7 h-7 text-primary animate-pulse" style={{animationDelay: '1s'}} />
              </div>
              <span className="text-sm font-medium">Банк</span>
            </div>
          </Card>
          
          <Card className="glass p-6 card-hover ripple cursor-pointer">
            <div className="flex flex-col items-center space-y-3">
              <div className="p-2 rounded-full bg-primary/10">
                <span className="text-2xl animate-pulse" style={{animationDelay: '1.5s'}}>🎴</span>
              </div>
              <span className="text-sm font-medium">Карты</span>
            </div>
          </Card>
        </div>

        {/* Main Site Link */}
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold gradient-text">FlowCross Launcher</h3>
          <p className="text-sm text-muted-foreground/80">
            Современный игровой лаунчер Minecraft для максимальной производительности
          </p>
          <Button 
            className="glass-button w-full ripple text-base py-3"
            onClick={() => window.open('https://flowcross.space', '_blank')}
          >
            Перейти на сайт
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-5 text-center">
            <div className="text-3xl font-bold gradient-text mb-1">490</div>
            <div className="text-xs text-muted-foreground/70 uppercase tracking-wide">Avg FPS</div>
          </div>
          <div className="p-5 text-center">
            <div className="text-3xl font-bold gradient-text mb-1">+60%</div>
            <div className="text-xs text-muted-foreground/70 uppercase tracking-wide">Memory</div>
          </div>
          <div className="p-5 text-center">
            <div className="text-3xl font-bold gradient-text mb-1">+40%</div>
            <div className="text-xs text-muted-foreground/70 uppercase tracking-wide">Speed</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Index;