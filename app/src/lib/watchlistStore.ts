// Watchlist & Favorites Local Storage Manager
const FAVORITES_KEY = 'signal_desk_favorites';
const WATCHLIST_KEY = 'signal_desk_watchlist';

export function getFavoriteSymbols(): string[] {
  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];
  } catch {
    return ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];
  }
}

export function toggleFavoriteSymbol(symbol: string): string[] {
  const current = getFavoriteSymbols();
  let updated: string[];
  if (current.includes(symbol)) {
    updated = current.filter((s) => s !== symbol);
  } else {
    updated = [...current, symbol];
  }
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save favorites', err);
  }
  return updated;
}

export function isSymbolFavorite(symbol: string): boolean {
  return getFavoriteSymbols().includes(symbol);
}
