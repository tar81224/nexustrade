import { Search, Bell, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TopBar() {
  return (
    <header className="fixed top-0 left-0 lg:left-[240px] right-0 h-14 z-40 glass-panel border-b border-border-subtle flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="lg:hidden w-8" /> {/* spacer for mobile brand */}
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-surface-hover">
          <Search className="w-4 h-4" />
        </button>
        <button className="p-2 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-surface-hover relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-loss-red rounded-full" />
        </button>
        <Link
          to="/settings"
          className="w-8 h-8 rounded-full bg-gradient-accent flex items-center justify-center text-deep-void font-semibold text-xs hover:opacity-90 transition-opacity"
        >
          NT
        </Link>
      </div>
    </header>
  );
}
