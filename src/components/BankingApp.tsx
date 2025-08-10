import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Eye, EyeOff, Plus, QrCode, Shield, Sparkles, Settings, ChevronLeft, ChevronRight, Lock, History, Send, ArrowUpDown, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
// Types
type Wallet = {
  id: string;           // public wallet id (e.g. abc7def8ghjklmno_x12a34b56)
  cardNumber: string;   // 16-digit formatted number
  skin: SkinId;         // visual style
  createdAt: number;
  words: string[];      // 10 unique words to login
};

type SkinId = 'classic' | 'sunset' | 'ocean' | 'midnight' | 'glass';

const SKIN_CLASSES: Record<SkinId, string> = {
  classic: 'bg-gradient-to-br from-primary/80 to-accent/80 text-foreground shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.4)]',
  sunset: 'bg-gradient-to-br from-[hsl(var(--primary)/0.9)] to-[hsl(var(--accent)/0.9)] text-foreground',
  ocean: 'bg-gradient-to-br from-[hsl(var(--accent)/0.9)] to-[hsl(var(--primary)/0.6)] text-foreground',
  midnight: 'bg-[radial-gradient(120%_120%_at_0%_0%,hsl(var(--accent)/0.3),transparent_60%)] bg-[linear-gradient(135deg,hsl(var(--primary)/0.8),transparent)] text-foreground',
  glass: 'backdrop-blur-md bg-background/30 border border-border/50 text-foreground',
};

const WORDS_DICTIONARY = [
  'alpha','bravo','charlie','delta','echo','foxtrot','golf','hotel','india','juliet',
  'kilo','lima','mike','november','oscar','papa','quebec','romeo','sierra','tango',
  'uniform','victor','whiskey','xray','yankee','zulu','amber','azure','coral','onyx',
  'pearl','ruby','topaz','jet','iris','lotus','maple','nebula','orbit','pluto',
  'quartz','raven','solar','terra','umbra','velvet','willow','xenon','yarrow','zenith',
  'aurora','blossom','comet','dawn','ember','fable','glimmer','harbor','island','jade',
  'kepler','lunar','meadow','nylon','opal','pixel','quill','ripple','sable','thunder',
  'ultra','vortex','wander','xerox','yodel','zephyr','atlas','breeze','cipher','drift',
  'ember','flame','groove','horizon','ion','jigsaw','knot','legend','magma','nimbus',
  'omega','pulse','quiver','rift','silk','trail','unity','vault','whisper','yonder'
];

// Helpers
const rand = (n: number) => Math.floor(Math.random() * n);

function generateWalletId() {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const seg1 = Array.from({ length: 16 }, () => alphabet[rand(alphabet.length)]).join('');
  const seg2 = Array.from({ length: 12 }, () => alphabet[rand(alphabet.length)]).join('');
  return `${seg1}_${seg2}`;
}

function generateCardNumber() {
  const digits = Array.from({ length: 16 }, () => String(rand(10))).join('');
  return `${digits.slice(0,4)} ${digits.slice(4,8)} ${digits.slice(8,12)} ${digits.slice(12,16)}`;
}

function pickUniqueWords(count = 10) {
  const pool = [...WORDS_DICTIONARY];
  const words: string[] = [];
  while (words.length < count && pool.length) {
    const idx = rand(pool.length);
    words.push(pool.splice(idx, 1)[0]);
  }
  return words;
}

const STORAGE_KEYS = {
  wallets: 'bankWallets',
  activeWallet: 'bankActiveWalletId',
  coins: 'clickerCoins',
} as const;

export default function BankingApp() {
  // Load wallets
  const [wallets, setWallets] = useState<Wallet[]>(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.wallets);
    if (raw) return JSON.parse(raw);
    const first: Wallet = {
      id: generateWalletId(),
      cardNumber: generateCardNumber(),
      skin: 'classic',
      createdAt: Date.now(),
      words: pickUniqueWords(10),
    };
    localStorage.setItem(STORAGE_KEYS.wallets, JSON.stringify([first]));
    localStorage.setItem(STORAGE_KEYS.activeWallet, first.id);
    return [first];
  });
  const [activeWalletId, setActiveWalletId] = useState<string>(() => localStorage.getItem(STORAGE_KEYS.activeWallet) || wallets[0]?.id);
  const activeIndex = Math.max(0, wallets.findIndex(w => w.id === activeWalletId));
  const activeWallet = wallets[activeIndex] ?? wallets[0];

  // Simple balance from localStorage
  const [balance, setBalance] = useState<number>(() => {
    const saved = localStorage.getItem('bank_balance');
    return saved ? parseInt(saved) : 10000;
  });
  
  useEffect(() => {
    localStorage.setItem('bank_balance', balance.toString());
  }, [balance]);

  const maxPerTransfer = useMemo(() => Math.max(0, Math.floor(balance * 0.1)), [balance]);

  // Persist helpers
  const saveWallets = useCallback((next: Wallet[]) => {
    setWallets(next);
    localStorage.setItem(STORAGE_KEYS.wallets, JSON.stringify(next));
  }, []);

  useEffect(() => {
    if (!activeWallet) return;
    localStorage.setItem(STORAGE_KEYS.activeWallet, activeWallet.id);
  }, [activeWallet?.id]);

  // Carousel setup (Embla)
  const [emblaRef, setEmblaRef] = useState<HTMLDivElement | null>(null);
  // Transfer form state
  const [recipientId, setRecipientId] = useState('');
  const [amount, setAmount] = useState<number>(1);
  const [showWords, setShowWords] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const handleAddCard = () => {
    const w: Wallet = {
      id: generateWalletId(),
      cardNumber: generateCardNumber(),
      skin: 'classic',
      createdAt: Date.now(),
      words: pickUniqueWords(10),
    };
    const next = [...wallets, w];
    saveWallets(next);
    setActiveWalletId(w.id);
    toast({ title: 'Карта добавлена', description: 'Сохраните 10 слов для входа.' });
  };

  const handleCopy = async (text: string, label?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Скопировано', description: label ?? text });
    } catch {}
  };

  const handleChangeSkin = (skin: SkinId) => {
    if (!activeWallet) return;
    const next = wallets.map(w => w.id === activeWallet.id ? { ...w, skin } : w);
    saveWallets(next);
    toast({ title: 'Скин применен', description: 'Оформление карты обновлено.' });
  };

  const handleTransfer = () => {
    if (!activeWallet) {
      toast({ title: 'Ошибка', description: 'Выберите карту для перевода' });
      return;
    }
    const amt = Math.floor(Number(amount));
    if (!recipientId || recipientId.length < 5) {
      toast({ title: 'Ошибка', description: 'Укажите корректный номер кошелька получателя.' });
      return;
    }
    if (isNaN(amt) || amt < 1) {
      toast({ title: 'Ошибка', description: 'Минимальная сумма перевода — 1 монета.' });
      return;
    }
    if (amt > maxPerTransfer) {
      toast({ title: 'Лимит перевода', description: `Максимум ${maxPerTransfer} монет за один перевод (10% от баланса).` });
      return;
    }
    if (amt > balance) {
      toast({ title: 'Недостаточно средств', description: 'Пополните баланс.' });
      return;
    }

    try {
      // Simple transfer logic without database
      const newBalance = balance - amt;
      const cashback = amt >= 10000 ? Math.floor(amt * 0.1) : 0;
      setBalance(newBalance + cashback);
      
      toast({ 
        title: 'Перевод выполнен', 
        description: `Отправлено ${amt} монет. ${cashback > 0 ? `Кэшбэк: ${cashback}` : ''}` 
      });
      setAmount(1);
      setRecipientId('');
    } catch (e: any) {
      toast({ title: 'Ошибка', description: e.message ?? 'Не удалось выполнить перевод' });
    }
  };

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Ф-Банк</h1>
        <p className="text-sm text-muted-foreground">Обмен монетами по номеру кошелька и QR‑коду. Лимит перевода: 10% от баланса.</p>
        <link rel="canonical" href="/bank" />
      </header>

      {/* Cards Carousel */}
      <section aria-label="Ваши карты" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Баланс: {balance} • Лимит на перевод: {maxPerTransfer}</div>
          <Button size="sm" variant="outline" onClick={handleAddCard}>
            <Plus className="h-4 w-4 mr-1" /> Добавить карту
          </Button>
        </div>

        <div className="overflow-hidden" ref={setEmblaRef}>
          <div className="flex gap-4">
            {wallets.map((w) => (
              <div key={w.id} className="min-w-[85%]">
                <Card className={cn('relative p-5 h-44 rounded-2xl text-foreground', SKIN_CLASSES[w.skin])}>
                  <div className="absolute inset-0 rounded-2xl pointer-events-none" />
                  <div className="flex items-center justify-between">
                    <div className="text-sm opacity-80">Ф-Банк</div>
                    <Sparkles className="h-4 w-4 opacity-70" />
                  </div>
                  <div className="mt-6 text-xl tracking-widest font-mono select-all">
                    {w.cardNumber}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <div className="truncate max-w-[65%]" title={w.id}>ID: {w.id}</div>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => handleCopy(w.id, 'Номер кошелька')} aria-label="Копировать номер кошелька">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => setQrOpen(true)} aria-label="Показать QR-код">
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Skins */}
        <div className="flex items-center gap-2 mt-1">
          {(['classic','sunset','ocean','midnight','glass'] as SkinId[]).map((s) => (
            <button key={s} onClick={() => handleChangeSkin(s)} className={cn('h-8 px-3 rounded-full text-xs border', activeWallet?.skin === s ? 'bg-primary/20 border-primary' : 'hover:bg-muted/50')}>
              {s}
            </button>
          ))}
        </div>
      </section>

      {/* Words (login) */}
      {activeWallet && (
        <section className="mt-6 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">10 слов для входа</h2>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => setShowWords(v => !v)}>
                {showWords ? <><EyeOff className="h-4 w-4 mr-1" /> Скрыть</> : <><Eye className="h-4 w-4 mr-1" /> Показать</>}
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleCopy(activeWallet.words.join(' '), 'Секретные слова')}>
                <Shield className="h-4 w-4 mr-1" /> Скопировать
              </Button>
            </div>
          </div>
          <div className={cn('grid grid-cols-2 gap-2 text-sm', !showWords && 'blur-sm select-none')}>
            {activeWallet.words.map((w, i) => (
              <div key={w} className="glass p-2 rounded-md flex items-center justify-between">
                <span className="opacity-70">{i + 1}.</span>
                <span className="font-mono">{w}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Transfer */}
      <section className="mt-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 border border-primary/10 backdrop-blur-sm">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent/20 to-transparent rounded-full translate-y-12 -translate-x-12" />
          
          <div className="relative p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
                <Send className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Перевод монет</h2>
                <p className="text-sm text-muted-foreground">Быстрые и безопасные переводы</p>
              </div>
            </div>

            {/* Balance info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
                <div className="flex items-center gap-2 text-accent mb-1">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs font-medium">Баланс</span>
                </div>
                <div className="text-2xl font-bold">{balance.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">монет</div>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 text-primary mb-1">
                  <ArrowUpDown className="h-4 w-4" />
                  <span className="text-xs font-medium">Лимит</span>
                </div>
                <div className="text-2xl font-bold">{maxPerTransfer.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">за перевод</div>
              </div>
            </div>

            {/* Transfer form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Номер кошелька получателя</label>
                <div className="relative">
                  <Input 
                    placeholder="Введите номер кошелька..." 
                    value={recipientId} 
                    onChange={(e) => setRecipientId(e.target.value.trim())}
                    className="pl-12 h-12 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/25"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-primary to-accent" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Сумма перевода</label>
                <div className="relative">
                  <Input 
                    type="number" 
                    min={1} 
                    max={maxPerTransfer} 
                    value={amount} 
                    onChange={(e) => setAmount(Number(e.target.value))} 
                    placeholder="0"
                    className="pl-12 pr-16 h-12 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/25 text-lg font-semibold"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Zap className="h-4 w-4 text-accent" />
                  </div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    монет
                  </div>
                </div>
              </div>

              {/* Quick amount buttons */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setAmount(1000)}
                  className="flex-1 h-10 bg-background/50 hover:bg-primary/10 hover:border-primary/30"
                >
                  1K
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setAmount(5000)}
                  className="flex-1 h-10 bg-background/50 hover:bg-primary/10 hover:border-primary/30"
                >
                  5K
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setAmount(maxPerTransfer)}
                  disabled={maxPerTransfer <= 0}
                  className="flex-1 h-10 bg-background/50 hover:bg-accent/10 hover:border-accent/30"
                >
                  MAX
                </Button>
              </div>

              {/* Transfer button */}
              <Button 
                onClick={handleTransfer} 
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30"
              >
                <Send className="h-5 w-5 mr-2" />
                Отправить перевод
              </Button>
            </div>

            {/* Features info */}
            <div className="pt-4 border-t border-border/50">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="h-3 w-3 text-primary" />
                  Безопасные переводы
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Zap className="h-3 w-3 text-accent" />
                  Кэшбэк 10% с 10K+
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QR modal (simple) */}
      {qrOpen && activeWallet && (
        <div role="dialog" aria-modal className="fixed inset-0 z-50 grid place-items-center bg-background/80">
          <Card className="p-6 space-y-4 max-w-sm w-[90%]">
            <h3 className="text-lg font-semibold">QR для перевода</h3>
            <div className="mx-auto w-full flex items-center justify-center">
              <QRCodeSVG value={`wallet:${activeWallet.id}`} size={192} />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => handleCopy(`wallet:${activeWallet.id}`, 'QR payload')}>Скопировать payload</Button>
              <Button variant="outline" className="w-28" onClick={() => setQrOpen(false)}>Закрыть</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
