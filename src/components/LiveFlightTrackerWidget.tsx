import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Compass,
  Gauge,
  Maximize2,
  Navigation,
  Radio,
  Sparkles,
  Plane,
  Clock,
  MapPin,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { RadarFlight } from './FlightRadarView';
import { getLiveFlightTelemetry } from '../services/flightTrackerService';

interface LiveFlightTrackerWidgetProps {
  airline: string;
  flightNumber: string;
  airportName: string;
  countryCode: string;
  onOpenFullRadar?: (flightId: string) => void;
  onPredictFlight?: () => void;
}

export const LiveFlightTrackerWidget: React.FC<LiveFlightTrackerWidgetProps> = ({
  airline,
  flightNumber,
  airportName,
  countryCode,
  onOpenFullRadar,
  onPredictFlight,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  const [flightData, setFlightData] = useState<RadarFlight>(() =>
    getLiveFlightTelemetry({
      airlineFullName: airline,
      flightNumber,
      departureAirportName: airportName,
      countryCode,
    })
  );

  const [isLiveReceiving, setIsLiveReceiving] = useState(true);

  // Sync flightData when props change
  useEffect(() => {
    const updated = getLiveFlightTelemetry({
      airlineFullName: airline,
      flightNumber,
      departureAirportName: airportName,
      countryCode,
    });
    setFlightData(updated);
  }, [airline, flightNumber, airportName, countryCode]);

  // Initialize or update mini Leaflet radar map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [flightData.lat, flightData.lng],
        zoom: 6,
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    map.panTo([flightData.lat, flightData.lng]);

    // Update marker
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
    }
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
    }

    const planeSvg = `
      <div style="transform: rotate(${flightData.heading}deg);" class="flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#ef4444" stroke="#7f1d1d" stroke-width="1.5">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
        </svg>
      </div>
    `;

    const labelHtml = `
      <div class="relative -top-2 flex flex-col items-center pointer-events-none">
        <div class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold whitespace-nowrap bg-red-600 text-white border border-red-400 shadow-md">
          ${flightData.callsign}
        </div>
        ${planeSvg}
      </div>
    `;

    const customIcon = L.divIcon({
      className: 'custom-mini-plane',
      html: labelHtml,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    markerRef.current = L.marker([flightData.lat, flightData.lng], { icon: customIcon }).addTo(map);

    // Add purple route trajectory
    polylineRef.current = L.polyline(flightData.routeTrail, {
      color: '#a855f7',
      weight: 3,
      opacity: 0.85,
      dashArray: '4, 6',
    }).addTo(map);

  }, [flightData]);

  // Live real-time ADS-B movement ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setFlightData((prev) => {
        const rad = (prev.heading * Math.PI) / 180;
        const deltaLat = Math.cos(rad) * 0.0015;
        const deltaLng = Math.sin(rad) * 0.0015;
        const newLat = prev.lat + deltaLat;
        const newLng = prev.lng + deltaLng;
        return {
          ...prev,
          lat: newLat,
          lng: newLng,
          distanceTraveledKm: prev.distanceTraveledKm + 1,
          distanceRemainingKm: Math.max(0, prev.distanceRemainingKm - 1),
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl space-y-0 text-slate-100">
      {/* 1. Header Bar: Live ADS-B Active Indicator */}
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Live Flight Tracker (ADS-B 1090MHz)
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                RECEIVING
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Tracking <strong className="text-white">{flightData.flightNumber}</strong> ({flightData.airline})
            </span>
          </div>
        </div>

        {onOpenFullRadar && (
          <button
            onClick={() => onOpenFullRadar(flightData.id)}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Open Full Radar Map</span>
          </button>
        )}
      </div>

      {/* 2. Route Banner (KUL ➔ MED or DEL ➔ JFK) */}
      <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
        {/* Origin */}
        <div className="text-left">
          <span className="text-2xl font-black font-mono tracking-tight text-white block">
            {flightData.originCode}
          </span>
          <span className="text-xs font-semibold text-slate-300 block">{flightData.originCity}</span>
          <span className="text-[10px] font-mono text-slate-500">{flightData.scheduledDep} (Dep)</span>
        </div>

        {/* Flight Track in Center */}
        <div className="flex-1 px-4 flex flex-col items-center">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-amber-400">
            <span>{flightData.callsign}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-300">{flightData.aircraftType}</span>
          </div>
          <div className="w-full relative my-1.5 flex items-center">
            <div className="h-0.5 w-full bg-slate-800" />
            <div
              className="absolute h-0.5 bg-amber-500"
              style={{ width: `${flightData.progressPercent}%` }}
            />
            <div
              className="absolute text-amber-400 -top-2"
              style={{ left: `calc(${flightData.progressPercent}% - 6px)` }}
            >
              <Plane className="w-3.5 h-3.5 rotate-90" />
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {flightData.distanceTraveledKm.toLocaleString()} km ({flightData.progressPercent}%) · {flightData.distanceRemainingKm.toLocaleString()} km left
          </span>
        </div>

        {/* Destination */}
        <div className="text-right">
          <span className="text-2xl font-black font-mono tracking-tight text-white block">
            {flightData.destCode}
          </span>
          <span className="text-xs font-semibold text-slate-300 block">{flightData.destCity}</span>
          <span className="text-[10px] font-mono text-slate-500">{flightData.estimatedArr} (Est)</span>
        </div>
      </div>

      {/* 3. Interactive Embedded Mini Radar Map */}
      <div className="relative w-full h-52 bg-slate-950 border-b border-slate-800">
        <div ref={mapContainerRef} className="w-full h-full" />
        <div className="absolute top-2 left-2 z-20 bg-slate-950/80 backdrop-blur-xs px-2 py-1 rounded text-[10px] font-mono text-slate-300 border border-slate-800">
          Lat: {flightData.lat.toFixed(4)}° · Lng: {flightData.lng.toFixed(4)}°
        </div>
        <div className="absolute bottom-2 right-2 z-20 bg-slate-950/80 backdrop-blur-xs px-2 py-1 rounded text-[10px] font-mono text-amber-400 border border-amber-500/30 font-semibold">
          Flightradar24 Engine
        </div>
      </div>

      {/* 4. Live Telemetry Gauges Grid */}
      <div className="p-3.5 bg-slate-950 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
        {/* Altitude */}
        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block font-sans">LIVE ALTITUDE</span>
            <span className="text-sm font-bold text-white">{flightData.altitudeFt.toLocaleString()} ft</span>
          </div>
          <Gauge className="w-4 h-4 text-sky-400 shrink-0" />
        </div>

        {/* Speed */}
        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block font-sans">GROUND SPEED</span>
            <span className="text-sm font-bold text-white">{flightData.speedKnots} kts</span>
          </div>
          <Navigation className="w-4 h-4 text-emerald-400 shrink-0" />
        </div>

        {/* Heading */}
        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block font-sans">HEADING / TRACK</span>
            <span className="text-sm font-bold text-white">{flightData.heading}° NW</span>
          </div>
          <Compass className="w-4 h-4 text-amber-400 shrink-0" />
        </div>

        {/* Live Status */}
        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block font-sans">FLIGHT STATUS</span>
            <span className={`text-xs font-bold ${
              flightData.status === 'On Time' ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {flightData.status} ({flightData.delayMinutes > 0 ? `+${flightData.delayMinutes}m` : '0m'})
            </span>
          </div>
          <Clock className="w-4 h-4 text-slate-400 shrink-0" />
        </div>
      </div>
    </div>
  );
};
