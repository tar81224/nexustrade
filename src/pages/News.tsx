import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, TrendingUp, TrendingDown, Minus, RefreshCw, Check, Search } from 'lucide-react';
import { getNews, markArticleRead } from '@/services/dataService';
import type { NewsArticle } from '@/services/dataService';

const FILTER_TABS = ['All', 'Stocks', 'Macro', 'Earnings', 'Crypto', 'Commodities'] as const;
type FilterTab = (typeof FILTER_TABS)[number];

function SentimentIcon({ sentiment }: { sentiment: string }) {
  if (sentiment === 'Bullish') return <TrendingUp size={14} className="text-gain-green" />;
  if (sentiment === 'Bearish') return <TrendingDown size={14} className="text-loss-red" />;
  return <Minus size={14} className="text-text-muted" />;
}

export default function News() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<NewsArticle[]>(() => getNews());
  const [readIds, setReadIds] = useState<Set<number>>(() => {
    const read = new Set<number>();
    articles.forEach((a) => { if (a.read) read.add(a.id); });
    return read;
  });

  const refreshNews = useCallback(() => {
    const fresh = getNews();
    setArticles(fresh);
    const newRead = new Set<number>();
    fresh.forEach((a) => { if (a.read) newRead.add(a.id); });
    setReadIds(newRead);
  }, []);

  const handleMarkRead = useCallback((id: number) => {
    markArticleRead(id);
    setReadIds((prev) => new Set([...prev, id]));
  }, []);

  const filtered = useMemo(() => {
    let result = [...articles];
    if (activeFilter !== 'All') {
      result = result.filter((a) => a.category === activeFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.headline.toLowerCase().includes(q) ||
          a.source.toLowerCase().includes(q) ||
          a.summary.some((s) => s.toLowerCase().includes(q)) ||
          a.affectedTickers.some((t) => t.ticker.toLowerCase().includes(q))
      );
    }
    return result;
  }, [articles, activeFilter, searchQuery]);

  const unreadCount = articles.filter((a) => !readIds.has(a.id)).length;

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="font-display font-semibold text-[32px] text-text-primary">
              News Center
            </h1>
            <p className="text-body-sm text-text-secondary mt-1">
              {unreadCount} unread articles — AI-powered analysis of market-moving news
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search news..."
                className="pl-9 pr-4 py-2 rounded-lg bg-surface-elevated border border-border-subtle text-text-primary text-body-sm placeholder:text-text-muted focus:outline-none focus:border-border-active transition-colors w-full sm:w-[260px]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  <Minus size={14} />
                </button>
              )}
            </div>
            <button
              onClick={refreshNews}
              className="p-2 rounded-lg bg-surface-elevated border border-border-subtle text-text-muted hover:text-text-primary hover:border-border-active transition-all"
              title="Refresh news"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 bg-surface-elevated rounded-full p-1 w-fit flex-wrap">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-2 rounded-full font-body text-[13px] font-medium transition-all ${
                activeFilter === tab
                  ? 'bg-surface-glass text-accent-electric border border-border-active'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Breaking News Banner */}
      <AnimatePresence>
        {filtered.some((a) => a.breaking) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 rounded-xl border border-loss-red/25 p-4"
            style={{ background: 'rgba(239, 68, 68, 0.06)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-loss-red" />
              <span className="badge-red">BREAKING</span>
              <Clock size={14} className="text-text-muted ml-2" />
              <span className="font-mono text-[11px] text-text-muted">Just now</span>
            </div>
            <h3 className="font-display font-semibold text-[18px] text-text-primary">
              Federal Reserve Signals September Rate Cut as Inflation Cools
            </h3>
            <p className="text-body-sm text-text-secondary mt-1">
              Fed Chair Powell hints at policy pivot; markets rally on dovish signals
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* News Feed */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((article, i) => {
            const isRead = readIds.has(article.id);
            return (
              <motion.article
                key={article.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.4,
                  delay: i * 0.05,
                  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                }}
                className={`glass-card p-5 transition-all duration-300 ${
                  isRead ? 'opacity-60' : 'hover:-translate-y-1'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`${
                      article.category === 'Macro'
                        ? 'badge-purple'
                        : article.category === 'Earnings'
                          ? 'badge-accent'
                          : article.category === 'Crypto'
                            ? 'badge-green'
                            : article.category === 'Commodities'
                              ? 'badge-green'
                              : 'badge-accent'
                    }`}
                  >
                    {article.category.toUpperCase()}
                  </span>
                  <span className="font-mono text-[11px] text-text-muted">
                    {article.source}
                  </span>
                  <span className="font-mono text-[11px] text-text-muted ml-auto">
                    {article.timestamp}
                  </span>
                  {!isRead && (
                    <span className="w-2 h-2 rounded-full bg-accent-electric" />
                  )}
                </div>

                <h3 className="font-display font-semibold text-[18px] text-text-primary mb-2">
                  {article.headline}
                </h3>

                <ul className="flex flex-col gap-1 mb-3">
                  {article.summary.map((point, si) => (
                    <li
                      key={si}
                      className="text-body-sm text-text-secondary flex items-start gap-2"
                    >
                      <span className="text-accent-electric mt-1.5 text-[6px]">&#9654;</span>
                      {point}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Sentiment */}
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface-elevated">
                    <SentimentIcon sentiment={article.sentiment} />
                    <span
                      className={`font-mono text-[11px] ${
                        article.sentiment === 'Bullish'
                          ? 'text-gain-green'
                          : article.sentiment === 'Bearish'
                            ? 'text-loss-red'
                            : 'text-text-muted'
                      }`}
                    >
                      {article.sentiment}
                    </span>
                  </div>

                  {/* Impact Score */}
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[11px] text-text-muted">Impact</span>
                    <div className="w-16 h-1.5 bg-surface-hover rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${article.impact * 10}%`,
                          background:
                            article.impact >= 7
                              ? 'var(--accent-electric)'
                              : article.impact >= 4
                                ? 'var(--accent-purple)'
                                : 'var(--text-muted)',
                        }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-text-muted">
                      {article.impact}/10
                    </span>
                  </div>

                  {/* Affected Tickers */}
                  <div className="flex flex-wrap gap-1.5 ml-auto">
                    {article.affectedTickers.map((t) => (
                      <span
                        key={t.ticker}
                        className={`font-mono text-[11px] px-2 py-0.5 rounded-full ${
                          t.positive
                            ? 'text-gain-green bg-gain-green-dim'
                            : 'text-loss-red bg-[rgba(239,68,68,0.12)]'
                        }`}
                      >
                        {t.ticker} {t.change}
                      </span>
                    ))}
                  </div>

                  {/* Mark as Read */}
                  {!isRead && (
                    <button
                      onClick={() => handleMarkRead(article.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded-full bg-surface-elevated text-text-muted hover:text-accent-electric hover:border-border-active border border-transparent transition-all text-[11px] font-mono"
                    >
                      <Check size={12} />
                      Mark Read
                    </button>
                  )}
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-text-muted text-body-sm">
            No articles match your search
          </div>
        )}
      </div>
    </div>
  );
}
