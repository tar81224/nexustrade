import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Bell,
  SlidersHorizontal,
  Key,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Globe,
  DollarSign,
  Check,
  X,
  Loader2,
  Trash2,
  Download,
  Upload,
  Database,
} from 'lucide-react';
import { getApiKey, setApiKey, removeApiKey, hasApiKey } from '@/services/apiKeys';
import type { ApiProvider } from '@/services/apiKeys';

type SettingsTab = 'API Keys' | 'Profile' | 'Notifications' | 'Preferences' | 'Data';

const SETTINGS_NAV: { id: SettingsTab; icon: typeof Key; label: string }[] = [
  { id: 'API Keys', icon: Key, label: 'API Keys' },
  { id: 'Profile', icon: User, label: 'Profile' },
  { id: 'Notifications', icon: Bell, label: 'Notifications' },
  { id: 'Preferences', icon: SlidersHorizontal, label: 'Preferences' },
  { id: 'Data', icon: Database, label: 'Data' },
];

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        enabled ? 'bg-accent-electric' : 'bg-surface-hover'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

interface ApiKeyRowProps {
  provider: ApiProvider;
  label: string;
  helpUrl: string;
  helpText: string;
}

function ApiKeyRow({ provider, label, helpUrl, helpText }: ApiKeyRowProps) {
  const [key, setKey] = useState('');
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [saved, setSaved] = useState(() => hasApiKey(provider));

  useEffect(() => {
    const existing = getApiKey(provider);
    if (existing) setKey(existing);
  }, [provider]);

  const handleSave = () => {
    if (key.trim()) {
      setApiKey(provider, key.trim());
      setSaved(true);
    } else {
      removeApiKey(provider);
      setSaved(false);
    }
  };

  const handleTest = () => {
    setStatus('testing');
    setTimeout(() => {
      setStatus(key.trim().length > 0 ? 'success' : 'error');
      setTimeout(() => setStatus('idle'), 3000);
    }, 1000);
  };

  const handleRemove = () => {
    removeApiKey(provider);
    setKey('');
    setSaved(false);
    setStatus('idle');
  };

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-[18px] text-text-primary">{label}</h3>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-[11px] font-mono text-gain-green">
              <Check size={12} />
              Saved
            </span>
          )}
          <span className={`w-2.5 h-2.5 rounded-full ${
            status === 'success' ? 'bg-gain-green' : status === 'error' ? 'bg-loss-red' : saved ? 'bg-gain-green' : 'bg-text-muted'
          }`} />
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type={show ? 'text' : 'password'}
            value={key}
            onChange={(e) => { setKey(e.target.value); setSaved(false); }}
            placeholder={`Enter your ${label} API key...`}
            className="w-full px-4 py-2.5 pr-10 rounded-lg bg-surface-elevated border border-border-subtle text-text-primary text-body-sm placeholder:text-text-muted focus:outline-none focus:border-border-active transition-colors font-mono"
          />
          <button
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2.5 rounded-lg bg-accent-electric-dim text-accent-electric text-[13px] font-medium hover:bg-accent-electric hover:text-deep-void transition-all"
        >
          Save
        </button>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-[11px] text-text-muted">
          {helpText}{' '}
          <a href={helpUrl} target="_blank" rel="noopener noreferrer" className="text-accent-electric hover:underline">
            Get your key here
          </a>
        </p>
        <div className="flex items-center gap-2">
          {saved && (
            <button
              onClick={handleRemove}
              className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-text-muted hover:text-loss-red hover:bg-surface-hover transition-all"
            >
              Remove
            </button>
          )}
          <button
            onClick={handleTest}
            disabled={status === 'testing'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-subtle text-[12px] font-medium text-text-secondary hover:text-accent-electric hover:border-border-active transition-all disabled:opacity-50"
          >
            {status === 'testing' && <Loader2 size={12} className="animate-spin" />}
            {status === 'success' && <Check size={12} className="text-gain-green" />}
            {status === 'error' && <X size={12} className="text-loss-red" />}
            {status === 'testing' ? 'Testing...' : status === 'success' ? 'Connected' : status === 'error' ? 'Failed' : 'Test Connection'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('API Keys');

  // Profile state
  const [name, setName] = useState(() => localStorage.getItem('nexustrade_profile_name') || 'Trader One');
  const [email, setEmail] = useState(() => localStorage.getItem('nexustrade_profile_email') || 'trader@nexustrade.app');
  const [bio, setBio] = useState(() => localStorage.getItem('nexustrade_profile_bio') || 'Active trader focused on tech stocks and AI-driven strategies.');
  const [profileSaved, setProfileSaved] = useState(false);

  // Notifications state
  const [priceAlerts, setPriceAlerts] = useState(() => localStorage.getItem('nexustrade_notif_price') !== 'false');
  const [newsAlerts, setNewsAlerts] = useState(() => localStorage.getItem('nexustrade_notif_news') !== 'false');
  const [aiSignalAlerts, setAiSignalAlerts] = useState(() => localStorage.getItem('nexustrade_notif_signals') !== 'false');
  const [marketAlerts, setMarketAlerts] = useState(() => localStorage.getItem('nexustrade_notif_market') === 'true');
  const [weeklySummary, setWeeklySummary] = useState(() => localStorage.getItem('nexustrade_notif_weekly') !== 'false');
  const [emailDelivery, setEmailDelivery] = useState(() => localStorage.getItem('nexustrade_deliv_email') !== 'false');
  const [pushDelivery, setPushDelivery] = useState(() => localStorage.getItem('nexustrade_deliv_push') !== 'false');
  const [smsDelivery, setSmsDelivery] = useState(() => localStorage.getItem('nexustrade_deliv_sms') === 'true');

  // Preferences state
  const [theme, setTheme] = useState(() => localStorage.getItem('nexustrade_pref_theme') || 'Dark');
  const [currency, setCurrency] = useState(() => localStorage.getItem('nexustrade_pref_currency') || 'USD');
  const [timezone, setTimezone] = useState(() => localStorage.getItem('nexustrade_pref_timezone') || 'America/New_York');
  const [numberFormat, setNumberFormat] = useState(() => localStorage.getItem('nexustrade_pref_numberfmt') || 'US');

  // Data tab
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const saveProfile = useCallback(() => {
    localStorage.setItem('nexustrade_profile_name', name);
    localStorage.setItem('nexustrade_profile_email', email);
    localStorage.setItem('nexustrade_profile_bio', bio);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  }, [name, email, bio]);

  const saveNotif = useCallback((key: string, value: boolean) => {
    localStorage.setItem(`nexustrade_notif_${key}`, String(value));
  }, []);

  const saveDelivery = useCallback((key: string, value: boolean) => {
    localStorage.setItem(`nexustrade_deliv_${key}`, String(value));
  }, []);

  const savePref = useCallback((key: string, value: string) => {
    localStorage.setItem(`nexustrade_pref_${key}`, value);
  }, []);

  const handleExport = () => {
    const data = {
      profile: { name, email, bio },
      apiKeys: {
        yahoo: hasApiKey('yahoo') ? '***' : null,
        news: hasApiKey('news') ? '***' : null,
        openai: hasApiKey('openai') ? '***' : null,
      },
      preferences: { theme, currency, timezone, numberFormat },
      notifications: { priceAlerts, newsAlerts, aiSignalAlerts, marketAlerts, weeklySummary },
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexustrade-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleClearCache = () => {
    const keysToRemove = Object.keys(localStorage).filter(k =>
      k.startsWith('nexustrade_') && !k.includes('api_') && !k.includes('profile')
    );
    keysToRemove.forEach(k => localStorage.removeItem(k));
    window.location.reload();
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="mb-6"
      >
        <h1 className="font-display font-semibold text-[32px] text-text-primary">Settings</h1>
        <p className="text-body-sm text-text-secondary mt-1">Manage your API keys, profile, and preferences</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Nav */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:w-[220px] flex-shrink-0"
        >
          <div className="glass-card p-2 flex lg:flex-col gap-1 overflow-x-auto">
            {SETTINGS_NAV.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all whitespace-nowrap text-body-sm ${
                    activeTab === item.id
                      ? 'bg-accent-electric-dim text-accent-electric border-l-2 border-accent-electric'
                      : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary border-l-2 border-transparent'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {/* ─── API Keys ─── */}
            {activeTab === 'API Keys' && (
              <motion.div
                key="api-keys"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <h2 className="font-display font-semibold text-[24px] text-text-primary mb-4">API Keys</h2>
                <ApiKeyRow
                  provider="yahoo"
                  label="Yahoo Finance API"
                  helpUrl="https://financeapi.net/"
                  helpText="Used for real-time stock prices, market data, and portfolio tracking."
                />
                <ApiKeyRow
                  provider="news"
                  label="NewsAPI"
                  helpUrl="https://newsapi.org/"
                  helpText="Used for fetching financial news and market analysis articles."
                />
                <ApiKeyRow
                  provider="openai"
                  label="OpenAI API"
                  helpUrl="https://platform.openai.com/"
                  helpText="Used for AI advisor chat, signal generation, and portfolio insights."
                />
              </motion.div>
            )}

            {/* ─── Profile ─── */}
            {activeTab === 'Profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="glass-card p-6 space-y-6"
              >
                <h2 className="font-display font-semibold text-[24px] text-text-primary">Profile</h2>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-deep-void font-bold text-xl"
                    style={{ background: 'var(--gradient-accent)' }}>
                    {name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-body-sm text-text-primary font-medium">Profile Photo</p>
                    <p className="text-body-sm text-text-muted">This will be displayed across the app</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block font-mono text-[11px] text-text-muted uppercase tracking-wider mb-1.5">Display Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-surface-elevated border border-border-subtle text-text-primary text-body-sm focus:outline-none focus:border-border-active transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[11px] text-text-muted uppercase tracking-wider mb-1.5">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-surface-elevated border border-border-subtle text-text-primary text-body-sm focus:outline-none focus:border-border-active transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[11px] text-text-muted uppercase tracking-wider mb-1.5">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-lg bg-surface-elevated border border-border-subtle text-text-primary text-body-sm focus:outline-none focus:border-border-active transition-colors resize-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border-subtle flex items-center gap-3">
                  <button onClick={saveProfile} className="gradient-btn">
                    Save Changes
                  </button>
                  {profileSaved && (
                    <span className="flex items-center gap-1 text-[12px] font-mono text-gain-green">
                      <Check size={14} />
                      Saved successfully
                    </span>
                  )}
                </div>
              </motion.div>
            )}

            {/* ─── Notifications ─── */}
            {activeTab === 'Notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="glass-card p-6">
                  <h2 className="font-display font-semibold text-[24px] text-text-primary mb-4">Alert Types</h2>
                  <div className="space-y-4">
                    {[
                      { label: 'Price Alerts', desc: 'Get notified when stocks hit your target prices', value: priceAlerts, onChange: (v: boolean) => { setPriceAlerts(v); saveNotif('price', v); } },
                      { label: 'News Alerts', desc: 'Breaking news about your watchlist and holdings', value: newsAlerts, onChange: (v: boolean) => { setNewsAlerts(v); saveNotif('news', v); } },
                      { label: 'AI Signals', desc: 'New buy/sell/hold signals from the AI engine', value: aiSignalAlerts, onChange: (v: boolean) => { setAiSignalAlerts(v); saveNotif('signals', v); } },
                      { label: 'Market Open/Close', desc: 'Daily market open and close notifications', value: marketAlerts, onChange: (v: boolean) => { setMarketAlerts(v); saveNotif('market', v); } },
                      { label: 'Weekly Summary', desc: 'Portfolio performance summary every Monday', value: weeklySummary, onChange: (v: boolean) => { setWeeklySummary(v); saveNotif('weekly', v); } },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-body-sm text-text-primary font-medium">{item.label}</p>
                          <p className="text-body-sm text-text-muted">{item.desc}</p>
                        </div>
                        <Toggle enabled={item.value} onChange={item.onChange} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h2 className="font-display font-semibold text-[24px] text-text-primary mb-4">Delivery Method</h2>
                  <div className="space-y-4">
                    {[
                      { label: 'Email', desc: 'Delivered to your registered email', value: emailDelivery, onChange: (v: boolean) => { setEmailDelivery(v); saveDelivery('email', v); } },
                      { label: 'Push Notifications', desc: 'Browser push alerts (when enabled)', value: pushDelivery, onChange: (v: boolean) => { setPushDelivery(v); saveDelivery('push', v); } },
                      { label: 'SMS', desc: 'Text messages to your phone', value: smsDelivery, onChange: (v: boolean) => { setSmsDelivery(v); saveDelivery('sms', v); } },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-body-sm text-text-primary font-medium">{item.label}</p>
                          <p className="text-body-sm text-text-muted">{item.desc}</p>
                        </div>
                        <Toggle enabled={item.value} onChange={item.onChange} />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── Preferences ─── */}
            {activeTab === 'Preferences' && (
              <motion.div
                key="preferences"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="glass-card p-6 space-y-6"
              >
                <h2 className="font-display font-semibold text-[24px] text-text-primary">Preferences</h2>

                {/* Theme */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    {theme === 'Dark' ? <Moon size={16} className="text-text-muted" /> : <Sun size={16} className="text-text-muted" />}
                    <div>
                      <p className="text-body-sm text-text-primary font-medium">Theme</p>
                      <p className="text-body-sm text-text-muted">Choose your preferred appearance</p>
                    </div>
                  </div>
                  <select
                    value={theme}
                    onChange={(e) => { setTheme(e.target.value); savePref('theme', e.target.value); }}
                    className="px-3 py-2 rounded-lg bg-surface-elevated border border-border-subtle text-text-primary text-body-sm focus:outline-none focus:border-border-active cursor-pointer"
                  >
                    <option>Dark</option>
                    <option>Light</option>
                    <option>System</option>
                  </select>
                </div>

                <div className="h-px bg-border-subtle" />

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 font-mono text-[11px] text-text-muted uppercase tracking-wider mb-1.5">
                      <DollarSign size={12} /> Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => { setCurrency(e.target.value); savePref('currency', e.target.value); }}
                      className="w-full px-4 py-2.5 rounded-lg bg-surface-elevated border border-border-subtle text-text-primary text-body-sm focus:outline-none focus:border-border-active"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (&euro;)</option>
                      <option value="GBP">GBP (&pound;)</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 font-mono text-[11px] text-text-muted uppercase tracking-wider mb-1.5">
                      <Globe size={12} /> Timezone
                    </label>
                    <select
                      value={timezone}
                      onChange={(e) => { setTimezone(e.target.value); savePref('timezone', e.target.value); }}
                      className="w-full px-4 py-2.5 rounded-lg bg-surface-elevated border border-border-subtle text-text-primary text-body-sm focus:outline-none focus:border-border-active"
                    >
                      <option value="America/New_York">Eastern (ET)</option>
                      <option value="America/Chicago">Central (CT)</option>
                      <option value="America/Denver">Mountain (MT)</option>
                      <option value="America/Los_Angeles">Pacific (PT)</option>
                      <option value="Europe/London">London (GMT)</option>
                      <option value="Asia/Tokyo">Tokyo (JST)</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 font-mono text-[11px] text-text-muted uppercase tracking-wider mb-1.5">
                      Number Format
                    </label>
                    <select
                      value={numberFormat}
                      onChange={(e) => { setNumberFormat(e.target.value); savePref('numberfmt', e.target.value); }}
                      className="w-full px-4 py-2.5 rounded-lg bg-surface-elevated border border-border-subtle text-text-primary text-body-sm focus:outline-none focus:border-border-active"
                    >
                      <option value="US">US (1,234.56)</option>
                      <option value="EU">EU (1.234,56)</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── Data ─── */}
            {activeTab === 'Data' && (
              <motion.div
                key="data"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="glass-card p-6">
                  <h2 className="font-display font-semibold text-[24px] text-text-primary mb-4">Data Management</h2>

                  <div className="space-y-4">
                    {/* Export */}
                    <div className="flex items-center justify-between p-4 bg-surface-elevated rounded-lg">
                      <div>
                        <p className="text-body-sm text-text-primary font-medium">Export Data</p>
                        <p className="text-body-sm text-text-muted">Download all your settings and preferences as JSON</p>
                      </div>
                      <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-electric-dim text-accent-electric text-[13px] font-medium hover:bg-accent-electric hover:text-deep-void transition-all"
                      >
                        <Download size={16} />
                        Export
                      </button>
                    </div>

                    {/* Import */}
                    <div className="flex items-center justify-between p-4 bg-surface-elevated rounded-lg">
                      <div>
                        <p className="text-body-sm text-text-primary font-medium">Import Data</p>
                        <p className="text-body-sm text-text-muted">Restore from a previously exported file</p>
                      </div>
                      <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-elevated border border-border-subtle text-text-secondary hover:text-accent-electric hover:border-border-active transition-all text-[13px] font-medium cursor-pointer">
                        <Upload size={16} />
                        Import
                        <input
                          type="file"
                          accept=".json"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              try {
                                const data = JSON.parse(ev.target?.result as string);
                                if (data.profile) {
                                  setName(data.profile.name || name);
                                  setEmail(data.profile.email || email);
                                  setBio(data.profile.bio || bio);
                                }
                                if (data.preferences) {
                                  setTheme(data.preferences.theme || theme);
                                  setCurrency(data.preferences.currency || currency);
                                  setTimezone(data.preferences.timezone || timezone);
                                  setNumberFormat(data.preferences.numberFormat || numberFormat);
                                }
                                alert('Settings imported successfully!');
                              } catch {
                                alert('Invalid file format');
                              }
                            };
                            reader.readAsText(file);
                          }}
                        />
                      </label>
                    </div>

                    {/* Clear Cache */}
                    <div className="flex items-center justify-between p-4 bg-surface-elevated rounded-lg">
                      <div>
                        <p className="text-body-sm text-text-primary font-medium">Clear Cache</p>
                        <p className="text-body-sm text-text-muted">Remove cached data and temporary files</p>
                      </div>
                      <button
                        onClick={handleClearCache}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-elevated border border-border-subtle text-text-secondary hover:text-accent-electric hover:border-border-active transition-all text-[13px] font-medium"
                      >
                        <Trash2 size={16} />
                        Clear Cache
                      </button>
                    </div>

                    {/* Reset All */}
                    <div className="flex items-center justify-between p-4 rounded-lg border border-loss-red/25" style={{ background: 'rgba(239,68,68,0.06)' }}>
                      <div>
                        <p className="text-body-sm font-medium text-loss-red">Reset All Data</p>
                        <p className="text-body-sm text-text-muted">This will permanently delete all your data and settings</p>
                      </div>
                      <button
                        onClick={() => setShowResetConfirm(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[rgba(239,68,68,0.12)] text-loss-red text-[13px] font-medium hover:bg-loss-red hover:text-white transition-all"
                      >
                        <Trash2 size={16} />
                        Reset
                      </button>
                    </div>
                  </div>
                </div>

                {/* Reset Confirmation Dialog */}
                {showResetConfirm && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={() => setShowResetConfirm(false)}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={(e) => e.stopPropagation()}
                      className="glass-card p-6 w-full max-w-[400px]"
                    >
                      <h3 className="font-display font-semibold text-[20px] text-text-primary mb-2">
                        Reset All Data?
                      </h3>
                      <p className="text-body-sm text-text-secondary mb-6">
                        This will permanently delete all your settings, API keys, watchlist, and preferences. This action cannot be undone.
                      </p>
                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => setShowResetConfirm(false)}
                          className="px-4 py-2 rounded-lg border border-border-subtle text-text-secondary hover:text-text-primary transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleReset}
                          className="px-4 py-2 rounded-lg bg-loss-red text-white hover:opacity-90 transition-opacity"
                        >
                          Reset Everything
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
