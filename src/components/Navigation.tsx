import { useState } from 'react';
import { Home, Play, Gamepad, Package, Database, Map, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    { id: 'data', icon: Database, label: 'Данные' },
  ];

  const renderTab = (tab: any) => {
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
  };

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50">
      <div className={`glass-nav rounded-t-3xl p-4 border-t border-border/30 transition-all duration-300 ${isExpanded ? 'pb-6' : ''}`}>
        {/* Всегда видимые вкладки */}
        <div className="flex justify-center items-center space-x-8">
          {alwaysVisibleTabs.map(renderTab)}
          
          {/* Кнопка разворачивания */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-300",
              "text-muted-foreground hover:text-primary hover:scale-105"
            )}
          >
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronUp className="w-5 h-5" />
            )}
            <span className="text-xs font-medium">Ещё</span>
          </button>
        </div>
        
        {/* Скрываемые вкладки */}
        <div className={cn(
          "overflow-hidden transition-all duration-300",
          isExpanded ? "max-h-20 mt-4" : "max-h-0"
        )}>
          <div className="flex justify-around items-center">
            {collapsibleTabs.map(renderTab)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;