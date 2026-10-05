import React from 'react';
import { CloudRain, Compass, Gauge, Thermometer, Wind, AlertCircle } from 'lucide-react';
import { ContinentCode } from '../types';

interface AirspaceWeatherWidgetProps {
  airportName: string;
  countryCode: string;
  continent: ContinentCode;
  monthIndex: number;
}

export const AirspaceWeatherWidget: React.FC<AirspaceWeatherWidgetProps> = ({
  airportName,
  countryCode,
  continent,
  monthIndex,
}) => {
  // Deterministic simulation based on airport & month for realistic aviation METAR/TAF metrics
  const isWinter = monthIndex === 11 || monthIndex === 0 || monthIndex === 1;
  const isMonsoon = (monthIndex >= 5 && monthIndex <= 8) && (continent === 'AS' || continent === 'AF');
  
  let temperature = isWinter ? (continent === 'EU' || continent === 'NA' ? '3°C' : '22°C') : '28°C';
  let windSpeed = isWinter ? '18 kts (Gusts 26)' : '11 kts';
  let visibility = isMonsoon ? '4,500m (Rain)' : isWinter ? '6,000m (Haze)' : '> 10 km (CAVOK)';
  let slotPressure = isMonsoon || isWinter ? 'Moderate to High' : 'Nominal';
  let runwayCondition = isMonsoon ? 'Wet / De-icing Active' : 'Dry & Clear';

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-semibold text-slate-200">
            Airspace METAR & Runway Conditions
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
          {countryCode} · {continent}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Thermometer className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Surface Temp</span>
          </div>
          <div className="text-xs font-semibold font-mono text-white">{temperature}</div>
        </div>

        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Wind className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>Surface Wind</span>
          </div>
          <div className="text-xs font-semibold font-mono text-white">{windSpeed}</div>
        </div>

        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <CloudRain className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Visibility</span>
          </div>
          <div className="text-xs font-semibold font-mono text-white truncate">{visibility}</div>
        </div>

        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Slot Pressure</span>
          </div>
          <div className="text-xs font-semibold font-mono text-emerald-400">{slotPressure}</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          <span>Runway Status: <strong className="text-slate-300 font-medium">{runwayCondition}</strong></span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">Auto-synced</span>
      </div>
    </div>
  );
};
