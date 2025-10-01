import { LogOut, Bot } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function DashboardHeader() {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-500 p-2 rounded-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">AI Trading Agent</h1>
            <p className="text-xs text-slate-400">Autonomous Crypto Trading Platform</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-white">{user?.email}</p>
            <p className="text-xs text-slate-400">Authenticated</p>
          </div>
          <button
            onClick={signOut}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
