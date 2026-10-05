import { FlightInput, ModelMetrics, ModelTrainingConfig, PredictionResult } from '../types';

export interface BackendHealthResponse {
  status: 'online' | 'offline';
  server: string;
  port: number;
  uptimeSeconds: number;
  nodeVersion: string;
  platform: string;
  memoryUsageMb: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
  };
  modelStatus: string;
  totalRecords: number;
  totalPredictionsServed: number;
  timestamp: string;
}

export interface BackendLogEntry {
  id: string;
  timestamp: string;
  type: 'http' | 'ml' | 'system';
  method?: string;
  endpoint?: string;
  statusCode?: number;
  durationMs?: number;
  message: string;
  details?: any;
}

export interface BackendPredictResponse {
  success: boolean;
  result: PredictionResult;
  backendInfo: {
    runtime: string;
    endpoint: string;
    executionTimeMs: number;
    serverTimestamp: string;
  };
}

export async function checkBackendHealth(): Promise<BackendHealthResponse | null> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function predictViaBackend(input: FlightInput): Promise<BackendPredictResponse> {
  const res = await fetch('/api/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Backend error: ${res.status}`);
  }
  return await res.json();
}

export async function trainViaBackend(config: ModelTrainingConfig): Promise<{
  metrics: ModelMetrics;
  trainingTimeMs: number;
  datasetSize: number;
}> {
  const res = await fetch('/api/train', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!res.ok) {
    throw new Error(`Backend training error: ${res.status}`);
  }
  return await res.json();
}

export async function fetchBackendLogs(): Promise<BackendLogEntry[]> {
  try {
    const res = await fetch('/api/logs');
    if (!res.ok) return [];
    const data = await res.json();
    return data.logs || [];
  } catch (err) {
    return [];
  }
}

export async function runPythonSimulationViaBackend(scriptName = 'train_model.py'): Promise<{
  outputLines: string[];
  executionTimestamp: string;
}> {
  const res = await fetch('/api/run-python-pipeline', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ script: scriptName }),
  });
  if (!res.ok) {
    throw new Error(`Simulation error: ${res.status}`);
  }
  return await res.json();
}
