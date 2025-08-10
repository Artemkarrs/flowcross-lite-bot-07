import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, ExternalLink, Users, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Feedback = () => {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Сообщение отправлено!",
      description: "Мы свяжемся с вами в ближайшее время.",
    });
    
    setMessage('');
    setEmail('');
    setIsSubmitting(false);
  };

  const supportChannels = [
    {
      name: 'Telegram',
      description: 'Быстрая поддержка 24/7',
      link: 'https://t.me/flowcross_support',
      icon: MessageCircle,
      color: 'text-blue-400',
    },
    {
      name: 'Discord',
      description: 'Сообщество игроков',
      link: 'https://discord.gg/flowcross',
      icon: Users,
      color: 'text-purple-400',
    },
    {
      name: 'Email',
      description: 'support@flowcross.space',
      link: 'mailto:support@flowcross.space',
      icon: Phone,
      color: 'text-green-400',
    },
  ];

  return (
    <div className="space-y-6 slide-in-right">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Обратная связь
        </h1>
        <p className="text-muted-foreground text-sm">
          Мы всегда готовы помочь с FlowCross
        </p>
      </div>

      {/* Quick Support Channels */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Каналы поддержки</h3>
        {supportChannels.map((channel) => {
          const Icon = channel.icon;
          return (
            <Card key={channel.name} className="glass p-4">
              <button
                onClick={() => window.open(channel.link, '_blank')}
                className="w-full flex items-center space-x-4 text-left hover:bg-muted/10 rounded-lg transition-colors duration-200"
              >
                <div className={`p-2 rounded-lg bg-secondary/20 ${channel.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{channel.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {channel.description}
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </button>
            </Card>
          );
        })}
      </div>

      {/* Feedback Form */}
      <Card className="glass p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-4">Написать сообщение</h3>
          </div>
          
          <div>
            <Input
              placeholder="Ваш email (необязательно)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="glass"
            />
          </div>
          
          <div>
            <Textarea
              placeholder="Опишите вашу проблему или предложение..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="glass resize-none"
              required
            />
          </div>
          
          <Button
            type="submit"
            disabled={!message.trim() || isSubmitting}
            className="glass-button w-full"
          >
            {isSubmitting ? (
              <>Отправляем...</>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Отправить сообщение
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* FAQ */}
      <Card className="glass p-6">
        <h3 className="text-lg font-semibold mb-4">Частые вопросы</h3>
        <div className="space-y-4">
          <div>
            <div className="font-medium text-sm mb-1">Как установить FlowCross?</div>
            <div className="text-xs text-muted-foreground">
              Скачайте установщик с официального сайта flowcross.space
            </div>
          </div>
          <div>
            <div className="font-medium text-sm mb-1">Проблемы с запуском?</div>
            <div className="text-xs text-muted-foreground">
              Убедитесь что Java 8+ установлена на вашем компьютере
            </div>
          </div>
          <div>
            <div className="font-medium text-sm mb-1">Как получить Flow+?</div>
            <div className="text-xs text-muted-foreground">
              Используйте раздел "Flow+" в этом боте для покупки подписки
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Feedback;