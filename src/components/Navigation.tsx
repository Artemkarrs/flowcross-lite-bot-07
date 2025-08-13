import { useState } from 'react';
import { Home, Play, Gamepad, Package, Map, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const alwaysVisibleTabs = [
    { id: 'home', icon: Home, label: 'Главная' },
    { id: 'clicker', icon: Play, label: 'Кликер' },
  ];
  
  const collapsibleTabs = [
    { id: 'cases', icon: Gamepad, label: 'Кейсы' },
    { id: 'inventory', icon: Package, label: 'Инвентарь' },
    { id: 'cards', icon: Map, label: 'Карты' },
  ];

  const renderTab = (tab: any) => {
    const Icon = tab.icon;
    const isActive = activeTab === tab.id;
    
    return (
      <button
        key={tab.id}
        onClick={() => onTabChange(tab.id)}
        className={cn(
          "flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-300 relative",
          isActive 
            ? "text-primary bg-primary/10 scale-105" 
            : "text-muted-foreground hover:text-primary hover:scale-105 hover:bg-muted/50"
        )}
      >
        <Icon className="w-5 h-5" />
        <span className="text-xs font-medium">{tab.label}</span>
        {isActive && (
          <div className="absolute -bottom-1 w-8 h-1 bg-primary rounded-full animate-scale-in" />
        )}
      </button>
    );
  };

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50">
      <div className={`glass-nav rounded-t-3xl p-4 border-t border-border/20 transition-all duration-300 ${isExpanded ? 'pb-6' : ''}`}>
        {/* Theme toggle in top right */}
        <div className="absolute -top-12 right-4">
          <div className="glass rounded-full p-1">
            <ThemeToggle />
          </div>
        </div>
        
        {/* Всегда видимые вкладки */}
        <div className="flex justify-center items-center space-x-8">
          {alwaysVisibleTabs.map(renderTab)}
          
          {/* Кнопка разворачивания */}
          {collapsibleTabs.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-300",
                "text-muted-foreground hover:text-primary hover:scale-105 hover:bg-muted/50",
                isExpanded && "text-primary bg-primary/10"
              )}
            >
              <Settings className={cn("w-5 h-5 transition-transform duration-300", isExpanded && "rotate-90")} />
              <span className="text-xs font-medium">Ещё</span>
            </button>
          )}
        </div>
        
        {/* Скрываемые вкладки */}
        {collapsibleTabs.length > 0 && (
          <div className={cn(
            "overflow-hidden transition-all duration-300",
            isExpanded ? "max-h-20 mt-4" : "max-h-0"
          )}>
            <div className="flex justify-around items-center">
              {collapsibleTabs.map(renderTab)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navigation;