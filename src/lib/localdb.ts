// Lightweight client-side "DB" using localStorage + cookies for session
// NOTE: This is a front-end only mock. Data lives in this browser only.

export type User = {
  id: string;
  email: string;
  username: string;
  password: string; // stored as plain for simplicity in this demo
  pin?: string;     // optional payment PIN
  createdAt: number;
};

export type Transaction = {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  createdAt: number;
  cashback: number; // 0 or positive value returned to sender
};

// Inventory system (без привязки к пользователям)
export type InventoryItem = {
  id: string;
  type: 'case' | 'skin' | 'coins' | 'ability' | 'upgrade' | 'card';
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  amount?: number; // for stackable items like coins
  description?: string;
  obtainedAt: number;
};

export type CaseItem = {
  id: string;
  name: string;
  type: 'skin' | 'coins' | 'gems' | 'ability' | 'upgrade';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  value: number; // coins/gems amount or item value
  chance: number; // drop chance in %
  description?: string;
};

export type CardReward = {
  id: string;
  name: string;
  type: 'skin' | 'coins' | 'gems' | 'ability' | 'upgrade';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  value: number;
  description: string;
  icon: string;
};

// Card rewards pool
export const CARD_REWARDS: CardReward[] = [
  // Coins
  { id: 'coins_50', name: '50 Монет', type: 'coins', rarity: 'common', value: 50, description: 'Обычные монеты', icon: '💰' },
  { id: 'coins_150', name: '150 Монет', type: 'coins', rarity: 'common', value: 150, description: 'Стопка монет', icon: '💰' },
  { id: 'coins_500', name: '500 Монет', type: 'coins', rarity: 'rare', value: 500, description: 'Кошелек монет', icon: '💰' },
  
  // Gems
  { id: 'gems_5', name: '5 Гемов', type: 'gems', rarity: 'rare', value: 5, description: 'Маленькие кристаллы', icon: '💎' },
  { id: 'gems_15', name: '15 Гемов', type: 'gems', rarity: 'epic', value: 15, description: 'Блестящие гемы', icon: '💎' },
  { id: 'gems_50', name: '50 Гемов', type: 'gems', rarity: 'legendary', value: 50, description: 'Драгоценные камни', icon: '💎' },
  
  // Skins
  { id: 'skin_basic', name: 'Базовый Скин', type: 'skin', rarity: 'common', value: 100, description: 'Простой скин персонажа', icon: '👕' },
  { id: 'skin_cool', name: 'Крутой Скин', type: 'skin', rarity: 'rare', value: 300, description: 'Стильный образ', icon: '👕' },
  { id: 'skin_epic', name: 'Эпический Скин', type: 'skin', rarity: 'epic', value: 800, description: 'Редкий эпический скин', icon: '👕' },
  { id: 'skin_legendary', name: 'Легендарный Скин', type: 'skin', rarity: 'legendary', value: 2000, description: 'Уникальный легендарный скин', icon: '👕' },
  
  // Abilities
  { id: 'ability_speed', name: 'Ускорение', type: 'ability', rarity: 'rare', value: 1, description: '+10% к скорости кликов', icon: '⚡' },
  { id: 'ability_luck', name: 'Удача', type: 'ability', rarity: 'epic', value: 1, description: '+15% к крит. урону', icon: '🍀' },
  { id: 'ability_multi', name: 'Мультиклик', type: 'ability', rarity: 'legendary', value: 1, description: 'x2 клики за раз', icon: '👆' },
  
  // Upgrades
  { id: 'upgrade_click', name: 'Улучшение Клика', type: 'upgrade', rarity: 'common', value: 1, description: '+1 урон за клик', icon: '⬆️' },
  { id: 'upgrade_auto', name: 'Автокликер', type: 'upgrade', rarity: 'epic', value: 1, description: 'Автоматические клики', icon: '🤖' },
  { id: 'upgrade_bonus', name: 'Бонус Множитель', type: 'upgrade', rarity: 'legendary', value: 1, description: 'x1.5 ко всем доходам', icon: '📈' }
];

// Sample case contents
export const CASE_CONTENTS: Record<string, CaseItem[]> = {
  'starter_case': [
    { id: 'coins_100', name: '100 Монет', type: 'coins', rarity: 'common', value: 100, chance: 40 },
    { id: 'coins_250', name: '250 Монет', type: 'coins', rarity: 'common', value: 250, chance: 30 },
    { id: 'gems_10', name: '10 Гемов', type: 'gems', rarity: 'rare', value: 10, chance: 20 },
    { id: 'skin_common', name: 'Обычный Скин', type: 'skin', rarity: 'rare', value: 500, chance: 8 },
    { id: 'gems_50', name: '50 Гемов', type: 'gems', rarity: 'epic', value: 50, chance: 2 }
  ]
};

const KEYS = {
  users: 'db.users',
  balances: 'db.balances',
  walletIndex: 'db.walletIndex', // walletId -> userId
  txs: 'db.transactions',
};

const GUEST_USER_ID = 'guest';

// Cookie helpers
function getCookie(name: string): string | undefined {
  const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : undefined;
}
export function setCookie(name: string, value: string, maxAgeSeconds: number) {
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; max-age=${maxAgeSeconds}; path=/`;
}

// Core stores
function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function nanoid(): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const part = (n: number) => Array.from({ length: n }, () => alphabet[Math.floor(Math.random()*alphabet.length)]).join('');
  return `${part(12)}_${part(10)}`;
}

// Users (legacy)
export function listUsers(): User[] { return readJSON<User[]>(KEYS.users, []); }
function saveUsers(users: User[]) { writeJSON(KEYS.users, users); }

export function registerUser(email: string, username: string, password: string) {
  const users = listUsers();
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) throw new Error('Почта уже используется');
  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) throw new Error('Юзернейм уже используется');
  const user: User = { id: nanoid(), email, username, password, createdAt: Date.now() };
  users.push(user);
  saveUsers(users);
  const balances = readJSON<Record<string, number>>(KEYS.balances, {});
  balances[user.id] = balances[user.id] ?? 0;
  writeJSON(KEYS.balances, balances);
  giveStarterItems();
  setCookie('fb_session', user.id, 60 * 60 * 24 * 30);
  return user;
}

export function loginUser(identifier: string, password: string): User {
  const users = listUsers();
  const user = users.find(u => u.email.toLowerCase() === identifier.toLowerCase() || u.username.toLowerCase() === identifier.toLowerCase());
  if (!user || user.password !== password) throw new Error('Неверные данные входа');
  setCookie('fb_session', user.id, 60 * 60 * 24 * 30);
  return user;
}

export function logoutUser() {
  setCookie('fb_session', '', 0);
}

export function currentUser(): User | undefined {
  const id = getCookie('fb_session');
  if (!id) return undefined;
  return listUsers().find(u => u.id === id);
}

// PIN helpers (legacy)
export function setUserPin(userId: string, pin: string) {
  const users = listUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) throw new Error('Пользователь не найден');
  users[idx].pin = pin;
  saveUsers(users);
}
export function verifyUserPin(userId: string, pin: string): boolean {
  const users = listUsers();
  const user = users.find(u => u.id === userId);
  return !!user && (!!user.pin ? user.pin === pin : true);
}
export function rememberPinForSession(minutes = 15) {
  setCookie('fb_pin_ok', '1', 60 * minutes);
}
export function isPinRemembered(): boolean { return getCookie('fb_pin_ok') === '1'; }

// Comprehensive Game Save System
export type GameSaveData = {
  // Кликер данные
  clickerCoins: number;
  clickerLevel: number;
  clickerPower: number;
  clickerTotalClicks: number;
  clickerPlayTime: number;
  clickerSkin: string;
  clickerAchievements: string[];
  clickerCritical: number;
  clickerSpeed: number;
  clickerAbilitiesUsed: number;
  clickerOwnedSkins: string[];
  clickerOwnedAbilities: string[];
  clickerActiveAbilities: {[key: string]: {endTime: number, active: boolean}};
  clickerAbilityCooldowns: {[key: string]: number};
  clickerTutorialCompleted: boolean;
  
  // Кейсы данные
  dailyCaseOpenings: {[key: string]: number};
  lastDailyReset: string;
  
  // Змейка данные
  snakeHighScore: number;
  snakeTotalScore: number;
  snakeGamesPlayed: number;
  snakeFoodEaten: number;
  snakePerfectGames: number;
  snakeAchievements: string[];
  
  // Общие ресурсы
  gems: number;
  balance: number;
  
  // Инвентарь
  inventory: InventoryItem[];
  
  // Карты
  lastCardTime: number;
  
  // Метаданные
  lastSaved: number;
  version: string;
};

const CURRENT_SAVE_VERSION = "1.0.0";

// Получение полных данных сохранения
export function getFullSaveData(): GameSaveData {
  const defaultSave: GameSaveData = {
    clickerCoins: 0,
    clickerLevel: 1,
    clickerPower: 1,
    clickerTotalClicks: 0,
    clickerPlayTime: 0,
    clickerSkin: 'default',
    clickerAchievements: [],
    clickerCritical: 0,
    clickerSpeed: 0,
    clickerAbilitiesUsed: 0,
    clickerOwnedSkins: ['default'],
    clickerOwnedAbilities: [],
    clickerActiveAbilities: {},
    clickerAbilityCooldowns: {},
    clickerTutorialCompleted: false,
    dailyCaseOpenings: {},
    lastDailyReset: '',
    snakeHighScore: 0,
    snakeTotalScore: 0,
    snakeGamesPlayed: 0,
    snakeFoodEaten: 0,
    snakePerfectGames: 0,
    snakeAchievements: [],
    gems: 0,
    balance: 0,
    inventory: [],
    lastCardTime: 0,
    lastSaved: Date.now(),
    version: CURRENT_SAVE_VERSION
  };

  try {
    const saved = readJSON<GameSaveData>('game_save_data', defaultSave);
    return { ...defaultSave, ...saved };
  } catch {
    return defaultSave;
  }
}

// Сохранение полных данных
export function saveFullGameData(data: Partial<GameSaveData>) {
  const current = getFullSaveData();
  const updated = {
    ...current,
    ...data,
    lastSaved: Date.now(),
    version: CURRENT_SAVE_VERSION
  };
  writeJSON('game_save_data', updated);
  return updated;
}

// Автосохранение каждые 30 секунд
let autoSaveInterval: NodeJS.Timeout | null = null;

export function enableAutoSave() {
  if (autoSaveInterval) return;
  
  autoSaveInterval = setInterval(() => {
    try {
      syncAllGameData();
    } catch (error) {
      console.warn('Ошибка автосохранения:', error);
    }
  }, 30000); // 30 секунд
}

export function disableAutoSave() {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
  }
}

// Синхронизация всех данных из localStorage в центральное сохранение
export function syncAllGameData() {
  const saveData: Partial<GameSaveData> = {
    // Кликер
    clickerCoins: parseInt(localStorage.getItem('clickerCoins') || '0'),
    clickerLevel: parseInt(localStorage.getItem('clickerLevel') || '1'),
    clickerPower: parseInt(localStorage.getItem('clickerPower') || '1'),
    clickerTotalClicks: parseInt(localStorage.getItem('clickerTotalClicks') || '0'),
    clickerPlayTime: parseInt(localStorage.getItem('clickerPlayTime') || '0'),
    clickerSkin: localStorage.getItem('clickerSkin') || 'default',
    clickerAchievements: JSON.parse(localStorage.getItem('clickerAchievements') || '[]'),
    clickerCritical: parseInt(localStorage.getItem('clickerCritical') || '0'),
    clickerSpeed: parseInt(localStorage.getItem('clickerSpeed') || '0'),
    clickerAbilitiesUsed: parseInt(localStorage.getItem('clickerAbilitiesUsed') || '0'),
    clickerOwnedSkins: JSON.parse(localStorage.getItem('clickerOwnedSkins') || '["default"]'),
    clickerOwnedAbilities: JSON.parse(localStorage.getItem('clickerOwnedAbilities') || '[]'),
    clickerActiveAbilities: JSON.parse(localStorage.getItem('clickerActiveAbilities') || '{}'),
    clickerAbilityCooldowns: JSON.parse(localStorage.getItem('clickerAbilityCooldowns') || '{}'),
    clickerTutorialCompleted: localStorage.getItem('clickerTutorialCompleted') === 'true',
    
    // Кейсы
    dailyCaseOpenings: JSON.parse(localStorage.getItem('dailyCaseOpenings') || '{}'),
    lastDailyReset: localStorage.getItem('lastDailyReset') || '',
    
    // Змейка
    snakeHighScore: parseInt(localStorage.getItem('snakeHighScore') || '0'),
    snakeTotalScore: parseInt(localStorage.getItem('snakeTotalScore') || '0'),
    snakeGamesPlayed: parseInt(localStorage.getItem('snakeGamesPlayed') || '0'),
    snakeFoodEaten: parseInt(localStorage.getItem('snakeFoodEaten') || '0'),
    snakePerfectGames: parseInt(localStorage.getItem('snakePerfectGames') || '0'),
    snakeAchievements: JSON.parse(localStorage.getItem('snakeAchievements') || '[]'),
    
    // Ресурсы
    gems: getGems(),
    balance: getBalance(),
    inventory: getInventory(),
    lastCardTime: getLastCardTime()
  };
  
  return saveFullGameData(saveData);
}

// Загрузка всех данных обратно в localStorage
export function loadAllGameData() {
  const data = getFullSaveData();
  
  // Кликер
  localStorage.setItem('clickerCoins', data.clickerCoins.toString());
  localStorage.setItem('clickerLevel', data.clickerLevel.toString());
  localStorage.setItem('clickerPower', data.clickerPower.toString());
  localStorage.setItem('clickerTotalClicks', data.clickerTotalClicks.toString());
  localStorage.setItem('clickerPlayTime', data.clickerPlayTime.toString());
  localStorage.setItem('clickerSkin', data.clickerSkin);
  localStorage.setItem('clickerAchievements', JSON.stringify(data.clickerAchievements));
  localStorage.setItem('clickerCritical', data.clickerCritical.toString());
  localStorage.setItem('clickerSpeed', data.clickerSpeed.toString());
  localStorage.setItem('clickerAbilitiesUsed', data.clickerAbilitiesUsed.toString());
  localStorage.setItem('clickerOwnedSkins', JSON.stringify(data.clickerOwnedSkins));
  localStorage.setItem('clickerOwnedAbilities', JSON.stringify(data.clickerOwnedAbilities));
  localStorage.setItem('clickerActiveAbilities', JSON.stringify(data.clickerActiveAbilities));
  localStorage.setItem('clickerAbilityCooldowns', JSON.stringify(data.clickerAbilityCooldowns));
  if (data.clickerTutorialCompleted) {
    localStorage.setItem('clickerTutorialCompleted', 'true');
  }
  
  // Кейсы
  localStorage.setItem('dailyCaseOpenings', JSON.stringify(data.dailyCaseOpenings));
  localStorage.setItem('lastDailyReset', data.lastDailyReset);
  
  // Змейка
  localStorage.setItem('snakeHighScore', data.snakeHighScore.toString());
  localStorage.setItem('snakeTotalScore', data.snakeTotalScore.toString());
  localStorage.setItem('snakeGamesPlayed', data.snakeGamesPlayed.toString());
  localStorage.setItem('snakeFoodEaten', data.snakeFoodEaten.toString());
  localStorage.setItem('snakePerfectGames', data.snakePerfectGames.toString());
  localStorage.setItem('snakeAchievements', JSON.stringify(data.snakeAchievements));
  
  // Ресурсы
  setGems(data.gems);
  setBalance(data.balance);
  
  // Инвентарь
  const inventory = readJSON<Record<string, InventoryItem[]>>('db.inventory', {});
  inventory[GUEST_USER_ID] = data.inventory;
  writeJSON('db.inventory', inventory);
  
  // Карты
  setLastCardTime(data.lastCardTime);
  
  return data;
}

// Экспорт данных для внешнего сохранения
export function exportGameData(): string {
  const data = syncAllGameData();
  return JSON.stringify(data, null, 2);
}

// Импорт данных из внешнего источника
export function importGameData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData) as GameSaveData;
    
    // Проверка валидности данных
    if (!data.version || typeof data.balance !== 'number') {
      throw new Error('Некорректный формат данных');
    }
    
    saveFullGameData(data);
    loadAllGameData();
    return true;
  } catch (error) {
    console.error('Ошибка импорта данных:', error);
    return false;
  }
}

// Сброс всех данных игры
export function resetAllGameData() {
  // Очистить localStorage
  const keysToRemove = [
    'clickerCoins', 'clickerLevel', 'clickerPower', 'clickerTotalClicks',
    'clickerPlayTime', 'clickerSkin', 'clickerAchievements', 'clickerCritical',
    'clickerSpeed', 'clickerAbilitiesUsed', 'clickerOwnedSkins', 'clickerOwnedAbilities',
    'clickerActiveAbilities', 'clickerAbilityCooldowns', 'clickerTutorialCompleted',
    'dailyCaseOpenings', 'lastDailyReset', 'snakeHighScore', 'snakeTotalScore',
    'snakeGamesPlayed', 'snakeFoodEaten', 'snakePerfectGames', 'snakeAchievements'
  ];
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // Сброс центральных данных
  writeJSON('game_save_data', {});
  writeJSON('db.gems', {});
  writeJSON(KEYS.balances, {});
  writeJSON('db.inventory', {});
  writeJSON('db.lastCardTime', 0);
  
  // Создать новое чистое сохранение
  const cleanSave = getFullSaveData();
  saveFullGameData(cleanSave);
  giveStarterItems();
}

// Guest Balance Functions (обновленные для работы с новой системой)
export function getBalance(): number {
  const balances = readJSON<Record<string, number>>(KEYS.balances, {});
  return balances[GUEST_USER_ID] ?? 0;
}

export function setBalance(value: number) {
  const balances = readJSON<Record<string, number>>(KEYS.balances, {});
  balances[GUEST_USER_ID] = Math.max(0, Math.floor(value));
  writeJSON(KEYS.balances, balances);
  
  // Обновить центральное сохранение
  const currentSave = getFullSaveData();
  currentSave.balance = balances[GUEST_USER_ID];
  saveFullGameData(currentSave);
}

export function addBalance(delta: number) {
  setBalance(getBalance() + delta);
}

// Legacy Balance Functions (for user-based systems)
export function getUserBalance(userId: string): number {
  const balances = readJSON<Record<string, number>>(KEYS.balances, {});
  return balances[userId] ?? 0;
}

export function setUserBalance(userId: string, value: number) {
  const balances = readJSON<Record<string, number>>(KEYS.balances, {});
  balances[userId] = Math.max(0, Math.floor(value));
  writeJSON(KEYS.balances, balances);
}

export function addUserBalance(userId: string, delta: number) {
  setUserBalance(userId, getUserBalance(userId) + delta);
}

// Guest Gems Functions
export function getGems(): number {
  const gems = readJSON<Record<string, number>>('db.gems', {});
  return gems[GUEST_USER_ID] ?? 0;
}

export function setGems(value: number) {
  const gems = readJSON<Record<string, number>>('db.gems', {});
  gems[GUEST_USER_ID] = Math.max(0, Math.floor(value));
  writeJSON('db.gems', gems);
  
  // Обновить центральное сохранение
  const currentSave = getFullSaveData();
  currentSave.gems = gems[GUEST_USER_ID];
  saveFullGameData(currentSave);
}

export function addGems(delta: number) {
  setGems(getGems() + delta);
}

// Legacy Gems Functions (for user-based systems)
export function getUserGems(userId: string): number {
  const gems = readJSON<Record<string, number>>('db.gems', {});
  return gems[userId] ?? 0;
}

export function setUserGems(userId: string, value: number) {
  const gems = readJSON<Record<string, number>>('db.gems', {});
  gems[userId] = Math.max(0, Math.floor(value));
  writeJSON('db.gems', gems);
}

export function addUserGems(userId: string, delta: number) {
  setUserGems(userId, getUserGems(userId) + delta);
}

// Inventory Functions
export function getInventory(): InventoryItem[] {
  const inventory = readJSON<Record<string, InventoryItem[]>>('db.inventory', {});
  return inventory[GUEST_USER_ID] ?? [];
}

export function addInventoryItem(item: Omit<InventoryItem, 'id' | 'obtainedAt'>) {
  const inventory = readJSON<Record<string, InventoryItem[]>>('db.inventory', {});
  const userItems = inventory[GUEST_USER_ID] ?? [];
  
  const newItem: InventoryItem = {
    ...item,
    id: nanoid(),
    obtainedAt: Date.now()
  };
  
  userItems.push(newItem);
  inventory[GUEST_USER_ID] = userItems;
  writeJSON('db.inventory', inventory);
  return newItem;
}

export function removeInventoryItem(itemId: string) {
  const inventory = readJSON<Record<string, InventoryItem[]>>('db.inventory', {});
  const userItems = inventory[GUEST_USER_ID] ?? [];
  inventory[GUEST_USER_ID] = userItems.filter(item => item.id !== itemId);
  writeJSON('db.inventory', inventory);
}

// Cards system
export function getLastCardTime(): number {
  return readJSON<number>('db.lastCardTime', 0);
}

export function setLastCardTime(time: number) {
  writeJSON('db.lastCardTime', time);
}

export function canDrawCard(): boolean {
  const lastTime = getLastCardTime();
  const now = Date.now();
  const hourInMs = 60 * 60 * 1000;
  return now - lastTime >= hourInMs;
}

export function drawCard(): CardReward {
  if (!canDrawCard()) {
    throw new Error('Карту можно получить только раз в час');
  }
  
  // Weighted random selection
  const weights = CARD_REWARDS.map(reward => {
    switch (reward.rarity) {
      case 'common': return 40;
      case 'rare': return 30; 
      case 'epic': return 20;
      case 'legendary': return 10;
      default: return 40;
    }
  });
  
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < CARD_REWARDS.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      setLastCardTime(Date.now());
      return CARD_REWARDS[i];
    }
  }
  
  // Fallback
  setLastCardTime(Date.now());
  return CARD_REWARDS[0];
}

// Give starter items
export function giveStarterItems() {
  const currentInventory = getInventory();
  if (currentInventory.length === 0) {
    // Give 2 starter cases
    addInventoryItem({
      type: 'case',
      name: 'Стартовый Кейс',
      rarity: 'common'
    });
    addInventoryItem({
      type: 'case', 
      name: 'Стартовый Кейс',
      rarity: 'common'
    });
    
    // Give some starter coins
    addInventoryItem({
      type: 'coins',
      name: 'Монеты',
      rarity: 'common',
      amount: 1000
    });
    
    // Set initial gems and balance
    setGems(10);
    setBalance(500);
  }
}

// Legacy wallet and transaction functions
export function linkWalletToUser(walletId: string, userId: string) {
  const index = readJSON<Record<string, string>>(KEYS.walletIndex, {});
  index[walletId] = userId;
  writeJSON(KEYS.walletIndex, index);
}
export function findUserIdByWallet(walletId: string): string | undefined {
  const index = readJSON<Record<string, string>>(KEYS.walletIndex, {});
  return index[walletId];
}

export function listTransactions(): Transaction[] { return readJSON<Transaction[]>(KEYS.txs, []); }
function saveTransactions(txs: Transaction[]) { writeJSON(KEYS.txs, txs); }
export function listUserTransactions(userId: string): Transaction[] {
  return listTransactions().filter(t => t.fromUserId === userId || t.toUserId === userId).sort((a,b) => b.createdAt - a.createdAt);
}

export function transferByWallet(fromUserId: string, fromWalletId: string, toWalletPublicId: string, amount: number) {
  const amt = Math.floor(amount);
  if (isNaN(amt) || amt < 1) throw new Error('Минимальная сумма — 1');
  const senderBalance = getUserBalance(fromUserId);
  const cap = Math.floor(senderBalance * 0.1);
  if (amt > cap) throw new Error(`Максимум ${cap} (10% от баланса)`);
  if (amt > senderBalance) throw new Error('Недостаточно средств');
  const toUserId = findUserIdByWallet(toWalletPublicId);
  if (!toUserId) throw new Error('Кошелек получателя не найден (на этом устройстве)');

  setUserBalance(fromUserId, senderBalance - amt);
  addUserBalance(toUserId, amt);

  const cashback = amt > 10000 ? Math.floor(amt * 0.1) : 0;
  if (cashback > 0) addUserBalance(fromUserId, cashback);

  const tx: Transaction = {
    id: nanoid(),
    fromUserId,
    toUserId,
    fromWalletId,
    toWalletId: toWalletPublicId,
    amount: amt,
    createdAt: Date.now(),
    cashback,
  };
  const txs = listTransactions();
  txs.push(tx);
  saveTransactions(txs);
  return tx;
}