/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Navbar, AppTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { PredictorView } from './components/PredictorView';
import { DatasetExplorer } from './components/DatasetExplorer';
import { INITIAL_DATASET, generateSyntheticAirlineDataset } from './data/airlineDataset';
import { FlightDelayPipeline } from './ml/logisticRegression';
import { AirlineDataRecord, FlightInput, ModelMetrics, PredictionResult } from './types';
import { testConnection } from './firebase/config';
import { savePrediction } from './firebase/firestoreService';
import { checkBackendHealth, predictViaBackend } from './services/backendApi';
import { CheckCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [dataset, setDataset] = useState<AirlineDataRecord[]>(INITIAL_DATASET);
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [lastPrediction, setLastPrediction] = useState<PredictionResult | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [useBackendMode, setUseBackendMode] = useState<boolean>(true);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(true);

  // Validate connection to Firestore on boot as mandated by skill guidelines
  useEffect(() => {
    testConnection().catch((err) => {
      console.warn('Firestore boot connection validation:', err);
    });
    // Check backend health
    checkBackendHealth().then((h) => {
      setIsBackendOnline(h !== null && h.status === 'online');
    });
  }, []);

  // Maintain singleton instance of the Scikit-Learn equivalent Pipeline for client-side fallback
  const pipeline = useMemo(() => new FlightDelayPipeline(), []);

  // Train the model on initial mount or when dataset changes
  useEffect(() => {
    setIsTraining(true);
    try {
      const computedMetrics = pipeline.train(dataset, {
        testSplit: 0.2,
        iterations: 350,
        regularizationC: 1.0,
        features: {
          gender: true,
          age: true,
          nationality: true,
          airportCountryCode: true,
          airportContinent: true,
          depMonth: true,
          depDayOfWeek: true,
        },
      });
      setMetrics(computedMetrics);

      // Run initial default prediction so the prediction tab has live results
      const initialPrediction = pipeline.predict({
        gender: 'Male',
        age: 35,
        nationality: 'United States',
        airportCountryCode: 'US',
        airportContinent: 'NA',
        departureDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
      });
      setLastPrediction(initialPrediction);
    } catch (err) {
      console.error('Initial model training failed:', err);
    } finally {
      setIsTraining(false);
    }
  }, [pipeline, dataset]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Prediction executor: supports Express Backend (/api/predict) or client-side engine
  const handlePredict = async (input: FlightInput): Promise<PredictionResult> => {
    if (useBackendMode) {
      try {
        const resp = await predictViaBackend(input);
        setLastPrediction(resp.result);
        showToast(`Prediction served by Express backend (${resp.backendInfo.executionTimeMs}ms)`);
        return resp.result;
      } catch (err) {
        console.warn('Backend API unavailable, using in-browser pipeline fallback:', err);
      }
    }
    const res = pipeline.predict(input);
    setLastPrediction(res);
    return res;
  };

  const handleUploadCsv = (records: AirlineDataRecord[]) => {
    setDataset(records);
    showToast(`Loaded ${records.length} records from uploaded CSV.`);
  };

  const handleResetDefault = () => {
    const refreshed = generateSyntheticAirlineDataset(360);
    setDataset(refreshed);
    showToast('Reset dataset to default 360 flight records.');
  };

  // Save prediction to Firestore
  const handleSavePredictionToDb = async (input: FlightInput, pred: PredictionResult) => {
    try {
      await savePrediction(input, pred);
      showToast('Saved flight prediction to Cloud Firestore!');
    } catch (err) {
      console.error('Failed to save prediction:', err);
      showToast('Failed to save to Firestore.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar Contract */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            onGetStarted={() => setActiveTab('predictor')}
            dataset={dataset}
          />
        )}

        {activeTab === 'predictor' && (
          <PredictorView
            onPredict={handlePredict}
            lastResult={lastPrediction}
            onSavePrediction={handleSavePredictionToDb}
            isBackendMode={useBackendMode}
          />
        )}

        {activeTab === 'dataset' && (
          <DatasetExplorer
            dataset={dataset}
            onUploadCsv={handleUploadCsv}
            onResetDefault={handleResetDefault}
          />
        )}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white shadow-xl animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Quiet Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Flight Delay Predictor Studio</span>
            <span aria-hidden="true">·</span>
            <span>Scikit-Learn Logistic Regression Pipeline</span>
            <span aria-hidden="true">·</span>
            <span>Streamlit Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
