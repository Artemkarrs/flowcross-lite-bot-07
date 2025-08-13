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
import { Play, Gamepad, CreditCard, Map } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isLoading, setIsLoading] = useState(true);


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
        
        {/* Content container with padding for clean spacing */}
        <main className="flex-1 p-6 pb-32 overflow-y-auto">
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
  const quickActions = [
    { id: 'clicker', icon: Play, label: 'Кликер', description: 'Зарабатывай кликами' },
    { id: 'cases', icon: Gamepad, label: 'Кейсы', description: 'Открывай награды' },
    { id: 'bank', icon: CreditCard, label: 'Банк', description: 'Управляй финансами' },
    { id: 'cards', icon: Map, label: 'Карты', description: 'Коллекционируй' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-light tracking-tight text-foreground">
          FlowCross
        </h1>
        <p className="text-lg text-muted-foreground font-light">
          Современный игровой лаунчер
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Card key={action.id} className="glass p-6 card-hover ripple cursor-pointer border-0">
              <div className="flex flex-col items-center space-y-3 text-center">
                <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-foreground">{action.label}</span>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main CTA */}
      <Card className="glass p-8 space-y-6 border-0">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-light text-foreground">FlowCross Launcher</h2>
          <p className="text-muted-foreground font-light leading-relaxed">
            Максимальная производительность и современный дизайн для вашего игрового опыта
          </p>
          <Button 
            className="glass-button w-full h-12 text-base font-medium ripple click-button border-0"
            onClick={() => window.open('https://flowcross.space', '_blank')}
          >
            Открыть FlowCross
          </Button>
        </div>
      </Card>

      {/* Performance Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4">
          <div className="text-3xl font-light text-foreground mb-2">490</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Avg FPS</div>
        </div>
        <div className="text-center p-4">
          <div className="text-3xl font-light text-primary mb-2">+60%</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Memory</div>
        </div>
        <div className="text-center p-4">
          <div className="text-3xl font-light text-primary mb-2">+40%</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Speed</div>
        </div>
      </div>
    </div>
  );
};

export default Index;