import React from 'react';
import { PlaneTakeoff, Sparkles } from 'lucide-react';
import { ContinentCode } from '../types';

export interface RoutePreset {
  airlineFullName: string;
  flightNumber: string;
  airportName: string;
  countryCode: string;
  continent: ContinentCode;
  label: string;
  route: string;
}

export const ROUTE_PRESETS: RoutePreset[] = [
  {
    airlineFullName: 'AI - Air India',
    flightNumber: 'AI-101',
    airportName: 'Indira Gandhi Delhi (DEL)',
    countryCode: 'IN',
    continent: 'AS',
    label: 'Delhi → New York',
    route: 'DEL → JFK',
  },
  {
    airlineFullName: '6E - IndiGo',
    flightNumber: '6E-2054',
    airportName: 'Chhatrapati Shivaji Mumbai (BOM)',
    countryCode: 'IN',
    continent: 'AS',
    label: 'Mumbai → Dubai',
    route: 'BOM → DXB',
  },
  {
    airlineFullName: 'DL - Delta Air Lines',
    flightNumber: 'DL-264',
    airportName: 'John F. Kennedy (JFK)',
    countryCode: 'US',
    continent: 'NA',
    label: 'New York → London',
    route: 'JFK → LHR',
  },
  {
    airlineFullName: 'BA - British Airways',
    flightNumber: 'BA-11',
    airportName: 'London Heathrow (LHR)',
    countryCode: 'GB',
    continent: 'EU',
    label: 'London → Singapore',
    route: 'LHR → SIN',
  },
  {
    airlineFullName: 'LH - Lufthansa',
    flightNumber: 'LH-400',
    airportName: 'Frankfurt Airport (FRA)',
    countryCode: 'DE',
    continent: 'EU',
    label: 'Frankfurt → Chicago',
    route: 'FRA → ORD',
  },
  {
    airlineFullName: 'EK - Emirates',
    flightNumber: 'EK-201',
    airportName: 'Dubai International (DXB)',
    countryCode: 'AE',
    continent: 'AS',
    label: 'Dubai → Sydney',
    route: 'DXB → SYD',
  },
];

interface QuickRoutePresetsProps {
  onSelectPreset: (preset: RoutePreset) => void;
  activeFlightNumber: string;
}

export const QuickRoutePresets: React.FC<QuickRoutePresetsProps> = ({
  onSelectPreset,
  activeFlightNumber,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <PlaneTakeoff className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-medium text-slate-300">Quick Test Commercial Routes</span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">1-Click Load</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {ROUTE_PRESETS.map((preset) => {
          const isSelected = activeFlightNumber === preset.flightNumber;
          return (
            <button
              key={preset.flightNumber}
              type="button"
              onClick={() => onSelectPreset(preset)}
              className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-sky-500/10 border-sky-500/80 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-sky-400">{preset.flightNumber}</span>
                <span className="text-[10px] font-mono text-slate-400">{preset.continent}</span>
              </div>
              <div className="mt-1">
                <span className="text-xs font-semibold text-white block truncate">{preset.route}</span>
                <span className="text-[10px] text-slate-400 truncate block">{preset.airlineFullName.split(' - ')[1]}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
