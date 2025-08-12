import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Save, Download, Upload, RotateCcw, Database, Clock, Copy, Check } from 'lucide-react';
import { 
  exportGameData, 
  importGameData, 
  resetAllGameData, 
  syncAllGameData, 
  loadAllGameData,
  enableAutoSave,
  disableAutoSave,
  getFullSaveData 
} from '@/lib/localdb';

const GameDataManager = () => {
  const { toast } = useToast();
  const [importData, setImportData] = useState('');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportedData, setExportedData] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Загрузить данные при запуске компонента
    loadAllGameData();
    
    // Включить автосохранение
    if (autoSaveEnabled) {
      enableAutoSave();
    }
    
    // Обновить время последней синхронизации
    const saveData = getFullSaveData();
    if (saveData.lastSaved) {
      setLastSyncTime(new Date(saveData.lastSaved));
    }

    return () => {
      if (!autoSaveEnabled) {
        disableAutoSave();
      }
    };
  }, [autoSaveEnabled]);

  const handleExport = () => {
    try {
      const data = exportGameData();
      setExportedData(data);
      setShowExportDialog(true);
      
      toast({
        title: "Экспорт готов",
        description: "JSON код доступен для копирования"
      });
    } catch (error) {
      toast({
        title: "Ошибка экспорта",
        description: "Не удалось экспортировать данные",
        variant: "destructive"
      });
    }
  };

  const handleCopyExport = async () => {
    try {
      await navigator.clipboard.writeText(exportedData);
      setCopied(true);
      toast({
        title: "Скопировано!",
        description: "JSON код скопирован в буфер обмена"
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Ошибка копирования",
        description: "Не удалось скопировать в буфер обмена",
        variant: "destructive"
      });
    }
  };

  const handleDownloadExport = () => {
    const blob = new Blob([exportedData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowgame_save_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Файл загружен",
      description: "Сохранение загружено на устройство"
    });
  };

  const handleImport = () => {
    if (!importData.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите данные для импорта",
        variant: "destructive"
      });
      return;
    }

    const success = importGameData(importData);
    if (success) {
      toast({
        title: "Импорт завершен",
        description: "Данные успешно загружены"
      });
      setImportData('');
      setLastSyncTime(new Date());
      // Перезагрузить страницу для применения изменений
      window.location.reload();
    } else {
      toast({
        title: "Ошибка импорта",
        description: "Некорректный формат данных",
        variant: "destructive"
      });
    }
  };

  const handleReset = () => {
    if (window.confirm('Вы уверены? Все данные будут удалены безвозвратно! ВКЛЮЧАЯ ВСЕ ДЕНЬГИ, ГЕМЫ И УЛУЧШЕНИЯ!')) {
      resetAllGameData();
      toast({
        title: "Полный сброс выполнен",
        description: "Все игровые данные, деньги, гемы и улучшения удалены"
      });
      setLastSyncTime(new Date());
      // Перезагрузить страницу
      window.location.reload();
    }
  };

  const handleManualSync = () => {
    try {
      syncAllGameData();
      setLastSyncTime(new Date());
      toast({
        title: "Синхронизация завершена",
        description: "Все данные сохранены"
      });
    } catch (error) {
      toast({
        title: "Ошибка синхронизации",
        description: "Не удалось сохранить данные",
        variant: "destructive"
      });
    }
  };

  const toggleAutoSave = () => {
    const newState = !autoSaveEnabled;
    setAutoSaveEnabled(newState);
    
    if (newState) {
      enableAutoSave();
      toast({
        title: "Автосохранение включено",
        description: "Данные будут сохраняться каждые 30 секунд"
      });
    } else {
      disableAutoSave();
      toast({
        title: "Автосохранение отключено",
        description: "Сохранения только вручную"
      });
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportData(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Управление Данными
        </h1>
        <p className="text-muted-foreground text-sm">
          Сохранение, загрузка и синхронизация игровых данных
        </p>
      </div>

      {/* Статус сохранения */}
      <Card className="glass p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Database className="w-5 h-5 mr-2 text-primary" />
            Статус Сохранения
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              onClick={toggleAutoSave}
              variant={autoSaveEnabled ? "default" : "outline"}
              size="sm"
            >
              {autoSaveEnabled ? "Авто ВКЛ" : "Авто ВЫКЛ"}
            </Button>
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Последнее сохранение:</span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {lastSyncTime ? lastSyncTime.toLocaleString() : 'Никогда'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Автосохранение:</span>
            <span className={autoSaveEnabled ? 'text-green-400' : 'text-red-400'}>
              {autoSaveEnabled ? 'Включено (каждые 30 сек)' : 'Отключено'}
            </span>
          </div>
        </div>
      </Card>

      {/* Быстрые действия */}
      <Card className="glass p-4">
        <h3 className="text-lg font-semibold mb-4">Быстрые Действия</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={handleManualSync} className="glass-button">
            <Save className="w-4 h-4 mr-2" />
            Сохранить
          </Button>
          <Button onClick={handleExport} variant="outline" className="glass">
            <Download className="w-4 h-4 mr-2" />
            Экспорт
          </Button>
        </div>
      </Card>

      {/* Экспорт/Импорт */}
      <Card className="glass p-4">
        <h3 className="text-lg font-semibold mb-4">Импорт Данных</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Загрузить из файла:
            </label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer cursor-pointer"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Или вставить JSON данные:
            </label>
            <Textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Вставьте JSON данные сохранения здесь..."
              className="glass min-h-[100px] text-xs font-mono"
            />
          </div>
          
          <Button 
            onClick={handleImport} 
            className="glass-button w-full"
            disabled={!importData.trim()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Импортировать Данные
          </Button>
        </div>
      </Card>

      {/* Опасная зона */}
      <Card className="glass p-4 border-destructive/20">
        <h3 className="text-lg font-semibold mb-4 text-destructive">Опасная Зона</h3>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Внимание! Следующие действия необратимы.
          </p>
          <Button 
            onClick={handleReset} 
            variant="destructive" 
            className="w-full"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Сбросить Все Данные
          </Button>
        </div>
      </Card>

      {/* Информация о данных */}
      <Card className="glass p-4">
        <h3 className="text-lg font-semibold mb-4">Что Сохраняется</h3>
        <div className="text-sm space-y-2 text-muted-foreground">
          <div>• <strong>Кликер:</strong> уровень, монеты, прокачки, скины, способности, достижения</div>
          <div>• <strong>Кейсы:</strong> история открытий, дневные лимиты</div>
          <div>• <strong>Змейка:</strong> рекорды, статистика, достижения</div>
          <div>• <strong>Ресурсы:</strong> баланс, гемы, инвентарь</div>
          <div>• <strong>Прогресс:</strong> карты, время игры, метаданные</div>
        </div>
      </Card>

      {/* Диалог экспорта */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="glass max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Download className="w-5 h-5 mr-2 text-primary" />
              Экспорт Данных
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Скопируйте JSON код или загрузите как файл:
            </p>
            
            <Textarea
              value={exportedData}
              readOnly
              className="glass min-h-[200px] text-xs font-mono"
              placeholder="JSON данные появятся здесь..."
            />
            
            <div className="flex gap-3">
              <Button 
                onClick={handleCopyExport} 
                className="glass-button flex-1"
                disabled={!exportedData}
              >
                {copied ? (
                  <Check className="w-4 h-4 mr-2 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                {copied ? 'Скопировано!' : 'Копировать'}
              </Button>
              
              <Button 
                onClick={handleDownloadExport} 
                variant="outline" 
                className="glass flex-1"
                disabled={!exportedData}
              >
                <Download className="w-4 h-4 mr-2" />
                Скачать файл
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GameDataManager;