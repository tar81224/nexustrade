# NexusTrade

AI-powered personal stock trading assistant with real-time market data, news analysis, portfolio management, and AI advisor.

## Features

- **Dashboard** — Portfolio tracking, performance charts, AI signals feed, watchlist, market overview
- **AI News Center** — Financial news with AI summaries, sentiment analysis, impact scores
- **Stock Screener** — Advanced filters (sector, market cap, AI score, signal), sortable table/grid views
- **Portfolio Management** — Holdings, performance vs S&P 500, allocation charts, transactions, AI insights
- **AI Advisor** — Chat interface for stock analysis, comparisons, portfolio review, market outlook
- **Settings** — API key management (Yahoo Finance, NewsAPI, OpenAI), profile, notifications, preferences

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Recharts (data visualization)
- Framer Motion (animations)
- Three.js (3D particle effects)

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## API Keys

The app works out of the box with realistic mock data. To connect to live data, add your API keys in **Settings → API Keys**:

| Service | Purpose | Get Key |
|---------|---------|---------|
| Yahoo Finance | Stock prices & market data | [financeapi.net](https://financeapi.net) |
| NewsAPI | Live financial news | [newsapi.org](https://newsapi.org) |
| OpenAI | AI summaries & insights | [platform.openai.com](https://platform.openai.com) |

API keys are stored in your browser's localStorage and never leave your device.

## License

MIT
