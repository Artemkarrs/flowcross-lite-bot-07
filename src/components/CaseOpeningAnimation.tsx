import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Package, Sparkles } from 'lucide-react';
import { InventoryItem, CASE_CONTENTS, CaseItem } from '@/lib/localdb';

interface CaseOpeningAnimationProps {
  caseItem: InventoryItem;
  onComplete: (reward: CaseItem) => void;
  onClose: () => void;
}

const CaseOpeningAnimation = ({ caseItem, onComplete, onClose }: CaseOpeningAnimationProps) => {
  const [stage, setStage] = useState<'opening' | 'revealing' | 'complete'>('opening');
  const [selectedReward, setSelectedReward] = useState<CaseItem | null>(null);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number}>>([]);

  useEffect(() => {
    // Create particles
    const newParticles = Array.from({length: 20}, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100
    }));
    setParticles(newParticles);

    // Start opening animation
    const timer1 = setTimeout(() => {
      setStage('revealing');
      selectReward();
    }, 2000);

    const timer2 = setTimeout(() => {
      setStage('complete');
    }, 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const selectReward = () => {
    const caseContents = CASE_CONTENTS.starter_case; // Default to starter case
    const rand = Math.random() * 100;
    let cumulative = 0;
    
    for (const item of caseContents) {
      cumulative += item.chance;
      if (rand <= cumulative) {
        setSelectedReward(item);
        return;
      }
    }
    
    // Fallback to first item
    setSelectedReward(caseContents[0]);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-yellow-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'coins': return '💰';
      case 'gems': return '💎';
      case 'skin': return '👕';
      default: return '🎁';
    }
  };

  const handleComplete = () => {
    if (selectedReward) {
      onComplete(selectedReward);
      onClose(); // Закрываем после обработки награды
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
      {/* Particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute pointer-events-none"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animation: `sparkle ${Math.random() * 2 + 1}s ease-in-out infinite`
          }}
        >
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
      ))}

      <Card className="glass p-8 w-80 mx-4 text-center relative">
        {stage === 'complete' && (
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2"
          >
            <X className="w-4 h-4" />
          </Button>
        )}

        {stage === 'opening' && (
          <div className="space-y-6">
            <div className="relative">
              <Package className="w-24 h-24 mx-auto text-primary animate-bounce" />
              <div className="absolute inset-0 animate-pulse">
                <Package className="w-24 h-24 mx-auto text-primary/50" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Открытие кейса...</h3>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
              </div>
            </div>
          </div>
        )}

        {stage === 'revealing' && selectedReward && (
          <div className="space-y-6">
            <div className={`relative p-6 rounded-lg bg-gradient-to-br ${getRarityColor(selectedReward.rarity)} animate-scale-in`}>
              <div className="text-6xl mb-2 animate-bounce">
                {getRewardIcon(selectedReward.type)}
              </div>
              <Badge className="bg-black/20 text-white">
                {selectedReward.rarity}
              </Badge>
            </div>
            <div>
              <h3 className="text-xl font-bold">Получен приз!</h3>
              <p className="text-muted-foreground">Определение награды...</p>
            </div>
          </div>
        )}

        {stage === 'complete' && selectedReward && (
          <div className="space-y-6">
            <div className={`relative p-6 rounded-lg bg-gradient-to-br ${getRarityColor(selectedReward.rarity)} animate-pulse-glow`}>
              <div className="text-6xl mb-2">
                {getRewardIcon(selectedReward.type)}
              </div>
              <Badge className="bg-black/20 text-white">
                {selectedReward.rarity}
              </Badge>
            </div>
            <div>
              <h3 className="text-xl font-bold gradient-text">{selectedReward.name}</h3>
              <p className="text-muted-foreground">
                {selectedReward.type === 'coins' && `${selectedReward.value} монет`}
                {selectedReward.type === 'gems' && `${selectedReward.value} гемов`}
                {selectedReward.type === 'skin' && 'Новый скин!'}
              </p>
            </div>
            <Button
              onClick={handleComplete}
              className="w-full glass-button"
            >
              Забрать награду
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CaseOpeningAnimation;