import React, { useState, useEffect } from 'react';
import {
  Database,
  Cloud,
  CheckCircle2,
  Trash2,
  RefreshCw,
  LogIn,
  LogOut,
  UploadCloud,
  FileCheck,
  Clock,
  Layers,
  Search,
} from 'lucide-react';
import { auth, databaseConfigInfo, googleProvider } from '../firebase/config';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import {
  deletePrediction,
  fetchModelCheckpoints,
  fetchRecentPredictions,
  SavedModelCheckpointDocument,
  SavedPredictionDocument,
  syncDatasetBatch,
} from '../firebase/firestoreService';
import { AirlineDataRecord } from '../types';

interface DatabaseViewProps {
  dataset: AirlineDataRecord[];
  onDatasetUpdated?: (records: AirlineDataRecord[]) => void;
  onShowToast: (msg: string) => void;
}

export const DatabaseView: React.FC<DatabaseViewProps> = ({
  dataset,
  onShowToast,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [predictions, setPredictions] = useState<SavedPredictionDocument[]>([]);
  const [checkpoints, setCheckpoints] = useState<SavedModelCheckpointDocument[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'predictions' | 'checkpoints'>('predictions');
  const [searchFilter, setSearchFilter] = useState('');

  // Track auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Fetch data
  const loadDatabaseData = async () => {
    setIsLoading(true);
    try {
      const [preds, ckpts] = await Promise.all([
        fetchRecentPredictions(50),
        fetchModelCheckpoints(),
      ]);
      setPredictions(preds);
      setCheckpoints(ckpts);
    } catch (err) {
      console.error('Failed to load database items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDatabaseData();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      onShowToast('Signed in with Google successfully.');
    } catch (err) {
      console.error('Sign-in error:', err);
      onShowToast('Could not complete Google Sign-in.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onShowToast('Signed out of Firebase.');
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  const handleDeletePrediction = async (id: string) => {
    try {
      await deletePrediction(id);
      setPredictions((prev) => prev.filter((p) => p.id !== id));
      onShowToast('Prediction record removed from Firestore.');
    } catch (err) {
      console.error('Failed to delete:', err);
      onShowToast('Error deleting prediction from database.');
    }
  };

  const handleSyncDataset = async () => {
    if (!currentUser) {
      onShowToast('Please sign in to sync datasets to the database.');
      return;
    }
    setIsSyncing(true);
    try {
      const count = await syncDatasetBatch(dataset);
      onShowToast(`Successfully synced ${count} airline records into Firestore /dataset collection!`);
      await loadDatabaseData();
    } catch (err) {
      console.error('Sync failed:', err);
      onShowToast('Failed to sync dataset records to Firestore.');
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredPredictions = predictions.filter((p) => {
    const q = searchFilter.toLowerCase();
    return (
      p.predictedStatus.toLowerCase().includes(q) ||
      p.nationality.toLowerCase().includes(q) ||
      p.airportCountryCode.toLowerCase().includes(q) ||
      p.userEmail?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Database className="w-6 h-6 text-sky-400" />
              <span>Cloud Firestore Database</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Persistent storage for model inference history, trained checkpoint metrics, and synced airline records.
            </p>
          </div>

          {/* Auth Bar */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-slate-300 font-medium">{currentUser.email}</span>
                <button
                  onClick={handleSignOut}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer ml-1"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-sky-400" />
                <span>Sign in with Google</span>
              </button>
            )}

            <button
              onClick={loadDatabaseData}
              disabled={isLoading}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              title="Refresh Firestore collections"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Database Connection & Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Database Status</span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Online & Connected</span>
            </div>
          </div>
          <div className="text-sm font-bold text-white font-mono truncate mt-1">
            {databaseConfigInfo.projectId}
          </div>
          <span className="text-[11px] text-slate-500 font-mono block truncate">
            DB: {databaseConfigInfo.databaseId}
          </span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Persisted Predictions</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-sky-400">
            {predictions.length}
          </div>
          <span className="text-[11px] text-slate-500 block">
            Collection: <code className="text-slate-400 font-mono">/predictions</code>
          </span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Dataset Cloud Sync</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Sync airline dataset rows to Firestore
            </span>
          </div>
          <button
            onClick={handleSyncDataset}
            disabled={isSyncing}
            className="mt-2 w-full py-1.5 px-3 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>{isSyncing ? 'Syncing Records...' : 'Sync Dataset to Cloud'}</span>
          </button>
        </div>
      </div>

      {/* Sub tabs: Predictions vs Model Checkpoints */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('predictions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeSubTab === 'predictions'
                  ? 'bg-slate-800 text-sky-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Saved Predictions ({predictions.length})
            </button>
            <button
              onClick={() => setActiveSubTab('checkpoints')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeSubTab === 'checkpoints'
                  ? 'bg-slate-800 text-sky-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Model Checkpoints ({checkpoints.length})
            </button>
          </div>

          {activeSubTab === 'predictions' && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search predictions..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          )}
        </div>

        {/* Content based on sub-tab */}
        {activeSubTab === 'predictions' ? (
          <div>
            {filteredPredictions.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-medium">
                      <th className="py-2.5 px-3">Date Saved</th>
                      <th className="py-2.5 px-3">Passenger</th>
                      <th className="py-2.5 px-3">Flight / Airport</th>
                      <th className="py-2.5 px-3">Departure Date</th>
                      <th className="py-2.5 px-3 text-right">Predicted Status</th>
                      <th className="py-2.5 px-3 text-right">Confidence</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {filteredPredictions.map((item) => {
                      let statusColor = 'text-emerald-400';
                      if (item.predictedStatus === 'Delayed') statusColor = 'text-amber-400';
                      if (item.predictedStatus === 'Cancelled') statusColor = 'text-rose-400';

                      return (
                        <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-2.5 px-3 text-slate-400">
                            {new Date(item.createdAtIso).toLocaleString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="py-2.5 px-3 font-sans text-slate-200">
                            {item.gender} · {item.age} yrs · {item.nationality}
                          </td>
                          <td className="py-2.5 px-3 font-sans text-slate-300">
                            {item.airportCountryCode} ({item.airportContinent})
                          </td>
                          <td className="py-2.5 px-3 text-slate-300">{item.departureDate}</td>
                          <td className={`py-2.5 px-3 text-right font-sans font-semibold ${statusColor}`}>
                            {item.predictedStatus}
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums text-slate-300">
                            {(item.confidence * 100).toFixed(1)}%
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => handleDeletePrediction(item.id)}
                              className="text-slate-500 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                              title="Delete record from Firestore"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">
                No saved predictions in Firestore yet. Run a prediction on the "Predictor" tab and click "Save to Database".
              </div>
            )}
          </div>
        ) : (
          <div>
            {checkpoints.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-medium">
                      <th className="py-2.5 px-3">Saved Time</th>
                      <th className="py-2.5 px-3 text-right">Accuracy</th>
                      <th className="py-2.5 px-3 text-right">F1-Score</th>
                      <th className="py-2.5 px-3 text-right">Precision</th>
                      <th className="py-2.5 px-3 text-right">Recall</th>
                      <th className="py-2.5 px-3 text-right">Test Size</th>
                      <th className="py-2.5 px-3 text-right">Hyperparams</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {checkpoints.map((ckpt) => (
                      <tr key={ckpt.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 px-3 text-slate-400">
                          {new Date(ckpt.createdAtIso).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-white">
                          {(ckpt.accuracy * 100).toFixed(2)}%
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-sky-400">
                          {(ckpt.f1Score * 100).toFixed(2)}%
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-emerald-400">
                          {(ckpt.precision * 100).toFixed(2)}%
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-slate-300">
                          {(ckpt.recall * 100).toFixed(2)}%
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-slate-400">
                          {ckpt.testSetSize} rows
                        </td>
                        <td className="py-2.5 px-3 text-right text-[11px] text-slate-500">
                          C={ckpt.regularizationC} · iter={ckpt.iterations}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">
                No model checkpoints saved to Firestore yet. Go to "Model & Metrics" to save a trained model checkpoint.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
