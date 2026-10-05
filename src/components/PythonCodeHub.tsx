import React, { useState } from 'react';
import {
  Check,
  Code2,
  Copy,
  Download,
  FileCode,
  FolderArchive,
  Terminal,
} from 'lucide-react';
import { APP_PY, downloadPredictorZip, downloadTextFile, README_MD, REQUIREMENTS_TXT, TRAIN_MODEL_PY } from '../utils/zipGenerator';
import { AirlineDataRecord } from '../types';

interface PythonCodeHubProps {
  dataset: AirlineDataRecord[];
  onDownloadZip: () => void;
  isDownloadingZip: boolean;
}

export const PythonCodeHub: React.FC<PythonCodeHubProps> = ({
  dataset,
  onDownloadZip,
  isDownloadingZip,
}) => {
  const [activeFile, setActiveFile] = useState<'train' | 'app' | 'requirements' | 'readme'>('train');
  const [copied, setCopied] = useState(false);

  const getFileContent = () => {
    switch (activeFile) {
      case 'train':
        return { filename: 'train_model.py', content: TRAIN_MODEL_PY, lang: 'python' };
      case 'app':
        return { filename: 'app.py', content: APP_PY, lang: 'python' };
      case 'requirements':
        return { filename: 'requirements.txt', content: REQUIREMENTS_TXT, lang: 'text' };
      case 'readme':
        return { filename: 'README.md', content: README_MD, lang: 'markdown' };
    }
  };

  const current = getFileContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(current.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCurrent = () => {
    downloadTextFile(current.filename, current.content);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Python & Streamlit Source Code Hub
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Complete standalone scikit-learn training script, Streamlit application, and dependency manifest.
            </p>
          </div>
          <button
            onClick={onDownloadZip}
            disabled={isDownloadingZip}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:opacity-50 rounded-lg transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          >
            <FolderArchive className="w-4 h-4" />
            <span>{isDownloadingZip ? 'Compressing Files...' : 'Download Flight_Delay_Predictor_App_Files.zip'}</span>
          </button>
        </div>
      </div>

      {/* Terminal Quick Start Box */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-slate-200">
          <Terminal className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-semibold">Local Execution Workflow</h2>
        </div>
        <p className="text-xs text-slate-400">
          After unzipping <code className="text-sky-300 font-mono">Flight_Delay_Predictor_App_Files.zip</code>, run these commands in your terminal:
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between bg-slate-950 px-3.5 py-2.5 rounded-lg border border-slate-800 font-mono text-xs">
            <span className="text-emerald-400">
              <span className="text-slate-500 mr-2">$</span>pip install -r requirements.txt
            </span>
            <span className="text-[11px] text-slate-500">Installs pandas, scikit-learn, joblib, streamlit</span>
          </div>
          <div className="flex items-center justify-between bg-slate-950 px-3.5 py-2.5 rounded-lg border border-slate-800 font-mono text-xs">
            <span className="text-emerald-400">
              <span className="text-slate-500 mr-2">$</span>python train_model.py
            </span>
            <span className="text-[11px] text-slate-500">Trains ColumnTransformer + LogisticRegression, dumps .pkl</span>
          </div>
          <div className="flex items-center justify-between bg-slate-950 px-3.5 py-2.5 rounded-lg border border-slate-800 font-mono text-xs">
            <span className="text-emerald-400">
              <span className="text-slate-500 mr-2">$</span>streamlit run app.py
            </span>
            <span className="text-[11px] text-slate-500">Launches interactive web predictor at localhost:8501</span>
          </div>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {/* File Tabs & Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveFile('train')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                activeFile === 'train'
                  ? 'bg-slate-800 text-sky-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>train_model.py</span>
            </button>
            <button
              onClick={() => setActiveFile('app')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                activeFile === 'app'
                  ? 'bg-slate-800 text-sky-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>app.py</span>
            </button>
            <button
              onClick={() => setActiveFile('requirements')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                activeFile === 'requirements'
                  ? 'bg-slate-800 text-sky-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>requirements.txt</span>
            </button>
            <button
              onClick={() => setActiveFile('readme')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                activeFile === 'readme'
                  ? 'bg-slate-800 text-sky-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>README.md</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-md transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleDownloadCurrent}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-md transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Download {current.filename}</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <pre className="p-5 text-xs font-mono text-slate-200 bg-slate-950/80 overflow-x-auto leading-relaxed">
          <code>{current.content}</code>
        </pre>
      </div>
    </div>
  );
};
