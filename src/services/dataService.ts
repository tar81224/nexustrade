import { hasApiKey } from './apiKeys';
import { getUserPortfolio, hasUserModifiedPortfolio } from './portfolioStore';

/* ────────────────────── types ────────────────────── */

export interface Stock {
  ticker: string;
  company: string;
  sector: string;
  price: number;
  change: number;
  changePct: number;
  volume: string;
  marketCap: string;
  marketCapCategory: 'Large' | 'Mid' | 'Small';
  aiScore: number;
  signal: 'Buy' | 'Hold' | 'Sell';
  sparkline: number[];
  pe?: number;
}

export interface PortfolioHolding {
  ticker: string;
  company: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  totalValue: number;
  pl: number;
  plPct: number;
  sector: string;
}

export interface Transaction {
  id: number;
  date: string;
  type: 'Buy' | 'Sell' | 'Dividend';
  ticker: string;
  shares: number;
  price: number;
  total: number;
}

export interface AISignal {
  id: number;
  ticker: string;
  type: 'Buy' | 'Sell' | 'Hold';
  confidence: number;
  timestamp: string;
  reason: string;
}

export interface NewsArticle {
  id: number;
  headline: string;
  source: string;
  timestamp: string;
  category: 'Stocks' | 'Macro' | 'Earnings' | 'Crypto' | 'Commodities';
  summary: string[];
  sentiment: 'Bullish' | 'Neutral' | 'Bearish';
  impact: number;
  affectedTickers: { ticker: string; change: string; positive: boolean }[];
  breaking?: boolean;
  read?: boolean;
}

export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePct: number;
  history: number[];
}

export interface ScreenerFilters {
  search?: string;
  sector?: string;
  marketCap?: string;
  aiScoreMin?: number;
  aiScoreMax?: number;
  signal?: string;
}

/* ────────────────────── 20+ stocks ────────────────────── */

export const ALL_STOCKS: Stock[] = [
  { ticker: 'AAPL', company: 'Apple Inc', sector: 'Technology', price: 195.64, change: 2.34, changePct: 1.21, volume: '55.1M', marketCap: '3.0T', marketCapCategory: 'Large', aiScore: 85, signal: 'Buy', sparkline: [50,48,52,55,53,58,60,57,62,65], pe: 32.4 },
  { ticker: 'MSFT', company: 'Microsoft Corp', sector: 'Technology', price: 412.35, change: -1.24, changePct: -0.30, volume: '25.3M', marketCap: '3.1T', marketCapCategory: 'Large', aiScore: 92, signal: 'Hold', sparkline: [60,62,58,55,57,54,56,53,55,52], pe: 35.1 },
  { ticker: 'GOOGL', company: 'Alphabet Inc', sector: 'Technology', price: 176.82, change: 1.41, changePct: 0.80, volume: '28.5M', marketCap: '2.2T', marketCapCategory: 'Large', aiScore: 83, signal: 'Buy', sparkline: [45,47,44,48,50,49,52,51,53,55], pe: 25.6 },
  { ticker: 'AMZN', company: 'Amazon.com Inc', sector: 'Consumer Cyclical', price: 198.45, change: 2.93, changePct: 1.50, volume: '38.2M', marketCap: '2.1T', marketCapCategory: 'Large', aiScore: 88, signal: 'Buy', sparkline: [50,52,48,55,53,58,56,62,60,65], pe: 42.3 },
  { ticker: 'NVDA', company: 'NVIDIA Corp', sector: 'Technology', price: 892.10, change: 26.76, changePct: 3.10, volume: '48.2M', marketCap: '2.2T', marketCapCategory: 'Large', aiScore: 94, signal: 'Buy', sparkline: [40,55,45,60,50,70,65,80,75,90], pe: 72.3 },
  { ticker: 'META', company: 'Meta Platforms', sector: 'Technology', price: 502.30, change: -3.55, changePct: -0.70, volume: '18.6M', marketCap: '1.3T', marketCapCategory: 'Large', aiScore: 79, signal: 'Hold', sparkline: [60,62,65,63,66,64,62,60,58,55], pe: 28.4 },
  { ticker: 'TSLA', company: 'Tesla Inc', sector: 'Consumer Cyclical', price: 248.75, change: -3.53, changePct: -1.40, volume: '61.4M', marketCap: '790B', marketCapCategory: 'Large', aiScore: 72, signal: 'Hold', sparkline: [70,65,68,60,55,58,52,50,48,45], pe: 68.5 },
  { ticker: 'JPM', company: 'JPMorgan Chase', sector: 'Finance', price: 242.15, change: 1.21, changePct: 0.50, volume: '12.3M', marketCap: '700B', marketCapCategory: 'Large', aiScore: 76, signal: 'Buy', sparkline: [50,51,49,52,53,52,54,55,54,56], pe: 12.8 },
  { ticker: 'V', company: 'Visa Inc', sector: 'Finance', price: 278.90, change: 2.49, changePct: 0.90, volume: '8.2M', marketCap: '580B', marketCapCategory: 'Large', aiScore: 82, signal: 'Buy', sparkline: [50,52,51,54,53,56,55,58,57,60], pe: 31.2 },
  { ticker: 'WMT', company: 'Walmart Inc', sector: 'Consumer Defensive', price: 168.75, change: 0.51, changePct: 0.30, volume: '6.5M', marketCap: '680B', marketCapCategory: 'Large', aiScore: 71, signal: 'Hold', sparkline: [48,49,47,50,49,51,50,52,51,53], pe: 26.5 },
  { ticker: 'JNJ', company: 'Johnson & Johnson', sector: 'Healthcare', price: 145.30, change: -0.87, changePct: -0.60, volume: '7.8M', marketCap: '350B', marketCapCategory: 'Large', aiScore: 68, signal: 'Hold', sparkline: [52,51,50,49,48,49,47,48,46,45], pe: 14.2 },
  { ticker: 'UNH', company: 'UnitedHealth Group', sector: 'Healthcare', price: 582.40, change: -1.17, changePct: -0.20, volume: '4.8M', marketCap: '540B', marketCapCategory: 'Large', aiScore: 74, signal: 'Hold', sparkline: [55,54,56,55,53,54,52,53,51,50], pe: 18.6 },
  { ticker: 'XOM', company: 'Exxon Mobil Corp', sector: 'Energy', price: 118.20, change: -0.95, changePct: -0.80, volume: '15.2M', marketCap: '470B', marketCapCategory: 'Large', aiScore: 65, signal: 'Hold', sparkline: [55,54,52,53,50,51,48,49,47,45], pe: 13.4 },
  { ticker: 'BAC', company: 'Bank of America', sector: 'Finance', price: 37.45, change: 0.22, changePct: 0.59, volume: '28.6M', marketCap: '290B', marketCapCategory: 'Large', aiScore: 70, signal: 'Hold', sparkline: [42,43,42,44,43,45,44,46,45,47], pe: 11.8 },
  { ticker: 'MA', company: 'Mastercard Inc', sector: 'Finance', price: 445.20, change: 4.01, changePct: 0.91, volume: '3.4M', marketCap: '420B', marketCapCategory: 'Large', aiScore: 84, signal: 'Buy', sparkline: [55,57,56,59,58,61,60,63,62,65], pe: 35.6 },
  { ticker: 'PG', company: 'Procter & Gamble', sector: 'Consumer Defensive', price: 165.80, change: 0.50, changePct: 0.30, volume: '5.6M', marketCap: '390B', marketCapCategory: 'Large', aiScore: 73, signal: 'Hold', sparkline: [50,49,50,51,50,52,51,52,53,52], pe: 24.8 },
  { ticker: 'HD', company: 'Home Depot', sector: 'Consumer Cyclical', price: 348.50, change: -2.09, changePct: -0.60, volume: '4.2M', marketCap: '350B', marketCapCategory: 'Large', aiScore: 77, signal: 'Buy', sparkline: [58,57,56,55,54,53,52,51,50,49], pe: 22.1 },
  { ticker: 'LLY', company: 'Eli Lilly & Co', sector: 'Healthcare', price: 692.30, change: 13.85, changePct: 2.04, volume: '3.1M', marketCap: '660B', marketCapCategory: 'Large', aiScore: 89, signal: 'Buy', sparkline: [40,45,42,50,48,55,52,60,58,65], pe: 118.4 },
  { ticker: 'MRK', company: 'Merck & Co', sector: 'Healthcare', price: 129.80, change: 0.65, changePct: 0.50, volume: '6.8M', marketCap: '330B', marketCapCategory: 'Large', aiScore: 75, signal: 'Hold', sparkline: [48,49,48,50,49,51,50,52,51,53], pe: 16.2 },
  { ticker: 'PEP', company: 'PepsiCo Inc', sector: 'Consumer Defensive', price: 168.40, change: -0.84, changePct: -0.50, volume: '4.5M', marketCap: '230B', marketCapCategory: 'Large', aiScore: 69, signal: 'Hold', sparkline: [52,51,50,49,48,47,46,45,44,43], pe: 22.6 },
  { ticker: 'COST', company: 'Costco Wholesale', sector: 'Consumer Defensive', price: 485.60, change: 3.40, changePct: 0.70, volume: '2.1M', marketCap: '215B', marketCapCategory: 'Large', aiScore: 81, signal: 'Buy', sparkline: [50,52,51,54,53,56,55,58,57,60], pe: 36.8 },
  { ticker: 'DIS', company: 'Walt Disney Co', sector: 'Consumer Cyclical', price: 112.40, change: -1.35, changePct: -1.19, volume: '9.8M', marketCap: '205B', marketCapCategory: 'Large', aiScore: 66, signal: 'Hold', sparkline: [55,53,54,52,50,51,49,47,48,46], pe: 22.4 },
  { ticker: 'VZ', company: 'Verizon Communications', sector: 'Technology', price: 42.15, change: 0.13, changePct: 0.31, volume: '18.3M', marketCap: '177B', marketCapCategory: 'Large', aiScore: 62, signal: 'Hold', sparkline: [45,44,45,46,45,47,46,48,47,49], pe: 8.9 },
  { ticker: 'NFLX', company: 'Netflix Inc', sector: 'Consumer Cyclical', price: 625.80, change: 12.52, changePct: 2.04, volume: '5.6M', marketCap: '270B', marketCapCategory: 'Large', aiScore: 86, signal: 'Buy', sparkline: [45,50,48,55,53,60,58,65,63,70], pe: 38.2 },
  { ticker: 'AMD', company: 'Advanced Micro Devices', sector: 'Technology', price: 168.20, change: 3.46, changePct: 2.10, volume: '42.8M', marketCap: '272B', marketCapCategory: 'Large', aiScore: 87, signal: 'Buy', sparkline: [35,40,38,45,42,50,48,55,52,58], pe: 45.3 },
  { ticker: 'CRM', company: 'Salesforce Inc', sector: 'Technology', price: 288.40, change: 4.33, changePct: 1.52, volume: '6.2M', marketCap: '280B', marketCapCategory: 'Large', aiScore: 80, signal: 'Buy', sparkline: [48,50,49,52,51,54,53,56,55,58], pe: 32.1 },
];

/* ────────────────────── transactions fallback ────────────────────── */

const TRANSACTIONS_FALLBACK: Transaction[] = [
  { id: 1, date: '2025-01-15', type: 'Buy', ticker: 'NVDA', shares: 10, price: 875.20, total: 8752.00 },
  { id: 2, date: '2025-01-14', type: 'Sell', ticker: 'TSLA', shares: 15, price: 248.75, total: 3731.25 },
  { id: 3, date: '2025-01-12', type: 'Buy', ticker: 'LLY', shares: 3, price: 665.00, total: 1995.00 },
  { id: 4, date: '2025-01-10', type: 'Buy', ticker: 'AAPL', shares: 25, price: 192.40, total: 4810.00 },
  { id: 5, date: '2025-01-08', type: 'Buy', ticker: 'MSFT', shares: 10, price: 408.30, total: 4083.00 },
  { id: 6, date: '2025-01-05', type: 'Dividend', ticker: 'JPM', shares: 0, price: 0, total: 42.50 },
  { id: 7, date: '2024-12-28', type: 'Buy', ticker: 'AMD', shares: 30, price: 158.60, total: 4758.00 },
  { id: 8, date: '2024-12-22', type: 'Sell', ticker: 'PEP', shares: 20, price: 169.20, total: 3384.00 },
  { id: 9, date: '2024-12-20', type: 'Buy', ticker: 'NFLX', shares: 3, price: 610.00, total: 1830.00 },
  { id: 10, date: '2024-12-18', type: 'Buy', ticker: 'V', shares: 8, price: 272.00, total: 2176.00 },
  { id: 11, date: '2024-12-15', type: 'Buy', ticker: 'GOOGL', shares: 20, price: 170.50, total: 3410.00 },
  { id: 12, date: '2024-12-10', type: 'Sell', ticker: 'DIS', shares: 40, price: 115.00, total: 4600.00 },
  { id: 13, date: '2024-12-08', type: 'Dividend', ticker: 'AAPL', shares: 0, price: 0, total: 28.50 },
  { id: 14, date: '2024-12-05', type: 'Buy', ticker: 'META', shares: 5, price: 498.00, total: 2490.00 },
  { id: 15, date: '2024-12-01', type: 'Buy', ticker: 'AMZN', shares: 15, price: 192.00, total: 2880.00 },
  { id: 16, date: '2024-11-28', type: 'Sell', ticker: 'XOM', shares: 25, price: 120.00, total: 3000.00 },
  { id: 17, date: '2024-11-25', type: 'Buy', ticker: 'CRM', shares: 8, price: 280.00, total: 2240.00 },
  { id: 18, date: '2024-11-20', type: 'Dividend', ticker: 'V', shares: 0, price: 0, total: 18.75 },
  { id: 19, date: '2024-11-18', type: 'Buy', ticker: 'JPM', shares: 10, price: 238.90, total: 2389.00 },
  { id: 20, date: '2024-11-15', type: 'Sell', ticker: 'BAC', shares: 100, price: 38.00, total: 3800.00 },
  { id: 21, date: '2024-11-10', type: 'Buy', ticker: 'MA', shares: 5, price: 435.00, total: 2175.00 },
  { id: 22, date: '2024-11-05', type: 'Buy', ticker: 'NVDA', shares: 15, price: 720.00, total: 10800.00 },
  { id: 23, date: '2024-11-01', type: 'Dividend', ticker: 'MSFT', shares: 0, price: 0, total: 35.20 },
  { id: 24, date: '2024-10-28', type: 'Buy', ticker: 'HD', shares: 6, price: 340.00, total: 2040.00 },
];

/* ────────────────────── AI signals ────────────────────── */

const AI_SIGNALS: AISignal[] = [
  { id: 1, ticker: 'NVDA', type: 'Buy', confidence: 94, timestamp: '2 min ago', reason: 'Strong AI demand, Blackwell ramp accelerating' },
  { id: 2, ticker: 'LLY', type: 'Buy', confidence: 91, timestamp: '8 min ago', reason: 'Mounjaro sales beating estimates, pipeline expansion' },
  { id: 3, ticker: 'AMD', type: 'Buy', confidence: 88, timestamp: '15 min ago', reason: 'Data center share gains, MI300 traction' },
  { id: 4, ticker: 'NFLX', type: 'Buy', confidence: 86, timestamp: '22 min ago', reason: 'Ad tier scaling, margin expansion' },
  { id: 5, ticker: 'AMZN', type: 'Buy', confidence: 85, timestamp: '28 min ago', reason: 'AWS reacceleration, cost optimization' },
  { id: 6, ticker: 'AAPL', type: 'Hold', confidence: 72, timestamp: '35 min ago', reason: 'Services growth offsetting iPhone softness' },
  { id: 7, ticker: 'MSFT', type: 'Hold', confidence: 88, timestamp: '42 min ago', reason: 'Azure growth strong, valuation elevated' },
  { id: 8, ticker: 'GOOGL', type: 'Buy', confidence: 83, timestamp: '51 min ago', reason: 'AI integration driving ad efficiency' },
  { id: 9, ticker: 'TSLA', type: 'Sell', confidence: 65, timestamp: '1 hr ago', reason: 'Margin pressure, increased competition' },
  { id: 10, ticker: 'META', type: 'Hold', confidence: 79, timestamp: '1 hr ago', reason: 'Reels monetization improving, capex heavy' },
  { id: 11, ticker: 'JPM', type: 'Buy', confidence: 76, timestamp: '2 hr ago', reason: 'NII tailwinds, investment banking recovery' },
  { id: 12, ticker: 'DIS', type: 'Sell', confidence: 58, timestamp: '3 hr ago', reason: 'Streaming losses persist, cable decline' },
];

/* ────────────────────── news articles ────────────────────── */

const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 1, headline: 'Federal Reserve Signals September Rate Cut as Inflation Cools',
    source: 'Reuters', timestamp: '12 min ago', category: 'Macro',
    summary: [
      'Fed Chair Powell hints at "time to adjust policy" in Jackson Hole speech',
      'Markets price in 72% probability of 25bp cut in September',
      'Dollar index falls 0.6% as Treasury yields decline across the curve',
    ],
    sentiment: 'Bullish', impact: 9,
    affectedTickers: [{ ticker: 'SPY', change: '+1.2%', positive: true }, { ticker: 'QQQ', change: '+1.5%', positive: true }, { ticker: 'TLT', change: '+0.8%', positive: true }, { ticker: 'DXY', change: '-0.6%', positive: false }],
    breaking: true,
  },
  {
    id: 2, headline: 'Apple Q3 Earnings Beat: Services Revenue Hits All-Time High',
    source: 'Bloomberg', timestamp: '1 hr ago', category: 'Earnings',
    summary: [
      'EPS $1.64 vs $1.53 expected, revenue $85.78B vs $84.52B expected',
      'Services revenue up 14% YoY to $24.21 billion',
      'iPhone sales in China show resilience despite competition from Huawei',
    ],
    sentiment: 'Bullish', impact: 8,
    affectedTickers: [{ ticker: 'AAPL', change: '+4.2%', positive: true }, { ticker: 'MSFT', change: '+0.5%', positive: true }],
  },
  {
    id: 3, headline: 'NVIDIA Announces Next-Gen Blackwell GPUs for Data Centers',
    source: 'TechCrunch', timestamp: '2 hr ago', category: 'Stocks',
    summary: [
      'B200 chip delivers 4x inference performance over previous generation',
      'Amazon, Google, and Microsoft among first customers',
      'Production ramp expected to drive Q4 revenue above consensus',
    ],
    sentiment: 'Bullish', impact: 7,
    affectedTickers: [{ ticker: 'NVDA', change: '+3.8%', positive: true }, { ticker: 'AMD', change: '+2.1%', positive: true }, { ticker: 'AVGO', change: '+1.4%', positive: true }],
  },
  {
    id: 4, headline: 'Semiconductor Sector Faces New Export Restrictions to China',
    source: 'WSJ', timestamp: '3 hr ago', category: 'Stocks',
    summary: [
      'Biden administration expands chip export controls to 140+ Chinese entities',
      'Memory chip equipment now included in restrictions',
      'Industry groups warn of significant revenue impact in 2025',
    ],
    sentiment: 'Bearish', impact: 8,
    affectedTickers: [{ ticker: 'NVDA', change: '-1.2%', positive: false }, { ticker: 'AMD', change: '-1.8%', positive: false }, { ticker: 'INTC', change: '-0.9%', positive: false }],
  },
  {
    id: 5, headline: 'Bitcoin ETF Inflows Reach $500M in Single Day Record',
    source: 'CoinDesk', timestamp: '4 hr ago', category: 'Crypto',
    summary: [
      'BlackRock IBIT leads with $310M in daily inflows',
      'Total Bitcoin ETF AUM crosses $60 billion milestone',
      'Analysts cite institutional FOMO ahead of halving supply shock',
    ],
    sentiment: 'Bullish', impact: 6,
    affectedTickers: [{ ticker: 'BTC', change: '+2.8%', positive: true }, { ticker: 'COIN', change: '+5.1%', positive: true }, { ticker: 'MSTR', change: '+4.3%', positive: true }],
  },
  {
    id: 6, headline: 'Tesla Recalls 1.8M Vehicles Over Software Safety Issue',
    source: 'AP News', timestamp: '5 hr ago', category: 'Stocks',
    summary: [
      'Over-the-air update to fix hood latch sensor malfunction',
      'No accidents or injuries reported related to the issue',
      'Estimated recall cost of $45M in Q3',
    ],
    sentiment: 'Bearish', impact: 4,
    affectedTickers: [{ ticker: 'TSLA', change: '-1.4%', positive: false }],
  },
  {
    id: 7, headline: 'US Jobless Claims Fall to 233K, Beating Expectations',
    source: 'CNBC', timestamp: '6 hr ago', category: 'Macro',
    summary: [
      'Initial claims drop 6K from prior week, below 240K consensus',
      'Continuing claims hold steady at 1.86 million',
      'Labor market resilience supports soft landing narrative',
    ],
    sentiment: 'Bullish', impact: 5,
    affectedTickers: [{ ticker: 'SPY', change: '+0.3%', positive: true }, { ticker: 'GLD', change: '-0.2%', positive: false }],
  },
  {
    id: 8, headline: 'Amazon Web Services Launches AI-Powered Code Assistant',
    source: 'The Verge', timestamp: '8 hr ago', category: 'Stocks',
    summary: [
      'Amazon Q Developer competes directly with GitHub Copilot',
      'Free tier for individuals, $19/month for professionals',
      'Enterprise tier includes security scanning and compliance features',
    ],
    sentiment: 'Bullish', impact: 5,
    affectedTickers: [{ ticker: 'AMZN', change: '+1.1%', positive: true }, { ticker: 'MSFT', change: '-0.3%', positive: false }],
  },
  {
    id: 9, headline: 'Ethereum Layer-2 Networks Surpass Mainnet in Daily Transactions',
    source: 'Decrypt', timestamp: '10 hr ago', category: 'Crypto',
    summary: [
      'Base, Arbitrum, and Optimism collectively process 4.2M daily txs',
      'Gas fees on L2s average $0.01 vs $2.50 on mainnet',
      'Vitalik Buterin calls it "the scaling moment we built for"',
    ],
    sentiment: 'Bullish', impact: 4,
    affectedTickers: [{ ticker: 'ETH', change: '+1.5%', positive: true }, { ticker: 'COIN', change: '+0.8%', positive: true }],
  },
  {
    id: 10, headline: 'JPMorgan Raises S&P 500 Year-End Target to 6,200',
    source: 'MarketWatch', timestamp: '12 hr ago', category: 'Macro',
    summary: [
      'Revision driven by stronger-than-expected earnings growth',
      'Tech sector weighting increase accounts for 60% of target lift',
      'Analysts maintain "Overweight" rating on communications services',
    ],
    sentiment: 'Bullish', impact: 6,
    affectedTickers: [{ ticker: 'SPY', change: '+0.5%', positive: true }, { ticker: 'JPM', change: '+0.7%', positive: true }],
  },
  {
    id: 11, headline: 'Gold Prices Hit Record High on Geopolitical Tensions',
    source: 'Reuters', timestamp: '14 hr ago', category: 'Commodities',
    summary: [
      'Spot gold reaches $2,485/oz, surpassing previous all-time high',
      'Safe-haven demand rises amid Middle East escalation',
      'Central bank buying continues at record pace',
    ],
    sentiment: 'Bullish', impact: 6,
    affectedTickers: [{ ticker: 'GLD', change: '+1.8%', positive: true }, { ticker: 'GOLD', change: '+2.1%', positive: true }],
  },
  {
    id: 12, headline: 'Eli Lilly Mounjaro Sales Surge 120% in Q2',
    source: 'FiercePharma', timestamp: '16 hr ago', category: 'Earnings',
    summary: [
      'Revenue of $3.09B beats consensus of $2.85B for GLP-1 drug',
      'Zepbound launch exceeding expectations in obesity market',
      'Company raises full-year guidance by $1B',
    ],
    sentiment: 'Bullish', impact: 8,
    affectedTickers: [{ ticker: 'LLY', change: '+5.2%', positive: true }, { ticker: 'NVO', change: '+2.8%', positive: true }],
  },
  {
    id: 13, headline: 'OPEC+ Delays Production Increase Amid Demand Concerns',
    source: 'Bloomberg', timestamp: '18 hr ago', category: 'Commodities',
    summary: [
      'Group postpones planned October output hike by two months',
      'Brent crude rises 2.3% on tighter supply outlook',
      'Saudi Arabia emphasizes commitment to market stability',
    ],
    sentiment: 'Bullish', impact: 7,
    affectedTickers: [{ ticker: 'XOM', change: '+1.5%', positive: true }, { ticker: 'CVX', change: '+1.3%', positive: true }, { ticker: 'USO', change: '+2.1%', positive: true }],
  },
  {
    id: 14, headline: 'Netflix Password Crackdown Drives 47% Subscriber Growth',
    source: 'Variety', timestamp: '20 hr ago', category: 'Earnings',
    summary: [
      'Q2 net adds of 8.05M crush consensus of 5.2M',
      'Paid sharing initiative exceeds internal projections',
      'Ad tier now accounts for 25% of new signups in supported markets',
    ],
    sentiment: 'Bullish', impact: 7,
    affectedTickers: [{ ticker: 'NFLX', change: '+6.8%', positive: true }, { ticker: 'DIS', change: '-0.5%', positive: false }],
  },
  {
    id: 15, headline: 'Microsoft Azure Revenue Grows 31%, Accelerating from Prior Quarter',
    source: 'TechCrunch', timestamp: '22 hr ago', category: 'Earnings',
    summary: [
      'Azure growth beats 29% consensus estimate',
      'AI services contributing 800bps to Azure growth',
      'Management guides Q1 in-line to slightly ahead of expectations',
    ],
    sentiment: 'Bullish', impact: 8,
    affectedTickers: [{ ticker: 'MSFT', change: '+2.4%', positive: true }, { ticker: 'GOOGL', change: '+1.2%', positive: true }, { ticker: 'AMZN', change: '+0.9%', positive: true }],
  },
];

/* ────────────────────── market indices ────────────────────── */

const marketIndices: MarketIndex[] = [
  { name: 'S&P 500', value: 5891.34, change: 49.67, changePct: 0.85, history: [5750,5780,5760,5800,5820,5790,5810,5840,5830,5850,5840,5891] },
  { name: 'NASDAQ', value: 18947.26, change: 210.32, changePct: 1.12, history: [18200,18400,18300,18500,18600,18500,18700,18800,18700,18850,18800,18947] },
  { name: 'DOW', value: 43219.77, change: 146.21, changePct: 0.34, history: [42500,42700,42600,42800,42900,42850,43000,43100,43050,43150,43100,43220] },
];

/* ────────────────────── helpers ────────────────────── */

function checkApiKey(provider: 'finnhub' | 'news' | 'openai', functionName: string): void {
  if (hasApiKey(provider)) {
    console.log(`[${functionName}] Would call API with key: ${hasApiKey(provider) ? '***' : 'none'}`);
  }
}

/* deterministic pseudo-random: same seed → same sequence.
   Used to generate realistic-but-stable performance curves.   */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

/* ────────────────────── exported functions ────────────────────── */

export function getMarketOverview(): MarketIndex[] {
  checkApiKey('finnhub', 'getMarketOverview');
  // Return stable values — no random jitter
  return marketIndices.map((m) => ({ ...m }));
}

export function getPortfolioData(): {
  holdings: PortfolioHolding[];
  totalValue: number;
  dayGain: number;
  dayGainPct: number;
  buyingPower: number;
  aiSignalsActive: number;
} {
  checkApiKey('finnhub', 'getPortfolioData');

  const userPositions = getUserPortfolio();
  const buyingPower = 10000;

  if (userPositions.length === 0) {
    return {
      holdings: [],
      totalValue: 0,
      dayGain: 0,
      dayGainPct: 0,
      buyingPower,
      aiSignalsActive: AI_SIGNALS.filter((s) => s.type === 'Buy').length,
    };
  }

  let totalValue = 0;
  let dayGain = 0;

  const holdings: PortfolioHolding[] = userPositions.map((pos) => {
    const stock = ALL_STOCKS.find(
      (s) => s.ticker.toUpperCase() === pos.ticker.toUpperCase()
    );

    const currentPrice = stock ? stock.price : 0;
    const sector = stock ? stock.sector : 'Unknown';
    const company = stock ? stock.company : pos.ticker;
    const totalHoldingValue = pos.shares * currentPrice;
    const pl = (currentPrice - pos.avgCost) * pos.shares;
    const plPct = pos.avgCost > 0 ? ((currentPrice - pos.avgCost) / pos.avgCost) * 100 : 0;
    // Stable day gain based on the stock's change percentage
    const holdingDayGain = stock ? pos.shares * stock.change : 0;

    totalValue += totalHoldingValue;
    dayGain += holdingDayGain;

    return {
      ticker: pos.ticker.toUpperCase(),
      company,
      shares: pos.shares,
      avgCost: pos.avgCost,
      currentPrice,
      totalValue: totalHoldingValue,
      pl,
      plPct,
      sector,
    };
  });

  return {
    holdings,
    totalValue,
    dayGain,
    dayGainPct: (dayGain / (totalValue - dayGain)) * 100,
    buyingPower,
    aiSignalsActive: AI_SIGNALS.filter((s) => s.type === 'Buy').length,
  };
}

export function getWatchlist(): Stock[] {
  checkApiKey('finnhub', 'getWatchlist');
  const watchlistTickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA', 'AMD', 'NFLX', 'LLY'];
  return watchlistTickers
    .map((t) => ALL_STOCKS.find((s) => s.ticker === t)!)
    .filter(Boolean)
    .map((s) => ({ ...s })); // stable — no random jitter
}

export function getStockData(ticker?: string): Stock[] {
  checkApiKey('finnhub', 'getStockData');
  if (ticker) {
    const found = ALL_STOCKS.find((s) => s.ticker.toLowerCase() === ticker.toLowerCase());
    return found ? [{ ...found }] : [];
  }
  return ALL_STOCKS.map((s) => ({ ...s })); // stable — no random jitter
}

export function getNews(category?: string): NewsArticle[] {
  checkApiKey('news', 'getNews');
  const articles = NEWS_ARTICLES.map((a) => ({
    ...a,
    read: localStorage.getItem(`news_read_${a.id}`) === 'true',
  }));
  if (category && category !== 'All') {
    return articles.filter((a) => a.category === category);
  }
  return articles;
}

export function markArticleRead(id: number): void {
  localStorage.setItem(`news_read_${id}`, 'true');
}

export function getAISignals(): AISignal[] {
  checkApiKey('openai', 'getAISignals');
  // Stable — no random jitter
  return AI_SIGNALS.map((s) => ({ ...s }));
}

export function getScreenedStocks(filters: ScreenerFilters = {}): Stock[] {
  checkApiKey('finnhub', 'getScreenedStocks');
  let result = [...ALL_STOCKS];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (s) => s.ticker.toLowerCase().includes(q) || s.company.toLowerCase().includes(q)
    );
  }
  if (filters.sector && filters.sector !== 'All') {
    result = result.filter((s) => s.sector === filters.sector);
  }
  if (filters.marketCap && filters.marketCap !== 'All') {
    result = result.filter((s) => s.marketCapCategory === filters.marketCap);
  }
  if (filters.signal && filters.signal !== 'All') {
    result = result.filter((s) => s.signal === filters.signal);
  }
  if (filters.aiScoreMin !== undefined) {
    result = result.filter((s) => s.aiScore >= (filters.aiScoreMin || 0));
  }

  return result;
}

/** Generate transactions from the user's portfolio positions.
 *  If the portfolio has been modified by the user, return Buy transactions
 *  derived from each position. Otherwise return the fallback set.  */
export function getTransactions(typeFilter?: string): Transaction[] {
  checkApiKey('finnhub', 'getTransactions');

  const userModified = hasUserModifiedPortfolio();

  let txs: Transaction[];

  if (userModified) {
    // Generate Buy transactions from current positions
    const positions = getUserPortfolio();
    txs = positions.map((pos, idx) => ({
      id: idx + 1,
      date: pos.addedAt.slice(0, 10),
      type: 'Buy' as const,
      ticker: pos.ticker.toUpperCase(),
      shares: pos.shares,
      price: pos.avgCost,
      total: pos.shares * pos.avgCost,
    }));
  } else {
    txs = [...TRANSACTIONS_FALLBACK];
  }

  if (typeFilter && typeFilter !== 'All') {
    return txs.filter((t) => t.type === typeFilter);
  }
  return txs;
}

/* ────────────────────── portfolio performance data ────────────────────── */

export function getPortfolioPerformance(timeframe: string) {
  const points =
    timeframe === '1D' ? 24 :
    timeframe === '1W' ? 7 :
    timeframe === '1M' ? 30 :
    timeframe === '3M' ? 90 :
    timeframe === '1Y' ? 365 : 30;

  // Build a deterministic performance curve based on the user's actual holdings.
  // We compute a weighted average of each holding's changePct to set the trend direction.
  const portfolio = getPortfolioData();
  const holdings = portfolio.holdings;

  let weightedReturn = 0;
  let totalWeight = 0;
  holdings.forEach((h) => {
    const stock = ALL_STOCKS.find((s) => s.ticker === h.ticker);
    if (stock) {
      const weight = h.totalValue;
      weightedReturn += stock.changePct * weight;
      totalWeight += weight;
    }
  });

  // Normalised daily drift (annualised / 365)
  const drift = totalWeight > 0 ? (weightedReturn / totalWeight) / 365 * 2.5 : 0.0003;
  const base = Math.max(10000, portfolio.totalValue * 0.95);

  const rng = seededRandom(42);

  return Array.from({ length: points }, (_, i) => {
    // Deterministic random walk
    let walkSum = 0;
    for (let j = 0; j <= i; j++) {
      walkSum += (rng() - 0.5 + drift) * 0.008 * base;
    }
    const value = base + walkSum;

    // S&P 500 benchmark — slightly underperforms the portfolio
    const spRng = seededRandom(123);
    let spWalk = 0;
    for (let j = 0; j <= i; j++) {
      spWalk += (spRng() - 0.5 + drift * 0.6) * 0.006 * base;
    }
    const spValue = base + spWalk;

    return {
      label: timeframe === '1D' ? `${i}:00` : `D${i + 1}`,
      value: Math.round(value),
      sp500: Math.round(spValue),
    };
  });
}

export function getSectorAllocation() {
  const holdings = getPortfolioData().holdings;
  if (holdings.length === 0) return [];

  const total = holdings.reduce((s, h) => s + h.totalValue, 0);
  const sectorMap: Record<string, number> = {};
  holdings.forEach((h) => {
    sectorMap[h.sector] = (sectorMap[h.sector] || 0) + h.totalValue;
  });
  const colors: Record<string, string> = {
    Technology: '#00F0FF', Healthcare: '#8B5CF6', Finance: '#3B82F6',
    Energy: '#F59E0B', 'Consumer Cyclical': '#EC4899',
    'Consumer Defensive': '#10B981', Cash: '#64748B',
  };
  return Object.entries(sectorMap).map(([name, value]) => ({
    name,
    value: Math.round((value / total) * 100),
    color: colors[name] || '#64748B',
  }));
}

export function getStockAllocation() {
  const holdings = getPortfolioData().holdings;
  if (holdings.length === 0) return [];

  const total = holdings.reduce((s, h) => s + h.totalValue, 0);
  return holdings
    .map((h) => ({ name: h.ticker, value: Math.round((h.totalValue / total) * 100) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
}

/* ────────────────────── AI chat responses ────────────────────── */

export function getAIResponse(message: string): { text: string; type?: 'stock' | 'compare' | 'portfolio' | 'market' | 'generic' } {
  const lower = message.toLowerCase();

  const tickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'AMD', 'NFLX', 'LLY', 'JPM', 'V', 'DIS', 'XOM', 'BAC'];
  const foundTicker = tickers.find((t) => lower.includes(t.toLowerCase()));

  if (lower.includes('compare') || lower.includes('vs') || lower.includes('versus')) {
    return {
      type: 'compare',
      text: `**MSFT vs GOOGL — Head-to-Head Comparison**

| Metric | MSFT | GOOGL |
|--------|------|-------|
| Price | $412.35 | $176.82 |
| P/E Ratio | 35.1x | 25.6x |
| Market Cap | $3.1T | $2.2T |
| AI Score | 92 | 83 |
| Signal | Hold | Buy |

**Verdict**: MSFT offers more stability with higher margins and Azure growth (31% YoY), while GOOGL trades at a discount with more upside potential in AI integration. MSFT is better for conservative investors; GOOGL for growth-oriented.`,
    };
  }

  if (lower.includes('portfolio') || lower.includes('holding') || lower.includes('my account')) {
    const pd = getPortfolioData();
    const topHoldings = pd.holdings
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 3);

    const holdingsText = topHoldings.length > 0
      ? topHoldings.map((h, i) => `${i + 1}. ${h.ticker} — $${h.totalValue.toLocaleString()} (${((h.totalValue / pd.totalValue) * 100).toFixed(1)}% allocation)`).join('\n')
      : 'No holdings yet. Add your first position!';

    return {
      type: 'portfolio',
      text: `**Portfolio Summary**

- **Total Value**: $${pd.totalValue.toLocaleString()}
- **Day Gain**: $${pd.dayGain.toFixed(2)} (${pd.dayGainPct.toFixed(2)}%)
- **Buying Power**: $${pd.buyingPower.toLocaleString()}
- **Active Positions**: ${pd.holdings.length}
- **AI Buy Signals**: ${pd.aiSignalsActive}

**Top Holdings**:
${holdingsText}

${pd.holdings.length > 0 ? '**⚠️ Tip**: Use the Portfolio page to add, edit, or remove positions anytime.' : ''}`,
    };
  }

  if (lower.includes('market') || lower.includes('outlook') || lower.includes('economy') || lower.includes('fed')) {
    return {
      type: 'market',
      text: `**Market Outlook — Bullish Near-Term**

**Key Levels**:
- S&P 500: 5,891 (+0.85%) — Approaching all-time highs
- NASDAQ: 18,947 (+1.12%) — Led by semiconductors
- DOW: 43,220 (+0.34%) — Steady industrial performance

**Catalysts This Week**:
1. **Fed Policy** — 72% probability of 25bp rate cut in September
2. **Earnings** — 12 S&P 500 companies reporting
3. **Job Data** — Initial claims Thursday, NFP Friday

**Sector Rotation**: Money flowing into Technology and Healthcare, out of Energy. AI theme remains dominant driver.

My models show **68% probability** of S&P 500 closing above 5,900 this week.`,
    };
  }

  if (foundTicker) {
    const stock = ALL_STOCKS.find((s) => s.ticker === foundTicker);
    if (stock) {
      return {
        type: 'stock',
        text: `**${stock.ticker} — ${stock.company}**

- **Price**: $${stock.price.toFixed(2)} (${stock.change >= 0 ? '+' : ''}${stock.changePct.toFixed(2)}%)
- **Market Cap**: ${stock.marketCap}
- **P/E Ratio**: ${stock.pe || 'N/A'}x
- **Volume**: ${stock.volume}
- **AI Score**: ${stock.aiScore}/100
- **Signal**: **${stock.signal}**

${stock.signal === 'Buy' ? '**Bull Case**: Strong fundamentals and technical momentum support a long position.' : stock.signal === 'Sell' ? '**Bear Case**: Headwinds suggest caution. Consider reducing exposure.' : '**Neutral**: Mixed signals — hold existing positions but avoid new entries.'}

Would you like a deeper dive into ${stock.ticker}'s financials or a comparison with a peer?`,
      };
    }
  }

  const genericResponses = [
    `I'm your AI trading assistant. I can help you with:

- **Stock Analysis** — "Analyze AAPL" or "What do you think about NVDA?"
- **Comparisons** — "Compare MSFT vs GOOGL"
- **Portfolio Review** — "Review my portfolio"
- **Market Outlook** — "What's your market outlook?"
- **Screening** — "Find the best tech stocks to buy"

What would you like to explore?`,

    `Great question! Based on current market conditions, I recommend focusing on:

1. **Quality Growth** — Companies with accelerating revenue and expanding margins
2. **AI Infrastructure** — NVDA, AMD, and the semiconductor supply chain
3. **Defensive Dividends** — JPM, V, and MA for stability

Try asking me about a specific stock or use the Screener to find opportunities matching your criteria.`,

    `I can provide real-time analysis on any stock. My AI models process technical indicators, fundamentals, and sentiment data to generate trading signals.

**Current Top Picks**:
- **NVDA** (Score 94) — AI demand accelerating
- **LLY** (Score 89) — GLP-1 drugs driving massive growth
- **NFLX** (Score 86) — Ad tier scaling beautifully

Ask me about any ticker for a full breakdown!`,
  ];

  // Use a simple hash of the message to pick a stable response
  const hash = message.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const index = hash % genericResponses.length;

  return {
    type: 'generic',
    text: genericResponses[index],
  };
}
