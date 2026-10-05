import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { FlightDelayPipeline } from './src/ml/logisticRegression.ts';
import { generateSyntheticAirlineDataset } from './src/data/airlineDataset.ts';
import { AirlineDataRecord, FlightInput, ModelTrainingConfig } from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ServerLogEntry {
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

const serverLogs: ServerLogEntry[] = [];
const MAX_LOGS = 100;

function logServer(entry: Omit<ServerLogEntry, 'id' | 'timestamp'>) {
  const item: ServerLogEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  serverLogs.unshift(item);
  if (serverLogs.length > MAX_LOGS) {
    serverLogs.pop();
  }
  console.log(`[${item.timestamp}] [${item.type.toUpperCase()}] ${item.message}`);
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const startTime = Date.now();
  let totalPredictionsServed = 0;

  // Initialize backend dataset and ML pipeline
  logServer({
    type: 'system',
    message: 'Initializing Express Backend and Server-Side ML Pipeline...',
  });

  const backendDataset: AirlineDataRecord[] = generateSyntheticAirlineDataset(360);
  const backendPipeline = new FlightDelayPipeline();
  const initialMetrics = backendPipeline.train(backendDataset, {
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

  logServer({
    type: 'ml',
    message: `Backend ML Pipeline fitted on ${backendDataset.length} rows. Accuracy: ${(initialMetrics.accuracy * 100).toFixed(2)}%, F1: ${(initialMetrics.f1Score * 100).toFixed(2)}%`,
  });

  app.use(express.json());

  // Request logger middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      const start = performance.now();
      res.on('finish', () => {
        const duration = Math.round(performance.now() - start);
        logServer({
          type: 'http',
          method: req.method,
          endpoint: req.path,
          statusCode: res.statusCode,
          durationMs: duration,
          message: `${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`,
        });
      });
    }
    next();
  });

  // 1. Health & Server Telemetry
  app.get('/api/health', (req: Request, res: Response) => {
    const memory = process.memoryUsage();
    res.json({
      status: 'online',
      server: 'Node.js Express Full-Stack ML Engine',
      port: PORT,
      uptimeSeconds: Math.round((Date.now() - startTime) / 1000),
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsageMb: {
        heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
        rss: Math.round(memory.rss / 1024 / 1024),
      },
      modelStatus: 'trained',
      totalRecords: backendDataset.length,
      totalPredictionsServed,
      timestamp: new Date().toISOString(),
    });
  });

  // 2. Predict Flight Status via Backend API
  app.post('/api/predict', (req: Request, res: Response) => {
    const startInference = performance.now();
    const input: FlightInput = req.body;

    if (!input || !input.departureDate || !input.airportCountryCode || !input.airportContinent) {
      return res.status(400).json({
        error: 'Invalid input. Required: departureDate, airportCountryCode, airportContinent, age, gender, nationality',
      });
    }

    try {
      const prediction = backendPipeline.predict(input);
      const executionTimeMs = parseFloat((performance.now() - startInference).toFixed(2));
      totalPredictionsServed++;

      logServer({
        type: 'ml',
        message: `Inference executed: ${prediction.predictedStatus} (Confidence: ${(prediction.probabilities[prediction.predictedStatus] * 100).toFixed(1)}%) in ${executionTimeMs}ms`,
        details: { input, predictedStatus: prediction.predictedStatus },
      });

      res.json({
        success: true,
        result: prediction,
        backendInfo: {
          runtime: 'Express Server (server.ts)',
          endpoint: '/api/predict',
          executionTimeMs,
          serverTimestamp: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal inference failure' });
    }
  });

  // 3. Train Model on Backend API
  app.post('/api/train', (req: Request, res: Response) => {
    const startTrain = performance.now();
    const config: ModelTrainingConfig = req.body || {
      testSplit: 0.2,
      iterations: 500,
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
    };

    try {
      const metrics = backendPipeline.train(backendDataset, config);
      const trainingTimeMs = Math.round(performance.now() - startTrain);

      logServer({
        type: 'ml',
        message: `Backend model re-trained: max_iter=${config.iterations}, C=${config.regularizationC}, split=${config.testSplit}. Accuracy=${(metrics.accuracy * 100).toFixed(2)}% in ${trainingTimeMs}ms`,
      });

      res.json({
        success: true,
        metrics,
        trainingTimeMs,
        datasetSize: backendDataset.length,
        serverTimestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Training failed' });
    }
  });

  // 4. Get Current Backend Model Metrics
  app.get('/api/metrics', (req: Request, res: Response) => {
    const metrics = backendPipeline.getMetrics();
    res.json({
      success: true,
      metrics,
      serverTimestamp: new Date().toISOString(),
    });
  });

  // 5. Get Airline Dataset from Backend
  app.get('/api/dataset', (req: Request, res: Response) => {
    const limitParam = parseInt(req.query.limit as string, 10) || 50;
    const search = ((req.query.search as string) || '').toLowerCase();

    let filtered = backendDataset;
    if (search) {
      filtered = backendDataset.filter(
        (r) =>
          r.passengerId.toLowerCase().includes(search) ||
          r.nationality.toLowerCase().includes(search) ||
          r.airportCountryCode.toLowerCase().includes(search)
      );
    }

    res.json({
      success: true,
      totalCount: backendDataset.length,
      filteredCount: filtered.length,
      records: filtered.slice(0, limitParam),
    });
  });

  // 6. Real-Time Server Logs
  app.get('/api/logs', (req: Request, res: Response) => {
    res.json({
      success: true,
      logs: serverLogs,
      serverTime: new Date().toISOString(),
    });
  });

  // 7. Live Flight Radar Telemetry Tracker API
  app.get('/api/flight-tracker/:flightNumber', (req: Request, res: Response) => {
    const fn = (req.params.flightNumber || '').toUpperCase().trim();
    logServer({
      type: 'http',
      message: `ADS-B Telemetry queried for flight ${fn}`,
      details: { flightNumber: fn, receiver: '1090MHz Virtual ADS-B' },
    });

    res.json({
      success: true,
      flightNumber: fn,
      receiverMode: 'ADS-B 1090MHz + ML Trajectory Engine',
      serverTimestamp: new Date().toISOString(),
    });
  });

  // 8. Simulate Python Script Execution on Backend
  app.post('/api/run-python-pipeline', (req: Request, res: Response) => {
    const script = req.body?.script || 'train_model.py';
    const lines = [
      `$ python ${script}`,
      '🔄 Loading Airline Dataset.csv...',
      `   Dataset loaded successfully: ${backendDataset.length} rows, 11 features.`,
      '⚙️ Preprocessing dates and features...',
      '   - ColumnTransformer: OneHotEncoder(handle_unknown="ignore") for [Gender, Nationality, Airport Country Code, Airport Continent]',
      '   - StandardScaler() for [Age, dep_month, dep_dayofweek]',
      '   - Train/test stratified split: 80% train / 20% test',
      '🏋️ Training final Logistic Regression model pipeline (max_iter=500, solver="lbfgs")...',
      '   - Epoch 100/500: cross-entropy loss = 1.0984',
      '   - Epoch 250/500: cross-entropy loss = 1.0821',
      '   - Epoch 500/500: convergence criterion satisfied.',
      '',
      '📊 Final Test-set Results:',
      `   Accuracy:  ${((backendPipeline.getMetrics()?.accuracy || 0.358) * 100).toFixed(2)}%`,
      `   F1-Score:  ${((backendPipeline.getMetrics()?.f1Score || 0.352) * 100).toFixed(2)}% (weighted)`,
      '',
      '💾 Saving model to "flight_status_model.pkl"...',
      '   joblib.dump(final_pipeline, "flight_status_model.pkl") -> [SUCCESS 242 KB]',
      '✅ Done! Model artifact generated. Ready for Streamlit web app.',
    ];

    logServer({
      type: 'system',
      message: `Executed Python simulation pipeline for ${script}`,
    });

    res.json({
      success: true,
      script,
      outputLines: lines,
      executionTimestamp: new Date().toISOString(),
    });
  });

  // Vite middleware in dev or static serving in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    logServer({
      type: 'system',
      message: `Flight Delay Predictor Backend running at http://0.0.0.0:${PORT}`,
    });
  });
}

startServer().catch((err) => {
  console.error('Fatal backend startup error:', err);
});
