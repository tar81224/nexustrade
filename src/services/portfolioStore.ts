/* ────────────────────── user-managed portfolio store ────────────────────── */

export interface UserPosition {
  ticker: string;
  shares: number;
  avgCost: number;
  addedAt: string; // ISO date
}

const STORAGE_KEY = 'nexustrade_user_portfolio';
const MODIFIED_FLAG_KEY = 'nexustrade_portfolio_modified';

const DEMO_POSITIONS: UserPosition[] = [
  { ticker: 'NVDA', shares: 10, avgCost: 750.0, addedAt: '2025-01-01T00:00:00Z' },
  { ticker: 'AAPL', shares: 25, avgCost: 180.0, addedAt: '2025-01-01T00:00:00Z' },
  { ticker: 'MSFT', shares: 15, avgCost: 380.0, addedAt: '2025-01-01T00:00:00Z' },
];

/* ─── helpers ─── */

function readStorage(): UserPosition[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserPosition[];
  } catch {
    return null;
  }
}

function writeStorage(positions: UserPosition[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
}

function setModifiedFlag(): void {
  localStorage.setItem(MODIFIED_FLAG_KEY, 'true');
}

/* ─── public API ─── */

/**
 * Returns the user's portfolio positions.
 * On first visit: returns demo data (and persists it so the badge shows).
 * After user makes any change: returns their actual data.
 * After clearAllPositions: returns empty array (demo won't reappear).
 */
export function getUserPortfolio(): UserPosition[] {
  const stored = readStorage();
  if (stored) {
    return stored;
  }
  if (localStorage.getItem(MODIFIED_FLAG_KEY) === 'true') {
    return [];
  }
  writeStorage(DEMO_POSITIONS);
  return DEMO_POSITIONS;
}

/** Add a new position (or merge if ticker already exists). */
export function addPosition(ticker: string, shares: number, avgCost: number): void {
  const positions = getUserPortfolio();
  const existing = positions.find((p) => p.ticker.toUpperCase() === ticker.toUpperCase());

  if (existing) {
    const totalShares = existing.shares + shares;
    const totalCost = existing.shares * existing.avgCost + shares * avgCost;
    existing.shares = totalShares;
    existing.avgCost = totalCost / totalShares;
  } else {
    positions.push({
      ticker: ticker.toUpperCase(),
      shares,
      avgCost,
      addedAt: new Date().toISOString(),
    });
  }

  writeStorage(positions);
  setModifiedFlag();
}

/** Update shares and avg cost for an existing position. */
export function updatePosition(ticker: string, shares: number, avgCost: number): void {
  const positions = getUserPortfolio();
  const pos = positions.find((p) => p.ticker.toUpperCase() === ticker.toUpperCase());
  if (!pos) return;

  pos.shares = shares;
  pos.avgCost = avgCost;
  writeStorage(positions);
  setModifiedFlag();
}

/** Remove a single position by ticker. */
export function removePosition(ticker: string): void {
  const positions = getUserPortfolio().filter(
    (p) => p.ticker.toUpperCase() !== ticker.toUpperCase()
  );
  writeStorage(positions);
  setModifiedFlag();
}

/** Check whether the user has ever added, edited, or removed a position. */
export function hasUserModifiedPortfolio(): boolean {
  return localStorage.getItem(MODIFIED_FLAG_KEY) === 'true';
}

/** Remove all positions and set the cleared flag so demo data never returns. */
export function clearAllPositions(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.setItem(MODIFIED_FLAG_KEY, 'true');
}

/** Returns true if the current portfolio is exactly the demo seed data. */
export function isDemoData(): boolean {
  const positions = getUserPortfolio();
  if (positions.length !== DEMO_POSITIONS.length) return false;
  return positions.every((p, i) => {
    const d = DEMO_POSITIONS[i];
    return p.ticker === d.ticker && p.shares === d.shares && p.avgCost === d.avgCost;
  });
}
