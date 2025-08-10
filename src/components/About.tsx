import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Bot, 
  Headphones, 
  Zap, 
  Users, 
  ExternalLink,
  MessageCircle,
  Github,
  Heart
} from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: Bot,
      title: 'Умный помощник',
      description: 'Автоматические ответы на часто задаваемые вопросы о FlowCross',
    },
    {
      icon: Headphones,
      title: 'Техническая поддержка',
      description: 'Быстрое решение проблем с лаунчером и играми',
    },
    {
      icon: Zap,
      title: 'Мини-игры',
      description: 'Развлечения пока ждете ответа от поддержки',
    },
    {
      icon: Users,
      title: 'Сообщество',
      description: 'Связь с другими игроками FlowCross',
    },
  ];

  const team = [
    {
      name: 'FlowCross LLC',
      role: 'Разработчики лаунчера',
      description: 'Команда энтузиастов создающая лучший Minecraft лаунчер',
    },
    {
      name: 'Support Team',
      role: 'Техническая поддержка',
      description: 'Специалисты готовые помочь 24/7',
    },
  ];

  return (
    <div className="space-y-6 slide-in-right">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full glass mb-4 animate-pulse-glow">
          <Bot className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          О FlowCross Bot
        </h1>
        <p className="text-muted-foreground text-sm">
          Ваш надежный помощник в мире FlowCross
        </p>
      </div>

      {/* Mission */}
      <Card className="glass p-6">
        <h3 className="text-lg font-semibold mb-3">Наша миссия</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Обеспечить максимально комфортное взаимодействие пользователей с 
          FlowCross Launcher через быструю поддержку, полезные инструменты 
          и развлекательный контент.
        </p>
      </Card>

      {/* Features */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Возможности бота</h3>
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className="glass p-4">
              <div className="flex items-start space-x-4">
                <div className="p-2 rounded-lg bg-primary/20 text-primary">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium mb-1">{feature.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {feature.description}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Team */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Команда</h3>
        {team.map((member, index) => (
          <Card key={index} className="glass p-4">
            <div className="space-y-2">
              <div className="font-medium">{member.name}</div>
              <div className="text-sm text-primary">{member.role}</div>
              <div className="text-sm text-muted-foreground">
                {member.description}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Links */}
      <Card className="glass p-6">
        <h3 className="text-lg font-semibold mb-4">Полезные ссылки</h3>
        <div className="space-y-3">
          <Button
            variant="outline"
            className="glass w-full justify-start"
            onClick={() => window.open('https://flowcross.space', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Официальный сайт
          </Button>
          <Button
            variant="outline"
            className="glass w-full justify-start"
            onClick={() => window.open('https://github.com/flowcross', '_blank')}
          >
            <Github className="w-4 h-4 mr-2" />
            GitHub
          </Button>
          <Button
            variant="outline"
            className="glass w-full justify-start"
            onClick={() => window.open('https://t.me/flowcross', '_blank')}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Telegram канал
          </Button>
        </div>
      </Card>

      {/* Version */}
      <Card className="glass p-4 text-center">
        <div className="text-sm text-muted-foreground">
          FlowCross Bot v1.0.0
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Создано с ❤️ для сообщества FlowCross
        </div>
      </Card>
    </div>
  );
};

export default About;