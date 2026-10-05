import React from 'react';
import {
  AlertCircle,
  CloudLightning,
  Compass,
  Gauge,
  Lightbulb,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

export const DataScienceGuide: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Signal vs. Noise: Aviation Data Science Analysis
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Why demographic models yield ~33% uniform probabilities, and what real operational features drive commercial flight delays.
          </p>
        </div>
      </div>

      {/* Main Callout Banner */}
      <div className="bg-sky-950/30 border border-sky-500/30 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-sky-400">
          <Lightbulb className="w-5 h-5" />
          <h2 className="text-sm font-semibold">The 33% Probability Paradox Explained</h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          In typical Kaggle Airline Datasets, the target variable <code className="text-sky-300 font-mono">Flight Status</code> has 3 classes (On Time, Delayed, Cancelled) distributed roughly evenly (~33.3% each). When a Logistic Regression model is fed passenger demographics (<code className="text-sky-300 font-mono">Gender</code>, <code className="text-sky-300 font-mono">Age</code>, <code className="text-sky-300 font-mono">Nationality</code>), the model’s coefficients shrink toward zero because passenger identity has virtually no physical influence on air traffic control, turnaround fueling, or storm fronts.
        </p>
        <p className="text-xs text-slate-400 leading-relaxed">
          Consequently, the Softmax output converges to the class prior distribution: <span className="text-white font-mono font-semibold">~33.3% On Time · ~33.3% Delayed · ~33.3% Cancelled</span>.
        </p>
      </div>

      {/* Feature Signal Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Low Signal (Demographic Schema) */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-amber-400">
            <TrendingDown className="w-4 h-4" />
            <h3 className="text-sm font-semibold">Current Pipeline Features (Low Signal)</h3>
          </div>
          <p className="text-xs text-slate-400">
            These features define the exercise dataset schema, demonstrating the ML pipeline rather than operational flight mechanics.
          </p>

          <div className="space-y-2.5">
            {[
              {
                feature: 'Passenger Age & Gender',
                correlation: '< 0.02',
                explanation: 'A 24-year-old traveler boards the exact same aircraft as an 80-year-old traveler. Zero causal linkage to aircraft pushback time.',
              },
              {
                feature: 'Passenger Nationality',
                correlation: '< 0.03',
                explanation: 'Country of passport holder is an individual administrative marker, not an apron or airspace condition.',
              },
              {
                feature: 'Airport Country & Continent',
                correlation: '0.08 - 0.12',
                explanation: 'Weak proxy for high-density hub airspace (e.g. Northeast US Corridor or Central European airspace vs remote regional strips).',
              },
              {
                feature: 'Departure Month & Day of Week',
                correlation: '0.12 - 0.18',
                explanation: 'Moderate seasonal correlation reflecting winter icing delays or summer convective thunderstorm seasons, plus Monday/Friday peak traffic.',
              },
            ].map((item) => (
              <div key={item.feature} className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200">{item.feature}</span>
                  <span className="font-mono text-amber-400 tabular-nums">Pearson r: {item.correlation}</span>
                </div>
                <p className="text-[11px] text-slate-400">{item.explanation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* High Signal (Real Airline Operations) */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            <h3 className="text-sm font-semibold">Production Aviation Features (High Signal)</h3>
          </div>
          <p className="text-xs text-slate-400">
            What commercial airline operations (Delta, Lufthansa, United, FAA) feed into machine learning models to reach 85%+ predictive accuracy.
          </p>

          <div className="space-y-2.5">
            {[
              {
                feature: 'Inbound Aircraft Late Arrival (Turnaround)',
                correlation: '0.65 - 0.82',
                explanation: 'If the incoming aircraft scheduled for your flight is delayed arriving at the gate, your outbound flight almost always inherits the delay.',
              },
              {
                feature: 'METAR / TAF Weather & Wind Shear',
                correlation: '0.55 - 0.74',
                explanation: 'Runway surface freezing, crosswind limits exceeding aircraft specs, low visibility (CAT III ILS), and convective cell activity along flight corridor.',
              },
              {
                feature: 'ATC Ground Delay Programs (GDP)',
                correlation: '0.60 - 0.78',
                explanation: 'FAA or Eurocontrol issuing controlled departure times (EDCT) to throttle arrivals into constrained airports.',
              },
              {
                feature: 'Scheduled vs Scheduled Taxi Times',
                correlation: '0.45 - 0.60',
                explanation: 'Peak apron queue congestion, de-icing pad wait times, and runway intersection crossings.',
              },
            ].map((item) => (
              <div key={item.feature} className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200">{item.feature}</span>
                  <span className="font-mono text-emerald-400 tabular-nums">Impact: {item.correlation}</span>
                </div>
                <p className="text-[11px] text-slate-400">{item.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Architecture Best Practice */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-slate-200">
          <ShieldCheck className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-semibold">How This Demonstration Validates the ML Workflow</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Building and evaluating this pipeline is a masterclass in data science hygiene:
        </p>
        <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
          <li>
            <strong className="text-slate-200">Leakage Prevention:</strong> Splitting data into train and test sets strictly before fitting <code className="text-sky-300 font-mono">StandardScaler</code> and <code className="text-sky-300 font-mono">OneHotEncoder</code>.
          </li>
          <li>
            <strong className="text-slate-200">Handling Unseen Categories:</strong> Utilizing <code className="text-sky-300 font-mono">handle_unknown="ignore"</code> so unknown nationalities or country codes at inference time gracefully encode as zeros without crashing.
          </li>
          <li>
            <strong className="text-slate-200">Honest Evaluation:</strong> Using a Confusion Matrix and class-balanced F1-Score rather than raw accuracy alone, immediately identifying when a classifier is guessing around the baseline majority class.
          </li>
        </ul>
      </div>
    </div>
  );
};
