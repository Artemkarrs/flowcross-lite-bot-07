import { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Zap, TrendingUp, Award, Palette, Shield, Clock, Star, Flame, Rocket, Save, Download, Upload, Crown, Diamond, Trophy, Target, Gift, Sparkles, Heart, Bomb, Coffee, Moon, Sun, Skull, Rainbow, Snowflake, Sword, Wand2, Languages, Globe, CircleDollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { translations, formatTime } from '@/lib/translations';

interface Achievement {
  id: string;
  name: string;
  description: string;
  requirement: (stats: GameStats) => boolean;
  reward: number;
  icon: React.ReactNode;
}

interface GameStats {
  coins: number;
  totalClicks: number;
  clickPower: number;
  level: number;
  playTime: number;
  dailyCoins: number;
  criticalUpgrade: number;
  speedUpgrade: number;
  abilitiesUsed: number;
  skinsOwned: number;
  offlineEarnings: number;
}

interface Ability {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  cooldown: number;
  duration: number;
  effect: string;
  price: number;
  unlocked: boolean;
}

interface Skin {
  id: string;
  name: string;
  price: number;
  icon: React.ReactNode;
  color: string;
  unlocked: boolean;
}

const DAILY_COIN_LIMIT = 10000;

const ClickerGame = () => {
  const [coins, setCoins] = useState(() => parseInt(localStorage.getItem('clickerCoins') || '0'));
  const [clickPower, setClickPower] = useState(() => parseInt(localStorage.getItem('clickerPower') || '1'));
  
  const [level, setLevel] = useState(() => parseInt(localStorage.getItem('clickerLevel') || '1'));
  const [totalClicks, setTotalClicks] = useState(() => parseInt(localStorage.getItem('clickerTotalClicks') || '0'));
  const [playTime, setPlayTime] = useState(() => parseInt(localStorage.getItem('clickerPlayTime') || '0'));
  const [lastClickTime, setLastClickTime] = useState(Date.now());
  const [clickCount, setClickCount] = useState(0);
  const [currentSkin, setCurrentSkin] = useState(() => localStorage.getItem('clickerSkin') || 'default');
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(() => 
    JSON.parse(localStorage.getItem('clickerAchievements') || '[]')
  );
  const [multiplier, setMultiplier] = useState(1);
  const [criticalUpgrade, setCriticalUpgrade] = useState(() => parseInt(localStorage.getItem('clickerCritical') || '0'));
  const [speedUpgrade, setSpeedUpgrade] = useState(() => parseInt(localStorage.getItem('clickerSpeed') || '0'));
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSave, setAutoSave] = useState(true);
  const [floatingTexts, setFloatingTexts] = useState<Array<{id: number, x: number, y: number, text: string, color: string}>>([]);
  const [skinEffect, setSkinEffect] = useState('');
  const [language, setLanguage] = useState(() => localStorage.getItem('clickerLanguage') || 'ru');
  const [abilitiesUsed, setAbilitiesUsed] = useState(() => parseInt(localStorage.getItem('clickerAbilitiesUsed') || '0'));
  
  // Золотой клик
  const [lastGoldenClick, setLastGoldenClick] = useState(() => parseInt(localStorage.getItem('clickerLastGoldenClick') || Date.now().toString()));
  const [goldenClickActive, setGoldenClickActive] = useState(false);
  
  // Константа с множителями для прокачки
  const priceMultipliers = [5, 10, 15, 25, 50, 150, 700];
  
  // Новые состояния для лимитов коинов и сохранений
  const [dailyCoins, setDailyCoins] = useState(() => parseInt(localStorage.getItem('clickerDailyCoins') || '0'));
  const [lastDailyReset, setLastDailyReset] = useState(() => parseInt(localStorage.getItem('clickerLastDailyReset') || Date.now().toString()));
  const [lastOfflineTime, setLastOfflineTime] = useState(() => parseInt(localStorage.getItem('clickerLastOfflineTime') || Date.now().toString()));
  const [clicksPerSecond, setClicksPerSecond] = useState(0);
  const [clickTimestamps, setClickTimestamps] = useState<number[]>([]);
  const [ownedSkins, setOwnedSkins] = useState<string[]>(() => JSON.parse(localStorage.getItem('clickerOwnedSkins') || '["default"]'));
  const [ownedAbilities, setOwnedAbilities] = useState<string[]>(() => JSON.parse(localStorage.getItem('clickerOwnedAbilities') || '[]'));
  
  // Кулдаун клика и лимиты кликов
  const [cooldownLevel, setCooldownLevel] = useState(() => parseInt(localStorage.getItem('clickerCooldownLevel') || '0'));
  const [cooldownUntil, setCooldownUntil] = useState<number>(0);
  const [hourlyClicks, setHourlyClicks] = useState(() => parseInt(localStorage.getItem('clickerHourlyClicks') || '0'));
  const [lastHourlyReset, setLastHourlyReset] = useState(() => parseInt(localStorage.getItem('clickerLastHourlyReset') || Date.now().toString()));
  const [dailyClicks, setDailyClicks] = useState(() => parseInt(localStorage.getItem('clickerDailyClicks') || '0'));
  const [lastDailyClicksReset, setLastDailyClicksReset] = useState(() => parseInt(localStorage.getItem('clickerLastDailyClicksReset') || Date.now().toString()));
  
  // Состояния для абилок
  const [activeAbilities, setActiveAbilities] = useState<{[key: string]: {endTime: number, active: boolean}}>(() => 
    JSON.parse(localStorage.getItem('clickerActiveAbilities') || '{}')
  );
  const [abilityCooldowns, setAbilityCooldowns] = useState<{[key: string]: number}>(() => 
    JSON.parse(localStorage.getItem('clickerAbilityCooldowns') || '{}')
  );
  const [showTutorial, setShowTutorial] = useState(() => !localStorage.getItem('clickerTutorialCompleted'));
  const [tutorialStep, setTutorialStep] = useState(0);
  
  const { toast } = useToast();
  const clickTimeoutRef = useRef<NodeJS.Timeout>();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const clickButtonRef = useRef<HTMLButtonElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const t = translations[language];

  // Единая функция для добавления монет с проверкой лимита
  const addCoinsWithLimit = useCallback((amount: number, source: string = 'клик') => {
    const currentDaily = parseInt(localStorage.getItem('clickerDailyCoins') || '0');
    const remainingLimit = DAILY_COIN_LIMIT - currentDaily;
    
    if (remainingLimit <= 0) {
      toast({
        title: "🚫 Дневной лимит достигнут!",
        description: `Максимум ${DAILY_COIN_LIMIT.toLocaleString()} монет в день`,
        variant: "destructive"
      });
      return 0;
    }
    
    const actualAmount = Math.min(amount, remainingLimit);
    
    if (actualAmount < amount) {
      toast({
        title: "⚠️ Частичное начисление",
        description: `Получено ${actualAmount}/${amount} монет (лимит ${DAILY_COIN_LIMIT.toLocaleString()}/день)`,
        variant: "destructive"
      });
    }
    
    setCoins(prev => prev + actualAmount);
    setDailyCoins(prev => {
      const newAmount = prev + actualAmount;
      localStorage.setItem('clickerDailyCoins', newAmount.toString());
      return newAmount;
    });
    
    return actualAmount;
  }, [toast]);

  const checkDailyLimit = useCallback(() => {
    const currentDaily = parseInt(localStorage.getItem('clickerDailyCoins') || '0');
    return currentDaily >= DAILY_COIN_LIMIT;
  }, []);

  const achievements: Achievement[] = [
    {
      id: 'first_click',
      name: t.firstClick,
      description: t.firstClickDesc,
      requirement: (stats) => stats.totalClicks >= 1,
      reward: 25,
      icon: <Zap className="w-4 h-4" />
    },
    {
      id: 'hundred_coins',
      name: t.hundredCoins,
      description: t.hundredCoinsDesc,
      requirement: (stats) => stats.coins >= 100,
      reward: 100,
      icon: <Star className="w-4 h-4" />
    },
    {
      id: 'thousand_coins',
      name: t.thousandCoins,
      description: t.thousandCoinsDesc,
      requirement: (stats) => stats.coins >= 1000,
      reward: 500,
      icon: <Flame className="w-4 h-4" />
    },
    {
      id: 'mega_saver',
      name: t.megaSaver,
      description: t.megaSaverDesc,
      requirement: (stats) => stats.coins >= 10000,
      reward: 2500,
      icon: <Crown className="w-4 h-4" />
    },
    {
      id: 'ultra_rich',
      name: t.ultraRich,
      description: t.ultraRichDesc,
      requirement: (stats) => stats.coins >= 100000,
      reward: 25000,
      icon: <Diamond className="w-4 h-4" />
    },
    {
      id: 'power_clicker',
      name: t.powerClicker,
      description: t.powerClickerDesc,
      requirement: (stats) => stats.clickPower >= 10,
      reward: 300,
      icon: <TrendingUp className="w-4 h-4" />
    },
    {
      id: 'super_power',
      name: t.superPower,
      description: t.superPowerDesc,
      requirement: (stats) => stats.clickPower >= 50,
      reward: 1500,
      icon: <Sword className="w-4 h-4" />
    },
    {
      id: 'click_marathon',
      name: t.clickMarathon,
      description: t.clickMarathonDesc,
      requirement: (stats) => stats.totalClicks >= 5000,
      reward: 1200,
      icon: <Target className="w-4 h-4" />
    },
    {
      id: 'click_legend',
      name: t.clickLegend,
      description: t.clickLegendDesc,
      requirement: (stats) => stats.totalClicks >= 50000,
      reward: 8000,
      icon: <Trophy className="w-4 h-4" />
    },
    {
      id: 'level_master',
      name: t.levelMaster,
      description: t.levelMasterDesc,
      requirement: (stats) => stats.level >= 100,
      reward: 10000,
      icon: <Diamond className="w-4 h-4" />
    },
    {
      id: 'time_traveler',
      name: t.timeTraveler,
      description: t.timeTravelerDesc,
      requirement: (stats) => stats.playTime >= 7200, // 2 часа
      reward: 3000,
      icon: <Clock className="w-4 h-4" />
    },
    {
      id: 'dedicated_player',
      name: t.dedicatedPlayer,
      description: t.dedicatedPlayerDesc,
      requirement: (stats) => stats.playTime >= 36000, // 10 часов
      reward: 15000,
      icon: <Heart className="w-4 h-4" />
    },
    {
      id: 'critical_master',
      name: t.criticalMaster,
      description: t.criticalMasterDesc,
      requirement: (stats) => stats.criticalUpgrade >= 25,
      reward: 4000,
      icon: <Star className="w-4 h-4" />
    },
    {
      id: 'skin_collector',
      name: t.skinCollector,
      description: t.skinCollectorDesc,
      requirement: (stats) => stats.skinsOwned >= 8,
      reward: 6000,
      icon: <Palette className="w-4 h-4" />
    },
    {
      id: 'ability_master',
      name: t.abilityMaster,
      description: t.abilityMasterDesc,
      requirement: (stats) => stats.abilitiesUsed >= 200,
      reward: 10000,
      icon: <Sparkles className="w-4 h-4" />
    },
    {
      id: 'daily_grinder',
      name: 'Дневной Грайндер',
      description: 'Заработайте 100,000 коинов за день',
      requirement: (stats) => stats.dailyCoins >= 100000,
      reward: 15000,
      icon: <CircleDollarSign className="w-4 h-4" />
    },
    {
      id: 'offline_master',
      name: 'Мастер Оффлайна',
      description: 'Получите 50,000 коинов оффлайн',
      requirement: (stats) => stats.offlineEarnings >= 50000,
      reward: 20000,
      icon: <Moon className="w-4 h-4" />
    }
  ];

  const abilities: Ability[] = [
    {
      id: 'double_coins',
      name: t.doubleCoins,
      description: t.doubleCoinsDesc,
      icon: <Sparkles className="w-4 h-4" />,
      cooldown: 300000, // 5 минут
      duration: 60000, // 1 минута
      effect: t.doubleCoinsDesc,
      price: 2500,
      unlocked: ownedAbilities.includes('double_coins')
    },
    {
      id: 'auto_burst',
      name: t.autoBurst,
      description: t.autoBurstDesc,
      icon: <Bomb className="w-4 h-4" />,
      cooldown: 450000, // 7.5 минут
      duration: 30000, // 30 секунд
      effect: t.autoBurstDesc,
      price: 5000,
      unlocked: ownedAbilities.includes('auto_burst')
    },
    {
      id: 'critical_boost',
      name: t.criticalBoost,
      description: t.criticalBoostDesc,
      icon: <Star className="w-4 h-4" />,
      cooldown: 600000, // 10 минут
      duration: 90000, // 1.5 минуты
      effect: t.criticalBoostDesc,
      price: 8000,
      unlocked: ownedAbilities.includes('critical_boost')
    },
    {
      id: 'coin_rain',
      name: 'Дождь Коинов',
      description: 'Получайте дополнительные коины каждую секунду',
      icon: <Gift className="w-4 h-4" />,
      cooldown: 900000, // 15 минут
      duration: 45000, // 45 секунд
      effect: 'Дождь Коинов',
      price: 12000,
      unlocked: ownedAbilities.includes('coin_rain')
    },
    {
      id: 'auto_upgrade',
      name: 'Авто Улучшение',
      description: 'Временно увеличивает скорость всех улучшений',
      icon: <TrendingUp className="w-4 h-4" />,
      cooldown: 1200000, // 20 минут
      duration: 120000, // 2 минуты
      effect: 'Авто Улучшение',
      price: 20000,
      unlocked: ownedAbilities.includes('auto_upgrade')
    }
  ];

  const skinColors = {
    default: '#60a5fa',
    fire: '#f97316',
    electric: '#facc15',
    cosmic: '#a855f7',
    royal: '#fde047',
    diamond: '#67e8f9',
    rainbow: '#ec4899',
    shadow: '#9ca3af',
    ice: '#93c5fd',
    nature: '#4ade80'
  };

  const getSkinParticleColor = (skinId: string) => {
    const particleColors = {
      default: '#60a5fa',
      fire: '#f97316',
      electric: '#facc15',
      cosmic: '#a855f7',
      royal: '#fde047',
      diamond: '#67e8f9',
      rainbow: '#ec4899',
      shadow: '#9ca3af',
      ice: '#93c5fd',
      nature: '#4ade80'
    };
    return particleColors[skinId as keyof typeof particleColors] || '#60a5fa';
  };

  const skins: Skin[] = [
    {
      id: 'default',
      name: t.defaultSkin,
      price: 0,
      icon: <Zap className="w-24 h-24" style={{ color: skinColors.default }} />,
      color: 'text-blue-400',
      unlocked: true
    },
    {
      id: 'fire',
      name: t.fireSkin,
      price: 1500,
      icon: <Flame className="w-16 h-16" style={{ color: skinColors.fire }} />,
      color: 'text-orange-500',
      unlocked: ownedSkins.includes('fire')
    },
    {
      id: 'electric',
      name: t.electricSkin,
      price: 3000,
      icon: <Zap className="w-16 h-16" style={{ color: skinColors.electric }} />,
      color: 'text-yellow-400',
      unlocked: ownedSkins.includes('electric')
    },
    {
      id: 'cosmic',
      name: t.cosmicSkin,
      price: 6000,
      icon: <Star className="w-16 h-16" style={{ color: skinColors.cosmic }} />,
      color: 'text-purple-400',
      unlocked: ownedSkins.includes('cosmic')
    },
    {
      id: 'royal',
      name: t.royalSkin,
      price: 15000,
      icon: <Crown className="w-16 h-16" style={{ color: skinColors.royal }} />,
      color: 'text-yellow-300',
      unlocked: ownedSkins.includes('royal')
    },
    {
      id: 'diamond',
      name: t.diamondSkin,
      price: 30000,
      icon: <Diamond className="w-16 h-16" style={{ color: skinColors.diamond }} />,
      color: 'text-cyan-300',
      unlocked: ownedSkins.includes('diamond')
    },
    {
      id: 'rainbow',
      name: t.rainbowSkin,
      price: 50000,
      icon: <Rainbow className="w-16 h-16" style={{ color: skinColors.rainbow }} />,
      color: 'text-pink-400',
      unlocked: ownedSkins.includes('rainbow')
    },
    {
      id: 'shadow',
      name: t.shadowSkin,
      price: 25000,
      icon: <Skull className="w-16 h-16" style={{ color: skinColors.shadow }} />,
      color: 'text-gray-400',
      unlocked: ownedSkins.includes('shadow')
    },
    {
      id: 'ice',
      name: t.iceSkin,
      price: 18000,
      icon: <Snowflake className="w-16 h-16" style={{ color: skinColors.ice }} />,
      color: 'text-blue-300',
      unlocked: ownedSkins.includes('ice')
    },
    {
      id: 'nature',
      name: t.natureSkin,
      price: 22000,
      icon: <Palette className="w-16 h-16" style={{ color: skinColors.nature }} />,
      color: 'text-green-400',
      unlocked: ownedSkins.includes('nature')
    }
  ];

  // Создание звука клика
  const createClickSound = (frequency: number = 800) => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        return;
      }
    }
    
    const audioContext = audioContextRef.current;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  // Создание плавающего текста
  const showFloatingText = (text: string, color: string) => {
    if (!clickButtonRef.current) return;
    
    // Получаем размеры кнопки
    const rect = clickButtonRef.current.getBoundingClientRect();
    const buttonRadius = rect.width / 2;
    
    // Создаем партикл внутри кнопки (относительно центра кнопки)
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * (buttonRadius - 30); // отступ от краев кнопки
    
    const newText = {
      id: Date.now(),
      x: rect.left + rect.width / 2 + Math.cos(angle) * distance,
      y: rect.top + rect.height / 2 + Math.sin(angle) * distance,
      text,
      color
    };
    
    setFloatingTexts(prev => [...prev, newText]);
    
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== newText.id));
    }, 2000);
  };

  const getRandomParticleColor = () => {
    const colors = ['text-yellow-400', 'text-green-400', 'text-blue-400', 'text-purple-400', 'text-pink-400', 'text-orange-400'];
    return colors[Math.floor(Math.random() * colors.length)];
  };



  // Level calculation and multiplier
  useEffect(() => {
    const newLevel = Math.floor(coins / 500) + 1; // Увеличили требование для уровня
    if (newLevel > level) {
      setLevel(newLevel);
      setMultiplier(1 + Math.floor(newLevel / 10) * 0.2); // Увеличили бонус от уровня
    }
  }, [coins, level]);

  // Play time tracking и сброс лимитов
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayTime(prev => prev + 1);
      
      const now = Date.now();
      
      // Проверка золотого клика каждые 10 минут
      if (now - lastGoldenClick > 600000 && !goldenClickActive) { // 10 минут
        setGoldenClickActive(true);
        setLastGoldenClick(now);
        localStorage.setItem('clickerLastGoldenClick', now.toString());
        
        toast({
          title: "✨ Золотой Клик!",
          description: "Кликни по кнопке для получения награды!",
          duration: 10000,
        });
        
        // Золотой клик исчезает через 30 секунд
        setTimeout(() => {
          setGoldenClickActive(false);
        }, 30000);
      }
      
      // Сброс дневного лимита
      if (now - lastDailyReset > 86400000) { // 24 часа
        setDailyCoins(0);
        setLastDailyReset(now);
        localStorage.setItem('clickerDailyCoins', '0');
        localStorage.setItem('clickerLastDailyReset', now.toString());
        
        toast({
          title: "🌅 Новый день!",
          description: "Лимит коинов сброшен",
          duration: 3000,
        });
      }
      
      // Дождь коинов абилка
      if (activeAbilities.coin_rain?.active) {
        const rainCoins = Math.floor(clickPower * multiplier * 0.5);
        addCoinsWithLimit(rainCoins, 'дождь коинов');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lastDailyReset, activeAbilities.coin_rain, clickPower, multiplier, lastGoldenClick, goldenClickActive]);

  // Автосохранение после покупки
  const autoSaveAfterPurchase = useCallback(() => {
    saveProgress();
    toast({
      title: "💾 Автосохранение",
      description: "Прогресс сохранен",
      duration: 2000,
    });
  }, []);

  // Save progress with debouncing
  const saveProgress = useCallback(() => {
    const gameData = {
      coins,
      clickPower,
      level,
      totalClicks,
      playTime,
      currentSkin,
      criticalUpgrade,
      speedUpgrade,
      unlockedAchievements,
      dailyCoins,
      ownedSkins,
      ownedAbilities,
      activeAbilities,
      abilityCooldowns,
      abilitiesUsed,
      lastSaved: new Date().toISOString(),
      version: '2.0'
    };

    // Save to localStorage
    localStorage.setItem('clickerCoins', coins.toString());
    localStorage.setItem('clickerPower', clickPower.toString());
    
    localStorage.setItem('clickerLevel', level.toString());
    localStorage.setItem('clickerTotalClicks', totalClicks.toString());
    localStorage.setItem('clickerPlayTime', playTime.toString());
    localStorage.setItem('clickerSkin', currentSkin);
    localStorage.setItem('clickerCritical', criticalUpgrade.toString());
    localStorage.setItem('clickerSpeed', speedUpgrade.toString());
    localStorage.setItem('clickerAchievements', JSON.stringify(unlockedAchievements));
    localStorage.setItem('clickerDailyCoins', dailyCoins.toString());
    localStorage.setItem('clickerOwnedSkins', JSON.stringify(ownedSkins));
    localStorage.setItem('clickerOwnedAbilities', JSON.stringify(ownedAbilities));
    localStorage.setItem('clickerActiveAbilities', JSON.stringify(activeAbilities));
    localStorage.setItem('clickerAbilityCooldowns', JSON.stringify(abilityCooldowns));
    localStorage.setItem('clickerAbilitiesUsed', abilitiesUsed.toString());
    localStorage.setItem('clickerCooldownLevel', cooldownLevel.toString());
    localStorage.setItem('clickerHourlyClicks', hourlyClicks.toString());
    localStorage.setItem('clickerLastHourlyReset', lastHourlyReset.toString());
    localStorage.setItem('clickerDailyClicks', dailyClicks.toString());
    localStorage.setItem('clickerLastDailyClicksReset', lastDailyClicksReset.toString());
    localStorage.setItem('clickerCooldownUntil', String(cooldownUntil));
    localStorage.setItem('clickerLastSaved', new Date().toISOString());
    localStorage.setItem('clickerLanguage', language);

    setLastSaved(new Date());
  }, [coins, clickPower, level, totalClicks, playTime, currentSkin, criticalUpgrade, speedUpgrade, unlockedAchievements, dailyCoins, ownedSkins, ownedAbilities, activeAbilities, abilityCooldowns, abilitiesUsed, language, cooldownLevel, hourlyClicks, lastHourlyReset, dailyClicks, lastDailyClicksReset, cooldownUntil]);

  // Автосохранение каждую секунду
  useEffect(() => {
    if (!autoSave) return;
    const interval = setInterval(() => {
      saveProgress();
    }, 1000);
    return () => clearInterval(interval);
  }, [autoSave, saveProgress]);

  // Сбросы лимитов кликов по времени
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      // Часовой сброс
      if (now - lastHourlyReset > 3600000) {
        setHourlyClicks(0);
        setLastHourlyReset(now);
        localStorage.setItem('clickerHourlyClicks', '0');
        localStorage.setItem('clickerLastHourlyReset', now.toString());
      }
      // Дневной сброс
      if (now - lastDailyClicksReset > 86400000) {
        setDailyClicks(0);
        setLastDailyClicksReset(now);
        localStorage.setItem('clickerDailyClicks', '0');
        localStorage.setItem('clickerLastDailyClicksReset', now.toString());
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lastHourlyReset, lastDailyClicksReset]);

  // Управление абилками
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      
      // Проверяем активные абилки
      setActiveAbilities(prev => {
        const updated = { ...prev };
        let changed = false;
        
        Object.keys(updated).forEach(abilityId => {
          if (updated[abilityId].endTime <= now && updated[abilityId].active) {
            updated[abilityId].active = false;
            changed = true;
            
            toast({
              title: "⏰ Абилка закончилась",
              description: `${abilities.find(a => a.id === abilityId)?.name || 'Абилка'} больше не активна`,
              duration: 2000,
            });
          }
        });
        
        if (changed) {
          localStorage.setItem('clickerActiveAbilities', JSON.stringify(updated));
        }
        
        return updated;
      });
      
      // Обновляем кулдауны
      setAbilityCooldowns(prev => {
        const updated = { ...prev };
        let changed = false;
        
        Object.keys(updated).forEach(abilityId => {
          if (updated[abilityId] <= now) {
            delete updated[abilityId];
            changed = true;
          }
        });
        
        if (changed) {
          localStorage.setItem('clickerAbilityCooldowns', JSON.stringify(updated));
        }
        
        return updated;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [abilities, toast]);

  // Auto-burst ability effect
  useEffect(() => {
    if (activeAbilities.auto_burst?.active) {
      const interval = setInterval(() => {
        if (activeAbilities.auto_burst?.active && activeAbilities.auto_burst.endTime > Date.now()) {
          // Автоматический клик от абилки с проверкой лимита
          if (checkDailyLimit()) {
            return; // Прекращаем авто-клики если лимит достигнут
          }
          
          const isCritical = Math.random() < ((criticalUpgrade * 0.03) + (activeAbilities.critical_boost?.active ? 0.5 : 0));
          const baseMultiplier = multiplier * (activeAbilities.double_coins?.active ? 2 : 1);
          const finalPower = clickPower * baseMultiplier * (isCritical ? 3 : 1); // Увеличен критический урон
          
          addCoinsWithLimit(finalPower, 'авто-взрыв');
          setTotalClicks(prev => prev + 1);
          
          // Убраны партиклы авто-взрыва - только звуковой эффект
        }
      }, 150); // 6.7 кликов в секунду
      
      return () => clearInterval(interval);
    }
  }, [activeAbilities.auto_burst, clickPower, multiplier, criticalUpgrade, activeAbilities.double_coins, activeAbilities.critical_boost]);

  // Check achievements
  useEffect(() => {
    const stats: GameStats = { 
      coins, 
      totalClicks, 
      clickPower, 
      level, 
      playTime, 
      dailyCoins,
      criticalUpgrade,
      speedUpgrade,
      abilitiesUsed,
      skinsOwned: ownedSkins.length,
      offlineEarnings: 0 // Будет вычисляться при необходимости
    };
    
    achievements.forEach(achievement => {
      if (!unlockedAchievements.includes(achievement.id) && achievement.requirement(stats)) {
        setUnlockedAchievements(prev => [...prev, achievement.id]);
        setCoins(prev => prev + achievement.reward);
        toast({
          title: `🏆 ${t.achievementUnlocked}`,
          description: `${achievement.name} - +${achievement.reward.toLocaleString()} FC`,
          duration: 5000,
        });
        
        // Убраны партиклы для достижений
      }
    });
  }, [coins, totalClicks, clickPower, level, playTime, dailyCoins, criticalUpgrade, speedUpgrade, abilitiesUsed, ownedSkins.length]);

  // Защита от автокликера (убраны лимиты кликов)
  const validateClick = () => {
    const now = Date.now();
    
    // Обновляем временные метки кликов
    setClickTimestamps(prev => {
      const oneSecondAgo = now - 1000;
      const recentClicks = [...prev.filter(timestamp => timestamp > oneSecondAgo), now];
      setClicksPerSecond(recentClicks.length);
      return recentClicks.slice(-50);
    });
    
    // Проверка скорости кликов (максимум 40 в секунду)
    if (clicksPerSecond >= 40) {
      toast({
        title: "🛡️ Защита от автокликера",
        description: "Слишком быстрые клики обнаружены! Замедлитесь.",
        variant: "destructive",
        duration: 3000,
      });
      return false;
    }

    // Убраны лимиты на клики в час и день
    
    return true;
  };

  const handleClick = () => {
    const now = Date.now();
    if (!validateClick()) return;

    // Проверка золотого клика
    if (goldenClickActive) {
      setGoldenClickActive(false);
      const reward = Math.random() < 0.7 ? getGoldenClickCoins() : getRandomCase();
      
      if (typeof reward === 'number') {
        if (checkDailyLimit()) {
          toast({
            title: "🚫 Дневной лимит достигнут!",
            description: `Награда за достижение отложена до завтра`,
            variant: "destructive"
          });
          return; // Не выдаем награду, но отмечаем достижение как выполненное
        }
        
        addCoinsWithLimit(reward, 'достижение');
        
        toast({
          title: "🏆 Золотая награда!",
          description: `Получено ${reward.toLocaleString()} коинов!`,
          duration: 4000,
        });
        
        if (clickButtonRef.current) {
          showFloatingText(`+${reward.toLocaleString()}`, '#ffd700');
        }
      } else {
        toast({
          title: "🎁 Золотой кейс!",
          description: `Получен кейс: ${reward}!`,
          duration: 4000,
        });
      }
      
      return;
    }

    // Убрана проверка кулдауна
    
    const criticalChance = (criticalUpgrade * 0.03) + (activeAbilities.critical_boost?.active ? 0.5 : 0);
    const isCritical = Math.random() < criticalChance;
    const baseMultiplier = multiplier * (activeAbilities.double_coins?.active ? 2 : 1);
    const autoUpgradeBonus = activeAbilities.auto_upgrade?.active ? 1.5 : 1;
    const finalPower = Math.floor(clickPower * baseMultiplier * autoUpgradeBonus * (isCritical ? 3 : 1));

    // Проверка дневного лимита
    if (checkDailyLimit()) {
      toast({
        title: "🚫 Дневной лимит достигнут!",
        description: `Максимум ${DAILY_COIN_LIMIT.toLocaleString()} монет в день`,
        variant: "destructive"
      });
      return;
    }
    const actualAmount = addCoinsWithLimit(finalPower, 'клик');

    // Звук клика и создание партиклов при каждом клике
    createClickSound(isCritical ? 1200 : 800);
    
    // Создание партиклов с цветом скина
    if (clickButtonRef.current) {
      
      if (clickButtonRef.current) {
        showFloatingText(`+${actualAmount.toLocaleString()}`, getSkinParticleColor(currentSkin));
      }
      
      clickButtonRef.current.classList.add('click-button-glow');
      setTimeout(() => {
        clickButtonRef.current?.classList.remove('click-button-glow');
      }, 300);
    }

    if (isCritical) {
      toast({ title: '⭐ Критический удар!', description: `+${actualAmount.toLocaleString()} FC (x3)`, duration: 2000 });
    }

    // Туториал
    if (showTutorial && tutorialStep === 0) {
      setTutorialStep(1);
    }
  };

  const getGoldenClickCoins = () => {
    return Math.floor(Math.random() * 4000) + 1000; // 1000-5000 коинов
  };

  const getRandomCase = () => {
    const cases = ['Обычный кейс', 'Редкий кейс', 'Эпический кейс', 'Легендарный кейс'];
    return cases[Math.floor(Math.random() * cases.length)];
  };

  const buyClickPower = () => {
    const multiplierIndex = Math.min(clickPower - 1, priceMultipliers.length - 1);
    const multiplier = multiplierIndex >= 0 ? priceMultipliers[multiplierIndex] : 5;
    const cost = Math.floor(clickPower * multiplier * (activeAbilities.auto_upgrade?.active ? 0.5 : 1));
    if (coins >= cost) {
      setCoins(prev => prev - cost);
      setClickPower(prev => prev + 1);
      
      toast({
        title: "🔧 Улучшение куплено!",
        description: `Сила клика увеличена до ${clickPower + 1}`,
        duration: 2000,
      });
      
      autoSaveAfterPurchase();
      
      // Туториал
      if (showTutorial && tutorialStep === 1) {
        setTutorialStep(2);
      }
    }
  };


  const buyCriticalUpgrade = () => {
    const multiplierIndex = Math.min(criticalUpgrade, priceMultipliers.length - 1);
    const multiplier = priceMultipliers[multiplierIndex];
    const cost = Math.floor((criticalUpgrade + 1) * multiplier * (activeAbilities.auto_upgrade?.active ? 0.5 : 1));
    if (coins >= cost) {
      setCoins(prev => prev - cost);
      setCriticalUpgrade(prev => prev + 1);
      
      toast({
        title: "⭐ Критический урон улучшен!",
        description: `Шанс крита: ${((criticalUpgrade + 1) * 3).toFixed(1)}%`,
        duration: 2000,
      });
      
      autoSaveAfterPurchase();
    }
  };


  // Покупка абилки
  const buyAbility = (ability: Ability) => {
    if (coins >= ability.price && !ownedAbilities.includes(ability.id)) {
      setCoins(prev => prev - ability.price);
      setOwnedAbilities(prev => {
        const newOwned = [...prev, ability.id];
        localStorage.setItem('clickerOwnedAbilities', JSON.stringify(newOwned));
        return newOwned;
      });
      
      toast({
        title: "🔮 Абилка куплена!",
        description: `${ability.name} теперь доступна`,
        duration: 3000,
      });
      
      autoSaveAfterPurchase();
    }
  };

  // Использование абилки
  const useAbility = (ability: Ability) => {
    const now = Date.now();
    
    if (!ability.unlocked) {
      toast({
        title: "🔒 Абилка не куплена",
        description: `Купите ${ability.name} за ${ability.price.toLocaleString()} FC`,
        variant: "destructive",
        duration: 2000,
      });
      return;
    }
    
    // Проверяем кулдаун
    if (abilityCooldowns[ability.id] && abilityCooldowns[ability.id] > now) {
      const remaining = Math.ceil((abilityCooldowns[ability.id] - now) / 1000);
      toast({
        title: "⏰ Абилка на кулдауне",
        description: `Осталось ${Math.floor(remaining / 60)}м ${remaining % 60}с`,
        variant: "destructive",
        duration: 2000,
      });
      return;
    }
    
    // Активируем абилку без дополнительной платы
    setAbilitiesUsed(prev => {
      const newCount = prev + 1;
      localStorage.setItem('clickerAbilitiesUsed', newCount.toString());
      return newCount;
    });
    
    setActiveAbilities(prev => {
      const updated = {
        ...prev,
        [ability.id]: {
          active: true,
          endTime: now + ability.duration
        }
      };
      localStorage.setItem('clickerActiveAbilities', JSON.stringify(updated));
      return updated;
    });
    
    // Устанавливаем кулдаун
    setAbilityCooldowns(prev => {
      const updated = {
        ...prev,
        [ability.id]: now + ability.cooldown
      };
      localStorage.setItem('clickerAbilityCooldowns', JSON.stringify(updated));
      return updated;
    });
    
    toast({
      title: `🔮 ${ability.name} активирована!`,
      description: `Длительность: ${ability.duration / 1000}с`,
      duration: 3000,
    });
    
        {/* Партиклы для абилки без числовых значений */}
        if (clickButtonRef.current) {
          const rect = clickButtonRef.current.getBoundingClientRect();
          // Убраны партиклы с текстом - только визуальный эффект
        }
  };

  // Функции туториала
  const nextTutorialStep = () => {
    if (tutorialStep < 2) {
      setTutorialStep(prev => prev + 1);
    } else {
      setShowTutorial(false);
      localStorage.setItem('clickerTutorialCompleted', 'true');
      toast({
        title: "🎓 Туториал завершен!",
        description: "Теперь вы знаете основы игры. Удачи!",
        duration: 4000,
      });
    }
  };

  const skipTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('clickerTutorialCompleted', 'true');
  };

  const buySkin = (skin: Skin) => {
    if (coins >= skin.price && !ownedSkins.includes(skin.id)) {
      setCoins(prev => prev - skin.price);
      setOwnedSkins(prev => {
        const newOwned = [...prev, skin.id];
        localStorage.setItem('clickerOwnedSkins', JSON.stringify(newOwned));
        return newOwned;
      });
      setCurrentSkin(skin.id);
      
      // Эффект смены скина
      setSkinEffect('animate-pulse animate-scale-in');
      setTimeout(() => setSkinEffect(''), 1000);
      
      // Партиклы при покупке скина убраны
      
      toast({
        title: `🎨 Скин "${skin.name}" куплен!`,
        description: `Новый стиль кнопки активирован`,
        duration: 2000,
      });
      
      autoSaveAfterPurchase();
    } else if (ownedSkins.includes(skin.id)) {
      setCurrentSkin(skin.id);
      toast({
        title: `🎨 Скин "${skin.name}" выбран!`,
        description: `Новый стиль кнопки активирован`,
        duration: 2000,
      });
    }
  };

  const getCurrentSkin = () => {
    return skins.find(skin => skin.id === currentSkin) || skins[0];
  };
  
  const getCurrentCooldown = () => 500;

  const buyCooldownUpgrade = () => {
    if (cooldownLevel >= 17) return;
    const cost = 10000 * Math.pow(cooldownLevel + 1, 2);
    if (coins < cost) return;
    setCoins(prev => prev - cost);
    setCooldownLevel(prev => prev + 1);
    toast({ title: '⏱️ Кулдаун уменьшен', description: `Текущий КД: ${(getCurrentCooldown()/1000).toFixed(1)}с` });
  };

  // Export/Import functions
  const exportData = () => {
    const gameData = {
      coins,
      clickPower,
      level,
      totalClicks,
      playTime,
      currentSkin,
      criticalUpgrade,
      speedUpgrade,
      unlockedAchievements,
      dailyCoins,
      ownedSkins,
      ownedAbilities,
      activeAbilities,
      abilityCooldowns,
      abilitiesUsed,
      cooldownLevel,
      hourlyClicks,
      lastHourlyReset,
      dailyClicks,
      lastDailyClicksReset,
      lastSaved: new Date().toISOString(),
      version: '2.1'
    };

    const dataStr = JSON.stringify(gameData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `flowcoin-clicker-save-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "📁 Данные экспортированы",
      description: "Файл сохранения загружен",
    });
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const gameData = JSON.parse(e.target?.result as string);
        
        // Validate data
        if (!gameData.version || typeof gameData.coins !== 'number') {
          throw new Error('Invalid save file');
        }

        // Load data
        setCoins(gameData.coins || 0);
        setClickPower(gameData.clickPower || 1);
        
        setLevel(gameData.level || 1);
        setTotalClicks(gameData.totalClicks || 0);
        setPlayTime(gameData.playTime || 0);
        setCurrentSkin(gameData.currentSkin || 'default');
        setCriticalUpgrade(gameData.criticalUpgrade || 0);
        setSpeedUpgrade(gameData.speedUpgrade || 0);
        setUnlockedAchievements(gameData.unlockedAchievements || []);
        setDailyCoins(gameData.dailyCoins || 0);
        setOwnedSkins(gameData.ownedSkins || ['default']);
        setOwnedAbilities(gameData.ownedAbilities || []);
        setActiveAbilities(gameData.activeAbilities || {});
        setAbilityCooldowns(gameData.abilityCooldowns || {});
        setAbilitiesUsed(gameData.abilitiesUsed || 0);
        setCooldownLevel(gameData.cooldownLevel || 0);
        setHourlyClicks(gameData.hourlyClicks || 0);
        setLastHourlyReset(gameData.lastHourlyReset || Date.now());
        setDailyClicks(gameData.dailyClicks || 0);
        setLastDailyClicksReset(gameData.lastDailyClicksReset || Date.now());

        toast({
          title: "📁 Данные импортированы",
          description: "Прогресс успешно загружен",
        });
      } catch (error) {
        toast({
          title: "❌ Ошибка импорта",
          description: "Не удалось загрузить файл сохранения",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  };

  const resetProgress = () => {
    if (confirm('Вы уверены, что хотите сбросить весь прогресс? Это действие нельзя отменить!')) {
      // Clear localStorage
      const keys = Object.keys(localStorage).filter(key => key.startsWith('clicker'));
      keys.forEach(key => localStorage.removeItem(key));
      
      // Reset state
      setCoins(0);
      setClickPower(1);
      
      setLevel(1);
      setTotalClicks(0);
      setPlayTime(0);
      setCurrentSkin('default');
      setCriticalUpgrade(0);
      setSpeedUpgrade(0);
      setUnlockedAchievements([]);
      setDailyCoins(0);
      setOwnedSkins(['default']);
      setOwnedAbilities([]);
      setActiveAbilities({});
      setAbilityCooldowns({});
      setAbilitiesUsed(0);
      setLastSaved(null);

      toast({
        title: "🔄 Прогресс сброшен",
        description: "Все данные удалены",
      });
    }
  };

  return (
    <div className="space-y-6 slide-in-right">
      {/* Туториал */}
      {showTutorial && (
        <Card className="glass p-4 border-primary/50 bg-primary/5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-primary">🎓 Туториал ({tutorialStep + 1}/3)</h3>
              <Button onClick={skipTutorial} variant="ghost" size="sm">Пропустить</Button>
            </div>
            
            {tutorialStep === 0 && (
              <div className="space-y-2">
                <p className="text-sm">Добро пожаловать в FlowCoin Clicker! Кликайте на большую кнопку ниже, чтобы заработать монеты.</p>
                <Button onClick={nextTutorialStep} size="sm" className="glass-button">Понятно!</Button>
              </div>
            )}
            
            {tutorialStep === 1 && (
              <div className="space-y-2">
                <p className="text-sm">Отлично! Теперь перейдите на вкладку "Улучшения" и купите улучшение силы клика.</p>
                <Button onClick={nextTutorialStep} size="sm" className="glass-button">Куплю улучшение!</Button>
              </div>
            )}
            
            {tutorialStep === 2 && (
              <div className="space-y-2">
                <p className="text-sm">Превосходно! Изучите другие вкладки: скины, достижения и абилки. Удачной игры!</p>
                <Button onClick={nextTutorialStep} size="sm" className="glass-button">Завершить туториал</Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          FlowCoin Clicker v2.0
        </h1>
        <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
          <span>{t.level} {level}</span>
          <span>•</span>
          
          {multiplier > 1 && (
            <>
              <span>•</span>
              <span className="text-primary">x{multiplier.toFixed(1)}</span>
            </>
          )}
        </div>
        
        {/* Лимиты коинов */}
        <div className="flex items-center justify-center space-x-6 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <CircleDollarSign className="w-3 h-3" />
            <span className={dailyCoins >= DAILY_COIN_LIMIT * 0.9 ? 'text-destructive font-semibold' : ''}>
              Дневные коины: {dailyCoins.toLocaleString()}/{DAILY_COIN_LIMIT.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Shield className="w-3 h-3" />
            <span>CPS: {clicksPerSecond}/40</span>
          </div>
        </div>
        
        {/* Предупреждение о лимите */}
        {dailyCoins >= DAILY_COIN_LIMIT * 0.9 && (
          <div className="text-center">
            <p className="text-xs text-destructive font-medium">
              {dailyCoins >= DAILY_COIN_LIMIT 
                ? '🚫 Дневной лимит достигнут! Возвращайтесь завтра'
                : '⚠️ Осталось менее 10% от дневного лимита'
              }
            </p>
          </div>
        )}
        
        {/* Прогресс-бар лимита */}
        <div className="space-y-1">
          <Progress value={(dailyCoins / DAILY_COIN_LIMIT) * 100} className="h-2" />
        </div>
      </div>

      {/* Main Clicker */}
      <Card className="glass p-8 text-center">
        <div className="space-y-4">
          <div className="text-3xl font-bold text-primary">
            {new Intl.NumberFormat(language === 'ru' ? 'ru' : 'en', { notation: 'compact', maximumFractionDigits: 1 }).format(coins)} FC
          </div>
          <div className="relative overflow-hidden">  {/* Добавляем overflow-hidden для ограничения партиклов */}
            <Button
              ref={clickButtonRef}
              onClick={handleClick}
              disabled={checkDailyLimit()}
              className={`click-button hover-glow relative overflow-hidden w-48 h-48 text-3xl font-bold transition-all duration-200 ${getCurrentSkin().color} ${skinEffect} ${goldenClickActive ? 'animate-pulse border-yellow-400 shadow-yellow-400/50' : ''}
                ${checkDailyLimit() ? 'opacity-50 cursor-not-allowed' : ''}
                bg-gradient-to-br from-primary/20 via-primary/10 to-transparent
                border-4 ${goldenClickActive ? 'border-yellow-400' : 'border-primary/30'}
                hover:scale-105 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/40 hover:rotate-2
                active:scale-90 active:shadow-inner active:shadow-primary/60 active:rotate-0 active:border-primary/70
                backdrop-blur-sm transform-gpu`}
              style={{
                borderRadius: '50%',
                transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1), transform 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
                color: getSkinParticleColor(currentSkin)
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="scale-[3] drop-shadow-2xl animate-pulse" style={{ filter: `drop-shadow(0 0 20px ${getSkinParticleColor(currentSkin)})` }}>
                  {getCurrentSkin().icon}
                </div>
                {goldenClickActive && (
                  <div className="absolute inset-0 bg-yellow-400/20 animate-pulse rounded-full"></div>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 animate-pulse opacity-50 rounded-full"></div>
              {/* Дополнительный эффект свечения */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
              {/* Дополнительный внутренний свет */}
              <div className="absolute inset-2 bg-gradient-to-br from-white/5 to-transparent opacity-60 rounded-full"></div>
            </Button>
            
            {/* Floating text - теперь ограничены кнопкой */}
            {floatingTexts.map(text => (
              <div
                key={text.id}
                className="absolute pointer-events-none font-bold z-10 drop-shadow-lg text-xl"
                style={{
                  left: text.x - (clickButtonRef.current?.getBoundingClientRect().left || 0),
                  top: text.y - (clickButtonRef.current?.getBoundingClientRect().top || 0),
                  animation: 'floatUp 2s ease-out forwards',
                  textShadow: `0 0 10px ${text.color}`,
                  color: text.color,
                  transform: 'translate(-50%, -50%)' // центрируем текст
                }}
              >
                {text.text}
              </div>
            ))}
            
            {/* Индикаторы активных абилок */}
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {Object.entries(activeAbilities).map(([abilityId, ability]) => {
                if (!ability.active) return null;
                const abilityData = abilities.find(a => a.id === abilityId);
                const remaining = Math.ceil((ability.endTime - Date.now()) / 1000);
                return (
                  <div key={abilityId} className="glass px-2 py-1 text-xs text-center animate-pulse-glow">
                    <div className="text-primary">{abilityData?.icon}</div>
                    <div className="text-xs">{remaining}s</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            +{(clickPower * multiplier).toLocaleString()} {language === 'ru' ? 'за клик' : 'per click'}
            {criticalUpgrade > 0 && (
              <div className="text-xs text-orange-400">
                {(criticalUpgrade * 3).toFixed(1)}% {language === 'ru' ? 'шанс критического удара (x3)' : 'critical hit chance (x3)'}
              </div>
            )}
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Shield className="w-4 h-4 text-green-500" />
            <span className="text-xs text-muted-foreground">
              {language === 'ru' ? 'Защита от автокликера активна' : 'Anti-cheat protection active'}
            </span>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="upgrades" className="w-full pb-4 animate-slide-in-right">
        <TabsList className="grid w-full grid-cols-5 mb-16">
          <TabsTrigger value="upgrades"><TrendingUp className="w-4 h-4" /></TabsTrigger>
          <TabsTrigger value="abilities"><Zap className="w-4 h-4" /></TabsTrigger>
          <TabsTrigger value="skins"><Palette className="w-4 h-4" /></TabsTrigger>
          <TabsTrigger value="achievements"><Award className="w-4 h-4" /></TabsTrigger>
          <TabsTrigger value="settings"><Star className="w-4 h-4" /></TabsTrigger>
        </TabsList>
        
        <TabsContent value="upgrades" className="space-y-4 animate-fade-in">
          <Card className="glass p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Сила клика</div>
                <div className="text-sm text-muted-foreground">
                  Текущая: {clickPower}
                </div>
              </div>
              <Button
                onClick={buyClickPower}
                disabled={coins < Math.floor(clickPower * (clickPower <= priceMultipliers.length ? priceMultipliers[clickPower - 1] : 700) * (activeAbilities.auto_upgrade?.active ? 0.5 : 1))}
                variant="outline"
                size="sm"
                className="glass-button"
              >
                {Math.floor(clickPower * (clickPower <= priceMultipliers.length ? priceMultipliers[clickPower - 1] : 700) * (activeAbilities.auto_upgrade?.active ? 0.5 : 1)).toLocaleString()} FC
              </Button>
            </div>
          </Card>


          <Card className="glass p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium flex items-center">
                  <Star className="w-4 h-4 mr-2 text-orange-400" />
                  Критический удар
                </div>
                <div className="text-sm text-muted-foreground">
                  Шанс: {(criticalUpgrade * 3).toFixed(1)}%
                </div>
              </div>
              <Button
                onClick={buyCriticalUpgrade}
                disabled={coins < Math.floor((criticalUpgrade + 1) * (criticalUpgrade < priceMultipliers.length ? priceMultipliers[criticalUpgrade] : 700) * (activeAbilities.auto_upgrade?.active ? 0.5 : 1))}
                variant="outline"
                size="sm"
                className="glass-button"
              >
                {Math.floor((criticalUpgrade + 1) * (criticalUpgrade < priceMultipliers.length ? priceMultipliers[criticalUpgrade] : 700) * (activeAbilities.auto_upgrade?.active ? 0.5 : 1)).toLocaleString()} FC
              </Button>
            </div>
          </Card>


          {/* Новые улучшения */}
          <Card className="glass p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium flex items-center">
                  <Rocket className="w-4 h-4 mr-2 text-purple-400" />
                  Супер Мощность
                </div>
                <div className="text-sm text-muted-foreground">
                  Уровень: {localStorage.getItem('clickerSuperPower') || '0'}
                </div>
              </div>
              <Button
                onClick={() => {
                  const level = parseInt(localStorage.getItem('clickerSuperPower') || '0');
                  const cost = Math.floor((level + 1) * 1000);
                  if (coins >= cost) {
                    setCoins(prev => prev - cost);
                    localStorage.setItem('clickerSuperPower', String(level + 1));
                    toast({ title: "🚀 Супер мощность!", description: "Сила всех кликов увеличена!" });
                  }
                }}
                disabled={coins < Math.floor((parseInt(localStorage.getItem('clickerSuperPower') || '0') + 1) * 1000)}
                variant="outline"
                size="sm"
                className="glass-button"
              >
                {Math.floor((parseInt(localStorage.getItem('clickerSuperPower') || '0') + 1) * 1000).toLocaleString()} FC
              </Button>
            </div>
          </Card>

          <Card className="glass p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-yellow-400" />
                  Энергетический Бустер
                </div>
                <div className="text-sm text-muted-foreground">
                  Уровень: {localStorage.getItem('clickerEnergyBooster') || '0'}
                </div>
              </div>
                 <Button
                   onClick={() => {
                     const level = parseInt(localStorage.getItem('clickerEnergyBooster') || '0');
                     const cost = Math.floor((level + 1) * 750);
                     if (coins >= cost) {
                       setCoins(prev => prev - cost);
                       localStorage.setItem('clickerEnergyBooster', String(level + 1));
                       toast({ title: "⚡ Энергия!", description: "Клики стали мощнее!" });
                     }
                   }}
                   disabled={coins < Math.floor((parseInt(localStorage.getItem('clickerEnergyBooster') || '0') + 1) * 750)}
                   variant="outline"
                   size="sm"
                   className="glass-button"
                 >
                   {Math.floor((parseInt(localStorage.getItem('clickerEnergyBooster') || '0') + 1) * 750).toLocaleString()} FC
                 </Button>
            </div>
          </Card>

          <Card className="glass p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium flex items-center">
                  <Diamond className="w-4 h-4 mr-2 text-cyan-400" />
                  Удачный Клик
                </div>
                <div className="text-sm text-muted-foreground">
                  Уровень: {localStorage.getItem('clickerLuckyClick') || '0'}
                </div>
              </div>
              <Button
                onClick={() => {
                  const level = parseInt(localStorage.getItem('clickerLuckyClick') || '0');
                  const cost = Math.floor((level + 1) * 2000);
                  if (coins >= cost) {
                    setCoins(prev => prev - cost);
                    localStorage.setItem('clickerLuckyClick', String(level + 1));
                    toast({ title: "💎 Удача!", description: "Шанс получить бонусные коины увеличен!" });
                  }
                }}
                disabled={coins < Math.floor((parseInt(localStorage.getItem('clickerLuckyClick') || '0') + 1) * 2000)}
                variant="outline"
                size="sm"
                className="glass-button"
              >
                {Math.floor((parseInt(localStorage.getItem('clickerLuckyClick') || '0') + 1) * 2000).toLocaleString()} FC
              </Button>
            </div>
          </Card>

          <Card className="glass p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium flex items-center">
                  <Crown className="w-4 h-4 mr-2 text-gold-400" />
                  Мастерство
                </div>
                <div className="text-sm text-muted-foreground">
                  Уровень: {localStorage.getItem('clickerMastery') || '0'}
                </div>
              </div>
              <Button
                onClick={() => {
                  const level = parseInt(localStorage.getItem('clickerMastery') || '0');
                  const cost = Math.floor((level + 1) * 5000);
                  if (coins >= cost) {
                    setCoins(prev => prev - cost);
                    localStorage.setItem('clickerMastery', String(level + 1));
                    toast({ title: "👑 Мастерство!", description: "Общая эффективность повышена!" });
                  }
                }}
                disabled={coins < Math.floor((parseInt(localStorage.getItem('clickerMastery') || '0') + 1) * 5000)}
                variant="outline"
                size="sm"
                className="glass-button"
              >
                {Math.floor((parseInt(localStorage.getItem('clickerMastery') || '0') + 1) * 5000).toLocaleString()} FC
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="skins" className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-2 gap-4">
            {skins.map((skin) => (
               <Card key={skin.id} className={`glass p-4 text-center transition-all duration-300 ${currentSkin === skin.id ? 'ring-2 ring-primary animate-scale-in' : 'hover:scale-105'}`}>
                 <div className="flex items-center justify-center mb-2">
                   <div className={`text-2xl transition-all duration-300 ${skin.color}`}>
                     {skin.icon}
                   </div>
                 </div>
                <div className="font-medium mb-1">{skin.name}</div>
                <div className="text-sm text-muted-foreground mb-3">
                  {skin.price === 0 ? 'Бесплатно' : `${skin.price.toLocaleString()} FC`}
                </div>
                {currentSkin === skin.id ? (
                  <Badge variant="default">Активен</Badge>
                ) : ownedSkins.includes(skin.id) ? (
                  <Button
                    onClick={() => buySkin(skin)}
                    size="sm"
                    className="glass-button w-full"
                  >
                    Выбрать
                  </Button>
                ) : (
                  coins >= skin.price ? (
                    <Button
                      onClick={() => buySkin(skin)}
                      size="sm"
                      className="glass-button w-full"
                    >
                      Купить
                    </Button>
                  ) : (
                    <Button disabled size="sm" variant="outline" className="w-full">
                      Недостаточно FC
                    </Button>
                  )
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4 animate-fade-in">
          <div className="space-y-3">
            {achievements.map((achievement) => {
              const isUnlocked = unlockedAchievements.includes(achievement.id);
               const stats: GameStats = { 
                 coins, 
                 totalClicks, 
                 clickPower, 
                 level, 
                 playTime, 
                 dailyCoins,
                 criticalUpgrade,
                 speedUpgrade,
                 abilitiesUsed,
                 skinsOwned: ownedSkins.length,
                 offlineEarnings: 0
               };
              const progress = achievement.requirement(stats);
              
              return (
                <Card key={achievement.id} className={`glass p-4 ${isUnlocked ? 'bg-primary/10' : ''}`}>
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${isUnlocked ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{achievement.name}</span>
                        {isUnlocked && <Badge variant="default">Выполнено</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {achievement.description}
                      </div>
                      <div className="text-xs text-primary">
                        Награда: +{achievement.reward.toLocaleString()} FC
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="abilities" className="space-y-4 animate-fade-in">
          <div className="space-y-3">
            {abilities.map((ability) => {
              const isOnCooldown = abilityCooldowns[ability.id] && abilityCooldowns[ability.id] > Date.now();
              const cooldownRemaining = isOnCooldown ? Math.ceil((abilityCooldowns[ability.id] - Date.now()) / 1000) : 0;
              const isActive = activeAbilities[ability.id]?.active;
              const activeRemaining = isActive ? Math.ceil((activeAbilities[ability.id].endTime - Date.now()) / 1000) : 0;
              const canAfford = coins >= ability.price;
              
              return (
                <Card key={ability.id} className={`glass p-4 ${isActive ? 'bg-primary/20 border-primary' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-primary text-primary-foreground animate-pulse-glow' : 'bg-muted'}`}>
                        {ability.icon}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{ability.name}</span>
                          {isActive && <Badge variant="default">Активна {Math.floor(activeRemaining / 60)}м {activeRemaining % 60}с</Badge>}
                          {isOnCooldown && <Badge variant="secondary">Кулдаун {Math.floor(cooldownRemaining / 60)}м {cooldownRemaining % 60}с</Badge>}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {ability.description}
                        </div>
                        <div className="text-xs text-primary">
                          {!ability.unlocked ? `Цена: ${ability.price.toLocaleString()} FC` : 'Куплена'}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {!ability.unlocked ? (
                        <Button
                          onClick={() => buyAbility(ability)}
                          disabled={!canAfford}
                          size="sm"
                          className="glass-button"
                        >
                          Купить
                        </Button>
                      ) : (
                        <Button
                          onClick={() => useAbility(ability)}
                          disabled={isOnCooldown || isActive}
                          size="sm"
                          className="glass-button"
                        >
                          Использовать
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 animate-fade-in">
          <Card className="glass p-4">
            <h3 className="text-lg font-semibold mb-4">{t.settings}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Язык / Language</div>
                  <div className="text-sm text-muted-foreground">
                    Выберите язык интерфейса
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setLanguage('ru')}
                    size="sm"
                    variant={language === 'ru' ? 'default' : 'outline'}
                    className="glass-button"
                  >
                    🇷🇺 RU
                  </Button>
                  <Button
                    onClick={() => setLanguage('en')}
                    size="sm"
                    variant={language === 'en' ? 'default' : 'outline'}
                    className="glass-button"
                  >
                    🇺🇸 EN
                  </Button>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="font-medium mb-2">Управление данными</div>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => { saveProgress(); toast({ title: 'Сохранено', description: 'Прогресс сохранён' }); }} size="sm" className="glass-button">
                      <Save className="w-4 h-4 mr-2" />
                      Сохранить
                    </Button>
                    <Button onClick={exportData} size="sm" variant="outline" className="glass-button">
                      <Download className="w-4 h-4 mr-2" />
                      Экспорт
                    </Button>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".json"
                        onChange={importData}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Button size="sm" variant="outline" className="glass-button">
                        <Upload className="w-4 h-4 mr-2" />
                        Импорт
                      </Button>
                    </div>
                  </div>
                  <Button onClick={resetProgress} size="sm" variant="destructive" className="w-full">
                    Сбросить прогресс
                  </Button>
                </div>
              </div>

              {lastSaved && (
                <div className="text-xs text-muted-foreground">
                  Последнее сохранение: {lastSaved.toLocaleString()}
                </div>
              )}
              
              <div className="text-xs text-muted-foreground">
                Время игры: {Math.floor(playTime / 3600)}ч {Math.floor((playTime % 3600) / 60)}м {playTime % 60}с
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClickerGame;