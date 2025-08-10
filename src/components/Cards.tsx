import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Clock, Gift } from 'lucide-react';
import { canDrawCard, drawCard, addInventoryItem, getLastCardTime, addGems, addBalance, CardReward } from '@/lib/localdb';
import { toast } from '@/hooks/use-toast';

const Cards = () => {
  const [canDraw, setCanDraw] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnCard, setDrawnCard] = useState<CardReward | null>(null);
  const [showReward, setShowReward] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const can = canDrawCard();
      setCanDraw(can);
      
      if (!can) {
        const lastTime = getLastCardTime();
        const hourInMs = 60 * 60 * 1000;
        const nextTime = lastTime + hourInMs;
        const remaining = Math.max(0, nextTime - Date.now());
        setTimeLeft(remaining);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / (60 * 1000));
    const seconds = Math.floor((ms % (60 * 1000)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDrawCard = async () => {
    if (!canDraw) return;
    
    setIsDrawing(true);
    
    // Animation delay
    setTimeout(() => {
      try {
        const reward = drawCard();
        setDrawnCard(reward);
        setShowReward(true);
        
        // Add reward to inventory/balance
        if (reward.type === 'coins') {
          addBalance(reward.value);
        } else if (reward.type === 'gems') {
          addGems(reward.value);
        } else {
          addInventoryItem({
            type: reward.type as any,
            name: reward.name,
            rarity: reward.rarity,
            description: reward.description
          });
        }
        
        toast({
          title: "🎴 Карта получена!",
          description: `${reward.icon} ${reward.name}`,
        });
        
        setCanDraw(false);
      } catch (error) {
        toast({
          title: "❌ Ошибка",
          description: "Не удалось получить карту",
          variant: "destructive"
        });
      } finally {
        setIsDrawing(false);
      }
    }, 2000);
  };

  const closeReward = () => {
    setShowReward(false);
    setDrawnCard(null);
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

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold gradient-text">
            Карты
          </h1>
          <p className="text-muted-foreground text-sm">
            Получайте бесплатные карты каждый час
          </p>
        </div>

        <Card className="glass p-6 space-y-6">
          {/* Card Drawing Area */}
          <div className="text-center space-y-4">
            <div className="relative">
              <div className={`w-32 h-44 mx-auto rounded-lg border-2 border-primary/20 flex items-center justify-center transition-all duration-500 ${
                isDrawing ? 'animate-pulse scale-110' : 'hover:scale-105'
              }`}>
                {isDrawing ? (
                  <div className="space-y-2">
                    <Sparkles className="w-12 h-12 text-primary animate-spin mx-auto" />
                    <div className="text-xs text-muted-foreground">Открытие...</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Gift className="w-12 h-12 text-primary mx-auto" />
                    <div className="text-xs text-muted-foreground">Карта</div>
                  </div>
                )}
              </div>
              
              {isDrawing && (
                <div className="absolute inset-0 pointer-events-none">
                  {Array.from({length: 8}).map((_, i) => (
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
              )}
            </div>

            {canDraw ? (
              <Button
                onClick={handleDrawCard}
                disabled={isDrawing}
                className="glass-button w-full py-3"
              >
                {isDrawing ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                    Открытие карты...
                  </>
                ) : (
                  <>
                    <Gift className="w-5 h-5 mr-2" />
                    Получить карту
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Следующая карта через: {formatTime(timeLeft)}</span>
                </div>
                <Progress value={(3600000 - timeLeft) / 36000} className="h-2" />
                <Button disabled className="w-full">
                  Ожидание...
                </Button>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">Что можно получить?</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <span>💰</span>
                <span>Монеты</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>💎</span>
                <span>Гемы</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>👕</span>
                <span>Скины</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>⚡</span>
                <span>Абилки</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>⬆️</span>
                <span>Улучшения</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🎁</span>
                <span>И многое другое!</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Rarity Info */}
        <Card className="glass p-4">
          <h4 className="font-semibold mb-3">Редкость предметов:</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-500 rounded"></div>
                <span className="text-sm">Обычные</span>
              </div>
              <span className="text-xs text-muted-foreground">40%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-sm">Редкие</span>
              </div>
              <span className="text-xs text-muted-foreground">30%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span className="text-sm">Эпические</span>
              </div>
              <span className="text-xs text-muted-foreground">20%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-sm">Легендарные</span>
              </div>
              <span className="text-xs text-muted-foreground">10%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Reward Modal */}
      {showReward && drawnCard && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <Card className="glass p-8 w-80 mx-4 text-center relative animate-scale-in">
            <div className="space-y-6">
              <div className={`relative p-6 rounded-lg bg-gradient-to-br ${getRarityColor(drawnCard.rarity)} animate-pulse-glow`}>
                <div className="text-6xl mb-2">
                  {drawnCard.icon}
                </div>
                <Badge className="bg-black/20 text-white">
                  {drawnCard.rarity}
                </Badge>
              </div>
              <div>
                <h3 className="text-xl font-bold gradient-text">{drawnCard.name}</h3>
                <p className="text-muted-foreground text-sm mt-2">
                  {drawnCard.description}
                </p>
              </div>
              <Button onClick={closeReward} className="w-full glass-button">
                Забрать награду
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default Cards;