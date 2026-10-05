import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Plane,
  Search,
  Layers,
  Settings,
  CloudSun,
  Filter,
  Sliders,
  Play,
  Share2,
  Bookmark,
  X,
  Compass,
  Eye,
  Radio,
  Clock,
  Sparkles,
  Maximize2,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { FlightInput, PredictionResult } from '../types';
import { getLiveFlightTelemetry } from '../services/flightTrackerService';

export interface RadarFlight {
  id: string;
  callsign: string;
  flightNumber: string;
  airline: string;
  aircraftType: string;
  aircraftModel: string;
  photoUrl: string;
  photographer: string;
  originCode: string;
  originCity: string;
  originTimezone: string;
  destCode: string;
  destCity: string;
  destTimezone: string;
  scheduledDep: string;
  actualDep: string;
  scheduledArr: string;
  estimatedArr: string;
  delayMinutes: number;
  status: 'On Time' | 'Delayed' | 'Cancelled';
  distanceTraveledKm: number;
  elapsedTime: string;
  distanceRemainingKm: number;
  remainingTime: string;
  progressPercent: number;
  lat: number;
  lng: number;
  heading: number; // degrees
  speedKnots: number;
  altitudeFt: number;
  originCoords: [number, number];
  destCoords: [number, number];
  routeTrail: [number, number][];
}

const SAMPLE_RADAR_FLIGHTS: RadarFlight[] = [
  {
    id: 'MAS158',
    callsign: 'MAS158',
    flightNumber: 'MH158',
    airline: 'Malaysia Airlines (Malaysia Negaraku Livery)',
    aircraftType: 'A332',
    aircraftModel: 'Airbus A330-223',
    photoUrl: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=800&q=80',
    photographer: 'CAN CKJ',
    originCode: 'KUL',
    originCity: 'KUALA LUMPUR',
    originTimezone: '+08 (UTC +08:00)',
    destCode: 'MED',
    destCity: 'MEDINA',
    destTimezone: '+03 (UTC +03:00)',
    scheduledDep: '5:10 PM',
    actualDep: '5:44 PM',
    scheduledArr: '9:00 PM',
    estimatedArr: '9:04 PM',
    delayMinutes: 34,
    status: 'Delayed',
    distanceTraveledKm: 2806,
    elapsedTime: '03:13 ago',
    distanceRemainingKm: 4262,
    remainingTime: 'in 05:06',
    progressPercent: 40,
    lat: 12.35,
    lng: 78.15,
    heading: 295,
    speedKnots: 472,
    altitudeFt: 38000,
    originCoords: [2.7456, 101.7072],
    destCoords: [24.5534, 39.7050],
    routeTrail: [
      [2.7456, 101.7072],
      [5.50, 95.20],
      [8.10, 88.40],
      [10.20, 83.10],
      [12.35, 78.15],
    ]
  },
  {
    id: 'AI101',
    callsign: 'AIC101',
    flightNumber: 'AI101',
    airline: 'Air India (Maharaja Livery)',
    aircraftType: 'B77W',
    aircraftModel: 'Boeing 777-337(ER)',
    photoUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80',
    photographer: 'DEL SPOTTER',
    originCode: 'DEL',
    originCity: 'NEW DELHI',
    originTimezone: '+05:30 (UTC +05:30)',
    destCode: 'JFK',
    destCity: 'NEW YORK',
    destTimezone: '-04 (UTC -04:00)',
    scheduledDep: '02:20 AM',
    actualDep: '02:25 AM',
    scheduledArr: '07:35 AM',
    estimatedArr: '07:28 AM',
    delayMinutes: 0,
    status: 'On Time',
    distanceTraveledKm: 4520,
    elapsedTime: '05:40 ago',
    distanceRemainingKm: 7230,
    remainingTime: 'in 08:35',
    progressPercent: 38,
    lat: 38.5,
    lng: 55.2,
    heading: 310,
    speedKnots: 495,
    altitudeFt: 34000,
    originCoords: [28.5562, 77.1000],
    destCoords: [40.6413, -73.7781],
    routeTrail: [
      [28.5562, 77.1000],
      [31.2, 72.1],
      [34.8, 64.5],
      [38.5, 55.2],
    ]
  },
  {
    id: 'IGO2054',
    callsign: 'IGO2054',
    flightNumber: '6E2054',
    airline: 'IndiGo Airlines',
    aircraftType: 'A21N',
    aircraftModel: 'Airbus A321-271NX',
    photoUrl: 'https://images.unsplash.com/photo-1520437358207-323b43b50729?auto=format&fit=crop&w=800&q=80',
    photographer: 'BOM AIR',
    originCode: 'BOM',
    originCity: 'MUMBAI',
    originTimezone: '+05:30 (UTC +05:30)',
    destCode: 'DEL',
    destCity: 'NEW DELHI',
    destTimezone: '+05:30 (UTC +05:30)',
    scheduledDep: '06:00 PM',
    actualDep: '06:18 PM',
    scheduledArr: '08:15 PM',
    estimatedArr: '08:24 PM',
    delayMinutes: 18,
    status: 'Delayed',
    distanceTraveledKm: 680,
    elapsedTime: '01:05 ago',
    distanceRemainingKm: 460,
    remainingTime: 'in 00:48',
    progressPercent: 60,
    lat: 23.4,
    lng: 75.1,
    heading: 25,
    speedKnots: 440,
    altitudeFt: 32000,
    originCoords: [19.0896, 72.8656],
    destCoords: [28.5562, 77.1000],
    routeTrail: [
      [19.0896, 72.8656],
      [21.1, 73.8],
      [23.4, 75.1],
    ]
  },
  {
    id: 'VTI992',
    callsign: 'VTI992',
    flightNumber: 'UK992',
    airline: 'Vistara',
    aircraftType: 'A320',
    aircraftModel: 'Airbus A320-251N',
    photoUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
    photographer: 'DEL SPOTTER',
    originCode: 'DEL',
    originCity: 'NEW DELHI',
    originTimezone: '+05:30 (UTC +05:30)',
    destCode: 'BLR',
    destCity: 'BENGALURU',
    destTimezone: '+05:30 (UTC +05:30)',
    scheduledDep: '04:15 PM',
    actualDep: '04:18 PM',
    scheduledArr: '07:05 PM',
    estimatedArr: '07:02 PM',
    delayMinutes: 0,
    status: 'On Time',
    distanceTraveledKm: 1140,
    elapsedTime: '01:45 ago',
    distanceRemainingKm: 570,
    remainingTime: 'in 00:55',
    progressPercent: 66,
    lat: 18.2,
    lng: 77.3,
    heading: 185,
    speedKnots: 465,
    altitudeFt: 36000,
    originCoords: [28.5562, 77.1000],
    destCoords: [13.1986, 77.7066],
    routeTrail: [
      [28.5562, 77.1000],
      [24.1, 77.0],
      [20.8, 77.2],
      [18.2, 77.3],
    ]
  },
  {
    id: 'UAE501',
    callsign: 'UAE501',
    flightNumber: 'EK501',
    airline: 'Emirates',
    aircraftType: 'B77W',
    aircraftModel: 'Boeing 777-31H(ER)',
    photoUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80',
    photographer: 'DXB AVIATION',
    originCode: 'BOM',
    originCity: 'MUMBAI',
    originTimezone: '+05:30 (UTC +05:30)',
    destCode: 'DXB',
    destCity: 'DUBAI',
    destTimezone: '+04 (UTC +04:00)',
    scheduledDep: '04:30 PM',
    actualDep: '04:32 PM',
    scheduledArr: '06:15 PM',
    estimatedArr: '06:10 PM',
    delayMinutes: 0,
    status: 'On Time',
    distanceTraveledKm: 1420,
    elapsedTime: '02:10 ago',
    distanceRemainingKm: 510,
    remainingTime: 'in 00:50',
    progressPercent: 74,
    lat: 23.5,
    lng: 62.4,
    heading: 290,
    speedKnots: 490,
    altitudeFt: 36000,
    originCoords: [19.0896, 72.8656],
    destCoords: [25.2532, 55.3657],
    routeTrail: [
      [19.0896, 72.8656],
      [21.2, 68.1],
      [23.5, 62.4],
    ]
  }
];

interface FlightRadarViewProps {
  onPredictDelayForFlight?: (input: FlightInput) => void;
  activeFlightNumber?: string;
}

export const FlightRadarView: React.FC<FlightRadarViewProps> = ({
  onPredictDelayForFlight,
  activeFlightNumber,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const polylineRef = useRef<L.Polyline | null>(null);

  const [flights, setFlights] = useState<RadarFlight[]>(SAMPLE_RADAR_FLIGHTS);
  const [selectedFlightId, setSelectedFlightId] = useState<string>('MAS158');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mapStyle, setMapStyle] = useState<'dark' | 'terrain' | 'satellite'>('terrain');
  const [isFollowing, setIsFollowing] = useState<boolean>(true);
  const [filterDelayOnly, setFilterDelayOnly] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

  // When activeFlightNumber changes from Predictor, resolve and select it
  useEffect(() => {
    if (!activeFlightNumber) return;

    const clean = activeFlightNumber.trim().toUpperCase().replace(/[\s-]/g, '');
    const found = flights.find(
      (f) =>
        f.id.toUpperCase().replace(/[\s-]/g, '') === clean ||
        f.flightNumber.toUpperCase().replace(/[\s-]/g, '') === clean ||
        f.callsign.toUpperCase().replace(/[\s-]/g, '') === clean
    );

    if (found) {
      setSelectedFlightId(found.id);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.panTo([found.lat, found.lng]);
        mapInstanceRef.current.setZoom(7);
      }
    } else {
      // Dynamically generate the flight and prepend to the live tracker
      const dynamicFlight = getLiveFlightTelemetry({
        airlineFullName: 'Commercial Airline',
        flightNumber: activeFlightNumber,
        departureAirportName: 'Indira Gandhi Delhi (DEL)',
        countryCode: 'IN',
      });

      setFlights((prev) => [dynamicFlight, ...prev]);
      setSelectedFlightId(dynamicFlight.id);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.panTo([dynamicFlight.lat, dynamicFlight.lng]);
        mapInstanceRef.current.setZoom(7);
      }
    }
  }, [activeFlightNumber]);

  const selectedFlight = flights.find((f) => f.id === selectedFlightId) || flights[0];

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default centered on South Asia / MAS158 area as shown in user screenshot
      const map = L.map(mapContainerRef.current, {
        center: [12.35, 78.15],
        zoom: 7,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      // Attribution
      L.control.attribution({ position: 'bottomright', prefix: 'Flightradar24 Engine' }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    // Add appropriate tile layer based on mapStyle
    let tileUrl = '';
    let attribution = '';

    if (mapStyle === 'terrain') {
      // OpenTopoMap / Humanitarian Terrain
      tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      attribution = 'Map data: &copy; OpenStreetMap contributors, SRTM';
    } else if (mapStyle === 'satellite') {
      // Esri Satellite
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS';
    } else {
      // CartoDB Dark Matter
      tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      attribution = '&copy; OpenStreetMap contributors &copy; CARTO';
    }

    L.tileLayer(tileUrl, {
      maxZoom: 18,
      attribution,
    }).addTo(map);

    return () => {
      // cleanup on unmount
    };
  }, [mapStyle]);

  // Update Plane Markers and Flight Trail
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((m) => map.removeLayer(m));
    markersRef.current = {};

    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    const filtered = flights.filter((f) => {
      if (filterDelayOnly && f.status !== 'Delayed') return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        f.callsign.toLowerCase().includes(q) ||
        f.flightNumber.toLowerCase().includes(q) ||
        f.airline.toLowerCase().includes(q) ||
        f.originCode.toLowerCase().includes(q) ||
        f.destCode.toLowerCase().includes(q)
      );
    });

    filtered.forEach((flight) => {
      const isSelected = flight.id === selectedFlightId;

      // Create Flightradar24-style custom HTML aircraft marker
      const planeSvg = `
        <div style="transform: rotate(${flight.heading}deg); transition: transform 0.5s;" class="flex items-center justify-center">
          <svg width="${isSelected ? 32 : 24}" height="${isSelected ? 32 : 24}" viewBox="0 0 24 24" fill="${isSelected ? '#ef4444' : '#fbbf24'}" stroke="${isSelected ? '#7f1d1d' : '#92400e'}" stroke-width="1.5">
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
          </svg>
        </div>
      `;

      const labelHtml = `
        <div class="relative -top-2 flex flex-col items-center pointer-events-auto">
          <div class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold whitespace-nowrap shadow-md border ${
            isSelected
              ? 'bg-red-600 text-white border-red-400'
              : 'bg-slate-900/90 text-amber-300 border-amber-500/40'
          }">
            ${flight.callsign}
          </div>
          ${planeSvg}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-flight-icon',
        html: labelHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([flight.lat, flight.lng], { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        setSelectedFlightId(flight.id);
        map.panTo([flight.lat, flight.lng]);
      });

      markersRef.current[flight.id] = marker;
    });

    // Draw active flight trail for selected flight
    if (selectedFlight) {
      // Polyline from origin coords through trail to current position and dashed to destination
      const trail = L.polyline(selectedFlight.routeTrail, {
        color: '#a855f7', // Purple trail as in user screenshot
        weight: 3,
        opacity: 0.85,
        dashArray: '4, 6',
      }).addTo(map);

      polylineRef.current = trail;

      if (isFollowing) {
        map.panTo([selectedFlight.lat, selectedFlight.lng]);
      }
    }
  }, [flights, selectedFlightId, filterDelayOnly, searchQuery, isFollowing, selectedFlight]);

  // Real-time animation simulation (planes slowly move along heading)
  useEffect(() => {
    const interval = setInterval(() => {
      setFlights((prev) =>
        prev.map((f) => {
          const rad = (f.heading * Math.PI) / 180;
          const deltaLat = Math.cos(rad) * 0.003;
          const deltaLng = Math.sin(rad) * 0.003;
          return {
            ...f,
            lat: f.lat + deltaLat,
            lng: f.lng + deltaLng,
            distanceTraveledKm: f.distanceTraveledKm + 1,
            distanceRemainingKm: Math.max(0, f.distanceRemainingKm - 1),
          };
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const handlePredictThisFlight = () => {
    if (!onPredictDelayForFlight || !selectedFlight) return;
    onPredictDelayForFlight({
      airline: selectedFlight.airline,
      flightNumber: selectedFlight.flightNumber,
      gender: 'Male',
      age: 32,
      nationality: 'India',
      airportCountryCode: selectedFlight.originCode === 'DEL' || selectedFlight.originCode === 'BOM' ? 'IN' : 'US',
      airportContinent: 'AS',
      departureDate: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="relative w-full h-[calc(100vh-8rem)] min-h-[620px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col font-sans select-none">
      {/* 1. Flightradar24 Top Header */}
      <div className="h-14 bg-slate-950/95 border-b border-slate-800/90 px-4 flex items-center justify-between gap-3 z-30">
        {/* Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-white font-mono">flightradar24</span>
              <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.2 rounded uppercase">LIVE</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">LIVE AIR TRAFFIC RADAR</span>
          </div>
        </div>

        {/* Search Bar matching screenshot */}
        <div className="relative flex-1 max-w-md hidden sm:block">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Find flights, airports and more (e.g. MAS158, AI101, 6E2054, KUL)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Tools (Map View switcher & coverage) */}
        <div className="flex items-center gap-2">
          {/* Map style dropdown */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setMapStyle('terrain')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                mapStyle === 'terrain' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Terrain
            </button>
            <button
              onClick={() => setMapStyle('dark')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                mapStyle === 'dark' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dark Radar
            </button>
            <button
              onClick={() => setMapStyle('satellite')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                mapStyle === 'satellite' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Satellite
            </button>
          </div>

          <button
            onClick={() => setFilterDelayOnly(!filterDelayOnly)}
            className={`px-2.5 py-1 rounded-lg border text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
              filterDelayOnly
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Filter className="w-3 h-3 text-amber-400" />
            <span className="hidden md:inline">Delays Only</span>
          </button>
        </div>
      </div>

      {/* 2. Map Canvas + Overlay Floating Panels */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* Leaflet Map DOM Node */}
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* 3. Left Panel: Flight Details Card (Exact replica of user's Flightradar24 screenshot) */}
        {selectedFlight && (
          <div className="absolute top-3 left-3 w-80 sm:w-96 max-h-[calc(100%-4.5rem)] z-20 bg-slate-950/95 backdrop-blur-md rounded-xl border border-slate-800 shadow-2xl overflow-y-auto flex flex-col text-slate-100 animate-fade-in">
            {/* Top Bar with Flight Number Pills and Star */}
            <div className="p-3 pb-2 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-amber-400 font-mono tracking-tight">
                  {selectedFlight.callsign}
                </span>
                <span className="text-[11px] font-mono text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                  {selectedFlight.flightNumber}
                </span>
                <span className="text-[11px] font-mono text-sky-300 bg-sky-950 px-1.5 py-0.5 rounded border border-sky-800">
                  {selectedFlight.aircraftType}
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-400">
                <button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  <Bookmark
                    className={`w-4 h-4 ${isBookmarked ? 'text-amber-400 fill-amber-400' : ''}`}
                  />
                </button>
                <div className="text-[10px] font-mono text-slate-500 font-bold">flightradar24</div>
              </div>
            </div>

            {/* Airline Header */}
            <div className="px-3.5 py-2 text-xs font-semibold text-slate-200 border-b border-slate-800/60 bg-slate-950/80">
              {selectedFlight.airline}
            </div>

            {/* Aircraft Photo */}
            <div className="relative w-full h-44 bg-slate-900 overflow-hidden border-b border-slate-800 group">
              <img
                src={selectedFlight.photoUrl}
                alt={selectedFlight.aircraftModel}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-2 left-2 text-[10px] text-white/80 font-mono bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
                <span>&copy; {selectedFlight.photographer}</span>
              </div>
              <div className="absolute bottom-2 right-2 text-[10px] text-white/90 font-mono bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-xs">
                {selectedFlight.aircraftModel}
              </div>
            </div>

            {/* Route Header (e.g. KUL -> MED) */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/90">
              <div className="flex items-center justify-between">
                {/* Origin */}
                <div className="text-left">
                  <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
                    {selectedFlight.originCode}
                  </div>
                  <div className="text-xs font-bold text-slate-300 mt-0.5">{selectedFlight.originCity}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{selectedFlight.originTimezone}</div>
                </div>

                {/* Animated Yellow Plane */}
                <div className="flex flex-col items-center px-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <svg className="w-4 h-4 -rotate-45" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                    </svg>
                  </div>
                </div>

                {/* Destination */}
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
                    {selectedFlight.destCode}
                  </div>
                  <div className="text-xs font-bold text-slate-300 mt-0.5">{selectedFlight.destCity}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{selectedFlight.destTimezone}</div>
                </div>
              </div>
            </div>

            {/* Timing & Delay Grid (SCHEDULED vs ACTUAL/ESTIMATED) */}
            <div className="p-3.5 border-b border-slate-800/80 bg-slate-900/40 space-y-2.5">
              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Scheduled Times */}
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-[11px] text-slate-400 font-medium">SCHEDULED</span>
                  <span className="font-mono font-bold text-slate-200">{selectedFlight.scheduledDep}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-[11px] text-slate-400 font-medium">SCHEDULED</span>
                  <span className="font-mono font-bold text-slate-200">{selectedFlight.scheduledArr}</span>
                </div>

                {/* Actual & Estimated (Delay indicators) */}
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-400 font-medium">ACTUAL</span>
                  <span className={`font-mono font-bold ${
                    selectedFlight.delayMinutes > 0 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {selectedFlight.actualDep}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-400 font-medium">ESTIMATED</span>
                  <div className="flex items-center gap-1 font-mono font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-slate-100">{selectedFlight.estimatedArr}</span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800/60">
                <span className="text-[11px] text-slate-400">Flight Status:</span>
                <span className={`px-2 py-0.5 rounded font-bold text-xs font-mono uppercase ${
                  selectedFlight.status === 'On Time'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : selectedFlight.status === 'Delayed'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}>
                  {selectedFlight.status} ({selectedFlight.delayMinutes > 0 ? `+${selectedFlight.delayMinutes}m` : '0m'})
                </span>
              </div>
            </div>

            {/* Flight Route Progress Bar (matching screenshot) */}
            <div className="p-3.5 border-b border-slate-800 bg-slate-950 space-y-2">
              <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-visible flex items-center">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${selectedFlight.progressPercent}%` }}
                />
                {/* Airplane Icon on Track */}
                <div
                  className="absolute -top-2.5 text-amber-400"
                  style={{ left: `calc(${selectedFlight.progressPercent}% - 8px)` }}
                >
                  <svg className="w-5 h-5 rotate-90" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                  </svg>
                </div>
              </div>

              {/* Distance and ETA */}
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>{selectedFlight.distanceTraveledKm.toLocaleString()} km, {selectedFlight.elapsedTime}</span>
                <span>{selectedFlight.distanceRemainingKm.toLocaleString()} km, {selectedFlight.remainingTime}</span>
              </div>
            </div>

            {/* Flight Telemetry Badges */}
            <div className="px-3.5 py-2.5 bg-slate-900/60 border-b border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-950 p-1.5 rounded border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">ALTITUDE</span>
                <span className="font-mono font-bold text-slate-200">{selectedFlight.altitudeFt.toLocaleString()} ft</span>
              </div>
              <div className="bg-slate-950 p-1.5 rounded border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">SPEED</span>
                <span className="font-mono font-bold text-slate-200">{selectedFlight.speedKnots} kts</span>
              </div>
              <div className="bg-slate-950 p-1.5 rounded border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">HEADING</span>
                <span className="font-mono font-bold text-slate-200">{selectedFlight.heading}&deg;</span>
              </div>
            </div>

            {/* Integrated ML Delay Prediction Trigger */}
            {onPredictDelayForFlight && (
              <div className="p-3 bg-sky-950/30 border-b border-sky-900/50">
                <button
                  onClick={handlePredictThisFlight}
                  className="w-full py-2 px-3 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Run Scikit-Learn Model On {selectedFlight.callsign}</span>
                </button>
              </div>
            )}

            {/* Action Bar matching bottom of screenshot */}
            <div className="p-2.5 bg-slate-950 grid grid-cols-5 text-center text-[10px] font-medium text-slate-400">
              <button
                onClick={() => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.setZoom(10);
                    mapInstanceRef.current.panTo([selectedFlight.lat, selectedFlight.lng]);
                  }
                }}
                className="flex flex-col items-center gap-1 hover:text-white transition-colors cursor-pointer p-1"
              >
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>3D view</span>
              </button>

              <button
                onClick={() => {
                  if (mapInstanceRef.current && polylineRef.current) {
                    mapInstanceRef.current.fitBounds(polylineRef.current.getBounds(), { padding: [50, 50] });
                  }
                }}
                className="flex flex-col items-center gap-1 hover:text-white transition-colors cursor-pointer p-1"
              >
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>Route</span>
              </button>

              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`flex flex-col items-center gap-1 transition-colors cursor-pointer p-1 ${
                  isFollowing ? 'text-amber-400' : 'hover:text-white'
                }`}
              >
                <Radio className={`w-3.5 h-3.5 ${isFollowing ? 'text-amber-400 animate-pulse' : ''}`} />
                <span>Follow</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                }}
                className="flex flex-col items-center gap-1 hover:text-white transition-colors cursor-pointer p-1"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Share</span>
              </button>

              <button
                onClick={() => {
                  // Switch to next flight
                  const idx = flights.findIndex((f) => f.id === selectedFlightId);
                  const nextFlight = flights[(idx + 1) % flights.length];
                  setSelectedFlightId(nextFlight.id);
                }}
                className="flex flex-col items-center gap-1 hover:text-white transition-colors cursor-pointer p-1"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                <span>More</span>
              </button>
            </div>
          </div>
        )}

        {/* 4. Bottom Toolbar matching screenshot */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-slate-950/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800 shadow-xl flex items-center gap-6 text-xs text-slate-300">
          <button
            onClick={() => setMapStyle(mapStyle === 'terrain' ? 'dark' : 'terrain')}
            className="flex items-center gap-1.5 hover:text-amber-400 transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-amber-400" />
            <span>Settings</span>
          </button>

          <button
            onClick={() => setMapStyle('satellite')}
            className="flex items-center gap-1.5 hover:text-amber-400 transition-colors cursor-pointer"
          >
            <CloudSun className="w-3.5 h-3.5 text-amber-400" />
            <span>Weather</span>
          </button>

          <button
            onClick={() => setFilterDelayOnly(!filterDelayOnly)}
            className="flex items-center gap-1.5 hover:text-amber-400 transition-colors cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span>Filters ({filterDelayOnly ? 'Delays' : 'All'})</span>
          </button>

          <button
            onClick={() => {
              if (selectedFlight && mapInstanceRef.current) {
                mapInstanceRef.current.panTo([selectedFlight.lat, selectedFlight.lng]);
              }
            }}
            className="flex items-center gap-1.5 hover:text-amber-400 transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Widgets</span>
          </button>

          <button
            onClick={() => {
              // Trigger slight position rewind
              if (selectedFlight) {
                setIsFollowing(true);
              }
            }}
            className="flex items-center gap-1.5 hover:text-amber-400 transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-amber-400" />
            <span>Playback</span>
          </button>
        </div>
      </div>
    </div>
  );
};
