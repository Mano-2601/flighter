import React, { useState } from 'react';
import {
  Activity,
  CheckCircle,
  Cpu,
  Database,
  Layers,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { AirlineDataRecord, ModelMetrics, ModelTrainingConfig } from '../types';

interface ModelTrainerProps {
  metrics: ModelMetrics | null;
  dataset: AirlineDataRecord[];
  onTrain: (config: ModelTrainingConfig) => void;
  isTraining: boolean;
  onSaveCheckpoint?: (config: { testSplit: number; iterations: number; regularizationC: number }) => Promise<void>;
}

export const ModelTrainer: React.FC<ModelTrainerProps> = ({
  metrics,
  dataset,
  onTrain,
  isTraining,
  onSaveCheckpoint,
}) => {
  const [testSplit, setTestSplit] = useState<number>(0.2);
  const [iterations, setIterations] = useState<number>(500);
  const [regularizationC, setRegularizationC] = useState<number>(1.0);
  const [isSavingCheckpoint, setIsSavingCheckpoint] = useState<boolean>(false);
  const [savedCheckpointSuccess, setSavedCheckpointSuccess] = useState<boolean>(false);
  const [features, setFeatures] = useState({
    gender: true,
    age: true,
    nationality: true,
    airportCountryCode: true,
    airportContinent: true,
    depMonth: true,
    depDayOfWeek: true,
  });

  const handleToggleFeature = (key: keyof typeof features) => {
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRunTrain = () => {
    onTrain({
      testSplit,
      iterations,
      regularizationC,
      features,
    });
  };

  const statusLabels = ['On Time', 'Delayed', 'Cancelled'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Scikit-Learn Model & Evaluation
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              ColumnTransformer (OneHotEncoder + StandardScaler) and LogisticRegression pipeline evaluation on the airline dataset.
            </p>
          </div>
          <button
            onClick={handleRunTrain}
            disabled={isTraining}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:opacity-50 rounded-lg transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTraining ? 'animate-spin' : ''}`} />
            <span>{isTraining ? 'Fitting Pipeline...' : 'Re-train Model Pipeline'}</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 font-medium">Test Set Accuracy</span>
            <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
              {(metrics.accuracy * 100).toFixed(2)}%
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">
              Stratified 3-class baseline ~33.3%
            </span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 font-medium">Weighted F1-Score</span>
            <div className="text-2xl font-bold font-mono tabular-nums text-sky-400 mt-1">
              {(metrics.f1Score * 100).toFixed(2)}%
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">Harmonic mean precision/recall</span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 font-medium">Weighted Precision</span>
            <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
              {(metrics.precision * 100).toFixed(2)}%
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">Positive predictive value</span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 font-medium">Test Evaluation Sample</span>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-200 mt-1">
              {metrics.testSetSize}
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">
              of {dataset.length} total airline records
            </span>
          </div>
        </div>
      )}

      {/* Main Grid: Pipeline Config & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Pipeline Configuration */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-slate-200">
              <Sliders className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-semibold">Hyperparameters & Feature Space</h2>
            </div>

            {/* Test Split */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Test Set Ratio (test_size)</span>
                <span className="font-mono tabular-nums text-sky-400 font-semibold">
                  {(testSplit * 100).toFixed(0)}%
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[0.15, 0.2, 0.3].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setTestSplit(val)}
                    className={`py-1.5 px-2 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
                      testSplit === val
                        ? 'bg-sky-500/10 border-sky-500 text-sky-300 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {(val * 100).toFixed(0)}%
                  </button>
                ))}
              </div>
            </div>

            {/* Max Iterations */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Solver Iterations (max_iter)</span>
                <span className="font-mono tabular-nums text-sky-400 font-semibold">{iterations}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[200, 500, 1000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setIterations(val)}
                    className={`py-1.5 px-2 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
                      iterations === val
                        ? 'bg-sky-500/10 border-sky-500 text-sky-300 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Regularization C */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Inverse Regularization (C)</span>
                <span className="font-mono tabular-nums text-sky-400 font-semibold">{regularizationC}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[0.1, 1.0, 10.0].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRegularizationC(val)}
                    className={`py-1.5 px-2 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
                      regularizationC === val
                        ? 'bg-sky-500/10 border-sky-500 text-sky-300 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    C={val}
                  </button>
                ))}
              </div>
            </div>

            {/* Features Included */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <span className="text-xs font-medium text-slate-300 block">Active Pipeline Features</span>
              <div className="space-y-1.5">
                {[
                  { key: 'gender' as const, label: 'Gender', type: 'Categorical · OneHotEncoder' },
                  { key: 'age' as const, label: 'Age', type: 'Numerical · StandardScaler' },
                  { key: 'nationality' as const, label: 'Nationality', type: 'Categorical · OneHotEncoder' },
                  { key: 'airportCountryCode' as const, label: 'Airport Country Code', type: 'Categorical · OneHotEncoder' },
                  { key: 'airportContinent' as const, label: 'Airport Continent', type: 'Categorical · OneHotEncoder' },
                  { key: 'depMonth' as const, label: 'dep_month (1-12)', type: 'Numerical · StandardScaler' },
                  { key: 'depDayOfWeek' as const, label: 'dep_dayofweek (0-6)', type: 'Numerical · StandardScaler' },
                ].map(({ key, label, type }) => (
                  <label
                    key={key}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-colors cursor-pointer text-xs"
                  >
                    <div>
                      <span className="text-slate-200 font-medium block">{label}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{type}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={features[key]}
                      onChange={() => handleToggleFeature(key)}
                      className="accent-sky-500 w-4 h-4 rounded cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Scikit-Learn Pipeline Architecture */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-slate-200">
              <Layers className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-semibold">Python Scikit-Learn Architecture</h3>
            </div>
            <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`preprocess = ColumnTransformer([
    ("cat", OneHotEncoder(handle_unknown="ignore"), 
     ["Gender", "Nationality", "Airport Country Code", "Airport Continent"]),
    ("num", StandardScaler(), 
     ["Age", "dep_month", "dep_dayofweek"])
])

final_pipeline = Pipeline([
    ("preprocess", preprocess),
    ("model", LogisticRegression(max_iter=${iterations}, C=${regularizationC}))
])`}
            </pre>
          </div>
        </div>

        {/* Evaluation Reports & Confusion Matrix */}
        <div className="lg:col-span-7 space-y-5">
          {/* Confusion Matrix */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-200">
                <Activity className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-semibold">3-Class Confusion Matrix (Test Set)</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">Actual vs Predicted</span>
            </div>

            {metrics ? (
              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 text-xs font-semibold text-slate-400 text-left">
                        Actual \ Predicted
                      </th>
                      {statusLabels.map((lbl) => (
                        <th key={lbl} className="p-2 text-xs font-semibold text-slate-300">
                          {lbl}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.confusionMatrix.matrix.map((row, rIdx) => {
                      const actualLabel = statusLabels[rIdx];
                      const totalInRow = row.reduce((a, b) => a + b, 0);

                      return (
                        <tr key={actualLabel} className="border-t border-slate-800/80">
                          <td className="p-2 text-xs font-medium text-slate-300 text-left">
                            {actualLabel}
                            <span className="text-[10px] text-slate-500 font-mono block">
                              (Total: {totalInRow})
                            </span>
                          </td>
                          {row.map((val, cIdx) => {
                            const isDiagonal = rIdx === cIdx;
                            const cellBg = isDiagonal
                              ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40'
                              : 'bg-slate-950 text-slate-400';

                            return (
                              <td key={cIdx} className="p-2">
                                <div className={`py-2 px-3 rounded-lg ${cellBg} font-mono tabular-nums text-sm`}>
                                  {val}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Click "Re-train Model Pipeline" to compute matrix.</p>
            )}
          </div>

          {/* Classification Report per Class */}
          {metrics && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-slate-200">
                Detailed Classification Report
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-medium">
                      <th className="py-2 px-3">Class</th>
                      <th className="py-2 px-3 text-right">Precision</th>
                      <th className="py-2 px-3 text-right">Recall</th>
                      <th className="py-2 px-3 text-right">F1-Score</th>
                      <th className="py-2 px-3 text-right">Support</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {metrics.classReports.map((cr) => (
                      <tr key={cr.status} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-sans font-medium text-slate-200">
                          {cr.status}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-slate-300">
                          {(cr.precision * 100).toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-slate-300">
                          {(cr.recall * 100).toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-sky-400">
                          {(cr.f1 * 100).toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-slate-400">
                          {cr.support}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Model Persistence & Serialization Info */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">
                  Serialized Target Artifact: flight_status_model.pkl
                </span>
                <span className="text-[11px] text-slate-400">
                  Ready to be loaded in Streamlit via joblib.load('flight_status_model.pkl')
                </span>
              </div>
            </div>
            {onSaveCheckpoint && metrics && (
              <button
                onClick={async () => {
                  setIsSavingCheckpoint(true);
                  try {
                    await onSaveCheckpoint({ testSplit, iterations, regularizationC });
                    setSavedCheckpointSuccess(true);
                    setTimeout(() => setSavedCheckpointSuccess(false), 3000);
                  } catch (err) {
                    console.error('Failed to save checkpoint:', err);
                  } finally {
                    setIsSavingCheckpoint(false);
                  }
                }}
                disabled={isSavingCheckpoint}
                className="py-1.5 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
              >
                <Database className="w-3.5 h-3.5 text-sky-400" />
                <span>
                  {savedCheckpointSuccess
                    ? 'Saved to Cloud Database!'
                    : isSavingCheckpoint
                    ? 'Saving...'
                    : 'Save Checkpoint to Database'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
