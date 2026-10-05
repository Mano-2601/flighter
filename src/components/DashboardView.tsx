import React from 'react';
import {
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Database,
  Gauge,
  Globe2,
  Plane,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Wind,
} from 'lucide-react';
import { AirlineDataRecord } from '../types';

interface DashboardViewProps {
  onGetStarted: () => void;
  dataset: AirlineDataRecord[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onGetStarted,
  dataset,
}) => {
  const totalFlights = dataset.length;
  const onTimeCount = dataset.filter((d) => d.flightStatus === 'On Time').length;
  const delayedCount = dataset.filter((d) => d.flightStatus === 'Delayed').length;
  const cancelledCount = dataset.filter((d) => d.flightStatus === 'Cancelled').length;

  const onTimeRate = totalFlights > 0 ? ((onTimeCount / totalFlights) * 100).toFixed(1) : '58.4';
  const delayRate = totalFlights > 0 ? ((delayedCount / totalFlights) * 100).toFixed(1) : '24.2';
  const cancelRate = totalFlights > 0 ? ((cancelledCount / totalFlights) * 100).toFixed(1) : '17.4';

  const carriers = [
    { code: 'AI', name: 'Air India', hub: 'DEL / BOM', onTime: '68%', reliability: 'High' },
    { code: '6E', name: 'IndiGo', hub: 'DEL / BLR', onTime: '84%', reliability: 'Very High' },
    { code: 'DL', name: 'Delta Air Lines', hub: 'ATL / JFK', onTime: '79%', reliability: 'High' },
    { code: 'BA', name: 'British Airways', hub: 'LHR', onTime: '76%', reliability: 'High' },
    { code: 'LH', name: 'Lufthansa', hub: 'FRA / MUC', onTime: '72%', reliability: 'Moderate' },
    { code: 'EK', name: 'Emirates', hub: 'DXB', onTime: '88%', reliability: 'Very High' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Cockpit Section */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
        {/* Cockpit Background Image with Dark Scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/cockpit_flight_deck_hero_1791207355203.jpg"
            alt="Cockpit Flight Deck"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-40 scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-500/10 via-transparent to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 px-6 py-12 sm:px-10 sm:py-16 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span>Next-Gen Flight Delay Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] text-balance">
            Commercial Flight Operations & Delay Prediction Engine
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            Harness machine learning pipelines to forecast flight delays, runway slot pressure, and schedule risks across global hubs before departure.
          </p>

          {/* Primary Action Button: Get Started */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={onGetStarted}
              className="px-6 py-3.5 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-sky-600/25 transition-all flex items-center gap-2.5 cursor-pointer group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Scikit-Learn Logistic Regression Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Operational KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4.5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Historical Records</span>
            <Database className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
            {totalFlights}
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Commercial Dataset</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4.5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>On-Time Dispatch</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
            {onTimeRate}%
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Global Baseline</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4.5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Delay Index</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-400 mt-1">
            {delayRate}%
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Runway / Slot Congestion</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4.5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Cancellation Rate</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-rose-400 mt-1">
            {cancelRate}%
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Severe Weather / Tech</span>
        </div>
      </div>

      {/* Feature & Capabilities Spotlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          onClick={onGetStarted}
          className="bg-slate-900/40 hover:bg-slate-900/70 border border-slate-800 hover:border-sky-500/50 rounded-xl p-5 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white group-hover:text-sky-300 transition-colors">
              Flight Delay Predictor
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Estimate arrival punctuality, delay likelihood, and cancellation risks by carrier, airport route, and departure dates.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-xs text-sky-400 font-medium">
            <span>Launch Predictor</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Wind className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">
              Airspace METAR & Weather
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Simulates surface wind, visibility, de-icing alerts, and airport congestion indices across major international airspace sectors.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-500">
            Real-Time Slot Engine
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Globe2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">
              Airline Dataset Explorer
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Filter, sort, and export comprehensive airline operational datasets with tabular analytics and CSV ingestion.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-500">
            360 Ingested Records
          </div>
        </div>
      </div>

      {/* Commercial Carrier Reliability Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-semibold text-white">Monitored Commercial Airline Carriers</h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Global Hub Benchmarks</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-2.5">Carrier Code</th>
                <th className="pb-2.5">Airline Name</th>
                <th className="pb-2.5">Primary Hubs</th>
                <th className="pb-2.5 text-right">Avg On-Time</th>
                <th className="pb-2.5 text-right">Reliability Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {carriers.map((c) => (
                <tr key={c.code} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 font-mono font-bold text-sky-400">{c.code}</td>
                  <td className="py-2.5 font-medium text-white">{c.name}</td>
                  <td className="py-2.5 font-mono text-slate-400">{c.hub}</td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-emerald-400">{c.onTime}</td>
                  <td className="py-2.5 text-right">
                    <span className="font-mono text-[11px] text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {c.reliability}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom CTA Banner */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-sky-950/50 via-slate-900/60 to-indigo-950/50 border border-sky-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-base font-semibold text-white">Ready to test a flight departure?</h3>
          <p className="text-xs text-slate-300">
            Launch the interactive predictor to compute real-time probabilities for upcoming commercial flights.
          </p>
        </div>
        <button
          onClick={onGetStarted}
          className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer shrink-0 shadow-md"
        >
          <span>Get Started Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
