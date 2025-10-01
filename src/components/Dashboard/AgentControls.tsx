import { Play, Loader2, Power } from 'lucide-react';

interface AgentControlsProps {
  onRunAgent: () => void;
  isRunning: boolean;
  autoMode: boolean;
  onToggleAutoMode: () => void;
}

export function AgentControls({ onRunAgent, isRunning, autoMode, onToggleAutoMode }: AgentControlsProps) {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Agent Controls</h3>

          <button
            onClick={onRunAgent}
            disabled={isRunning}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition duration-200 flex items-center justify-center space-x-3"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Analyzing Market...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>Run Agent</span>
              </>
            )}
          </button>
        </div>

        <div className="pt-6 border-t border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Power className={`w-5 h-5 ${autoMode ? 'text-emerald-500' : 'text-slate-500'}`} />
              <div>
                <p className="text-sm font-semibold text-white">Auto-Mode</p>
                <p className="text-xs text-slate-400">Run agent every 10 minutes</p>
              </div>
            </div>

            <button
              onClick={onToggleAutoMode}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                autoMode ? 'bg-emerald-500' : 'bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  autoMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {autoMode && (
            <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <p className="text-xs text-emerald-500 flex items-center">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                Auto-mode is active
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
