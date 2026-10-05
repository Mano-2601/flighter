import React from 'react';
import {
  X,
  Sparkles,
  LayoutDashboard,
  Compass,
  Database,
  ArrowRight,
} from 'lucide-react';
import { AviationLogo } from './AviationLogo';

interface FlightOptionsSliderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: 'dashboard' | 'predictor' | 'dataset') => void;
}

export const FlightOptionsSliderDrawer: React.FC<FlightOptionsSliderDrawerProps> = ({
  isOpen,
  onClose,
  onSelectTab,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity animate-fade-in cursor-pointer"
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex">
        <div className="w-screen max-w-sm bg-slate-950 border-r border-slate-800 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
          {/* Header */}
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-white">
                  <AviationLogo className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Flight Studio Navigation
                  </h2>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Quick Workspaces & Predictor
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Options List */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-300">Quick Launch Options</span>
              
              {/* Primary Action Button: Launch Delay Predictor */}
              <button
                onClick={() => {
                  onSelectTab('predictor');
                  onClose();
                }}
                className="w-full p-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-left transition-all flex items-center justify-between cursor-pointer group shadow-lg shadow-sky-950/50 border border-sky-400/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white">
                    <Sparkles className="w-4 h-4 text-sky-200" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Launch Delay Predictor</span>
                    <span className="text-[11px] text-sky-100/90">Real-time ML delay inference</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Secondary Option: Airline Dataset Explorer */}
              <button
                onClick={() => {
                  onSelectTab('dataset');
                  onClose();
                }}
                className="w-full p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-sky-500/40 text-left transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white block">Airline Dataset Explorer</span>
                    <span className="text-[11px] text-slate-400">Table analytics & CSV upload</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
              </button>

              {/* Tertiary Option: Flight Operations Dashboard */}
              <button
                onClick={() => {
                  onSelectTab('dashboard');
                  onClose();
                }}
                className="w-full p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-sky-500/40 text-left transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                    <LayoutDashboard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white block">Operations Dashboard</span>
                    <span className="text-[11px] text-slate-400">Overview, metrics & KPIs</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-slate-800 text-center">
            <p className="text-[11px] text-slate-500 font-mono">
              Scikit-Learn Logistic Regression Pipeline
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
