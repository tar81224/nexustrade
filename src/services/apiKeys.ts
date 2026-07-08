const STORAGE_KEYS = {
  yahoo: 'nexustrade_api_yahoo',
  news: 'nexustrade_api_news',
  openai: 'nexustrade_api_openai',
} as const;

export type ApiProvider = keyof typeof STORAGE_KEYS;

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
  return !!getApiKey(provider);
}
