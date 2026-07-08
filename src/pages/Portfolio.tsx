import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { TrendingUp, AlertTriangle, Lightbulb, Shield, X, Plus, Minus } from 'lucide-react';
import { getPortfolioData, getPortfolioPerformance, getTransactions, getSectorAllocation, getStockAllocation } from '@/services/dataService';

type Tab = 'Holdings' | 'Performance' | 'Allocation' | 'Transactions' | 'AI Insights';
const TABS: Tab[] = ['Holdings', 'Performance', 'Allocation', 'Transactions', 'AI Insights'];

interface ModalState {
  open: boolean;
  type: 'Buy' | 'Sell' | null;
  ticker: string;
  shares: number;
  price: number;
}

const aiInsights = [
  {
    type: 'rebalance' as const,
    title: 'Rebalance Suggestion: Shift 5% from Tech to Healthcare',
    description: 'Your Technology allocation is at 52% — consider trimming NVDA by 10 shares and adding LLY (AI Score 89) to bring sector weight below 45%.',
    confidence: 88,
    icon: TrendingUp,
    color: 'var(--gain-green)',
    bg: 'rgba(16,185,129,0.08)',
    action: 'Rebalance',
  },
  {
    type: 'risk' as const,
    title: 'Risk Alert: Concentrated in MAG7 Stocks',
    description: 'Your top 3 holdings (NVDA, AAPL, MSFT) represent 61% of your portfolio. This concentration increases volatility risk. Consider diversifying into defensive sectors.',
    confidence: 82,
    icon: AlertTriangle,
    color: 'var(--loss-red)',
    bg: 'rgba(239,68,68,0.08)',
    action: 'Review',
  },
  {
    type: 'opportunity' as const,
    title: 'Opportunity: Undervalued Energy Stocks',
    description: 'XOM is trading below its 200-day moving average with improving fundamentals. AI Score of 65 suggests accumulating on weakness. Consider adding 20 shares.',
    confidence: 71,
    icon: Lightbulb,
    color: 'var(--accent-electric)',
    bg: 'rgba(0,240,255,0.08)',
    action: 'Explore',
  },
  {
    type: 'risk' as const,
    title: 'Cash Deployment Opportunity',
    description: 'You have $18,500 in cash (7% of portfolio). With the Fed signaling rate cuts, now may be a good time to deploy into high-quality dividend stocks like V and MA.',
    confidence: 75,
    icon: Shield,
    color: 'var(--accent-purple)',
    bg: 'rgba(139,92,246,0.08)',
    action: 'Deploy',
  },
];

export default function Portfolio() {
  const [activeTab, setActiveTab] = useState<Tab>('Holdings');
  const [portfolio, setPortfolio] = useState(() => getPortfolioData());
  const [perfTimeframe, setPerfTimeframe] = useState('1M');
  const [txFilter, setTxFilter] = useState('All');
  const [modal, setModal] = useState<ModalState>({ open: false, type: null, ticker: '', shares: 0, price: 0 });
  const [dismissedInsights, setDismissedInsights] = useState<Set<number>>(new Set());

  const refreshPortfolio = useCallback(() => {
    setPortfolio(getPortfolioData());
  }, []);

  const perfData = useMemo(() => getPortfolioPerformance(perfTimeframe), [perfTimeframe]);
  const transactions = useMemo(() => getTransactions(txFilter), [txFilter]);
  const sectorAllocation = useMemo(() => getSectorAllocation(), []);
  const stockAllocation = useMemo(() => getStockAllocation(), []);

  const openModal = (type: 'Buy' | 'Sell', ticker: string, price: number) => {
    setModal({ open: true, type, ticker, shares: 0, price });
  };

  const closeModal = () => {
    setModal({ open: false, type: null, ticker: '', shares: 0, price: 0 });
  };

  const handleConfirmTrade = () => {
    if (modal.shares <= 0) return;
    // In a real app, this would call an API to execute the trade
    closeModal();
    refreshPortfolio();
  };

  const filteredInsights = aiInsights.filter((_, i) => !dismissedInsights.has(i));

  const totalPortfolioValue = portfolio.holdings.reduce((s, h) => s + h.totalValue, 0);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="mb-6"
      >
        <h1 className="font-display font-semibold text-[32px] text-text-primary">
          Portfolio
        </h1>
        <div className="flex items-center gap-4 mt-2">
          <span className="font-mono text-[28px] text-text-primary">
            ${totalPortfolioValue.toLocaleString()}
          </span>
          <span className="font-mono text-[13px] text-gain-green">+18.4% YTD</span>
          <button
            onClick={refreshPortfolio}
            className="p-1.5 rounded hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
          >
            <TrendingUp size={14} />
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex gap-1 bg-surface-elevated rounded-full p-1 w-fit mb-6 overflow-x-auto"
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full font-body text-[13px] font-medium transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'bg-surface-glass text-accent-electric border border-border-active'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {tab}
          </button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {/* ─── Holdings ─── */}
        {activeTab === 'Holdings' && (
          <motion.div
            key="holdings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="glass-card overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="data-table-header text-left">Ticker</th>
                    <th className="data-table-header text-right">Shares</th>
                    <th className="data-table-header text-right">Avg Cost</th>
                    <th className="data-table-header text-right">Price</th>
                    <th className="data-table-header text-right">Total Value</th>
                    <th className="data-table-header text-right">P&L</th>
                    <th className="data-table-header text-right">P&L %</th>
                    <th className="data-table-header text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.holdings.map((h) => (
                    <tr key={h.ticker} className="data-table-row">
                      <td className="py-3 px-4">
                        <span className="font-mono text-[13px] font-medium text-text-primary">{h.ticker}</span>
                        <span className="block font-mono text-[10px] text-text-muted">{h.sector}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[13px] text-text-primary">{h.shares}</td>
                      <td className="py-3 px-4 text-right font-mono text-[13px] text-text-secondary">
                        {h.avgCost > 0 ? `$${h.avgCost.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[13px] text-text-primary">
                        {h.currentPrice > 1 ? `$${h.currentPrice.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[13px] text-text-primary">
                        ${h.totalValue.toLocaleString()}
                      </td>
                      <td className={`py-3 px-4 text-right font-mono text-[13px] ${h.pl >= 0 ? 'text-gain-green' : 'text-loss-red'}`}>
                        {h.pl >= 0 ? '+' : ''}{h.pl > 0 ? `$${h.pl.toLocaleString()}` : '-'}
                      </td>
                      <td className={`py-3 px-4 text-right font-mono text-[13px] ${h.plPct > 0 ? 'text-gain-green' : h.plPct < 0 ? 'text-loss-red' : 'text-text-muted'}`}>
                        {h.plPct > 0 ? '+' : ''}{h.plPct.toFixed(1)}%
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          {h.ticker !== 'CASH' && h.currentPrice > 1 && (
                            <>
                              <button
                                onClick={() => openModal('Buy', h.ticker, h.currentPrice)}
                                className="p-1.5 rounded hover:bg-gain-green-dim text-text-muted hover:text-gain-green transition-colors"
                                title="Buy"
                              >
                                <Plus size={14} />
                              </button>
                              <button
                                onClick={() => openModal('Sell', h.ticker, h.currentPrice)}
                                className="p-1.5 rounded hover:bg-[rgba(239,68,68,0.12)] text-text-muted hover:text-loss-red transition-colors"
                                title="Sell"
                              >
                                <Minus size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  <tr className="border-t-2 border-border-subtle bg-surface-elevated">
                    <td className="py-3 px-4 font-mono text-[13px] font-medium text-text-primary">TOTAL</td>
                    <td colSpan={3} />
                    <td className="py-3 px-4 text-right font-mono text-[13px] font-bold text-text-primary">
                      ${totalPortfolioValue.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[13px] text-gain-green">
                      +${portfolio.holdings.filter(h => h.ticker !== 'CASH').reduce((s, h) => s + h.pl, 0).toLocaleString()}
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ─── Performance ─── */}
        {activeTab === 'Performance' && (
          <motion.div
            key="performance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <h3 className="font-display font-semibold text-[18px] text-text-primary">
                  Portfolio vs S&P 500
                </h3>
                <div className="flex gap-1 bg-surface-elevated rounded-full p-1">
                  {['1M', '3M', '6M', '1Y', 'ALL'].map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setPerfTimeframe(tf === 'ALL' ? '1Y' : tf)}
                      className={`px-3 py-1 rounded-full font-body text-[13px] font-medium transition-all ${
                        perfTimeframe === (tf === 'ALL' ? '1Y' : tf)
                          ? 'bg-surface-glass text-accent-electric border border-border-active'
                          : 'text-text-muted hover:text-text-primary'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={perfData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748B' }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} domain={['auto', 'auto']} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '10px',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '11px',
                        color: 'var(--text-primary)',
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                    />
                    <Line type="monotone" dataKey="value" stroke="#00F0FF" strokeWidth={2} dot={false} name="Portfolio" />
                    <Line type="monotone" dataKey="sp500" stroke="#64748B" strokeWidth={1.5} dot={false} strokeDasharray="4 4" name="S&P 500" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-6 mt-4 justify-center">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-0.5 bg-accent-electric" />
                  <span className="font-mono text-[11px] text-text-secondary">Portfolio +18.4%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-0.5 bg-text-muted" style={{ borderTop: '1px dashed #64748B', height: 0 }} />
                  <span className="font-mono text-[11px] text-text-secondary">S&P 500 +12.7%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'CAGR', value: '+18.4%', sub: 'Annual', color: 'var(--gain-green)' },
                { label: 'Sharpe Ratio', value: '1.84', sub: 'Risk-adj', color: 'var(--text-primary)' },
                { label: 'Max Drawdown', value: '-8.2%', sub: 'Since Jan', color: 'var(--loss-red)' },
                { label: 'Alpha', value: '+5.7%', sub: 'vs S&P 500', color: 'var(--accent-electric)' },
                { label: 'Beta', value: '1.12', sub: 'Volatility', color: 'var(--accent-purple)' },
              ].map((m) => (
                <div key={m.label} className="glass-card p-4 text-center">
                  <p className="font-mono text-[11px] text-text-muted mb-1">{m.label}</p>
                  <p className="font-mono text-[20px]" style={{ color: m.color }}>{m.value}</p>
                  <p className="font-mono text-[10px] text-text-muted">{m.sub}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── Allocation ─── */}
        {activeTab === 'Allocation' && (
          <motion.div
            key="allocation"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Sector Donut */}
            <div className="glass-card p-6">
              <h3 className="font-display font-semibold text-[18px] text-text-primary mb-4">
                Sector Allocation
              </h3>
              <div className="h-[280px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sectorAllocation}
                      cx="50%"
                      cy="50%"
                      innerRadius="60%"
                      outerRadius="85%"
                      dataKey="value"
                      stroke="none"
                    >
                      {sectorAllocation.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'var(--surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '10px',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '11px',
                        color: 'var(--text-primary)',
                      }}
                      formatter={(value: number) => [`${value}%`, 'Weight']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="font-mono text-[11px] text-text-muted">Total</span>
                  <span className="font-mono text-[24px] text-text-primary">
                    ${totalPortfolioValue.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {sectorAllocation.map((s) => (
                  <div key={s.name} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="font-mono text-[11px] text-text-secondary">{s.name} {s.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stock Bar Chart */}
            <div className="glass-card p-6">
              <h3 className="font-display font-semibold text-[18px] text-text-primary mb-4">
                Top 10 Holdings
              </h3>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stockAllocation} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} domain={[0, 'auto']} tickFormatter={(v) => `${v}%`} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#94A3B8', fontFamily: 'JetBrains Mono' }} width={50} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '10px',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '11px',
                        color: 'var(--text-primary)',
                      }}
                      formatter={(value: number) => [`${value}%`, 'Weight']}
                    />
                    <Bar dataKey="value" fill="#00F0FF" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── Transactions ─── */}
        {activeTab === 'Transactions' && (
          <motion.div
            key="transactions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="glass-card overflow-hidden"
          >
            <div className="p-4 border-b border-border-subtle flex items-center justify-between flex-wrap gap-3">
              <h3 className="font-display font-semibold text-[18px] text-text-primary">
                Transaction History
              </h3>
              <div className="flex gap-1 bg-surface-elevated rounded-full p-1">
                {['All', 'Buy', 'Sell', 'Dividend'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setTxFilter(type)}
                    className={`px-3 py-1 rounded-full font-body text-[12px] font-medium transition-all ${
                      txFilter === type
                        ? 'bg-surface-glass text-accent-electric border border-border-active'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="data-table-header text-left">Date</th>
                    <th className="data-table-header text-left">Type</th>
                    <th className="data-table-header text-left">Ticker</th>
                    <th className="data-table-header text-right">Shares</th>
                    <th className="data-table-header text-right">Price</th>
                    <th className="data-table-header text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} className="data-table-row">
                      <td className="py-3 px-4 font-mono text-[13px] text-text-secondary">{t.date}</td>
                      <td className="py-3 px-4">
                        <span className={`font-mono text-[11px] px-2 py-0.5 rounded-full ${
                          t.type === 'Buy' ? 'badge-green' : t.type === 'Sell' ? 'badge-red' : 'badge-purple'
                        }`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[13px] text-text-primary">{t.ticker}</td>
                      <td className="py-3 px-4 text-right font-mono text-[13px] text-text-primary">{t.shares || '-'}</td>
                      <td className="py-3 px-4 text-right font-mono text-[13px] text-text-primary">
                        {t.price > 0 ? `$${t.price.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[13px] text-text-primary">
                        ${t.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-text-muted text-body-sm">
                        No transactions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ─── AI Insights ─── */}
        {activeTab === 'AI Insights' && (
          <motion.div
            key="ai-insights"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {filteredInsights.map((insight, i) => {
              const Icon = insight.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="glass-card p-5 hover:-translate-y-0.5 transition-all duration-300"
                  style={{ borderLeft: `3px solid ${insight.color}` }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: insight.bg }}
                    >
                      <Icon size={18} style={{ color: insight.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display font-semibold text-[16px] text-text-primary mb-1">
                        {insight.title}
                      </h4>
                      <p className="text-body-sm text-text-secondary leading-relaxed mb-3">
                        {insight.description}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-text-muted">AI Confidence</span>
                          <div className="w-20 h-1.5 bg-surface-hover rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${insight.confidence}%`,
                                background: `linear-gradient(90deg, var(--accent-purple), var(--accent-electric))`,
                              }}
                            />
                          </div>
                          <span className="font-mono text-[11px] text-accent-electric">{insight.confidence}%</span>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                          <button className="px-3 py-1.5 rounded-lg bg-accent-electric-dim text-accent-electric text-[11px] font-medium hover:bg-accent-electric hover:text-deep-void transition-all">
                            {insight.action}
                          </button>
                          <button
                            onClick={() => setDismissedInsights(prev => new Set([...prev, i]))}
                            className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-text-muted hover:text-text-primary hover:bg-surface-hover transition-all"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {filteredInsights.length === 0 && (
              <div className="text-center py-16 text-text-muted text-body-sm">
                All insights have been dismissed. Check back later for new recommendations.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buy/Sell Modal */}
      <AnimatePresence>
        {modal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-6 w-full max-w-[400px]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-[20px] text-text-primary">
                  {modal.type} {modal.ticker}
                </h3>
                <button onClick={closeModal} className="p-1 rounded hover:bg-surface-hover text-text-muted">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-body-sm">
                  <span className="text-text-muted">Current Price</span>
                  <span className="font-mono text-text-primary">${modal.price.toFixed(2)}</span>
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-text-muted uppercase tracking-wider mb-1.5">
                    Number of Shares
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={modal.shares || ''}
                    onChange={(e) => setModal(prev => ({ ...prev, shares: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2.5 rounded-lg bg-surface-elevated border border-border-subtle text-text-primary text-body-sm focus:outline-none focus:border-border-active transition-colors"
                    placeholder="Enter shares..."
                    autoFocus
                  />
                </div>

                <div className="flex justify-between text-body-sm pt-2 border-t border-border-subtle">
                  <span className="text-text-muted">Estimated Total</span>
                  <span className="font-mono text-[18px] text-text-primary">
                    ${(modal.shares * modal.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <button
                  onClick={handleConfirmTrade}
                  disabled={modal.shares <= 0}
                  className={`w-full py-3 rounded-xl font-medium text-body-sm transition-all ${
                    modal.shares > 0
                      ? modal.type === 'Buy'
                        ? 'bg-gain-green text-deep-void hover:opacity-90'
                        : 'bg-loss-red text-white hover:opacity-90'
                      : 'bg-surface-hover text-text-muted cursor-not-allowed'
                  }`}
                >
                  Confirm {modal.type}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
