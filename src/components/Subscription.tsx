import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  Zap, 
  Shield, 
  Cloud, 
  Gamepad, 
  Sparkles,
  Check,
  ExternalLink,
  CreditCard
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Subscription = () => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [priceAnimation, setPriceAnimation] = useState('');
  const { toast } = useToast();

  const features = [
    {
      icon: Zap,
      title: 'Премиум оптимизация',
      description: 'Эксклюзивные алгоритмы для максимальной производительности',
    },
    {
      icon: Shield,
      title: 'Приоритетная поддержка',
      description: 'Быстрое решение проблем в первую очередь',
    },
    {
      icon: Cloud,
      title: 'Облачные профили',
      description: 'Синхронизация настроек между устройствами',
    },
    {
      icon: Gamepad,
      title: 'Эксклюзивные модпаки',
      description: 'Доступ к премиум сборкам и ранним версиям',
    },
    {
      icon: Sparkles,
      title: 'Кастомные темы',
      description: 'Уникальные темы оформления лаунчера',
    },
  ];

  const plans = {
    monthly: {
      price: '199₽',
      period: 'месяц',
      discount: null,
    },
    yearly: {
      price: '1990₽',
      period: 'год',
      discount: '17%',
    },
  };

  const handlePurchase = async () => {
    setIsLoading(true);
    
    try {
      // Здесь будет интеграция с платежной системой
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Перенаправление на оплату",
        description: "Открываем платежную форму...",
      });
      
      // Redirect to payment
      window.open('https://flowcross.space/subscribe', '_blank');
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Попробуйте позже или обратитесь в поддержку",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 slide-in-right">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full glass mb-4 animate-pulse-glow">
          <Star className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Flow+ Подписка
        </h1>
        <p className="text-muted-foreground text-sm">
          Раскройте полный потенциал FlowCross
        </p>
      </div>

      {/* Plan Selector */}
      <Card className="glass p-4">
        <div className="flex rounded-lg bg-secondary/20 p-1">
          <button
            onClick={() => {
              setSelectedPlan('monthly');
              setPriceAnimation('animate-scale-in');
              setTimeout(() => setPriceAnimation(''), 300);
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              selectedPlan === 'monthly'
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Месячная
          </button>
          <button
            onClick={() => {
              setSelectedPlan('yearly');
              setPriceAnimation('animate-scale-in');
              setTimeout(() => setPriceAnimation(''), 300);
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 relative ${
              selectedPlan === 'yearly'
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Годовая
            {plans.yearly.discount && (
              <Badge className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs">
                -{plans.yearly.discount}
              </Badge>
            )}
          </button>
        </div>
      </Card>

      {/* Pricing */}
      <Card className="glass p-6 text-center">
        <div className="space-y-4">
          <div className={`text-4xl font-bold text-primary transition-all duration-300 ${priceAnimation}`}>
            {plans[selectedPlan].price}
          </div>
          <div className="text-muted-foreground">
            за {plans[selectedPlan].period}
          </div>
          {selectedPlan === 'yearly' && (
            <div className="text-sm text-accent font-medium">
              Экономия 2390₽ в год!
            </div>
          )}
          <Button
            onClick={handlePurchase}
            disabled={isLoading}
            className="glass-button w-full text-lg py-6"
          >
            {isLoading ? (
              <>Обработка...</>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Оформить подписку
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Features */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Что входит в Flow+</h3>
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className="glass p-4">
              <div className="flex items-start space-x-4">
                <div className="p-2 rounded-lg bg-primary/20 text-primary">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium mb-1">{feature.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {feature.description}
                  </div>
                </div>
                <Check className="w-5 h-5 text-primary flex-shrink-0" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Benefits */}
      <Card className="glass p-6">
        <h3 className="text-lg font-semibold mb-4">Статистика Flow+</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-primary">+85%</div>
            <div className="text-xs text-muted-foreground">Быстрее запуск</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-primary">-40%</div>
            <div className="text-xs text-muted-foreground">Память</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-primary">24/7</div>
            <div className="text-xs text-muted-foreground">Поддержка</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-primary">100+</div>
            <div className="text-xs text-muted-foreground">Модпаков</div>
          </div>
        </div>
      </Card>

      {/* Footer */}
      <Card className="glass p-4">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Отмена в любое время • Безопасная оплата
          </p>
          <button
            onClick={() => window.open('https://flowcross.space/terms', '_blank')}
            className="text-xs text-primary hover:underline inline-flex items-center"
          >
            Условия использования
            <ExternalLink className="w-3 h-3 ml-1" />
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Subscription;