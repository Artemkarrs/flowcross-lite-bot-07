import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Gift, Star, Diamond, Crown, Shield, Zap, Eye, Sparkles, Coins, Gamepad, Gem, Trophy, Target, Heart, Flame, Snowflake, Skull } from 'lucide-react';

interface CaseReward {
  type: 'coins' | 'skin' | 'ability' | 'flowplus' | 'verification' | 'multiplier' | 'gems';
  chance: number;
  amountMin?: number;
  amountMax?: number;
  name?: string;
  icon?: React.ReactNode;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
}

interface CaseConfig {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'FC' | 'gems';
  color: string;
  icon: React.ReactNode;
  rewards: CaseReward[];
  minLevel?: number;
  dailyLimit?: number;
}

const CASES: CaseConfig[] = [
  {
    id: 'starter',
    name: 'Стартовый кейс',
    description: 'Идеально для новичков',
    price: 100,
    currency: 'FC',
    color: 'border-gray-400',
    icon: <Gift className="w-6 h-6" />,
    rewards: [
      { type: 'coins', chance: 0.9, amountMin: 50, amountMax: 200, rarity: 'common' },
      { type: 'multiplier', chance: 0.09, amountMin: 2, amountMax: 5, rarity: 'rare' },
      { type: 'gems', chance: 0.01, amountMin: 1, amountMax: 3, rarity: 'epic' },
    ],
  },
  {
    id: 'common',
    name: 'Обычный кейс',
    description: 'Сбалансированные награды',
    price: 250,
    currency: 'FC',
    color: 'border-green-400',
    icon: <Star className="w-6 h-6" />,
    rewards: [
      { type: 'verification', chance: 0.00000001, rarity: 'mythic' },
      { type: 'flowplus', chance: 0.00001, rarity: 'legendary' },
      { type: 'ability', chance: 0.03, name: 'Базовые способности', rarity: 'epic' },
      { type: 'multiplier', chance: 0.12, amountMin: 3, amountMax: 8, rarity: 'rare' },
      { type: 'gems', chance: 0.05, amountMin: 2, amountMax: 5, rarity: 'epic' },
      { type: 'coins', chance: 0.869989, amountMin: 150, amountMax: 500, rarity: 'common' },
    ],
  },
  {
    id: 'rare',
    name: 'Редкий кейс',
    description: 'Повышенные шансы на ценные награды',
    price: 1500,
    currency: 'FC',
    color: 'border-blue-400',
    icon: <Diamond className="w-6 h-6" />,
    rewards: [
      { type: 'verification', chance: 0.00000001, rarity: 'mythic' },
      { type: 'flowplus', chance: 0.00005, rarity: 'legendary' },
      { type: 'ability', chance: 0.1, name: 'Редкие способности', rarity: 'epic' },
      { type: 'multiplier', chance: 0.3, amountMin: 5, amountMax: 15, rarity: 'epic' },
      { type: 'gems', chance: 0.1, amountMin: 3, amountMax: 8, rarity: 'epic' },
      { type: 'coins', chance: 0.69995, amountMin: 800, amountMax: 3000, rarity: 'rare' },
    ],
  },
  {
    id: 'legendary',
    name: 'Легендарный кейс',
    description: 'Эксклюзивные награды для избранных',
    price: 10000,
    currency: 'FC',
    color: 'border-purple-400',
    icon: <Crown className="w-6 h-6" />,
    rewards: [
      { type: 'verification', chance: 0.00000001, rarity: 'mythic' },
      { type: 'flowplus', chance: 0.0001, rarity: 'legendary' },
      { type: 'ability', chance: 0.18, name: 'Легендарные способности', rarity: 'legendary' },
      { type: 'multiplier', chance: 0.47, amountMin: 10, amountMax: 25, rarity: 'legendary' },
      { type: 'gems', chance: 0.2, amountMin: 5, amountMax: 15, rarity: 'legendary' },
      { type: 'coins', chance: 0.1498, amountMin: 5000, amountMax: 25000, rarity: 'epic' },
    ],
  },
  {
    id: 'mythic',
    name: 'Мифический кейс',
    description: 'Невероятно редкие сокровища',
    price: 25,
    currency: 'gems',
    color: 'border-orange-400',
    icon: <Flame className="w-6 h-6" />,
    dailyLimit: 3,
    minLevel: 50,
    rewards: [
      { type: 'verification', chance: 0.000001, rarity: 'mythic' },
      { type: 'flowplus', chance: 0.001, rarity: 'legendary' },
      { type: 'ability', chance: 0.3, name: 'Мифические способности', rarity: 'mythic' },
      { type: 'multiplier', chance: 0.65, amountMin: 20, amountMax: 50, rarity: 'mythic' },
      { type: 'gems', chance: 0.04, amountMin: 10, amountMax: 30, rarity: 'legendary' },
      { type: 'coins', chance: 0.008999, amountMin: 15000, amountMax: 75000, rarity: 'legendary' },
    ],
  },
  {
    id: 'winter',
    name: 'Зимний кейс',
    description: 'Сезонное событие - ограниченное время!',
    price: 500,
    currency: 'FC',
    color: 'border-cyan-400',
    icon: <Snowflake className="w-6 h-6" />,
    dailyLimit: 10,
    rewards: [
      { type: 'ability', chance: 0.45, name: 'Ледяные способности', rarity: 'rare' },
      { type: 'multiplier', chance: 0.1, amountMin: 3, amountMax: 12, rarity: 'rare' },
      { type: 'gems', chance: 0.05, amountMin: 2, amountMax: 8, rarity: 'epic' },
      { type: 'coins', chance: 0.4, amountMin: 300, amountMax: 1200, rarity: 'rare' },
    ],
  },
  {
    id: 'shadow',
    name: 'Теневой кейс',
    description: 'Тёмные силы и запретные награды',
    price: 50,
    currency: 'gems',
    color: 'border-gray-800',
    icon: <Skull className="w-6 h-6" />,
    minLevel: 75,
    dailyLimit: 5,
    rewards: [
      { type: 'ability', chance: 0.6, name: 'Тёмные способности', rarity: 'epic' },
      { type: 'multiplier', chance: 0.2, amountMin: 15, amountMax: 40, rarity: 'legendary' },
      { type: 'gems', chance: 0.15, amountMin: 8, amountMax: 25, rarity: 'legendary' },
      { type: 'coins', chance: 0.05, amountMin: 10000, amountMax: 50000, rarity: 'legendary' },
    ],
  },
  {
    id: 'neon',
    name: 'Неоновый кейс',
    description: 'Светящиеся награды будущего',
    price: 750,
    currency: 'FC',
    color: 'border-pink-400',
    icon: <Zap className="w-6 h-6" />,
    rewards: [
      { type: 'ability', chance: 0.45, name: 'Электрические способности', rarity: 'rare' },
      { type: 'multiplier', chance: 0.15, amountMin: 5, amountMax: 18, rarity: 'epic' },
      { type: 'gems', chance: 0.1, amountMin: 3, amountMax: 10, rarity: 'rare' },
      { type: 'coins', chance: 0.3, amountMin: 400, amountMax: 1800, rarity: 'rare' },
    ],
  },
  {
    id: 'premium',
    name: 'Премиум кейс',
    description: 'Эксклюзивный контент для VIP игроков',
    price: 5000,
    currency: 'FC',
    color: 'border-yellow-400',
    icon: <Trophy className="w-6 h-6" />,
    minLevel: 30,
    rewards: [
      { type: 'ability', chance: 0.55, name: 'Премиум способности', rarity: 'epic' },
      { type: 'multiplier', chance: 0.2, amountMin: 8, amountMax: 22, rarity: 'epic' },
      { type: 'gems', chance: 0.15, amountMin: 4, amountMax: 12, rarity: 'epic' },
      { type: 'coins', chance: 0.1, amountMin: 2500, amountMax: 8000, rarity: 'epic' },
    ],
  },
  {
    id: 'heart',
    name: 'Валентинов кейс',
    description: 'Романтические награды с любовью',
    price: 400,
    currency: 'FC',
    color: 'border-red-400',
    icon: <Heart className="w-6 h-6" />,
    dailyLimit: 15,
    rewards: [
      { type: 'ability', chance: 0.4, name: 'Любовные способности', rarity: 'rare' },
      { type: 'multiplier', chance: 0.1, amountMin: 4, amountMax: 14, rarity: 'rare' },
      { type: 'gems', chance: 0.05, amountMin: 2, amountMax: 6, rarity: 'epic' },
      { type: 'coins', chance: 0.45, amountMin: 200, amountMax: 800, rarity: 'common' },
    ],
  },
  {
    id: 'cosmic',
    name: 'Космический кейс',
    description: 'Межгалактические сокровища',
    price: 80,
    currency: 'gems',
    color: 'border-purple-600',
    icon: <Sparkles className="w-6 h-6" />,
    minLevel: 100,
    dailyLimit: 2,
    rewards: [
      { type: 'verification', chance: 0.000005, rarity: 'mythic' },
      { type: 'flowplus', chance: 0.0005, rarity: 'legendary' },
      { type: 'ability', chance: 0.75, name: 'Космические способности', rarity: 'mythic' },
      { type: 'multiplier', chance: 0.2, amountMin: 25, amountMax: 75, rarity: 'mythic' },
      { type: 'gems', chance: 0.04, amountMin: 15, amountMax: 50, rarity: 'legendary' },
      { type: 'coins', chance: 0.004995, amountMin: 25000, amountMax: 100000, rarity: 'legendary' },
    ],
  }
];

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'text-gray-400 border-gray-400';
    case 'rare': return 'text-blue-400 border-blue-400';
    case 'epic': return 'text-purple-400 border-purple-400';
    case 'legendary': return 'text-orange-400 border-orange-400';
    case 'mythic': return 'text-red-400 border-red-400 animate-pulse';
    default: return 'text-gray-400 border-gray-400';
  }
};

const getRarityName = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'Обычный';
    case 'rare': return 'Редкий';
    case 'epic': return 'Эпический';
    case 'legendary': return 'Легендарный';
    case 'mythic': return 'Мифический';
    default: return 'Обычный';
  }
};

const ALL_SKINS = [
  { id: 'fire', name: 'Огненный', rarity: 'rare' },
  { id: 'electric', name: 'Электрический', rarity: 'rare' },
  { id: 'cosmic', name: 'Космический', rarity: 'epic' },
  { id: 'royal', name: 'Королевский', rarity: 'epic' },
  { id: 'diamond', name: 'Алмазный', rarity: 'legendary' },
  { id: 'rainbow', name: 'Радужный', rarity: 'legendary' },
  { id: 'shadow', name: 'Теневой', rarity: 'legendary' },
  { id: 'ice', name: 'Ледяной', rarity: 'epic' },
  { id: 'nature', name: 'Природный', rarity: 'epic' },
  { id: 'winter', name: 'Зимний', rarity: 'rare' },
  { id: 'dark', name: 'Тёмный', rarity: 'legendary' },
  { id: 'golden', name: 'Золотой', rarity: 'mythic' },
  { id: 'crystal', name: 'Кристальный', rarity: 'mythic' },
  { id: 'phoenix', name: 'Феникс', rarity: 'mythic' },
  { id: 'neon', name: 'Неоновый', rarity: 'epic' },
  { id: 'plasma', name: 'Плазменный', rarity: 'legendary' }
];

const ALL_ABILITIES = [
  { id: 'double_coins', name: 'Двойные монеты', rarity: 'rare' },
  { id: 'auto_burst', name: 'Авто-взрыв', rarity: 'epic' },
  { id: 'critical_boost', name: 'Критический бонус', rarity: 'epic' },
  { id: 'coin_rain', name: 'Дождь монет', rarity: 'legendary' },
  { id: 'auto_upgrade', name: 'Авто-улучшение', rarity: 'legendary' },
  { id: 'ice_freeze', name: 'Ледяная заморозка', rarity: 'rare' },
  { id: 'shadow_clone', name: 'Теневой клон', rarity: 'mythic' },
  { id: 'time_warp', name: 'Искажение времени', rarity: 'mythic' },
  { id: 'midas_touch', name: 'Прикосновение Мидаса', rarity: 'legendary' }
];

const EnhancedCasesGame = () => {
  const { toast } = useToast();
  const [opening, setOpening] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<CaseConfig | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [demoResults, setDemoResults] = useState<any[]>([]);
  const [gems] = useState(() => parseInt(localStorage.getItem('playerGems') || '0'));
  const [dailyOpenings, setDailyOpenings] = useState<{[key: string]: number}>(() => 
    JSON.parse(localStorage.getItem('dailyCaseOpenings') || '{}')
  );
  const [animationItems, setAnimationItems] = useState<any[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [finalResult, setFinalResult] = useState<any>(null);

  // Сброс дневных лимитов
  useEffect(() => {
    const now = new Date();
    const lastReset = localStorage.getItem('lastDailyReset');
    const today = now.toDateString();
    
    if (lastReset !== today) {
      setDailyOpenings({});
      localStorage.setItem('dailyCaseOpenings', '{}');
      localStorage.setItem('lastDailyReset', today);
    }
  }, []);

  const getPlayerLevel = () => {
    const coins = parseInt(localStorage.getItem('clickerCoins') || '0');
    return Math.floor(coins / 500) + 1;
  };

  const simulateOpening = (caseConfig: CaseConfig, count: number = 1) => {
    const results = [];
    for (let i = 0; i < count; i++) {
      const roll = Math.random();
      let acc = 0;
      let reward = caseConfig.rewards[caseConfig.rewards.length - 1];
      
      for (const r of caseConfig.rewards) {
        acc += r.chance;
        if (roll < acc) {
          reward = r;
          break;
        }
      }
      
      results.push({
        type: reward.type,
        rarity: reward.rarity,
        amount: reward.amountMin && reward.amountMax 
          ? Math.floor(reward.amountMin + Math.random() * (reward.amountMax - reward.amountMin + 1))
          : 1,
        name: reward.name || reward.type
      });
    }
    return results;
  };

  const openCase = (caseConfig: CaseConfig) => {
    if (opening || isAnimating) return;
    
    // Проверка дневного лимита для кейсов с монетами
    const DAILY_COIN_LIMIT = 10000;
    const currentDaily = parseInt(localStorage.getItem('clickerDailyCoins') || '0');
    const hasCoinsReward = caseConfig.rewards.some(r => r.type === 'coins');
    
    if (hasCoinsReward && currentDaily >= DAILY_COIN_LIMIT) {
      toast({
        title: 'Дневной лимит достигнут',
        description: `Кейс можно открыть, но монеты не будут начислены (лимит ${DAILY_COIN_LIMIT.toLocaleString()}/день)`,
        variant: 'destructive'
      });
    }
    
    const playerLevel = getPlayerLevel();
    if (caseConfig.minLevel && playerLevel < caseConfig.minLevel) {
      toast({
        title: 'Недостаточный уровень',
        description: `Нужен ${caseConfig.minLevel} уровень (текущий: ${playerLevel})`,
        variant: 'destructive'
      });
      return;
    }

    if (caseConfig.dailyLimit) {
      const today = dailyOpenings[caseConfig.id] || 0;
      if (today >= caseConfig.dailyLimit) {
        toast({
          title: 'Дневной лимит',
          description: `Можно открыть только ${caseConfig.dailyLimit} кейсов в день`,
          variant: 'destructive'
        });
        return;
      }
    }

    const balance = caseConfig.currency === 'FC' 
      ? parseInt(localStorage.getItem('clickerCoins') || '0')
      : gems;
    
    if (balance < caseConfig.price) {
      toast({
        title: `Недостаточно ${caseConfig.currency}`,
        description: `Нужно ${caseConfig.price.toLocaleString()} ${caseConfig.currency}`,
        variant: 'destructive'
      });
      return;
    }

    setOpening(caseConfig.id);
    setIsAnimating(true);

    // Списание средств
    if (caseConfig.currency === 'FC') {
      const coins = parseInt(localStorage.getItem('clickerCoins') || '0');
      localStorage.setItem('clickerCoins', String(coins - caseConfig.price));
    } else {
      const newGems = gems - caseConfig.price;
      localStorage.setItem('playerGems', String(newGems));
    }

    // Создание анимационной ленты
    const items = [];
    const winningResult = simulateOpening(caseConfig, 1)[0];
    
    // Добавляем 50 случайных предметов + выигрышный в конце
    for (let i = 0; i < 50; i++) {
      const randomResult = simulateOpening(caseConfig, 1)[0];
      items.push({
        ...randomResult,
        id: i,
        icon: getItemIcon(randomResult)
      });
    }
    
    // Выигрышный предмет в позиции 45-49 (чтобы остановилась на нём)
    items[47] = {
      ...winningResult,
      id: 47,
      icon: getItemIcon(winningResult),
      isWinner: true
    };
    
    setAnimationItems(items);
    setFinalResult(winningResult);

    // Запуск анимации
    setTimeout(() => {
      setIsAnimating(false);
      setOpening(null);
      
      // Обновляем дневные лимиты после успешного открытия
      if (caseConfig.dailyLimit) {
        const updatedOpenings = {
          ...dailyOpenings,
          [caseConfig.id]: (dailyOpenings[caseConfig.id] || 0) + 1
        };
        setDailyOpenings(updatedOpenings);
        localStorage.setItem('dailyCaseOpenings', JSON.stringify(updatedOpenings));
      }
      
      processReward(winningResult);
    }, 4000);
  };

  const getItemIcon = (result: any) => {
    switch (result.type) {
      case 'coins': return '💰';
      case 'gems': return '💎';
      case 'skin': return '🎨';
      case 'ability': return '✨';
      case 'flowplus': return '🌟';
      case 'verification': return '✅';
      case 'multiplier': return '⚡';
      default: return '🎁';
    }
  };

  const processReward = (result: any) => {
    const DAILY_COIN_LIMIT = 10000;
    
    switch (result.type) {
      case 'coins': {
        const currentDaily = parseInt(localStorage.getItem('clickerDailyCoins') || '0');
        const remainingLimit = DAILY_COIN_LIMIT - currentDaily;
        
        if (remainingLimit <= 0) {
          toast({ 
            title: "🚫 Дневной лимит достигнут!",
            description: `Максимум ${DAILY_COIN_LIMIT.toLocaleString()} монет в день`,
            variant: "destructive"
          });
          return;
        }
        
        const actualAmount = Math.min(result.amount, remainingLimit);
        
        if (actualAmount < result.amount) {
          toast({ 
            title: "⚠️ Частичное начисление",
            description: `Получено ${actualAmount}/${result.amount} монет (лимит ${DAILY_COIN_LIMIT.toLocaleString()}/день)`,
            variant: "destructive"
          });
        }
        
        const coins = parseInt(localStorage.getItem('clickerCoins') || '0');
        localStorage.setItem('clickerCoins', String(coins + actualAmount));
        const dailyCoins = parseInt(localStorage.getItem('clickerDailyCoins') || '0');
        localStorage.setItem('clickerDailyCoins', String(dailyCoins + actualAmount));
        toast({ 
          title: `💰 ${getRarityName(result.rarity)} награда!`,
          description: `+${actualAmount.toLocaleString()} FC${actualAmount < result.amount ? ' (ограничено лимитом)' : ''}`
        });
        break;
      }
      case 'gems': {
        const newGems = gems + result.amount;
        localStorage.setItem('playerGems', String(newGems));
        toast({ 
          title: `💎 ${getRarityName(result.rarity)} награда!`,
          description: `+${result.amount} драгоценных камней`
        });
        break;
      }
      case 'skin': {
        // Выдача реального скина
        const availableSkins = ALL_SKINS.filter(skin => 
          result.rarity === 'common' ? ['rare'].includes(skin.rarity) :
          result.rarity === 'rare' ? ['rare', 'epic'].includes(skin.rarity) :
          result.rarity === 'epic' ? ['epic', 'legendary'].includes(skin.rarity) :
          result.rarity === 'legendary' ? ['legendary', 'mythic'].includes(skin.rarity) :
          result.rarity === 'mythic' ? ['mythic'].includes(skin.rarity) : true
        );
        
        if (availableSkins.length > 0) {
          const randomSkin = availableSkins[Math.floor(Math.random() * availableSkins.length)];
          const ownedSkins = JSON.parse(localStorage.getItem('clickerOwnedSkins') || '["default"]');
          
          if (!ownedSkins.includes(randomSkin.id)) {
            ownedSkins.push(randomSkin.id);
            localStorage.setItem('clickerOwnedSkins', JSON.stringify(ownedSkins));
            
            toast({ 
              title: `🎨 ${getRarityName(result.rarity)} скин получен!`,
              description: `Скин "${randomSkin.name}" добавлен в коллекцию!`,
              duration: 5000
            });
          } else {
            // Если скин уже есть, выдаём компенсацию монетами
            const compensation = result.rarity === 'mythic' ? 15000 :
                               result.rarity === 'legendary' ? 7500 :
                               result.rarity === 'epic' ? 3000 :
                               result.rarity === 'rare' ? 1000 : 500;
            
            const coins = parseInt(localStorage.getItem('clickerCoins') || '0');
            localStorage.setItem('clickerCoins', String(coins + compensation));
            
            toast({ 
              title: `💰 Дублирующийся скин!`,
              description: `Получена компенсация: ${compensation.toLocaleString()} FC`,
              duration: 5000
            });
          }
        }
        break;
      }
      case 'ability': {
        // Выдача реальной абилки
        const availableAbilities = ALL_ABILITIES.filter(ability => 
          result.rarity === 'rare' ? ['rare'].includes(ability.rarity) :
          result.rarity === 'epic' ? ['rare', 'epic'].includes(ability.rarity) :
          result.rarity === 'legendary' ? ['epic', 'legendary'].includes(ability.rarity) :
          result.rarity === 'mythic' ? ['legendary', 'mythic'].includes(ability.rarity) : true
        );
        
        if (availableAbilities.length > 0) {
          const randomAbility = availableAbilities[Math.floor(Math.random() * availableAbilities.length)];
          const ownedAbilities = JSON.parse(localStorage.getItem('clickerOwnedAbilities') || '[]');
          
          if (!ownedAbilities.includes(randomAbility.id)) {
            ownedAbilities.push(randomAbility.id);
            localStorage.setItem('clickerOwnedAbilities', JSON.stringify(ownedAbilities));
            
            toast({ 
              title: `🔮 ${getRarityName(result.rarity)} способность получена!`,
              description: `Способность "${randomAbility.name}" разблокирована!`,
              duration: 5000
            });
          } else {
            // Если абилка уже есть, выдаём компенсацию монетами
            const compensation = result.rarity === 'mythic' ? 20000 :
                               result.rarity === 'legendary' ? 10000 :
                               result.rarity === 'epic' ? 5000 :
                               result.rarity === 'rare' ? 2500 : 1000;
            
            const coins = parseInt(localStorage.getItem('clickerCoins') || '0');
            localStorage.setItem('clickerCoins', String(coins + compensation));
            
            toast({ 
              title: `💰 Дублирующаяся способность!`,
              description: `Получена компенсация: ${compensation.toLocaleString()} FC`,
              duration: 5000
            });
          }
        }
        break;
      }
      case 'flowplus': {
        localStorage.setItem('flowPlusOwned', 'true');
        toast({ title: '🌟 ПОЗДРАВЛЯЕМ!', description: 'Получен Flow+ статус!' });
        break;
      }
      case 'verification': {
        localStorage.setItem('accountVerified', 'true');
        toast({ title: '✅ НЕВЕРОЯТНО!', description: 'Аккаунт подтверждён!' });
        break;
      }
      case 'multiplier': {
        toast({ 
          title: `⚡ ${getRarityName(result.rarity)} бонус!`,
          description: `Временный множитель x${result.amount} получен!`
        });
        break;
      }
      default: {
        toast({ 
          title: `🎁 ${getRarityName(result.rarity)} награда!`,
          description: `Получено: ${result.name}`
        });
      }
    }
  };

  const runDemo = () => {
    if (!selectedCase || isAnimating) return;
    setDemoMode(true);
    setIsAnimating(true);
    
    // Создаем анимацию как в реальном режиме
    const items = [];
    const winningResult = simulateOpening(selectedCase, 1)[0];
    
    // Добавляем 50 случайных предметов + выигрышный в конце
    for (let i = 0; i < 50; i++) {
      const randomResult = simulateOpening(selectedCase, 1)[0];
      items.push({
        ...randomResult,
        id: i,
        icon: getItemIcon(randomResult)
      });
    }
    
    // Выигрышный предмет в позиции 45-49
    items[47] = {
      ...winningResult,
      id: 47,
      icon: getItemIcon(winningResult),
      isWinner: true
    };
    
    setAnimationItems(items);
    setFinalResult(winningResult);

    // Запуск анимации без обработки награды
    setTimeout(() => {
      setIsAnimating(false);
      // Запускаем симуляцию 100 открытий после анимации
      const results = simulateOpening(selectedCase, 100);
      setDemoResults(results);
    }, 4000);
  };

  const CasePreview = ({ caseConfig }: { caseConfig: CaseConfig }) => (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <div className="text-4xl">{caseConfig.icon}</div>
        <h3 className="text-xl font-bold">{caseConfig.name}</h3>
        <p className="text-sm text-muted-foreground">{caseConfig.description}</p>
        <Badge variant="outline" className={caseConfig.color}>
          {caseConfig.price.toLocaleString()} {caseConfig.currency}
        </Badge>
        {caseConfig.minLevel && (
          <Badge variant="secondary">Мин. уровень: {caseConfig.minLevel}</Badge>
        )}
        {caseConfig.dailyLimit && (
          <Badge variant="secondary">
            Лимит: {caseConfig.dailyLimit}/день ({(dailyOpenings[caseConfig.id] || 0)}/{caseConfig.dailyLimit})
          </Badge>
        )}
      </div>
      
      <div className="space-y-3">
        <h4 className="font-semibold">Возможные награды:</h4>
        {caseConfig.rewards.map((reward, index) => (
          <div key={index} className={`p-3 rounded-lg border ${getRarityColor(reward.rarity || 'common')}`}>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{reward.name || reward.type}</div>
                <div className="text-xs text-muted-foreground">
                  {reward.rarity && getRarityName(reward.rarity)}
                  {reward.amountMin && reward.amountMax && 
                    ` • ${reward.amountMin}-${reward.amountMax}`
                  }
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {(reward.chance * 100).toFixed(reward.chance < 0.001 ? 6 : 2)}%
              </Badge>
            </div>
            <Progress value={reward.chance * 100} className="h-1 mt-2" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Улучшенные Кейсы
        </h1>
        <div className="flex justify-center items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <Coins className="w-4 h-4" />
            <span>{parseInt(localStorage.getItem('clickerCoins') || '0').toLocaleString()} FC</span>
          </div>
        </div>
      </div>

      {/* CS:GO Style Opening Animation */}
      {isAnimating && (
        <Card className="glass p-6 mb-4">
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold">Открытие кейса...</h3>
          </div>
          <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-lg h-32 border-2 border-primary/30">
            {/* Центральный указатель */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-full bg-primary z-20 shadow-lg shadow-primary/50">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent border-b-primary"></div>
              </div>
            </div>
            
            {/* Анимационная лента */}
            <div 
              className="absolute top-0 flex items-center h-full gap-4 py-4"
              style={{
                animation: 'slideToWinner 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
                left: '50%',
                transform: 'translateX(-50%)'
              }}
            >
              {animationItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 flex flex-col items-center justify-center text-sm font-bold transition-all duration-300 ${
                    item.isWinner 
                      ? `${getRarityColor(item.rarity)} bg-gradient-to-br from-yellow-400/20 to-orange-400/20 animate-pulse shadow-lg shadow-yellow-400/30` 
                      : `${getRarityColor(item.rarity)} bg-gradient-to-br from-gray-700/50 to-gray-600/50`
                  }`}
                >
                  <div className="text-2xl">{item.icon}</div>
                  <div className="text-xs text-center">
                    {item.type === 'coins' || item.type === 'gems' ? item.amount : getRarityName(item.rarity)}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Градиентные края для эффекта затухания */}
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-gray-900 to-transparent z-10"></div>
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-gray-900 to-transparent z-10"></div>
          </div>
          
          {finalResult && (
            <div className="text-center mt-4">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getRarityColor(finalResult.rarity)} animate-pulse`}>
                <span className="text-2xl">{getItemIcon(finalResult)}</span>
                <span className="font-bold">
                  {finalResult.type === 'coins' ? `${finalResult.amount} FC` :
                   finalResult.type === 'gems' ? `${finalResult.amount} драг. камней` :
                   `${getRarityName(finalResult.rarity)} ${finalResult.type}`}
                </span>
              </div>
            </div>
          )}
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {CASES.map((caseConfig) => {
          const playerLevel = getPlayerLevel();
          const canOpen = !caseConfig.minLevel || playerLevel >= caseConfig.minLevel;
          const dailyCount = dailyOpenings[caseConfig.id] || 0;
          const dailyAvailable = !caseConfig.dailyLimit || dailyCount < caseConfig.dailyLimit;
          
          return (
            <Card key={caseConfig.id} className={`glass p-4 ${caseConfig.color}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{caseConfig.icon}</div>
                  <div>
                    <div className="font-medium">{caseConfig.name}</div>
                    <div className="text-xs text-muted-foreground">{caseConfig.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {caseConfig.price.toLocaleString()} {caseConfig.currency}
                      {caseConfig.dailyLimit && 
                        ` • Осталось: ${caseConfig.dailyLimit - dailyCount}`
                      }
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedCase(caseConfig)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Просмотр
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Подробности кейса</DialogTitle>
                      </DialogHeader>
                      <Tabs defaultValue="preview" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="preview">Превью</TabsTrigger>
                          <TabsTrigger value="demo">Демо режим</TabsTrigger>
                        </TabsList>
                        <TabsContent value="preview">
                          {selectedCase && <CasePreview caseConfig={selectedCase} />}
                        </TabsContent>
                        <TabsContent value="demo" className="space-y-4">
                          <div className="text-center space-y-2">
                            <h4 className="font-semibold">Симуляция 100 открытий</h4>
                            <Button onClick={runDemo} disabled={!selectedCase}>
                              <Gamepad className="w-4 h-4 mr-2" />
                              Запустить демо
                            </Button>
                          </div>
                          {demoResults.length > 0 && (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              <h5 className="text-sm font-medium">Статистика:</h5>
                              {Object.entries(
                                demoResults.reduce((acc, result) => {
                                  const key = `${result.type} (${getRarityName(result.rarity)})`;
                                  acc[key] = (acc[key] || 0) + 1;
                                  return acc;
                                }, {})
                              ).map(([type, count]) => (
                                <div key={type} className="flex justify-between text-xs">
                                  <span>{type}</span>
                                  <span>{count as number} раз ({((count as number / 100) * 100).toFixed(1)}%)</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>
                  <Button 
                    size="sm" 
                    className="glass-button" 
                    disabled={opening === caseConfig.id || !canOpen || !dailyAvailable}
                    onClick={() => openCase(caseConfig)}
                  >
                    {opening === caseConfig.id ? 'Открываем...' : 
                     !canOpen ? `Ур. ${caseConfig.minLevel}` :
                     !dailyAvailable ? 'Лимит' : 'Открыть'}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      <Card className="glass p-4">
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Все награды мгновенно добавляются в ваш инвентарь. Драгоценные камни можно получить из кейсов или приобрести отдельно.
        </div>
      </Card>
    </div>
  );
};

export default EnhancedCasesGame;