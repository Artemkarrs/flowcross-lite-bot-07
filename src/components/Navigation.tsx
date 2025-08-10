import { Home, Play, Gamepad, Package, CreditCard, Map } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Главная' },
    { id: 'clicker', icon: Play, label: 'Кликер' },
    { id: 'cases', icon: Gamepad, label: 'Кейсы' },
    { id: 'inventory', icon: Package, label: 'Инвентарь' },
    { id: 'cards', icon: Map, label: 'Карты' },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md">
      <div className="glass-nav rounded-t-3xl p-4 border-t border-border/30">
        <div className="flex justify-around items-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-300",
                  isActive 
                    ? "text-primary bg-primary/20 scale-110" 
                    : "text-muted-foreground hover:text-primary hover:scale-105"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{tab.label}</span>
                {isActive && (
                  <div className="w-6 h-0.5 bg-primary rounded-full slide-in-right" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Navigation;