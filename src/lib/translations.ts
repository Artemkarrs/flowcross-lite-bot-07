export interface Translation {
  // Main UI
  coins: string;
  clickPower: string;
  autoClickers: string;
  level: string;
  totalClicks: string;
  playTime: string;
  achievements: string;
  upgrades: string;
  skins: string;
  abilities: string;
  statistics: string;
  settings: string;
  
  // Actions
  click: string;
  buy: string;
  use: string;
  activate: string;
  unlock: string;
  select: string;
  save: string;
  load: string;
  export: string;
  reset: string;
  
  // Upgrades
  upgradeClickPower: string;
  buyCriticalUpgrade: string;
  buySpeedUpgrade: string;
  buyAutoClicker: string;
  
  // Limits
  hourlyLimit: string;
  dailyLimit: string;
  remainingClicks: string;
  
  // Achievements
  firstClick: string;
  firstClickDesc: string;
  hundredCoins: string;
  hundredCoinsDesc: string;
  thousandCoins: string;
  thousandCoinsDesc: string;
  megaSaver: string;
  megaSaverDesc: string;
  powerClicker: string;
  powerClickerDesc: string;
  superPower: string;
  superPowerDesc: string;
  automation: string;
  automationDesc: string;
  autoMaster: string;
  autoMasterDesc: string;
  clickMarathon: string;
  clickMarathonDesc: string;
  clickLegend: string;
  clickLegendDesc: string;
  levelMaster: string;
  levelMasterDesc: string;
  timeTraveler: string;
  timeTravelerDesc: string;
  dedicatedPlayer: string;
  dedicatedPlayerDesc: string;
  
  // New Achievements
  speedDemon: string;
  speedDemonDesc: string;
  criticalMaster: string;
  criticalMasterDesc: string;
  ultraRich: string;
  ultraRichDesc: string;
  skinCollector: string;
  skinCollectorDesc: string;
  abilityMaster: string;
  abilityMasterDesc: string;
  
  // Abilities
  doubleCoins: string;
  doubleCoinsDesc: string;
  autoBurst: string;
  autoBurstDesc: string;
  criticalBoost: string;
  criticalBoostDesc: string;
  
  // Skins
  defaultSkin: string;
  fireSkin: string;
  electricSkin: string;
  cosmicSkin: string;
  royalSkin: string;
  diamondSkin: string;
  rainbowSkin: string;
  shadowSkin: string;
  iceSkin: string;
  natureSkin: string;
  
  // Tutorial
  welcomeTitle: string;
  welcomeDesc: string;
  upgradesTitle: string;
  upgradesDesc: string;
  achievementsTitle: string;
  achievementsDesc: string;
  nextStep: string;
  skipTutorial: string;
  
  // Messages
  achievementUnlocked: string;
  skinUnlocked: string;
  abilityActivated: string;
  progressSaved: string;
  gameLoaded: string;
  dataExported: string;
  gameReset: string;
  limitReached: string;
  
  // Language
  language: string;
  english: string;
  russian: string;
}

export const translations: Record<string, Translation> = {
  en: {
    // Main UI
    coins: "FlowCoins",
    clickPower: "Click Power",
    autoClickers: "Auto Clickers",
    level: "Level",
    totalClicks: "Total Clicks",
    playTime: "Play Time",
    achievements: "Achievements",
    upgrades: "Upgrades",
    skins: "Skins",
    abilities: "Abilities", 
    statistics: "Statistics",
    settings: "Settings",
    
    // Actions
    click: "CLICK!",
    buy: "Buy",
    use: "Use",
    activate: "Activate",
    unlock: "Unlock",
    select: "Select",
    save: "Save",
    load: "Load",
    export: "Export",
    reset: "Reset",
    
    // Upgrades
    upgradeClickPower: "Upgrade Click Power",
    buyCriticalUpgrade: "Buy Critical Upgrade",
    buySpeedUpgrade: "Buy Speed Upgrade",
    buyAutoClicker: "Buy Auto Clicker",
    
    // Limits
    hourlyLimit: "Hourly Limit",
    dailyLimit: "Daily Limit", 
    remainingClicks: "Remaining Clicks",
    
    // Achievements
    firstClick: "First Click",
    firstClickDesc: "Make your first click",
    hundredCoins: "First Hundred",
    hundredCoinsDesc: "Accumulate 100 FC",
    thousandCoins: "Thousand Club",
    thousandCoinsDesc: "Accumulate 1,000 FC",
    megaSaver: "Mega Saver",
    megaSaverDesc: "Accumulate 10,000 FC",
    powerClicker: "Power Clicker",
    powerClickerDesc: "Reach click power 5",
    superPower: "Super Power",
    superPowerDesc: "Reach click power 25",
    automation: "Automation",
    automationDesc: "Buy 3 auto clickers",
    autoMaster: "Auto Master",
    autoMasterDesc: "Buy 10 auto clickers",
    clickMarathon: "Click Marathon",
    clickMarathonDesc: "Make 1,000 clicks",
    clickLegend: "Click Legend", 
    clickLegendDesc: "Make 10,000 clicks",
    levelMaster: "Level Master",
    levelMasterDesc: "Reach level 50",
    timeTraveler: "Time Traveler",
    timeTravelerDesc: "Play for 1 hour",
    dedicatedPlayer: "Dedicated Player",
    dedicatedPlayerDesc: "Play for 5 hours",
    
    // New Achievements
    speedDemon: "Speed Demon",
    speedDemonDesc: "Buy 5 speed upgrades",
    criticalMaster: "Critical Master", 
    criticalMasterDesc: "Buy 10 critical upgrades",
    ultraRich: "Ultra Rich",
    ultraRichDesc: "Accumulate 100,000 FC",
    skinCollector: "Skin Collector",
    skinCollectorDesc: "Unlock 5 different skins",
    abilityMaster: "Ability Master",
    abilityMasterDesc: "Use abilities 50 times",
    
    // Abilities
    doubleCoins: "Double Coins",
    doubleCoinsDesc: "Doubles earnings for 30 seconds",
    autoBurst: "Auto Burst",
    autoBurstDesc: "Automatic clicks for 15 seconds",
    criticalBoost: "Critical Boost",
    criticalBoostDesc: "Increases crit chance by 50% for 45 seconds",
    
    // Skins
    defaultSkin: "Default",
    fireSkin: "Fire",
    electricSkin: "Electric",
    cosmicSkin: "Cosmic",
    royalSkin: "Royal",
    diamondSkin: "Diamond",
    rainbowSkin: "Rainbow",
    shadowSkin: "Shadow",
    iceSkin: "Ice",
    natureSkin: "Nature",
    
    // Tutorial
    welcomeTitle: "Welcome to FlowCoin Clicker!",
    welcomeDesc: "Click the big button to earn FlowCoins. The more you click, the more you earn!",
    upgradesTitle: "Upgrades & Auto Clickers",
    upgradesDesc: "Use your coins to buy upgrades that increase your earning power and automate clicking.",
    achievementsTitle: "Achievements & Rewards",
    achievementsDesc: "Complete achievements to earn bonus coins and unlock new content!",
    nextStep: "Next",
    skipTutorial: "Skip Tutorial",
    
    // Messages
    achievementUnlocked: "Achievement Unlocked!",
    skinUnlocked: "Skin Unlocked!",
    abilityActivated: "Ability Activated!",
    progressSaved: "Progress Saved",
    gameLoaded: "Game Loaded",
    dataExported: "Data Exported",
    gameReset: "Game Reset",
    limitReached: "Click limit reached",
    
    // Language
    language: "Language",
    english: "English",
    russian: "Русский",
  },
  ru: {
    // Main UI
    coins: "FlowCoins",
    clickPower: "Сила клика",
    autoClickers: "Автокликеры",
    level: "Уровень",
    totalClicks: "Всего кликов",
    playTime: "Время игры",
    achievements: "Достижения",
    upgrades: "Улучшения",
    skins: "Скины",
    abilities: "Способности",
    statistics: "Статистика",
    settings: "Настройки",
    
    // Actions
    click: "КЛИК!",
    buy: "Купить",
    use: "Использовать",
    activate: "Активировать",
    unlock: "Разблокировать",
    select: "Выбрать",
    save: "Сохранить",
    load: "Загрузить",
    export: "Экспорт",
    reset: "Сброс",
    
    // Upgrades
    upgradeClickPower: "Улучшить силу клика",
    buyCriticalUpgrade: "Купить улучшение крита",
    buySpeedUpgrade: "Купить улучшение скорости",
    buyAutoClicker: "Купить автокликер",
    
    // Limits
    hourlyLimit: "Часовой лимит",
    dailyLimit: "Дневной лимит",
    remainingClicks: "Оставшиеся клики",
    
    // Achievements
    firstClick: "Первый клик",
    firstClickDesc: "Сделайте свой первый клик",
    hundredCoins: "Первая сотня",
    hundredCoinsDesc: "Накопите 100 FC",
    thousandCoins: "Тысячник",
    thousandCoinsDesc: "Накопите 1,000 FC",
    megaSaver: "Мега-накопитель",
    megaSaverDesc: "Накопите 10,000 FC",
    powerClicker: "Сильный клик",
    powerClickerDesc: "Достигните силы клика 5",
    superPower: "Супер сила",
    superPowerDesc: "Достигните силы клика 25",
    automation: "Автоматизация",
    automationDesc: "Купите 3 автокликера",
    autoMaster: "Мастер автоматизации",
    autoMasterDesc: "Купите 10 автокликеров",
    clickMarathon: "Марафонец",
    clickMarathonDesc: "Сделайте 1,000 кликов",
    clickLegend: "Легенда кликов",
    clickLegendDesc: "Сделайте 10,000 кликов",
    levelMaster: "Мастер уровней",
    levelMasterDesc: "Достигните 50 уровня",
    timeTraveler: "Путешественник во времени",
    timeTravelerDesc: "Играйте 1 час",
    dedicatedPlayer: "Преданный игрок",
    dedicatedPlayerDesc: "Играйте 5 часов",
    
    // New Achievements
    speedDemon: "Демон скорости",
    speedDemonDesc: "Купите 5 улучшений скорости",
    criticalMaster: "Мастер критов",
    criticalMasterDesc: "Купите 10 улучшений крита",
    ultraRich: "Ультра богач",
    ultraRichDesc: "Накопите 100,000 FC",
    skinCollector: "Коллекционер скинов",
    skinCollectorDesc: "Разблокируйте 5 разных скинов",
    abilityMaster: "Мастер способностей",
    abilityMasterDesc: "Используйте способности 50 раз",
    
    // Abilities
    doubleCoins: "Двойные монеты",
    doubleCoinsDesc: "Удваивает заработок на 30 секунд",
    autoBurst: "Авто-взрыв",
    autoBurstDesc: "Автоматические клики в течение 15 секунд",
    criticalBoost: "Критический бустер",
    criticalBoostDesc: "Увеличивает шанс крита на 50% на 45 секунд",
    
    // Skins
    defaultSkin: "Стандартный",
    fireSkin: "Огненный",
    electricSkin: "Электрический",
    cosmicSkin: "Космический",
    royalSkin: "Королевский",
    diamondSkin: "Алмазный",
    rainbowSkin: "Радужный",
    shadowSkin: "Теневой",
    iceSkin: "Ледяной",
    natureSkin: "Природный",
    
    // Tutorial
    welcomeTitle: "Добро пожаловать в FlowCoin Clicker!",
    welcomeDesc: "Кликайте по большой кнопке, чтобы зарабатывать FlowCoins. Чем больше кликов, тем больше заработок!",
    upgradesTitle: "Улучшения и автокликеры",
    upgradesDesc: "Используйте монеты для покупки улучшений, которые увеличат вашу силу заработка и автоматизируют клики.",
    achievementsTitle: "Достижения и награды",
    achievementsDesc: "Выполняйте достижения, чтобы получать бонусные монеты и разблокировать новый контент!",
    nextStep: "Далее",
    skipTutorial: "Пропустить обучение",
    
    // Messages
    achievementUnlocked: "Достижение разблокировано!",
    skinUnlocked: "Скин разблокирован!",
    abilityActivated: "Способность активирована!",
    progressSaved: "Прогресс сохранён",
    gameLoaded: "Игра загружена",
    dataExported: "Данные экспортированы",
    gameReset: "Игра сброшена",
    limitReached: "Достигнут лимит кликов",
    
    // Language
    language: "Язык",
    english: "English",
    russian: "Русский",
  }
};

export const formatTime = (seconds: number, lang: string): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (lang === 'ru') {
    if (hours > 0) return `${hours}ч ${minutes}м ${secs}с`;
    if (minutes > 0) return `${minutes}м ${secs}с`;
    return `${secs}с`;
  } else {
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  }
};