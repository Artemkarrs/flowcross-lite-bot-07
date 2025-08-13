import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, ChevronRight, Bell, Settings as SettingsIcon } from 'lucide-react';

const AppleDemo = () => {
  const [segment, setSegment] = useState<'overview' | 'settings'>('overview');
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="apple-theme min-h-[calc(100vh-6rem)] bg-background text-foreground">
      {/* Top nav with frosted glass */}
      <div className="sticky top-0 z-40 apple-glass apple-blur-20 border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Apple UI Demo</div>
          <div className="apple-segmented">
            <button
              onClick={() => setSegment('overview')}
              className={`item ${segment === 'overview' ? 'is-active' : ''}`}
            >
              Обзор
            </button>
            <button
              onClick={() => setSegment('settings')}
              className={`item ${segment === 'settings' ? 'is-active' : ''}`}
            >
              Настройки
            </button>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="text-muted-foreground">
            <Search className="w-4 h-4" />
          </div>
          <input
            placeholder="Поиск"
            className="apple-input apple-blur-10 w-full"
          />
        </div>
      </div>

      <main className="p-4 space-y-4">
        {segment === 'overview' ? (
          <div className="space-y-4">
            <Card className="apple-card rounded-2xl p-4 apple-appear">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold">Добро пожаловать</div>
                  <div className="text-sm text-muted-foreground">Минималистичный UI в стиле Apple с размытием и плавными анимациями</div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="apple-button apple-pressable">Открыть модалку</button>
                  </DialogTrigger>
                  <DialogContent className="apple-glass apple-blur-30 rounded-2xl">
                    <DialogHeader>
                      <DialogTitle>Модальное окно</DialogTitle>
                      <DialogDescription>
                        Плавное появление, стекло с blur(30px), без свечения
                      </DialogDescription>
                    </DialogHeader>
                    <div className="text-sm text-muted-foreground">
                      Используйте этот паттерн для подтверждений и быстрых действий.
                    </div>
                    <DialogFooter>
                      <button className="apple-button">Готово</button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>

            <Card className="apple-card rounded-2xl p-4 apple-appear">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Уведомления</span>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SettingsIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Тонкие тени и градиенты</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Рекомендовано</span>
                </div>
              </div>
            </Card>

            <div className="apple-card rounded-2xl p-2 apple-appear">
              {/* Action list */}
              <button className="w-full text-left rounded-xl p-3 transition-colors hover:bg-secondary/60">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Профиль</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>
              <button className="w-full text-left rounded-xl p-3 transition-colors hover:bg-secondary/60">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Платежи</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>
              <button className="w-full text-left rounded-xl p-3 transition-colors hover:bg-secondary/60">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Конфиденциальность</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Card className="apple-card rounded-2xl p-4 apple-appear">
              <div className="text-base font-semibold mb-1">Настройки темы</div>
              <div className="text-sm text-muted-foreground mb-4">Размытия 10–40px и адаптивные элементы</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="apple-glass apple-blur-10 rounded-xl p-3">
                  <div className="text-xs text-muted-foreground">blur(10px)</div>
                  <div className="mt-2 h-10 rounded-lg bg-white/80" />
                </div>
                <div className="apple-glass apple-blur-20 rounded-xl p-3">
                  <div className="text-xs text-muted-foreground">blur(20px)</div>
                  <div className="mt-2 h-10 rounded-lg bg-white/80" />
                </div>
                <div className="apple-glass apple-blur-30 rounded-xl p-3">
                  <div className="text-xs text-muted-foreground">blur(30px)</div>
                  <div className="mt-2 h-10 rounded-lg bg-white/80" />
                </div>
                <div className="apple-glass apple-blur-40 rounded-xl p-3">
                  <div className="text-xs text-muted-foreground">blur(40px)</div>
                  <div className="mt-2 h-10 rounded-lg bg-white/80" />
                </div>
              </div>
            </Card>

            <Card className="apple-card rounded-2xl p-4 apple-appear">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Микроанимации</div>
                  <div className="text-xs text-muted-foreground">Наведение и нажатие 0.2–0.3s</div>
                </div>
                <button className="apple-button apple-pressable">Действие</button>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default AppleDemo;