import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, LayoutGrid, Table2, ArrowUpDown, X, SlidersHorizontal } from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts';
import { getStockData } from '@/services/dataService';

type ViewMode = 'table' | 'grid';
type SortField = 'ticker' | 'price' | 'changePct' | 'volume' | 'marketCap' | 'aiScore' | 'signal';
type SortDir = 'asc' | 'desc';

const SECTORS = ['All', 'Technology', 'Healthcare', 'Finance', 'Energy', 'Consumer Cyclical', 'Consumer Defensive'];
const MARKET_CAPS = ['All', 'Large', 'Mid', 'Small'];
const SIGNAL_TYPES = ['All', 'Buy', 'Hold', 'Sell'];

function MiniSparklineChart({ data, positive }: { data: number[]; positive: boolean }) {
  const chartData = data.map((v, i) => ({ v, i }));
  return (
    <div className="w-20 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
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

function AIScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-[50px] h-1.5 bg-surface-hover rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${score}%`,
            background: `linear-gradient(90deg, var(--accent-purple), var(--accent-electric))`,
          }}
        />
      </div>
      <span className="font-mono text-[11px] text-text-muted w-5">{score}</span>
    </div>
  );
}

export default function Screener() {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('aiScore');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [sector, setSector] = useState('All');
  const [marketCap, setMarketCap] = useState('All');
  const [aiScoreMin, setAiScoreMin] = useState(0);
  const [signalType, setSignalType] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const clearFilters = useCallback(() => {
    setSearch('');
    setSector('All');
    setMarketCap('All');
    setAiScoreMin(0);
    setSignalType('All');
  }, []);

  const hasActiveFilters = search || sector !== 'All' || marketCap !== 'All' || aiScoreMin > 0 || signalType !== 'All';

  const allStocks = useMemo(() => getStockData(), []);

  const filtered = useMemo(() => {
    let result = [...allStocks];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.ticker.toLowerCase().includes(q) ||
          s.company.toLowerCase().includes(q)
      );
    }
    if (sector !== 'All') result = result.filter((s) => s.sector === sector);
    if (marketCap !== 'All') result = result.filter((s) => s.marketCapCategory === marketCap);
    if (signalType !== 'All') result = result.filter((s) => s.signal === signalType);
    if (aiScoreMin > 0) result = result.filter((s) => s.aiScore >= aiScoreMin);

    result.sort((a, b) => {
      let valA: number | string = a[sortField];
      let valB: number | string = b[sortField];
      if (sortField === 'signal') {
        const order = { Buy: 3, Hold: 2, Sell: 1 };
        valA = order[a.signal];
        valB = order[b.signal];
      }
      if (sortField === 'volume') {
        const parse = (v: string) => parseFloat(v.replace(/[MBK]/g, '')) * (v.includes('B') ? 1000 : v.includes('M') ? 1 : 0.001);
        valA = parse(a.volume);
        valB = parse(b.volume);
      }
      if (sortField === 'marketCap') {
        const parse = (v: string) => parseFloat(v.replace(/[TBM]/g, '')) * (v.includes('T') ? 1000 : v.includes('B') ? 1 : 0.001);
        valA = parse(a.marketCap);
        valB = parse(b.marketCap);
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDir === 'asc' ? valA - valB : valB - valA;
      }
      return sortDir === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

    return result;
  }, [allStocks, search, sector, marketCap, signalType, aiScoreMin, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const SortHeader = ({ field, label, align = 'left' }: { field: SortField; label: string; align?: 'left' | 'right' }) => (
    <th
      onClick={() => handleSort(field)}
      className={`data-table-header cursor-pointer hover:text-accent-electric transition-colors select-none ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      <span className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : ''}`}>
        {label}
        {sortField === field && (
          <span className="text-accent-electric text-[10px]">
            {sortDir === 'asc' ? '\u25B2' : '\u25BC'}
          </span>
        )}
        {sortField !== field && <ArrowUpDown size={10} className="text-text-muted opacity-50" />}
      </span>
    </th>
  );

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="mb-6 flex items-center justify-between flex-wrap gap-4"
      >
        <div>
          <h1 className="font-display font-semibold text-[32px] text-text-primary">
            Stock Screener
          </h1>
          <p className="text-body-sm text-text-secondary mt-1">
            {filtered.length} stocks found — Filter and discover with AI-powered scoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex gap-1 bg-surface-elevated rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'table' ? 'bg-surface-glass text-accent-electric' : 'text-text-muted hover:text-text-primary'}`}
            >
              <Table2 size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-surface-glass text-accent-electric' : 'text-text-muted hover:text-text-primary'}`}
            >
              <LayoutGrid size={16} />
            </button>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all text-[13px] font-medium ${
              showFilters || hasActiveFilters
                ? 'bg-accent-electric-dim text-accent-electric border-border-active'
                : 'bg-surface-elevated border-border-subtle text-text-muted hover:text-text-primary'
            }`}
          >
            <SlidersHorizontal size={14} />
            Filters
            {hasActiveFilters && (
              <span className="w-4 h-4 rounded-full bg-accent-electric text-deep-void text-[10px] font-bold flex items-center justify-center">
                !
              </span>
            )}
          </button>
        </div>
      </motion.div>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="glass-card p-4 mb-6"
      >
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search ticker or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface-elevated border border-border-subtle text-text-primary text-body-sm placeholder:text-text-muted focus:outline-none focus:border-border-active transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Dropdowns */}
          <div className="flex flex-wrap gap-2">
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="px-3 py-2 rounded-lg bg-surface-elevated border border-border-subtle text-text-primary text-body-sm focus:outline-none focus:border-border-active cursor-pointer"
            >
              {SECTORS.map((s) => (
                <option key={s} value={s}>{s === 'All' ? 'All Sectors' : s}</option>
              ))}
            </select>
            <select
              value={marketCap}
              onChange={(e) => setMarketCap(e.target.value)}
              className="px-3 py-2 rounded-lg bg-surface-elevated border border-border-subtle text-text-primary text-body-sm focus:outline-none focus:border-border-active cursor-pointer"
            >
              {MARKET_CAPS.map((m) => (
                <option key={m} value={m}>{m === 'All' ? 'Market Cap' : m}</option>
              ))}
            </select>
            <select
              value={signalType}
              onChange={(e) => setSignalType(e.target.value)}
              className="px-3 py-2 rounded-lg bg-surface-elevated border border-border-subtle text-text-primary text-body-sm focus:outline-none focus:border-border-active cursor-pointer"
            >
              {SIGNAL_TYPES.map((s) => (
                <option key={s} value={s}>{s === 'All' ? 'Signal' : s}</option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-[13px] font-medium text-text-muted hover:text-loss-red hover:bg-surface-hover transition-all"
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>

        {/* AI Score Slider */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-border-subtle flex items-center gap-4">
            <span className="font-mono text-[11px] text-text-muted whitespace-nowrap">AI Score Min: {aiScoreMin}</span>
            <input
              type="range"
              min={0}
              max={100}
              value={aiScoreMin}
              onChange={(e) => setAiScoreMin(Number(e.target.value))}
              className="flex-1 h-1.5 bg-surface-hover rounded-full appearance-none cursor-pointer accent-accent-electric"
            />
            <span className="font-mono text-[11px] text-text-muted">100</span>
          </div>
        )}
      </motion.div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle">
                  <SortHeader field="ticker" label="Ticker" />
                  <SortHeader field="price" label="Price" align="right" />
                  <SortHeader field="changePct" label="Change %" align="right" />
                  <SortHeader field="volume" label="Volume" align="right" />
                  <SortHeader field="marketCap" label="Mkt Cap" align="right" />
                  <SortHeader field="aiScore" label="AI Score" align="right" />
                  <SortHeader field="signal" label="Signal" align="right" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((stock, i) => (
                  <motion.tr
                    key={stock.ticker}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.03 }}
                    className="data-table-row border-b border-border-subtle last:border-0"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-mono text-[13px] font-medium text-text-primary">
                          {stock.ticker}
                        </span>
                        <span className="block text-[11px] text-text-muted">{stock.company}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[13px] text-text-primary text-right">
                      ${stock.price.toFixed(2)}
                    </td>
                    <td className={`py-3 px-4 font-mono text-[13px] text-right ${stock.changePct >= 0 ? 'text-gain-green' : 'text-loss-red'}`}>
                      {stock.changePct >= 0 ? '+' : ''}{stock.changePct.toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 font-mono text-[13px] text-text-secondary text-right">
                      {stock.volume}
                    </td>
                    <td className="py-3 px-4 font-mono text-[13px] text-text-secondary text-right">
                      {stock.marketCap}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <AIScoreBar score={stock.aiScore} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`${stock.signal === 'Buy' ? 'badge-green' : stock.signal === 'Hold' ? 'badge-accent' : 'badge-red'}`}>
                        {stock.signal}
                      </span>
                    </td>
                  </motion.tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-text-muted text-body-sm">
                      No stocks match your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border-subtle">
            <span className="font-mono text-[11px] text-text-muted">
              Showing {filtered.length} of {allStocks.length} results
            </span>
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((stock, i) => (
            <motion.div
              key={stock.ticker}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="glass-card p-4 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="font-mono text-[16px] font-medium text-text-primary">{stock.ticker}</span>
                  <span className="block text-[11px] text-text-muted">{stock.company}</span>
                </div>
                <span className={`${stock.signal === 'Buy' ? 'badge-green' : stock.signal === 'Hold' ? 'badge-accent' : 'badge-red'}`}>
                  {stock.signal}
                </span>
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[20px] text-text-primary">${stock.price.toFixed(2)}</span>
                <span className={`font-mono text-[13px] ${stock.changePct >= 0 ? 'text-gain-green' : 'text-loss-red'}`}>
                  {stock.changePct >= 0 ? '+' : ''}{stock.changePct.toFixed(2)}%
                </span>
              </div>

              <MiniSparklineChart data={stock.sparkline} positive={stock.changePct >= 0} />

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-subtle">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-text-muted">AI</span>
                  <AIScoreBar score={stock.aiScore} />
                </div>
                <span className="font-mono text-[10px] text-text-muted">{stock.marketCap}</span>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-text-muted text-body-sm">
              No stocks match your filters
            </div>
          )}
        </div>
      )}
    </div>
  );
}
