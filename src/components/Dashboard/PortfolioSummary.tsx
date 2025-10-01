import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';

interface Holding {
  symbol: string;
  amount: number;
  price: number;
  value: number;
  change24h: number;
}

interface PortfolioSummaryProps {
  walletAddress: string | null;
  holdings: Holding[];
  totalValue: number;
  loading: boolean;
}

export function PortfolioSummary({ walletAddress, holdings, totalValue, loading }: PortfolioSummaryProps) {
  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-1/3"></div>
          <div className="h-4 bg-slate-700 rounded w-2/3"></div>
          <div className="h-20 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Wallet className="w-5 h-5 mr-2 text-emerald-500" />
          Portfolio Summary
        </h2>
      </div>

      {walletAddress ? (
        <>
          <div className="mb-6 p-4 bg-slate-700/50 rounded-lg">
            <p className="text-xs text-slate-400 mb-1">Wallet Address</p>
            <p className="text-sm text-white font-mono break-all">{walletAddress}</p>
          </div>

          <div className="mb-6">
            <p className="text-sm text-slate-400 mb-2">Total Portfolio Value</p>
            <p className="text-3xl font-bold text-white">
              ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-300 mb-3">Holdings</p>
            {holdings.length > 0 ? (
              holdings.map((holding) => (
                <div key={holding.symbol} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">{holding.symbol.substring(0, 2)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{holding.symbol}</p>
                      <p className="text-xs text-slate-400">{holding.amount.toFixed(4)} tokens</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">
                      ${holding.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <div className="flex items-center justify-end space-x-1">
                      {holding.change24h >= 0 ? (
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-500" />
                      )}
                      <span className={`text-xs font-medium ${holding.change24h >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {holding.change24h >= 0 ? '+' : ''}{holding.change24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-400 text-sm">No holdings yet</p>
                <p className="text-slate-500 text-xs mt-1">Run the agent to start trading</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <Wallet className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Wallet not initialized</p>
          <p className="text-slate-500 text-xs mt-1">Run the agent to create your wallet</p>
        </div>
      )}
    </div>
  );
}
