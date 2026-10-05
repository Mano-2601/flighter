import React, { useMemo, useState } from 'react';
import {
  BarChart2,
  Database,
  Download,
  FileSpreadsheet,
  Filter,
  RefreshCw,
  Search,
  Upload,
} from 'lucide-react';
import { CONTINENTS, generateAirlineCsv } from '../data/airlineDataset';
import { AirlineDataRecord, ContinentCode, FlightStatus } from '../types';
import { downloadTextFile } from '../utils/zipGenerator';

interface DatasetExplorerProps {
  dataset: AirlineDataRecord[];
  onUploadCsv: (records: AirlineDataRecord[]) => void;
  onResetDefault: () => void;
}

export const DatasetExplorer: React.FC<DatasetExplorerProps> = ({
  dataset,
  onUploadCsv,
  onResetDefault,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [continentFilter, setContinentFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 12;

  // Filtered dataset
  const filteredData = useMemo(() => {
    return dataset.filter((row) => {
      const matchesSearch =
        row.passengerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.nationality.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.airportCountryCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.airportName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'All' || row.flightStatus === statusFilter;
      const matchesContinent = continentFilter === 'All' || row.airportContinent === continentFilter;

      return matchesSearch && matchesStatus && matchesContinent;
    });
  }, [dataset, searchTerm, statusFilter, continentFilter]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = dataset.length;
    const onTime = dataset.filter((d) => d.flightStatus === 'On Time').length;
    const delayed = dataset.filter((d) => d.flightStatus === 'Delayed').length;
    const cancelled = dataset.filter((d) => d.flightStatus === 'Cancelled').length;

    // By continent
    const continentCounts: Record<ContinentCode, { onTime: number; delayed: number; cancelled: number; total: number }> = {
      NA: { onTime: 0, delayed: 0, cancelled: 0, total: 0 },
      EU: { onTime: 0, delayed: 0, cancelled: 0, total: 0 },
      AS: { onTime: 0, delayed: 0, cancelled: 0, total: 0 },
      OC: { onTime: 0, delayed: 0, cancelled: 0, total: 0 },
      AF: { onTime: 0, delayed: 0, cancelled: 0, total: 0 },
      SA: { onTime: 0, delayed: 0, cancelled: 0, total: 0 },
    };

    dataset.forEach((d) => {
      if (continentCounts[d.airportContinent]) {
        continentCounts[d.airportContinent].total++;
        if (d.flightStatus === 'On Time') continentCounts[d.airportContinent].onTime++;
        if (d.flightStatus === 'Delayed') continentCounts[d.airportContinent].delayed++;
        if (d.flightStatus === 'Cancelled') continentCounts[d.airportContinent].cancelled++;
      }
    });

    return { total, onTime, delayed, cancelled, continentCounts };
  }, [dataset]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage]);

  const handleDownloadCsv = () => {
    const csv = generateAirlineCsv(dataset);
    downloadTextFile('Airline Dataset.csv', csv, 'text/csv;charset=utf-8;');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) return;

      const newRecords: AirlineDataRecord[] = [];
      const dataLines = lines.slice(1);

      dataLines.forEach((line, index) => {
        // Simple CSV splitter handling quoted values
        const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((c) => c.replace(/^"|"$/g, '').trim());
        if (cols.length >= 7) {
          const passengerId = cols[0] || `PAX-${index + 1}`;
          const firstName = cols[1] || 'Traveler';
          const lastName = cols[2] || 'Anonymous';
          const gender = cols[3]?.toLowerCase() === 'female' ? 'Female' : 'Male';
          const age = parseInt(cols[4], 10) || 35;
          const nationality = cols[5] || 'United States';
          const airportName = cols[6] || 'International Airport';
          const airportCountryCode = cols[7] || 'US';
          const airportContinent = (['NA', 'EU', 'AS', 'OC', 'AF', 'SA'].includes(cols[8]) ? cols[8] : 'NA') as ContinentCode;
          const departureDate = cols[9] || '2025-06-15';
          const flightStatus: FlightStatus =
            cols[10] === 'Delayed' ? 'Delayed' : cols[10] === 'Cancelled' ? 'Cancelled' : 'On Time';

          const dObj = new Date(departureDate + 'T12:00:00Z');
          const depMonth = isNaN(dObj.getTime()) ? 6 : dObj.getUTCMonth() + 1;
          const depDayOfWeek = isNaN(dObj.getTime()) ? 3 : (dObj.getUTCDay() + 6) % 7;

          newRecords.push({
            id: `UPLOAD-${index + 1}`,
            passengerId,
            firstName,
            lastName,
            gender,
            age,
            nationality,
            airportName,
            airportCountryCode,
            airportContinent,
            departureDate,
            depMonth,
            depDayOfWeek,
            flightStatus,
          });
        }
      });

      if (newRecords.length > 0) {
        onUploadCsv(newRecords);
        setCurrentPage(1);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Airline Dataset Explorer
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Inspection of records, class distributions, and geographic features from Airline Dataset.csv.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-sky-400" />
              <span>Upload CSV</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Download CSV</span>
            </button>
            <button
              onClick={onResetDefault}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              title="Reset to default dataset"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Aggregate Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-medium">Total Flight Records</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
            {stats.total}
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">Airline Dataset.csv</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-medium">On Time Status</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
            {stats.onTime}{' '}
            <span className="text-xs text-slate-400 font-normal">
              ({((stats.onTime / (stats.total || 1)) * 100).toFixed(1)}%)
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">Baseline nominal</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-medium">Delayed Status</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-400 mt-1">
            {stats.delayed}{' '}
            <span className="text-xs text-slate-400 font-normal">
              ({((stats.delayed / (stats.total || 1)) * 100).toFixed(1)}%)
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">Air traffic & turnaround</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-medium">Cancelled Status</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-rose-400 mt-1">
            {stats.cancelled}{' '}
            <span className="text-xs text-slate-400 font-normal">
              ({((stats.cancelled / (stats.total || 1)) * 100).toFixed(1)}%)
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">Weather & mechanical</span>
        </div>
      </div>

      {/* Regional Delay Distribution */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-slate-200">
            <BarChart2 className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-semibold">Flight Status Distribution by Continent</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">NA · EU · AS · OC · AF · SA</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CONTINENTS.map((cont) => {
            const data = stats.continentCounts[cont.code] || { onTime: 0, delayed: 0, cancelled: 0, total: 0 };
            const tot = data.total || 1;
            const onTimePct = (data.onTime / tot) * 100;
            const delPct = (data.delayed / tot) * 100;
            const canPct = (data.cancelled / tot) * 100;

            return (
              <div key={cont.code} className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-white">{cont.code}</span>
                  <span className="text-[11px] text-slate-400 font-mono tabular-nums">{data.total} flights</span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full flex overflow-hidden">
                  <div style={{ width: `${onTimePct}%` }} className="bg-emerald-500" title={`On Time: ${data.onTime}`} />
                  <div style={{ width: `${delPct}%` }} className="bg-amber-500" title={`Delayed: ${data.delayed}`} />
                  <div style={{ width: `${canPct}%` }} className="bg-rose-500" title={`Cancelled: ${data.cancelled}`} />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span className="text-emerald-400">{data.onTime}</span>
                  <span className="text-amber-400">{data.delayed}</span>
                  <span className="text-rose-400">{data.cancelled}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dataset Filter & Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search passenger, nationality, airport..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <Filter className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="All">All Statuses</option>
                <option value="On Time">On Time</option>
                <option value="Delayed">Delayed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Continent Filter */}
            <select
              value={continentFilter}
              onChange={(e) => {
                setContinentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="All">All Continents</option>
              {CONTINENTS.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-medium">
                <th className="py-2.5 px-3">Flight & Airline</th>
                <th className="py-2.5 px-3">Passenger ID</th>
                <th className="py-2.5 px-3">Passenger Name</th>
                <th className="py-2.5 px-3">Gender / Age</th>
                <th className="py-2.5 px-3">Nationality</th>
                <th className="py-2.5 px-3">Airport / Country</th>
                <th className="py-2.5 px-3">Departure Date</th>
                <th className="py-2.5 px-3 text-right">Flight Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {paginatedData.length > 0 ? (
                paginatedData.map((row) => {
                  let statusColor = 'text-emerald-400';
                  if (row.flightStatus === 'Delayed') statusColor = 'text-amber-400';
                  if (row.flightStatus === 'Cancelled') statusColor = 'text-rose-400';

                  return (
                    <tr key={row.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-3 font-sans">
                        <span className="text-white font-medium block text-xs">{row.airline || 'AI - Air India'}</span>
                        <span className="text-[11px] font-mono text-sky-400">{row.flightNumber || 'AI-101'}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 font-mono">{row.passengerId}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-200 font-medium">
                        {row.firstName} {row.lastName}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-300">
                        {row.gender} · {row.age} yrs
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-300">{row.nationality}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-300">
                        {row.airportCountryCode} · {row.airportContinent}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 font-mono">{row.departureDate}</td>
                      <td className={`py-2.5 px-3 text-right font-sans font-semibold ${statusColor}`}>
                        {row.flightStatus}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 font-sans">
                    No flight records match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
          <span>
            Showing {(currentPage - 1) * rowsPerPage + 1} to{' '}
            {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length} records
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 disabled:opacity-40 cursor-pointer"
            >
              Prev
            </button>
            <span className="px-2 font-mono tabular-nums">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
