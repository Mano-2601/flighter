import React, { useState } from 'react';
import {
  AlertTriangle,
  BookmarkCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Database,
  Info,
  Plane,
  Sparkles,
  TrendingUp,
  XCircle,
  ShieldCheck,
} from 'lucide-react';
import { AIRLINES, AIRPORTS, CONTINENTS, COUNTRIES } from '../data/airlineDataset';
import { FlightInput, FlightStatus, PredictionResult } from '../types';
import { AirspaceWeatherWidget } from './AirspaceWeatherWidget';
import { QuickRoutePresets, RoutePreset } from './QuickRoutePresets';

interface PredictorViewProps {
  onPredict: (input: FlightInput) => Promise<PredictionResult> | PredictionResult;
  lastResult: PredictionResult | null;
  onSavePrediction?: (input: FlightInput, result: PredictionResult) => Promise<void>;
  isBackendMode?: boolean;
}

export const PredictorView: React.FC<PredictorViewProps> = ({
  onPredict,
  lastResult,
  onSavePrediction,
  isBackendMode = true,
}) => {
  const [airline, setAirline] = useState<string>('AI - Air India');
  const [flightNumber, setFlightNumber] = useState<string>('AI-101');
  const [airportName, setAirportName] = useState<string>('Indira Gandhi Delhi (DEL)');
  const [countryCode, setCountryCode] = useState<string>('IN');
  const [continent, setContinent] = useState<'NA' | 'EU' | 'AS' | 'OC' | 'AF' | 'SA'>('AS');
  const [departureDate, setDepartureDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });

  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(lastResult);

  // When preset route is selected
  const handleSelectPreset = (preset: RoutePreset) => {
    setAirline(preset.airlineFullName);
    setFlightNumber(preset.flightNumber);
    setAirportName(preset.airportName);
    setCountryCode(preset.countryCode);
    setContinent(preset.continent);
  };

  // When airline changes, synchronize country, continent, flight numbers, and airports
  const handleAirlineChange = (newAirlineFullName: string) => {
    setAirline(newAirlineFullName);
    const found = AIRLINES.find((a) => a.fullName === newAirlineFullName);
    if (found) {
      setCountryCode(found.defaultCountry);
      setContinent(found.defaultContinent);
      setFlightNumber(found.sampleFlightNumbers[0] || `${found.code}-101`);
      const apts = AIRPORTS[found.defaultCountry];
      if (apts && apts.length > 0) {
        setAirportName(apts[0]);
      }
    }
  };

  // When country changes, automatically synchronize continent and airport list
  const handleCountryChange = (newCountryCode: string) => {
    setCountryCode(newCountryCode);
    const found = COUNTRIES.find((c) => c.code === newCountryCode);
    if (found) {
      setContinent(found.continent);
    }
    const apts = AIRPORTS[newCountryCode];
    if (apts && apts.length > 0) {
      setAirportName(apts[0]);
    }
  };

  const handlePredict = async () => {
    setIsCalculating(true);
    try {
      const res = await onPredict({
        airline,
        flightNumber,
        gender: 'Male',
        age: 32,
        nationality: 'India',
        airportCountryCode: countryCode,
        airportContinent: continent,
        departureDate,
      });
      setResult(res);
    } catch (err) {
      console.error('Prediction failed:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  // Derive date metadata
  const parsedDate = new Date(departureDate + 'T12:00:00Z');
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const monthIndex = parsedDate.getUTCMonth();
  const dayOfWeekIndex = (parsedDate.getUTCDay() + 6) % 7;

  const getStatusBadge = (status: FlightStatus) => {
    switch (status) {
      case 'On Time':
        return (
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-xl font-bold tracking-tight">On Time</span>
          </div>
        );
      case 'Delayed':
        return (
          <div className="flex items-center gap-2 text-amber-400">
            <Clock className="w-5 h-5 text-amber-400" />
            <span className="text-xl font-bold tracking-tight">Delayed</span>
          </div>
        );
      case 'Cancelled':
        return (
          <div className="flex items-center gap-2 text-rose-400">
            <XCircle className="w-5 h-5 text-rose-400" />
            <span className="text-xl font-bold tracking-tight">Cancelled</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Flight Delay Predictor
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Predicts On Time, Delayed, or Cancelled status from airline carrier, airport route, and departure schedule.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Operational Engine Active
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Flight Details Inputs */}
        <div className="lg:col-span-6 space-y-5">
          {/* Quick Commercial Route Presets */}
          <QuickRoutePresets
            onSelectPreset={handleSelectPreset}
            activeFlightNumber={flightNumber}
          />

          {/* Flight Details Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 text-slate-200">
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4 text-sky-400" />
                <h2 className="text-sm font-semibold">Flight Schedule & Route Configuration</h2>
              </div>
              <span className="text-[11px] font-mono text-sky-400 bg-sky-950/60 border border-sky-800/60 px-2 py-0.5 rounded font-semibold">
                {airline.split(' - ')[0]}
              </span>
            </div>

            {/* Airline / Carrier Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Airline Carrier</label>
              <select
                value={airline}
                onChange={(e) => handleAirlineChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors font-medium cursor-pointer"
              >
                {AIRLINES.map((a) => (
                  <option key={a.code} value={a.fullName} className="bg-slate-950 text-slate-200">
                    {a.fullName}
                  </option>
                ))}
              </select>
            </div>

            {/* Flight Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Flight Number</label>
              <input
                type="text"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
                placeholder="e.g. AI-101, 6E-2054"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono uppercase focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>

            {/* Departure Airport */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Departure Airport</label>
              <select
                value={airportName}
                onChange={(e) => setAirportName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
              >
                {(AIRPORTS[countryCode] || ['International Airport']).map((apt) => (
                  <option key={apt} value={apt} className="bg-slate-950 text-slate-200">
                    {apt}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Airport Country Code */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Country Code</label>
                <select
                  value={countryCode}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code} className="bg-slate-950 text-slate-200">
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Airport Continent */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Continent</label>
                <select
                  value={continent}
                  onChange={(e) => setContinent(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
                >
                  {CONTINENTS.map((cont) => (
                    <option key={cont.code} value={cont.code} className="bg-slate-950 text-slate-200">
                      {cont.code} ({cont.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Departure Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Departure Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Calendar className="w-3 h-3 text-sky-400" />
                <span>
                  {monthNames[monthIndex]} · {dayNames[dayOfWeekIndex]} (Month {monthIndex + 1})
                </span>
              </div>
            </div>
          </div>

          {/* Predict Button */}
          <button
            onClick={handlePredict}
            disabled={isCalculating}
            className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-semibold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isCalculating ? 'Computing Logistic Regression Pipeline...' : 'Predict Flight Status'}</span>
          </button>

          {/* Airspace METAR Weather Widget */}
          <AirspaceWeatherWidget
            airportName={airportName}
            countryCode={countryCode}
            continent={continent}
            monthIndex={monthIndex}
          />
        </div>

        {/* Right Column: Prediction Results */}
        <div className="lg:col-span-6 space-y-5">
          {/* Prediction Inference Card */}
          {result ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-5 shadow-sm">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Prediction Inference Result
                </span>
                <div className="flex items-center gap-2">
                  {isBackendMode ? (
                    <span className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Express /api/predict
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      In-Browser Engine
                    </span>
                  )}
                </div>
              </div>

              {/* Flight & Airline Info Banner */}
              <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                    <Plane className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-white block text-xs">{airline}</span>
                    <span className="text-[11px] font-mono text-sky-400 font-semibold">{flightNumber}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-300 font-medium block truncate max-w-[160px] sm:max-w-[200px]">
                    {airportName}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {countryCode} · {continent}
                  </span>
                </div>
              </div>

              {/* Predicted Status Card */}
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Predicted Flight Status</span>
                  <div className="mt-1">{getStatusBadge(result.predictedStatus)}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Confidence Score</span>
                  <div className="text-xl font-bold font-mono tabular-nums text-white mt-0.5">
                    {(result.probabilities[result.predictedStatus] * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Probability Distribution Bar Chart */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-slate-300">
                    Class Probability Distribution
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">Multinomial Softmax</span>
                </div>
                <div className="space-y-2.5">
                  {(['On Time', 'Delayed', 'Cancelled'] as FlightStatus[]).map((status) => {
                    const prob = result.probabilities[status];
                    const percent = (prob * 100).toFixed(1);
                    const isWinner = result.predictedStatus === status;

                    let barColor = 'bg-slate-700';
                    let textColor = 'text-slate-300';
                    if (status === 'On Time') {
                      barColor = isWinner ? 'bg-emerald-500' : 'bg-emerald-500/40';
                      textColor = isWinner ? 'text-emerald-400 font-semibold' : 'text-slate-300';
                    } else if (status === 'Delayed') {
                      barColor = isWinner ? 'bg-amber-500' : 'bg-amber-500/40';
                      textColor = isWinner ? 'text-amber-400 font-semibold' : 'text-slate-300';
                    } else {
                      barColor = isWinner ? 'bg-rose-500' : 'bg-rose-500/40';
                      textColor = isWinner ? 'text-rose-400 font-semibold' : 'text-slate-300';
                    }

                    return (
                      <div key={status} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className={textColor}>{status}</span>
                          <span className="font-mono tabular-nums text-slate-300 font-medium">
                            {percent}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Feature Influence Table */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-slate-300">
                    Feature Impact Weights
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">Logistic Regression</span>
                </div>
                <div className="rounded-lg border border-slate-800 overflow-hidden bg-slate-950/60 divide-y divide-slate-800/80">
                  {result.featureContributions.slice(0, 4).map((fc, i) => (
                    <div key={i} className="p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-medium text-slate-300 block">{fc.feature}</span>
                        <span className="text-[11px] text-slate-500">{fc.description}</span>
                      </div>
                      <span className="font-mono tabular-nums text-sky-400 font-semibold shrink-0 ml-2">
                        {fc.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Prediction to Database CTA */}
              {onSavePrediction && (
                <div className="pt-3 border-t border-slate-800/80">
                  <button
                    onClick={async () => {
                      if (!result) return;
                      setIsSaving(true);
                      try {
                        await onSavePrediction(
                          {
                            airline,
                            flightNumber,
                            gender: 'Male',
                            age: 32,
                            nationality: 'India',
                            airportCountryCode: countryCode,
                            airportContinent: continent,
                            departureDate,
                          },
                          result
                        );
                        setSavedSuccess(true);
                        setTimeout(() => setSavedSuccess(false), 3000);
                      } catch (err) {
                        console.error('Save error:', err);
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                    disabled={isSaving}
                    className="w-full py-2.5 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-700/80 hover:border-sky-500/50 text-xs font-semibold text-slate-200 hover:text-white rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {savedSuccess ? (
                      <>
                        <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Saved to Firestore Database!</span>
                      </>
                    ) : (
                      <>
                        <Database className="w-3.5 h-3.5 text-sky-400" />
                        <span>{isSaving ? 'Persisting to Firestore...' : 'Save Prediction to Cloud Database'}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center mx-auto text-slate-400">
                <Clock className="w-6 h-6 text-sky-400" />
              </div>
              <h3 className="text-sm font-semibold text-white">Ready for Flight Inference</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Select a commercial route or configure airline parameters on the left and click "Predict Flight Status".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
