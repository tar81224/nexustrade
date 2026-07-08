const STORAGE_KEYS = {
  finnhub: 'nexustrade_api_finnhub',
  news: 'nexustrade_api_news',
  openai: 'nexustrade_api_openai',
} as const;

export type ApiProvider = 'finnhub' | 'news' | 'openai';

export function getApiKey(provider: ApiProvider): string | null {
  return localStorage.getItem(STORAGE_KEYS[provider]);
}

export function setApiKey(provider: ApiProvider, key: string): void {
  localStorage.setItem(STORAGE_KEYS[provider], key);
}

export function removeApiKey(provider: ApiProvider): void {
  localStorage.removeItem(STORAGE_KEYS[provider]);
}

export function hasApiKey(provider: ApiProvider): boolean {
  const key = getApiKey(provider);
  return !!key && key.length > 0;
}

export function getAllApiKeys(): Record<ApiProvider, string | null> {
  return {
    finnhub: getApiKey('finnhub'),
    news: getApiKey('news'),
    openai: getApiKey('openai'),
  };
}
