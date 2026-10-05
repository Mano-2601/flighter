import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle,
  Clock,
  Code2,
  Cpu,
  Layers,
  Play,
  RefreshCw,
  Send,
  Server,
  Terminal,
  Zap,
} from 'lucide-react';
import {
  BackendHealthResponse,
  BackendLogEntry,
  checkBackendHealth,
  fetchBackendLogs,
  runPythonSimulationViaBackend,
} from '../services/backendApi';

interface BackendConsoleViewProps {
  useBackendMode: boolean;
  setUseBackendMode: (val: boolean) => void;
  onShowToast: (msg: string) => void;
}

export const BackendConsoleView: React.FC<BackendConsoleViewProps> = ({
  useBackendMode,
  setUseBackendMode,
  onShowToast,
}) => {
  const [health, setHealth] = useState<BackendHealthResponse | null>(null);
  const [logs, setLogs] = useState<BackendLogEntry[]>([]);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [isRunningScript, setIsRunningScript] = useState<boolean>(false);
  const [terminalLines, setTerminalLines] = useState<string[]>([
    'Node.js Express ML server initialized on port 3000.',
    'Scikit-learn pipeline loaded and calibrated.',
    'Ready to receive API requests at /api/predict and /api/train.',
  ]);

  // API Playground state
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/api/predict');
  const [requestMethod, setRequestMethod] = useState<'GET' | 'POST'>('POST');
  const [requestPayload, setRequestPayload] = useState<string>(
    JSON.stringify(
      {
        gender: 'Female',
        age: 28,
        nationality: 'United Kingdom',
        airportCountryCode: 'GB',
        airportContinent: 'EU',
        departureDate: '2025-11-20',
      },
      null,
      2
    )
  );
  const [responsePayload, setResponsePayload] = useState<string | null>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseDuration, setResponseDuration] = useState<number | null>(null);
  const [isSendingRequest, setIsSendingRequest] = useState<boolean>(false);

  // Poll health and logs
  const refreshStatus = async () => {
    setIsPinging(true);
    const [h, l] = await Promise.all([checkBackendHealth(), fetchBackendLogs()]);
    setHealth(h);
    setLogs(l);
    setIsPinging(false);
  };

  useEffect(() => {
    refreshStatus();
    const interval = setInterval(refreshStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleRunScript = async () => {
    setIsRunningScript(true);
    try {
      const res = await runPythonSimulationViaBackend('train_model.py');
      setTerminalLines((prev) => [...prev, '----------------------------------------', ...res.outputLines]);
      onShowToast('Backend executed train_model.py successfully!');
      await refreshStatus();
    } catch (err: any) {
      setTerminalLines((prev) => [...prev, `[ERROR] Script execution failed: ${err.message}`]);
      onShowToast('Backend script execution failed.');
    } finally {
      setIsRunningScript(false);
    }
  };

  const handleSendTestRequest = async () => {
    setIsSendingRequest(true);
    const start = performance.now();
    try {
      let options: RequestInit = {
        method: requestMethod,
        headers: { 'Content-Type': 'application/json' },
      };
      if (requestMethod === 'POST') {
        options.body = requestPayload;
      }
      const res = await fetch(selectedEndpoint, options);
      const duration = Math.round(performance.now() - start);
      const data = await res.json().catch(() => ({ status: 'Non-JSON response' }));

      setResponseStatus(res.status);
      setResponseDuration(duration);
      setResponsePayload(JSON.stringify(data, null, 2));

      setTerminalLines((prev) => [
        ...prev,
        `[HTTP] ${requestMethod} ${selectedEndpoint} -> ${res.status} (${duration}ms)`,
      ]);
      await refreshStatus();
    } catch (err: any) {
      setResponseStatus(500);
      setResponseDuration(Math.round(performance.now() - start));
      setResponsePayload(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setIsSendingRequest(false);
    }
  };

  const handleSelectEndpoint = (ep: string, method: 'GET' | 'POST') => {
    setSelectedEndpoint(ep);
    setRequestMethod(method);
    if (ep === '/api/predict') {
      setRequestPayload(
        JSON.stringify(
          {
            gender: 'Male',
            age: 42,
            nationality: 'United States',
            airportCountryCode: 'US',
            airportContinent: 'NA',
            departureDate: '2025-12-24',
          },
          null,
          2
        )
      );
    } else if (ep === '/api/train') {
      setRequestPayload(
        JSON.stringify(
          {
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
          },
          null,
          2
        )
      );
    } else {
      setRequestPayload('{}');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Server className="w-6 h-6 text-sky-400" />
              <span>Backend Server Engine & Console</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Active Express Node.js server (<code className="text-sky-300 font-mono">server.ts</code>) handling API endpoints, Scikit-Learn inference, and live telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mode Switcher */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
              <button
                onClick={() => setUseBackendMode(true)}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  useBackendMode
                    ? 'bg-sky-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Express Backend Mode
              </button>
              <button
                onClick={() => setUseBackendMode(false)}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  !useBackendMode
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                In-Browser Client Mode
              </button>
            </div>

            <button
              onClick={refreshStatus}
              disabled={isPinging}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              title="Ping Express server"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Backend Telemetry Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Server Runtime</span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Online</span>
            </div>
          </div>
          <div className="text-base font-bold text-white font-mono mt-1">Express · Port 3000</div>
          <span className="text-[11px] text-slate-500 font-mono block">
            Node {health?.nodeVersion || 'v22'} · {health?.platform || 'linux'}
          </span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Backend Memory (Heap)</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-sky-400 mt-1">
            {health?.memoryUsageMb?.heapUsed || 32}{' '}
            <span className="text-xs text-slate-400 font-normal">MB</span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            RSS: {health?.memoryUsageMb?.rss || 95} MB
          </span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Server Uptime</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
            {health?.uptimeSeconds || 12}s
          </div>
          <span className="text-[11px] text-slate-500 block">
            Total Requests: {logs.length}
          </span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Predictions Served</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
            {health?.totalPredictionsServed || 0}
          </div>
          <span className="text-[11px] text-slate-500 block">via /api/predict</span>
        </div>
      </div>

      {/* Main Grid: Interactive API Playground & Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Live API Request / Response Inspector */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-200">
                <Send className="w-4 h-4 text-sky-400" />
                <h2 className="text-sm font-semibold">Backend API Endpoint Tester</h2>
              </div>
              <span className="text-xs font-mono text-slate-500">Express REST</span>
            </div>

            {/* Endpoints Selectors */}
            <div className="flex flex-wrap gap-1.5 text-xs font-mono">
              {[
                { ep: '/api/predict', method: 'POST' as const, label: 'POST /api/predict' },
                { ep: '/api/train', method: 'POST' as const, label: 'POST /api/train' },
                { ep: '/api/health', method: 'GET' as const, label: 'GET /api/health' },
                { ep: '/api/dataset?limit=5', method: 'GET' as const, label: 'GET /api/dataset' },
                { ep: '/api/logs', method: 'GET' as const, label: 'GET /api/logs' },
              ].map((item) => (
                <button
                  key={item.ep}
                  onClick={() => handleSelectEndpoint(item.ep, item.method)}
                  className={`px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                    selectedEndpoint === item.ep
                      ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Request URL Input */}
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1.5 rounded-lg bg-sky-950/80 text-sky-400 font-mono text-xs font-bold border border-sky-800/60">
                {requestMethod}
              </span>
              <input
                type="text"
                value={selectedEndpoint}
                onChange={(e) => setSelectedEndpoint(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-sky-500"
              />
              <button
                onClick={handleSendTestRequest}
                disabled={isSendingRequest}
                className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isSendingRequest ? 'Sending...' : 'Send'}</span>
              </button>
            </div>

            {/* Request Body Editor (if POST) */}
            {requestMethod === 'POST' && (
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-slate-400">JSON Request Body</span>
                <textarea
                  rows={6}
                  value={requestPayload}
                  onChange={(e) => setRequestPayload(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-sky-500 leading-relaxed"
                />
              </div>
            )}

            {/* Response Area */}
            {responsePayload && (
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-400">Server Response</span>
                    <span
                      className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${
                        responseStatus === 200
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {responseStatus} OK
                    </span>
                  </div>
                  {responseDuration !== null && (
                    <span className="font-mono tabular-nums text-slate-500">
                      {responseDuration}ms latency
                    </span>
                  )}
                </div>
                <pre className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 font-mono max-h-60 overflow-y-auto leading-relaxed">
                  {responsePayload}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Right: Real-time Terminal & Python Execution Log */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-200">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-semibold">Live Backend Console</h2>
              </div>
              <button
                onClick={handleRunScript}
                disabled={isRunningScript}
                className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isRunningScript ? 'Running...' : 'Run train_model.py'}</span>
              </button>
            </div>

            {/* Terminal Window */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 font-mono text-xs text-slate-300 h-96 overflow-y-auto space-y-1 leading-relaxed">
              <div className="text-slate-500 text-[11px] pb-1 border-b border-slate-900 mb-2">
                # Express server.ts standard output & ML logger
              </div>
              {terminalLines.map((line, idx) => {
                let color = 'text-slate-300';
                if (line.startsWith('$')) color = 'text-sky-400 font-bold';
                else if (line.includes('Accuracy:')) color = 'text-emerald-400 font-semibold';
                else if (line.includes('[ERROR]')) color = 'text-rose-400 font-bold';
                else if (line.includes('✅')) color = 'text-emerald-300 font-bold';
                else if (line.includes('[HTTP]')) color = 'text-amber-300';

                return (
                  <div key={idx} className={color}>
                    {line}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent API Requests Feed */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-200 font-semibold">
                <Activity className="w-3.5 h-3.5 text-sky-400" />
                <span>Recent Backend HTTP Calls</span>
              </div>
              <span className="text-slate-500 font-mono">{logs.length} logged</span>
            </div>

            <div className="space-y-1.5 max-h-44 overflow-y-auto text-xs font-mono">
              {logs.slice(0, 8).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800/80 text-[11px]"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`font-bold ${
                        log.method === 'POST' ? 'text-sky-400' : 'text-emerald-400'
                      }`}
                    >
                      {log.method || 'EVENT'}
                    </span>
                    <span className="text-slate-300 truncate">{log.endpoint || log.message}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {log.durationMs !== undefined && (
                      <span className="text-slate-500 tabular-nums">{log.durationMs}ms</span>
                    )}
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] ${
                        (log.statusCode || 200) < 400
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {log.statusCode || 200}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
