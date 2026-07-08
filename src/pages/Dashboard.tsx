import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Zap,
  Bot,
  RefreshCw,
  Plus,
  X,
  ArrowUpDown,
} from 'lucide-react';
import {
  getPortfolioData,
  getPortfolioPerformance,
  getAISignals,
  getWatchlist,
  getMarketOverview,
} from '@/services/dataService';
import type { Stock, AISignal, MarketIndex } from '@/services/dataService';

const TIMEFRAMES = ['1D', '1W', '1M', '3M', '1Y'] as const;
type Timeframe = (typeof TIMEFRAMES)[number];

function MiniSparkline({ positive }: { positive: boolean }) {
  const data = Array.from({ length: 10 }, () =>
    50 + (positive ? 1 : -1) * Math.random() * 30
  );
  return (
    <div className="w-16 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data.map((v, i) => ({ v, i }))}>
          <Area
            type="monotone"
            dataKey="v"
            stroke={positive ? '#10B981' : '#EF4444'}
            fill={positive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'}
            strokeWidth={1.5}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function MiniAreaChart({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((v, i) => ({ v, i }));
  return (
    <div className="w-24 h-10">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={`miniGrad-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            fill={`url(#miniGrad-${color})`}
            strokeWidth={1.5}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Dashboard() {
  const [timeframe, setTimeframe] = useState<Timeframe>('1M');
  const [portfolio, setPortfolio] = useState(() => getPortfolioData());
  const [chartData, setChartData] = useState(() => getPortfolioPerformance('1M'));
  const [signals, setSignals] = useState<AISignal[]>(() => getAISignals());
  const [watchlist, setWatchlist] = useState<Stock[]>(() => getWatchlist());
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>(() => getMarketOverview());
  const [watchlistSearch, setWatchlistSearch] = useState('');
  const [sortField, setSortField] = useState<'ticker' | 'price' | 'changePct'>('ticker');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showAddInput, setShowAddInput] = useState(false);
  const [addTicker, setAddTicker] = useState('');

  const refreshPortfolio = useCallback(() => {
    setPortfolio(getPortfolioData());
    setChartData(getPortfolioPerformance(timeframe));
  }, [timeframe]);

  const refreshSignals = useCallback(() => {
    setSignals(getAISignals());
  }, []);

  const refreshMarket = useCallback(() => {
    setMarketIndices(getMarketOverview());
  }, []);

  const refreshWatchlist = useCallback(() => {
    setWatchlist(getWatchlist());
  }, []);

  useEffect(() => {
    setChartData(getPortfolioPerformance(timeframe));
  }, [timeframe]);

  // Auto-refresh market every 30s
  useEffect(() => {
    const interval = setInterval(refreshMarket, 30000);
    return () => clearInterval(interval);
  }, [refreshMarket]);

  const handleSort = (field: 'ticker' | 'price' | 'changePct') => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filteredWatchlist = useMemo(() => {
    let result = [...watchlist];
    if (watchlistSearch) {
      const q = watchlistSearch.toLowerCase();
      result = result.filter(
        (s) => s.ticker.toLowerCase().includes(q) || s.company.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      let valA: string | number = a[sortField];
      let valB: string | number = b[sortField];
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortDir === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });
    return result;
  }, [watchlist, watchlistSearch, sortField, sortDir]);

  const handleAddStock = () => {
    if (!addTicker.trim()) return;
    const ticker = addTicker.toUpperCase();
    if (watchlist.find((s) => s.ticker === ticker)) {
      setAddTicker('');
      setShowAddInput(false);
      return;
    }
    // Add as placeholder stock (in real app would fetch data)
    const newStock: Stock = {
      ticker,
      company: ticker,
      sector: 'Unknown',
      price: 100 + Math.random() * 200,
      change: (Math.random() - 0.5) * 10,
      changePct: (Math.random() - 0.5) * 5,
      volume: '1.2M',
      marketCap: '50B',
      marketCapCategory: 'Mid',
      aiScore: Math.floor(Math.random() * 40) + 50,
      signal: Math.random() > 0.5 ? 'Buy' : 'Hold',
      sparkline: Array.from({ length: 10 }, () => 50 + Math.random() * 30),
    };
    setWatchlist((prev) => [...prev, newStock]);
    setAddTicker('');
    setShowAddInput(false);
  };

  const handleRemoveStock = (ticker: string) => {
    setWatchlist((prev) => prev.filter((s) => s.ticker !== ticker));
  };

  const summaryCards = [
    { label: 'Total Value', value: `$${portfolio.totalValue.toLocaleString()}`, change: `${portfolio.dayGain >= 0 ? '+' : ''}$${portfolio.dayGain.toFixed(0)}`, positive: portfolio.dayGain >= 0, icon: DollarSign, onRefresh: refreshPortfolio },
    { label: 'Day Gain/Loss', value: `${portfolio.dayGain >= 0 ? '+' : ''}$${portfolio.dayGain.toFixed(0)}`, change: `${portfolio.dayGainPct >= 0 ? '+' : ''}${portfolio.dayGainPct.toFixed(2)}%`, positive: portfolio.dayGain >= 0, icon: portfolio.dayGain >= 0 ? TrendingUp : TrendingDown, onRefresh: refreshPortfolio },
    { label: 'Buying Power', value: `$${portfolio.buyingPower.toLocaleString()}`, change: '', positive: true, icon: Activity, onRefresh: refreshPortfolio },
    { label: 'AI Signals', value: `${portfolio.aiSignalsActive} Active`, change: 'Buy signals', positive: true, icon: Zap, onRefresh: refreshSignals },
  ];

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="glass-card p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[11px] text-text-muted uppercase tracking-wider">
                  {card.label}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={card.onRefresh}
                    className="p-1 rounded hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw size={12} />
                  </button>
                  <Icon size={16} className="text-text-muted" />
                </div>
              </div>
              <p className="font-mono text-[28px] text-text-primary leading-none">
                {card.value}
              </p>
              {card.change && (
                <p className={`font-mono text-[13px] mt-1 ${card.positive ? 'text-gain-green' : 'text-loss-red'}`}>
                  {card.change}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Main Content: Chart + AI Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="lg:col-span-2 glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h3 className="font-display font-semibold text-[18px] text-text-primary">
                Portfolio Performance
              </h3>
              <p className="font-mono text-[13px] text-text-muted">
                ${portfolio.totalValue.toLocaleString()}{' '}
                <span className={portfolio.dayGain >= 0 ? 'text-gain-green' : 'text-loss-red'}>
                  {portfolio.dayGain >= 0 ? '+' : ''}{portfolio.dayGainPct.toFixed(2)}%
                </span>
              </p>
            </div>
            <div className="flex gap-1 bg-surface-elevated rounded-full p-1">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded-full font-body text-[13px] font-medium transition-all ${
                    timeframe === tf
                      ? 'bg-surface-glass text-accent-electric border border-border-active'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis
                  domain={['dataMin - 5000', 'dataMax + 5000']}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '11px',
                    color: 'var(--text-primary)',
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#10B981"
                  fill="url(#greenGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* AI Signals Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="glass-card p-0 overflow-hidden flex flex-col"
        >
          <div className="p-5 border-b border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={18} className="text-accent-electric" />
              <h3 className="font-display font-semibold text-[18px] text-text-primary">
                AI Signals
              </h3>
              <span className="badge-accent ml-2">Live</span>
            </div>
            <button
              onClick={refreshSignals}
              className="p-1.5 rounded hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
              title="Refresh Signals"
            >
              <RefreshCw size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[400px] scrollbar-thin">
            {signals.map((signal) => (
              <div
                key={signal.id}
                className="flex items-start gap-3 p-4 border-b border-border-subtle hover:bg-surface-hover transition-colors"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    signal.type === 'Buy'
                      ? 'bg-gain-green-dim'
                      : signal.type === 'Sell'
                        ? 'bg-[rgba(239,68,68,0.12)]'
                        : 'bg-accent-electric-dim'
                  }`}
                >
                  {signal.type === 'Buy' ? (
                    <TrendingUp size={14} className="text-gain-green" />
                  ) : signal.type === 'Sell' ? (
                    <TrendingDown size={14} className="text-loss-red" />
                  ) : (
                    <Activity size={14} className="text-accent-electric" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[13px] font-medium text-text-primary">
                      {signal.ticker}
                    </span>
                    <span
                      className={`text-[11px] px-1.5 py-0.5 rounded-full font-mono ${
                        signal.type === 'Buy'
                          ? 'bg-gain-green-dim text-gain-green'
                          : signal.type === 'Sell'
                            ? 'bg-[rgba(239,68,68,0.12)] text-loss-red'
                            : 'bg-accent-electric-dim text-accent-electric'
                      }`}
                    >
                      {signal.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-secondary mt-0.5 leading-tight line-clamp-2">
                    {signal.reason}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-12 h-1 bg-surface-hover rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent-electric"
                        style={{ width: `${signal.confidence}%` }}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-text-muted">
                      {signal.confidence}%
                    </span>
                    <span className="font-mono text-[10px] text-text-muted ml-auto">
                      {signal.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom: Watchlist + Market Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Watchlist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="glass-card overflow-hidden"
        >
          <div className="p-5 border-b border-border-subtle flex items-center justify-between flex-wrap gap-3">
            <h3 className="font-display font-semibold text-[18px] text-text-primary">
              Watchlist
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={refreshWatchlist}
                className="p-1.5 rounded hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
              >
                <RefreshCw size={14} />
              </button>
              {!showAddInput ? (
                <button
                  onClick={() => setShowAddInput(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent-electric-dim text-accent-electric text-[12px] font-medium hover:bg-accent-electric hover:text-deep-void transition-all"
                >
                  <Plus size={14} />
                  Add Stock
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={addTicker}
                    onChange={(e) => setAddTicker(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddStock()}
                    placeholder="Ticker"
                    className="w-20 px-2 py-1 rounded bg-surface-elevated border border-border-subtle text-text-primary text-[12px] font-mono focus:outline-none focus:border-border-active"
                    autoFocus
                  />
                  <button onClick={handleAddStock} className="p-1 rounded hover:bg-surface-hover text-gain-green">
                    <Plus size={14} />
                  </button>
                  <button onClick={() => { setShowAddInput(false); setAddTicker(''); }} className="p-1 rounded hover:bg-surface-hover text-text-muted">
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="p-3 border-b border-border-subtle">
            <input
              type="text"
              placeholder="Search watchlist..."
              value={watchlistSearch}
              onChange={(e) => setWatchlistSearch(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-border-subtle text-text-primary text-body-sm placeholder:text-text-muted focus:outline-none focus:border-border-active transition-colors"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="data-table-header text-left cursor-pointer hover:text-accent-electric" onClick={() => handleSort('ticker')}>
                    <span className="flex items-center gap-1">Ticker <ArrowUpDown size={10} /></span>
                  </th>
                  <th className="data-table-header text-right">Price</th>
                  <th className="data-table-header text-right cursor-pointer hover:text-accent-electric" onClick={() => handleSort('changePct')}>
                    <span className="flex items-center gap-1 justify-end">Change <ArrowUpDown size={10} /></span>
                  </th>
                  <th className="data-table-header text-right">Chart</th>
                  <th className="data-table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWatchlist.map((stock) => (
                  <tr key={stock.ticker} className="data-table-row">
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-mono text-[13px] font-medium text-text-primary">
                          {stock.ticker}
                        </span>
                        <span className="block text-[10px] text-text-muted truncate max-w-[120px]">
                          {stock.company}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[13px] text-text-primary">
                      ${stock.price.toFixed(2)}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono text-[13px] ${stock.changePct >= 0 ? 'text-gain-green' : 'text-loss-red'}`}>
                      {stock.changePct >= 0 ? '+' : ''}{stock.changePct.toFixed(2)}%
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end">
                        <MiniSparkline positive={stock.changePct >= 0} />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleRemoveStock(stock.ticker)}
                        className="p-1 rounded hover:bg-surface-hover text-text-muted hover:text-loss-red transition-colors"
                        title="Remove"
                      >
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredWatchlist.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-text-muted text-body-sm">
                      No stocks match your search
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Market Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="glass-card overflow-hidden"
        >
          <div className="p-5 border-b border-border-subtle flex items-center justify-between">
            <h3 className="font-display font-semibold text-[18px] text-text-primary">
              Market Overview
            </h3>
            <button
              onClick={refreshMarket}
              className="p-1.5 rounded hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
            >
              <RefreshCw size={14} />
            </button>
          </div>
          <div className="p-5 space-y-4">
            {marketIndices.map((market) => (
              <div key={market.name} className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-[13px] text-text-primary font-medium">
                    {market.name}
                  </p>
                  <p className="font-mono text-[11px] text-text-muted">
                    {market.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <MiniAreaChart data={market.history} color={market.changePct >= 0 ? '#10B981' : '#EF4444'} />
                  <div className="text-right">
                    <p className={`font-mono text-[13px] ${market.changePct >= 0 ? 'text-gain-green' : 'text-loss-red'}`}>
                      {market.changePct >= 0 ? '+' : ''}{market.changePct.toFixed(2)}%
                    </p>
                    <p className={`font-mono text-[10px] ${market.changePct >= 0 ? 'text-gain-green' : 'text-loss-red'}`}>
                      {market.change >= 0 ? '+' : ''}{market.change.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
