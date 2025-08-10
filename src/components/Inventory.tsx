import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Gem, Coins, Shirt, Gift, Plus } from 'lucide-react';
import { currentUser, getInventory, addInventoryItem, removeInventoryItem, InventoryItem, addBalance, addGems } from '@/lib/localdb';
import { toast } from '@/hooks/use-toast';
import CaseOpeningAnimation from './CaseOpeningAnimation';

const Inventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isOpening, setIsOpening] = useState(false);
  const [openingCase, setOpeningCase] = useState<InventoryItem | null>(null);

  useEffect(() => {
    setInventory(getInventory());
  }, []);

  const refreshInventory = () => {
    setInventory(getInventory());
  };

  const handleOpenCase = (caseItem: InventoryItem) => {
    // Сначала удаляем кейс из инвентаря
    removeInventoryItem(caseItem.id);
    refreshInventory();
    
    setOpeningCase(caseItem);
    setIsOpening(true);
  };

  const handleCaseOpened = (reward: any) => {
    if (!openingCase) return;

    // Кейс уже удален, только добавляем награду
    if (reward.type === 'coins') {
      addBalance(reward.value);
    } else if (reward.type === 'gems') {
      addGems(reward.value);
    } else if (reward.type === 'skin') {
      addInventoryItem({
        type: 'skin',
        name: reward.name,
        rarity: reward.rarity
      });
    }

    refreshInventory();
    setIsOpening(false);
    setOpeningCase(null);

    toast({
      title: "🎁 Кейс открыт!",
      description: `Получен: ${reward.name}`,
    });
  };

  const addCoins = (amount: number) => {
    addInventoryItem({
      type: 'coins',
      name: 'Монеты',
      rarity: 'common',
      amount
    });
    
    refreshInventory();
    toast({
      title: "💰 Монеты добавлены",
      description: `+${amount} монет в инвентарь`,
    });
  };

  const useCoins = (coinItem: InventoryItem) => {
    if (!coinItem.amount) return;
    
    addBalance(coinItem.amount);
    removeInventoryItem(coinItem.id);
    refreshInventory();
    
    toast({
      title: "💰 Монеты использованы",
      description: `+${coinItem.amount} монет на баланс`,
    });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const cases = inventory.filter(item => item.type === 'case');
  const skins = inventory.filter(item => item.type === 'skin');
  const coins = inventory.filter(item => item.type === 'coins');
  const abilities = inventory.filter(item => item.type === 'ability');
  const upgrades = inventory.filter(item => item.type === 'upgrade');

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold gradient-text">
            Инвентарь
          </h1>
          <p className="text-muted-foreground text-sm">
            Управляйте своими предметами и открывайте кейсы
          </p>
        </div>

        <Tabs defaultValue="cases" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="cases" className="flex items-center gap-1 text-xs">
              <Package className="w-4 h-4" />
              ({cases.length})
            </TabsTrigger>
            <TabsTrigger value="skins" className="flex items-center gap-1 text-xs">
              <Shirt className="w-4 h-4" />
              ({skins.length})
            </TabsTrigger>
            <TabsTrigger value="coins" className="flex items-center gap-1 text-xs">
              <Coins className="w-4 h-4" />
              ({coins.length})
            </TabsTrigger>
            <TabsTrigger value="abilities" className="flex items-center gap-1 text-xs">
              ⚡ ({abilities.length})
            </TabsTrigger>
            <TabsTrigger value="upgrades" className="flex items-center gap-1 text-xs">
              ⬆️ ({upgrades.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cases" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Кейсы</h3>
            </div>
            
            {cases.length === 0 ? (
              <Card className="glass p-8 text-center">
                <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">У вас нет кейсов</p>
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {cases.map((item) => (
                  <Card key={item.id} className="glass p-4 card-hover">
                    <div className="text-center space-y-3">
                      <div className="relative">
                        <Package className="w-12 h-12 mx-auto text-primary" />
                        <Badge className={`absolute -top-1 -right-1 ${getRarityColor(item.rarity)} text-white text-xs`}>
                          {item.rarity}
                        </Badge>
                      </div>
                      <h4 className="font-medium">{item.name}</h4>
                      <Button
                        onClick={() => handleOpenCase(item)}
                        className="w-full glass-button"
                        size="sm"
                      >
                        <Gift className="w-4 h-4 mr-2" />
                        Открыть
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="skins" className="space-y-4">
            <h3 className="text-lg font-semibold">Скины</h3>
            
            {skins.length === 0 ? (
              <Card className="glass p-8 text-center">
                <Shirt className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">У вас нет скинов</p>
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {skins.map((item) => (
                  <Card key={item.id} className="glass p-4 card-hover">
                    <div className="text-center space-y-3">
                      <div className="relative">
                        <Shirt className="w-12 h-12 mx-auto text-primary" />
                        <Badge className={`absolute -top-1 -right-1 ${getRarityColor(item.rarity)} text-white text-xs`}>
                          {item.rarity}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.obtainedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="coins" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Монеты</h3>
            </div>
            
            {coins.length === 0 ? (
              <Card className="glass p-8 text-center">
                <Coins className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">У вас нет монет</p>
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {coins.map((item) => (
                  <Card key={item.id} className="glass p-4 card-hover">
                    <div className="text-center space-y-3">
                      <Coins className="w-12 h-12 mx-auto text-yellow-500" />
                      <h4 className="font-medium">{item.amount} монет</h4>
                      <Button
                        onClick={() => useCoins(item)}
                        className="w-full"
                        variant="outline"
                        size="sm"
                      >
                        Использовать
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="abilities" className="space-y-4">
            <h3 className="text-lg font-semibold">Абилки</h3>
            
            {abilities.length === 0 ? (
              <Card className="glass p-8 text-center">
                <span className="text-4xl mb-4 block">⚡</span>
                <p className="text-muted-foreground">У вас нет абилок</p>
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {abilities.map((item) => (
                  <Card key={item.id} className="glass p-4 card-hover">
                    <div className="text-center space-y-3">
                      <div className="relative">
                        <span className="text-3xl">⚡</span>
                        <Badge className={`absolute -top-1 -right-1 ${getRarityColor(item.rarity)} text-white text-xs`}>
                          {item.rarity}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upgrades" className="space-y-4">
            <h3 className="text-lg font-semibold">Улучшения</h3>
            
            {upgrades.length === 0 ? (
              <Card className="glass p-8 text-center">
                <span className="text-4xl mb-4 block">⬆️</span>
                <p className="text-muted-foreground">У вас нет улучшений</p>
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {upgrades.map((item) => (
                  <Card key={item.id} className="glass p-4 card-hover">
                    <div className="text-center space-y-3">
                      <div className="relative">
                        <span className="text-3xl">⬆️</span>
                        <Badge className={`absolute -top-1 -right-1 ${getRarityColor(item.rarity)} text-white text-xs`}>
                          {item.rarity}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {isOpening && openingCase && (
        <CaseOpeningAnimation
          caseItem={openingCase}
          onComplete={handleCaseOpened}
          onClose={() => setIsOpening(false)}
        />
      )}
    </>
  );
};

export default Inventory;