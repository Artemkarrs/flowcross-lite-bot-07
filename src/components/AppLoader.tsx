import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { giveStarterItems } from '@/lib/localdb';
import { Sparkles, Zap } from 'lucide-react';

const AppLoader = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<'loading' | 'complete'>('loading');

  useEffect(() => {
    // Initialize starter items
    giveStarterItems();

    // Progress animation
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setStage('complete');
          setTimeout(onComplete, 1000);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
      <div className="text-center space-y-8 animate-fade-in">
        {/* Logo */}
        <div className="relative">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center animate-pulse-glow">
            <Zap className="w-12 h-12 text-white" />
          </div>
          
          {/* Particles */}
          {Array.from({length: 12}).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-primary rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Title */}
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">
            FlowCross Bot
          </h1>
          <p className="text-muted-foreground">
            Загрузка игрового мира...
          </p>
        </div>

        {/* Progress */}
        <div className="w-64 mx-auto space-y-2">
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {progress < 50 ? 'Инициализация системы...' : 
             progress < 80 ? 'Загрузка компонентов...' : 
             progress < 100 ? 'Подготовка интерфейса...' : 
             'Готово!'}
          </p>
        </div>

        {stage === 'complete' && (
          <div className="animate-scale-in">
            <Sparkles className="w-8 h-8 text-primary mx-auto animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};

export default AppLoader;