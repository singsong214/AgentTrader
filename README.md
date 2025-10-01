# AI Trading Agent

An autonomous AI-powered cryptocurrency trading platform that uses GPT-4 to analyze market data and news to make intelligent trading decisions. Built with React, TypeScript, Supabase, and Coinbase AgentKit.

## Overview

AI Trading Agent is a web application that allows users to deploy their own AI-powered crypto trading assistant. The agent autonomously analyzes real-time market prices, recent crypto news, and portfolio state to decide whether to buy, sell, or hold various cryptocurrencies. Users can trigger the agent manually or enable auto-mode for fully autonomous trading at regular intervals.

## Features

### Authentication & User Management
- **Email/Password Authentication**: Secure user registration and login using Supabase Auth
- **User Profiles**: Automatic profile creation upon signup with user metadata
- **Protected Routes**: Dashboard only accessible to authenticated users
- **Session Management**: Persistent sessions with automatic token refresh

### Real-Time Market Data
- **Live Price Feeds**: Real-time cryptocurrency prices from CoinGecko API
- **Multi-Asset Support**: Tracks BTC, ETH, and USDC prices
- **24-Hour Changes**: Displays price movement trends with visual indicators
- **Portfolio Valuation**: Automatic calculation of total portfolio value in USD

### News Integration
- **Crypto News Feed**: Latest headlines from CoinDesk RSS feed
- **Real-Time Updates**: Fetches top 5 most recent crypto news articles
- **Source Attribution**: Each article displays source and publish time
- **External Links**: Direct links to full articles for deeper reading

### AI Decision Engine
- **GPT-4 Integration**: Uses OpenAI's GPT-4 for intelligent market analysis
- **Contextual Analysis**: Considers market data, news sentiment, and portfolio state
- **Structured Decisions**: Returns action (buy/sell/hold), asset, amount, and reasoning
- **Conservative Strategy**: Prioritizes capital preservation and risk management
- **Demo Mode**: Falls back to mock decisions if OpenAI API key not configured

### Trading Agent
- **Manual Execution**: On-demand agent runs with "Run Agent" button
- **Auto-Mode**: Autonomous trading with configurable intervals (default: 10 minutes)
- **Trade Logging**: All decisions stored in database with full audit trail
- **Transaction Tracking**: Stores AI reasoning and transaction details
- **Status Monitoring**: Real-time visibility into agent activity and last trade

### Portfolio Management
- **Wallet Integration**: Each user gets a dedicated crypto wallet (Base Goerli testnet)
- **Holdings Display**: Visual breakdown of all assets with quantities and values
- **Price Tracking**: Current prices and 24-hour change percentages
- **Total Value**: Aggregated portfolio value in USD
- **Wallet Address**: Displays user's wallet address for funding

### User Interface
- **Modern Dashboard**: Clean, dark-themed trading terminal aesthetic
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Real-Time Updates**: Live data refresh without page reloads
- **Loading States**: Skeleton loaders and spinners for better UX
- **Color-Coded Data**: Green for gains, red for losses, clear visual hierarchy
- **Agent Console**: Detailed view of last trade with AI reasoning

## Tech Stack

### Frontend
- **React 18**: Modern UI library with hooks and functional components
- **TypeScript**: Type-safe development with full IDE support
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Lucide React**: Beautiful, consistent icon library

### Backend & Infrastructure
- **Supabase**: Backend-as-a-Service platform providing:
  - PostgreSQL database with real-time capabilities
  - Authentication and user management
  - Edge Functions (serverless Deno runtime)
  - Row Level Security (RLS) for data protection
  - Automatic API generation

### APIs & Services
- **OpenAI GPT-4**: AI decision-making and market analysis
- **CoinGecko API**: Real-time cryptocurrency price data
- **CoinDesk RSS**: Latest crypto news and headlines
- **Coinbase AgentKit**: On-chain operations and wallet management (Base Goerli testnet)

## Architecture

### Database Schema

#### `user_profiles`
Stores user information and extends Supabase auth.users:
- `id` (uuid, PK, FK to auth.users)
- `email` (text)
- `full_name` (text, nullable)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

#### `wallets`
Manages user crypto wallets:
- `id` (uuid, PK)
- `user_id` (uuid, FK to user_profiles)
- `wallet_address` (text, unique)
- `network` (text, default: 'base-goerli')
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

#### `trades`
Records all trading decisions and executions:
- `id` (uuid, PK)
- `user_id` (uuid, FK to user_profiles)
- `wallet_id` (uuid, FK to wallets, nullable)
- `asset` (text, e.g., 'BTC', 'ETH')
- `action` (text, enum: 'buy', 'sell', 'hold')
- `amount` (numeric)
- `price` (numeric)
- `total_value` (numeric)
- `ai_reason` (text, nullable)
- `tx_hash` (text, nullable)
- `status` (text, enum: 'pending', 'completed', 'failed')
- `error_message` (text, nullable)
- `created_at` (timestamptz)

#### `portfolio_snapshots`
Historical portfolio valuations:
- `id` (uuid, PK)
- `user_id` (uuid, FK to user_profiles)
- `total_value_usd` (numeric)
- `holdings` (jsonb)
- `created_at` (timestamptz)

### Row Level Security (RLS)

All tables have RLS enabled with policies ensuring:
- Users can only access their own data
- Authenticated access required for all operations
- Automatic user_id validation on INSERT/UPDATE
- No cross-user data leakage

### Edge Functions

#### `get-market-data`
- **Purpose**: Fetches real-time cryptocurrency prices
- **Data Source**: CoinGecko API
- **Assets**: BTC, ETH, USDC
- **Returns**: Price, 24h change, symbol for each asset
- **Auth**: Requires valid JWT token

#### `get-news`
- **Purpose**: Retrieves latest crypto news headlines
- **Data Source**: CoinDesk RSS feed
- **Returns**: Top 5 articles with title, source, URL, publishedAt
- **Parsing**: Custom XML parser for RSS feed
- **Auth**: Requires valid JWT token

#### `run-agent-decision`
- **Purpose**: Main AI decision-making orchestrator
- **Process**:
  1. Fetches market data and news via internal function calls
  2. Retrieves user's wallet information
  3. Constructs comprehensive prompt for GPT-4
  4. Calls OpenAI API for trading decision
  5. Parses structured response (Action, Asset, Amount, Reason)
  6. Logs trade decision to database
  7. Returns decision to frontend
- **Fallback**: Demo mode if OpenAI API key not configured
- **Auth**: Requires valid JWT token and extracts user from session

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works)
- OpenAI API key (optional, for AI functionality)

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Configuration

1. **Create a Supabase Project**: Visit [supabase.com](https://supabase.com)
2. **Get Credentials**: Find your project URL and anon key in Project Settings > API
3. **Database Migration**: Already applied if using this project (migration file included)
4. **Configure OpenAI Key** (optional but recommended):
   - Go to Project Settings > Edge Functions > Secrets
   - Add secret: `OPENAI_API_KEY` = your OpenAI API key from [platform.openai.com](https://platform.openai.com)

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## How to Use

### Getting Started

1. **Sign Up**: Create an account with email and password
2. **Login**: Access your dashboard after authentication
3. **View Dashboard**: See your portfolio, market data, and news feed

### Running the Agent

#### Manual Mode
1. Click the **"Run Agent"** button in Agent Controls
2. Watch the loading indicator: "Analyzing Market..."
3. View results in Agent Console showing:
   - Action taken (Buy/Sell/Hold)
   - Asset and amount (if applicable)
   - AI's reasoning
   - Trade status and timestamp

#### Auto Mode
1. Toggle the **"Auto-Mode"** switch to ON
2. Agent runs automatically every 10 minutes
3. Green indicator shows "Auto-mode is active"
4. Dashboard updates after each run
5. Toggle OFF to disable autonomous trading

### Understanding the Dashboard

**Portfolio Summary**
- Displays wallet address (created on first agent run)
- Shows total portfolio value in USD
- Lists all holdings with current prices and 24h changes

**Agent Console**
- Shows last trade decision
- Displays AI reasoning
- Links to blockchain explorer for completed transactions

**News Feed**
- Latest 5 crypto news headlines
- Source attribution and publish time
- Click external link icon to read full article

**Agent Controls**
- Manual run button
- Auto-mode toggle switch
- Visual feedback for all states

## Project Structure

```
src/
├── components/
│   ├── Auth/
│   │   ├── LoginForm.tsx           # User login interface
│   │   └── SignUpForm.tsx          # User registration interface
│   └── Dashboard/
│       ├── AgentConsole.tsx        # Last trade display
│       ├── AgentControls.tsx       # Run agent & auto-mode controls
│       ├── Dashboard.tsx           # Main dashboard container
│       ├── DashboardHeader.tsx     # Header with logout
│       ├── NewsFeed.tsx            # Crypto news display
│       └── PortfolioSummary.tsx    # Wallet & holdings display
├── contexts/
│   └── AuthContext.tsx             # Authentication state management
├── hooks/
│   └── useAgentData.ts             # Custom hook for agent operations
├── lib/
│   ├── database.types.ts           # TypeScript types for database
│   └── supabase.ts                 # Supabase client configuration
├── App.tsx                         # Main app component with routing
├── main.tsx                        # React app entry point
└── index.css                       # Global styles

supabase/
├── functions/
│   ├── get-market-data/
│   │   └── index.ts                # Market data Edge Function
│   ├── get-news/
│   │   └── index.ts                # News feed Edge Function
│   └── run-agent-decision/
│       └── index.ts                # AI decision Edge Function
└── migrations/
    └── create_initial_schema.sql   # Database schema migration
```

## Key Features Explained

### AI Decision Making Process

1. **Data Collection**: Agent fetches current market prices and recent news
2. **Context Building**: Constructs prompt with market data, news, and portfolio state
3. **AI Analysis**: GPT-4 analyzes data and makes conservative trading decisions
4. **Structured Output**: Returns action, asset, amount, and detailed reasoning
5. **Validation**: Checks balance availability and applies safety limits
6. **Execution**: Logs decision to database (on-chain execution ready for production)
7. **Feedback**: Updates UI with results and AI reasoning

### Security Features

- **RLS Policies**: Every database query automatically filtered by user_id
- **JWT Authentication**: All Edge Function calls require valid session token
- **No Client Secrets**: API keys never exposed to frontend
- **User Isolation**: Users can only access their own wallets and trades
- **Secure Sessions**: Token refresh handled automatically

### Demo Mode

When OpenAI API key is not configured:
- Agent runs in demo mode
- Returns "Hold" decisions with demo explanation
- All other features work normally
- Useful for testing and development

## Future Enhancements

### Planned Features
- **Coinbase AgentKit Full Integration**: Complete on-chain trading execution
- **Wallet Balance Sync**: Real-time balance updates from blockchain
- **Historical Charts**: Portfolio value tracking over time
- **Advanced Analytics**: Trade performance metrics and statistics
- **Multiple Wallets**: Support for different networks and wallets
- **Custom Trading Strategies**: User-configurable AI parameters
- **Notifications**: Email/SMS alerts for trades and portfolio changes
- **Social Features**: Share trades and strategies with community

### Performance Optimizations
- **Caching Layer**: Redis for market data and news
- **Rate Limiting**: Protect APIs from abuse
- **Batch Operations**: Optimize database queries
- **WebSocket Updates**: Real-time data streaming

## Development

### Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript type checking
```

### Testing

```bash
# Type checking
npm run typecheck

# Build test
npm run build
```

## Troubleshooting

### Agent Returns Demo Mode
- **Cause**: OpenAI API key not configured
- **Solution**: Add `OPENAI_API_KEY` to Supabase Edge Function secrets

### Market Data Not Loading
- **Cause**: CoinGecko API rate limit or network issues
- **Solution**: Wait a few minutes and try again (free tier has limits)

### News Feed Empty
- **Cause**: CoinDesk RSS feed temporarily unavailable
- **Solution**: Check internet connection and retry

### Authentication Errors
- **Cause**: Invalid Supabase credentials
- **Solution**: Verify `.env` file has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

## Contributing

This is a demonstration project. Feel free to fork and customize for your own use.

## License

MIT License - Feel free to use this project for learning and development.

## Disclaimer

This is an educational project for demonstration purposes. It uses testnet (Base Goerli) for blockchain operations. Never use this in production without proper security audits, risk management, and legal compliance. Cryptocurrency trading carries significant financial risk. The AI agent makes autonomous decisions that may result in financial loss. Use at your own risk.

## Support

For issues or questions, please review the troubleshooting section or check the Supabase documentation at [supabase.com/docs](https://supabase.com/docs).

---

**Built with** React, TypeScript, Supabase, OpenAI GPT-4, and Coinbase AgentKit