import React, { useState } from 'react';
import { AviationLogo } from './AviationLogo';
import { FlightOptionsSliderDrawer } from './FlightOptionsSliderDrawer';

export type AppTab = 'dashboard' | 'predictor' | 'dataset';

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const [isOptionsSliderOpen, setIsOptionsSliderOpen] = useState(false);

  return (
    <>
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: ONLY the Flight Logo is a Button; Text is standard branding */}
          <div className="flex items-center gap-3">
            {/* Flight Logo Button */}
            <button
              onClick={() => setIsOptionsSliderOpen(true)}
              className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-white hover:border-sky-400 hover:bg-sky-500/20 transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95 group"
              title="Click flight logo for menu options"
            >
              <AviationLogo className="w-6 h-6 text-white group-hover:text-sky-300 transition-colors" />
            </button>

            {/* Static Branding Text (Not a Button) */}
            <span className="text-base font-semibold tracking-tight text-white select-none">
              Flight Delay Predictor Studio
            </span>
          </div>

          {/* Zone 3: Live System Status */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>ML Pipeline Live</span>
            </span>
          </div>
        </div>
      </header>

      {/* Flight Navigation Slide-over Drawer */}
      <FlightOptionsSliderDrawer
        isOpen={isOptionsSliderOpen}
        onClose={() => setIsOptionsSliderOpen(false)}
        onSelectTab={setActiveTab}
      />
    </>
  );
};
