import { Bot, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Trade {
  id: string;
  asset: string;
  action: 'buy' | 'sell' | 'hold';
  amount: number;
  price: number;
  total_value: number;
  ai_reason: string | null;
  tx_hash: string | null;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

interface AgentConsoleProps {
  lastTrade: Trade | null;
  loading: boolean;
}

export function AgentConsole({ lastTrade, loading }: AgentConsoleProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'buy':
        return <TrendingUp className="w-5 h-5 text-emerald-500" />;
      case 'sell':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-slate-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'buy':
        return 'text-emerald-500';
      case 'sell':
        return 'text-red-500';
      default:
        return 'text-slate-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-1/3"></div>
          <div className="h-24 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <h2 className="text-xl font-bold text-white flex items-center mb-6">
        <Bot className="w-5 h-5 mr-2 text-emerald-500" />
        Agent Console
      </h2>

      {lastTrade ? (
        <div className="space-y-4">
          <div className="flex items-start space-x-4 p-4 bg-slate-700/30 rounded-lg">
            <div className="mt-1">{getActionIcon(lastTrade.action)}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-lg font-semibold capitalize ${getActionColor(lastTrade.action)}`}>
                  {lastTrade.action} {lastTrade.asset}
                </h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  lastTrade.status === 'completed' ? 'bg-emerald-500/20 text-emerald-500' :
                  lastTrade.status === 'failed' ? 'bg-red-500/20 text-red-500' :
                  'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {lastTrade.status}
                </span>
              </div>

              {lastTrade.action !== 'hold' && (
                <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                  <div>
                    <p className="text-slate-400">Amount</p>
                    <p className="text-white font-semibold">{lastTrade.amount.toFixed(4)} {lastTrade.asset}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Price</p>
                    <p className="text-white font-semibold">${lastTrade.price.toLocaleString()}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-slate-400">Total Value</p>
                    <p className="text-white font-semibold">${lastTrade.total_value.toLocaleString()}</p>
                  </div>
                </div>
              )}

              <div className="mb-3">
                <p className="text-xs text-slate-400 mb-1">AI Reasoning</p>
                <p className="text-sm text-white leading-relaxed">{lastTrade.ai_reason || 'No reason provided'}</p>
              </div>

              <div className="flex items-center space-x-4 text-xs text-slate-400">
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDate(lastTrade.created_at)}
                </div>
                {lastTrade.tx_hash && (
                  <a
                    href={`https://goerli.basescan.org/tx/${lastTrade.tx_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-500 hover:text-emerald-400 transition"
                  >
                    View on Explorer →
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Bot className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-sm mb-1">No trades executed yet</p>
          <p className="text-slate-500 text-xs">Click "Run Agent" to start autonomous trading</p>
        </div>
      )}
    </div>
  );
}
