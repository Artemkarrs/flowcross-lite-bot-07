import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Gift, Star, Diamond, Crown, Shield } from 'lucide-react';

interface CaseConfig {
  id: string;
  name: string;
  price: number; // FC
  rewards: {
    type: 'coins' | 'skin' | 'ability' | 'flowplus' | 'verification';
    chance: number; // 0..1
    amountMin?: number;
    amountMax?: number;
  }[];
}

const CASES: CaseConfig[] = [
  {
    id: 'common',
    name: 'Обычный кейс',
    price: 250,
    rewards: [
      { type: 'verification', chance: 0.00000001 }, // 0.000001%
      { type: 'flowplus', chance: 0.00001 }, // 0.001%
      { type: 'ability', chance: 0.03 },
      { type: 'skin', chance: 0.07 },
      { type: 'coins', chance: 0.899989, amountMin: 50, amountMax: 250 },
    ],
  },
  {
    id: 'rare',
    name: 'Редкий кейс',
    price: 1500,
    rewards: [
      { type: 'verification', chance: 0.00000001 },
      { type: 'flowplus', chance: 0.00005 }, // 0.005%
      { type: 'ability', chance: 0.1 },
      { type: 'skin', chance: 0.2 },
      { type: 'coins', chance: 0.69995, amountMin: 500, amountMax: 3000 },
    ],
  },
  {
    id: 'legendary',
    name: 'Легендарный кейс',
    price: 10000,
    rewards: [
      { type: 'verification', chance: 0.00000001 },
      { type: 'flowplus', chance: 0.0001 }, // 0.01% (максимум)
      { type: 'ability', chance: 0.18 },
      { type: 'skin', chance: 0.32 },
      { type: 'coins', chance: 0.4998, amountMin: 3000, amountMax: 20000 },
    ],
  },
];

const ALL_SKINS = ['fire','electric','cosmic','royal','diamond','rainbow','shadow','ice','nature'];
const ALL_ABILITIES = ['double_coins','auto_burst','critical_boost','coin_rain','auto_upgrade'];

const CasesGame = () => {
  const { toast } = useToast();
  const [opening, setOpening] = useState<string | null>(null);

  const openCase = (cfg: CaseConfig) => {
    if (opening) return;
    // read balance
    const coins = parseInt(localStorage.getItem('clickerCoins') || '0');
    if (coins < cfg.price) {
      toast({ title: 'Недостаточно FC', description: `Нужно ${cfg.price.toLocaleString()} FC` , variant: 'destructive'});
      return;
    }

    setOpening(cfg.id);

    // charge price
    localStorage.setItem('clickerCoins', String(coins - cfg.price));

    // roll reward
    const roll = Math.random();
    let acc = 0;
    let reward = cfg.rewards[cfg.rewards.length - 1];
    for (const r of cfg.rewards) {
      acc += r.chance;
      if (roll < acc) { reward = r; break; }
    }

    setTimeout(() => {
      setOpening(null);
      switch (reward.type) {
        case 'coins': {
          const min = reward.amountMin || 0, max = reward.amountMax || 0;
          const amount = Math.floor(min + Math.random() * (max - min + 1));
          const cur = parseInt(localStorage.getItem('clickerCoins') || '0');
          localStorage.setItem('clickerCoins', String(cur + amount));
          const dc = parseInt(localStorage.getItem('clickerDailyCoins') || '0');
          localStorage.setItem('clickerDailyCoins', String(dc + amount));
          toast({ title: 'Монеты!', description: `+${amount.toLocaleString()} FC` });
          break;
        }
        case 'flowplus': {
          localStorage.setItem('flowPlusOwned', 'true');
          toast({ title: 'Поздравляем!', description: 'Выпал Flow+' });
          break;
        }
        case 'verification': {
          localStorage.setItem('accountVerified', 'true');
          toast({ title: 'Невероятно!', description: 'Подтверждение аккаунта получено!' });
          break;
        }
        case 'skin': {
          const owned = JSON.parse(localStorage.getItem('clickerOwnedSkins') || '["default"]') as string[];
          const available = ALL_SKINS.filter(s => !owned.includes(s));
          if (available.length === 0) {
            // fallback to coins
            const cur = parseInt(localStorage.getItem('clickerCoins') || '0');
            localStorage.setItem('clickerCoins', String(cur + 500));
            toast({ title: 'Дубликат', description: '+500 FC компенсация' });
          } else {
            const skin = available[Math.floor(Math.random() * available.length)];
            const newOwned = [...owned, skin];
            localStorage.setItem('clickerOwnedSkins', JSON.stringify(newOwned));
            toast({ title: 'Новый скин!', description: `Открыт: ${skin}` });
          }
          break;
        }
        case 'ability': {
          const owned = JSON.parse(localStorage.getItem('clickerOwnedAbilities') || '[]') as string[];
          const available = ALL_ABILITIES.filter(a => !owned.includes(a));
          if (available.length === 0) {
            const cur = parseInt(localStorage.getItem('clickerCoins') || '0');
            localStorage.setItem('clickerCoins', String(cur + 800));
            toast({ title: 'Дубликат', description: '+800 FC компенсация' });
          } else {
            const ability = available[Math.floor(Math.random() * available.length)];
            const newOwned = [...owned, ability];
            localStorage.setItem('clickerOwnedAbilities', JSON.stringify(newOwned));
            toast({ title: 'Новая способность!', description: `Открыта: ${ability}` });
          }
          break;
        }
      }
    }, 900);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Кейсы</h1>
        <p className="text-xs text-muted-foreground">Шанс Flow+ не превышает 0.01%. Подтверждение аккаунта: 0.000001%.</p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {CASES.map((c) => (
          <Card key={c.id} className="glass p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {c.id === 'legendary' ? <Crown className="text-primary" /> : c.id === 'rare' ? <Diamond className="text-primary" /> : <Gift className="text-primary" />}
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-muted-foreground">Цена: {c.price.toLocaleString()} FC</div>
                <div className="text-xs text-muted-foreground">Flow+: {c.rewards.find(r=>r.type==='flowplus')?.chance! * 100}%</div>
              </div>
            </div>
            <Button size="sm" className="glass-button" disabled={opening===c.id} onClick={() => openCase(c)}>
              {opening===c.id ? 'Открываем...' : 'Открыть'}
            </Button>
          </Card>
        ))}
      </div>
      <Card className="glass p-4">
        <div className="text-xs text-muted-foreground flex items-center gap-2"><Shield className="w-4 h-4"/>Все награды сразу добавляются в кликер.</div>
      </Card>
    </div>
  );
};

export default CasesGame;
