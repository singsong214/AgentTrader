import { useState, useEffect, useRef } from 'react';
import { DashboardHeader } from './DashboardHeader';
import { PortfolioSummary } from './PortfolioSummary';
import { NewsFeed } from './NewsFeed';
import { AgentConsole } from './AgentConsole';
import { AgentControls } from './AgentControls';
import { useAgentData } from '../../hooks/useAgentData';

export function Dashboard() {
  const { marketData, news, lastTrade, wallet, loading, isRunning, runAgent } = useAgentData();
  const [autoMode, setAutoMode] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const holdings = marketData
    ? Object.entries(marketData).map(([symbol, data]) => ({
        symbol,
        amount: symbol === 'USDC' ? 1000 : symbol === 'BTC' ? 0.1 : 2,
        price: data.price,
        value: (symbol === 'USDC' ? 1000 : symbol === 'BTC' ? 0.1 : 2) * data.price,
        change24h: data.change24h,
      }))
    : [];

  const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0);

  const handleToggleAutoMode = () => {
    setAutoMode(!autoMode);
  };

  useEffect(() => {
    if (autoMode) {
      intervalRef.current = window.setInterval(() => {
        runAgent();
      }, 10 * 60 * 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoMode, runAgent]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <DashboardHeader />

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <PortfolioSummary
              walletAddress={wallet?.wallet_address || null}
              holdings={holdings}
              totalValue={totalValue}
              loading={loading}
            />

            <AgentConsole lastTrade={lastTrade} loading={loading} />
          </div>

          <div className="space-y-6">
            <AgentControls
              onRunAgent={runAgent}
              isRunning={isRunning}
              autoMode={autoMode}
              onToggleAutoMode={handleToggleAutoMode}
            />

            <NewsFeed articles={news} loading={loading} />
          </div>
        </div>
      </main>
    </div>
  );
}
