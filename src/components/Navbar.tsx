import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Newspaper, Search, Wallet,
  Bot, Settings, Menu, X, Clock, CircleDot
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/news', label: 'News', icon: Newspaper },
  { to: '/screener', label: 'Screener', icon: Search },
  { to: '/portfolio', label: 'Portfolio', icon: Wallet },
  { to: '/ai-advisor', label: 'AI Advisor', icon: Bot },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = time.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-[240px] z-50 glass-panel border-r border-border-subtle hidden lg:flex flex-col">
        {/* Brand */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-2 h-2 bg-accent-electric rounded-sm" />
          <span className="font-display font-semibold text-text-primary tracking-wide">
            NEXUSTRADE
          </span>
        </div>

        {/* Market Status */}
        <div className="px-6 pb-4 flex items-center gap-2 text-xs font-mono">
          <CircleDot className="w-3 h-3 text-gain-green animate-pulse" />
          <span className="text-text-secondary">Market Open</span>
          <span className="text-text-muted ml-auto">{timeStr}</span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-accent-electric-dim text-accent-electric border-l-2 border-accent-electric'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary border-l-2 border-transparent'
                )
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Info */}
        <div className="p-6 border-t border-border-subtle">
          <p className="text-xs text-text-muted">Personal Trading Tool</p>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 z-50 glass-panel border-b border-border-subtle flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-accent-electric rounded-sm" />
          <span className="font-display font-semibold text-text-primary text-sm">
            NEXUSTRADE
          </span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-text-secondary">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-deep-void/95 pt-14">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all',
                    isActive
                      ? 'bg-accent-electric-dim text-accent-electric'
                      : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      {/* Mobile Bottom Tab Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 z-50 glass-panel border-t border-border-subtle flex items-center justify-around">
        {navItems.slice(0, 5).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors',
                isActive ? 'text-accent-electric' : 'text-text-muted hover:text-text-secondary'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px]">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
