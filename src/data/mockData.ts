
import { ShoppingList, StockItem, PurchaseHistory } from '@/types';
import { storage } from '@/lib/storage';

const defaultLists: ShoppingList[] = [];
const defaultStock: StockItem[] = [];
const defaultHistory: PurchaseHistory[] = [];

// Cache síncrono para não quebrar a interface do usuário
let stockCache: StockItem[] = [];
let listsCache: ShoppingList[] = [];
let historyCache: PurchaseHistory[] = [];
let isLoaded = false;

export async function initializeLocalData() {
  if (isLoaded) return;
  
  try {
    // Tentar carregar da memória física do smartphone
    const stock = await storage.get<StockItem[]>('stock_items');
    const lists = await storage.get<ShoppingList[]>('shopping_lists');
    const history = await storage.get<PurchaseHistory[]>('purchase_history');

    // Se não houver nada, usa os padrões e salva
    if (!stock) {
      stockCache = defaultStock;
      await storage.set('stock_items', defaultStock);
    } else {
      stockCache = stock;
    }

    if (!lists) {
      listsCache = defaultLists;
      await storage.set('shopping_lists', defaultLists);
    } else {
      listsCache = lists;
    }

    if (!history) {
      historyCache = defaultHistory;
      await storage.set('purchase_history', defaultHistory);
    } else {
      historyCache = history;
    }

    isLoaded = true;
  } catch (error) {
    console.error("Failed to initialize local data, falling back to defaults:", error);
    stockCache = defaultStock;
    listsCache = defaultLists;
    historyCache = defaultHistory;
    isLoaded = true;
  }
}

// Funções síncronas para as páginas usarem sem delay
export function getStock(): StockItem[] {
  // Fallback para localStorage se o cache ainda não estiver pronto (compatibilidade)
  if (!isLoaded) {
    const fallback = localStorage.getItem('stock_items');
    return fallback ? JSON.parse(fallback) : defaultStock;
  }
  return stockCache;
}

export function getLists(): ShoppingList[] {
  if (!isLoaded) {
    const fallback = localStorage.getItem('shopping_lists');
    return fallback ? JSON.parse(fallback) : defaultLists;
  }
  return listsCache;
}

export function getHistory(): PurchaseHistory[] {
  if (!isLoaded) {
    const fallback = localStorage.getItem('purchase_history');
    return fallback ? JSON.parse(fallback) : defaultHistory;
  }
  return historyCache;
}

export async function saveStock(data: StockItem[]) {
  stockCache = data;
  await storage.set('stock_items', data);
  // Manter localStorage sincronizado para compatibilidade web
  localStorage.setItem('stock_items', JSON.stringify(data));
}

export async function saveLists(data: ShoppingList[]) {
  listsCache = data;
  await storage.set('shopping_lists', data);
  localStorage.setItem('shopping_lists', JSON.stringify(data));
}

export async function saveHistory(data: PurchaseHistory[]) {
  historyCache = data;
  await storage.set('purchase_history', data);
  localStorage.setItem('purchase_history', JSON.stringify(data));
}

export async function resetAllData() {
  // Clear Capacitor Preferences
  await storage.clear();
  // Clear LocalStorage (including API Key, tabs, filters, etc.)
  localStorage.clear();
  
  stockCache = [];
  listsCache = [];
  historyCache = [];
  
  // Also clear session-based state if any
  sessionStorage.clear();
  
  // Reload to apply clean state
  window.location.reload();
}
