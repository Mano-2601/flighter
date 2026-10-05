import { AirlineDataRecord, ContinentCode, FlightStatus } from '../types';

export const CONTINENTS: { code: ContinentCode; name: string }[] = [
  { code: 'NA', name: 'North America' },
  { code: 'EU', name: 'Europe' },
  { code: 'AS', name: 'Asia' },
  { code: 'OC', name: 'Oceania' },
  { code: 'AF', name: 'Africa' },
  { code: 'SA', name: 'South America' },
];

export const COUNTRIES: { code: string; name: string; continent: ContinentCode }[] = [
  { code: 'US', name: 'United States', continent: 'NA' },
  { code: 'GB', name: 'United Kingdom', continent: 'EU' },
  { code: 'CA', name: 'Canada', continent: 'NA' },
  { code: 'AU', name: 'Australia', continent: 'OC' },
  { code: 'DE', name: 'Germany', continent: 'EU' },
  { code: 'FR', name: 'France', continent: 'EU' },
  { code: 'JP', name: 'Japan', continent: 'AS' },
  { code: 'CN', name: 'China', continent: 'AS' },
  { code: 'IN', name: 'India', continent: 'AS' },
  { code: 'BR', name: 'Brazil', continent: 'SA' },
  { code: 'MX', name: 'Mexico', continent: 'NA' },
  { code: 'ES', name: 'Spain', continent: 'EU' },
  { code: 'IT', name: 'Italy', continent: 'EU' },
  { code: 'NL', name: 'Netherlands', continent: 'EU' },
  { code: 'SG', name: 'Singapore', continent: 'AS' },
  { code: 'AE', name: 'United Arab Emirates', continent: 'AS' },
  { code: 'ZA', name: 'South Africa', continent: 'AF' },
  { code: 'EG', name: 'Egypt', continent: 'AF' },
  { code: 'MY', name: 'Malaysia', continent: 'AS' },
  { code: 'NZ', name: 'New Zealand', continent: 'OC' },
  { code: 'AR', name: 'Argentina', continent: 'SA' },
];

export const NATIONALITIES: string[] = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Japan',
  'China',
  'India',
  'Brazil',
  'Mexico',
  'Spain',
  'Italy',
  'Netherlands',
  'Singapore',
  'South Africa',
  'New Zealand',
  'Argentina',
  'South Korea',
  'Sweden',
  'Switzerland',
];

export const AIRLINES: {
  code: string;
  name: string;
  fullName: string;
  defaultCountry: string;
  defaultContinent: ContinentCode;
  sampleFlightNumbers: string[];
}[] = [
  {
    code: 'AI',
    name: 'Air India',
    fullName: 'AI - Air India',
    defaultCountry: 'IN',
    defaultContinent: 'AS',
    sampleFlightNumbers: ['AI-101', 'AI-102', 'AI-302', 'AI-805', 'AI-187', 'AI-420'],
  },
  {
    code: '6E',
    name: 'IndiGo',
    fullName: '6E - IndiGo',
    defaultCountry: 'IN',
    defaultContinent: 'AS',
    sampleFlightNumbers: ['6E-2054', '6E-512', '6E-601', '6E-108', '6E-724', '6E-831'],
  },
  {
    code: 'UK',
    name: 'Vistara',
    fullName: 'UK - Vistara',
    defaultCountry: 'IN',
    defaultContinent: 'AS',
    sampleFlightNumbers: ['UK-992', 'UK-814', 'UK-720'],
  },
  {
    code: 'SG',
    name: 'SpiceJet',
    fullName: 'SG - SpiceJet',
    defaultCountry: 'IN',
    defaultContinent: 'AS',
    sampleFlightNumbers: ['SG-8169', 'SG-293', 'SG-142'],
  },
  {
    code: 'QP',
    name: 'Akasa Air',
    fullName: 'QP - Akasa Air',
    defaultCountry: 'IN',
    defaultContinent: 'AS',
    sampleFlightNumbers: ['QP-1102', 'QP-1372', 'QP-1518'],
  },
  {
    code: 'AA',
    name: 'American Airlines',
    fullName: 'AA - American Airlines',
    defaultCountry: 'US',
    defaultContinent: 'NA',
    sampleFlightNumbers: ['AA-100', 'AA-245', 'AA-789'],
  },
  {
    code: 'BA',
    name: 'British Airways',
    fullName: 'BA - British Airways',
    defaultCountry: 'GB',
    defaultContinent: 'EU',
    sampleFlightNumbers: ['BA-117', 'BA-256', 'BA-183'],
  },
  {
    code: 'EK',
    name: 'Emirates',
    fullName: 'EK - Emirates',
    defaultCountry: 'AE',
    defaultContinent: 'AS',
    sampleFlightNumbers: ['EK-501', 'EK-202', 'EK-517'],
  },
  {
    code: 'LH',
    name: 'Lufthansa',
    fullName: 'LH - Lufthansa',
    defaultCountry: 'DE',
    defaultContinent: 'EU',
    sampleFlightNumbers: ['LH-754', 'LH-400', 'LH-760'],
  },
  {
    code: 'SQ',
    name: 'Singapore Airlines',
    fullName: 'SQ - Singapore Airlines',
    defaultCountry: 'SG',
    defaultContinent: 'AS',
    sampleFlightNumbers: ['SQ-402', 'SQ-321', 'SQ-025'],
  },
  {
    code: 'MH',
    name: 'Malaysia Airlines',
    fullName: 'MH - Malaysia Airlines',
    defaultCountry: 'MY',
    defaultContinent: 'AS',
    sampleFlightNumbers: ['MAS158', 'MH158', 'MH140', 'MH004'],
  },
];

export const AIRPORTS: { [countryCode: string]: string[] } = {
  US: ['John F. Kennedy Intl (JFK)', 'Los Angeles Intl (LAX)', 'O\'Hare Intl (ORD)', 'Hartsfield-Jackson Atlanta (ATL)'],
  GB: ['London Heathrow (LHR)', 'London Gatwick (LGW)', 'Manchester Airport (MAN)'],
  CA: ['Toronto Pearson (YYZ)', 'Vancouver Intl (YVR)', 'Montréal-Trudeau (YUL)'],
  AU: ['Sydney Kingsford Smith (SYD)', 'Melbourne Airport (MEL)', 'Brisbane Airport (BNE)'],
  DE: ['Frankfurt Airport (FRA)', 'Munich Airport (MUC)', 'Berlin Brandenburg (BER)'],
  FR: ['Charles de Gaulle (CDG)', 'Orly Airport (ORY)', 'Nice Côte d\'Azur (NCE)'],
  JP: ['Tokyo Haneda (HND)', 'Narita Intl (NRT)', 'Kansai Intl (KIX)'],
  CN: ['Beijing Capital (PEK)', 'Shanghai Pudong (PVG)', 'Guangzhou Baiyun (CAN)'],
  IN: [
    'Indira Gandhi Delhi (DEL)',
    'Chhatrapati Shivaji Mumbai (BOM)',
    'Kempegowda Bangalore (BLR)',
    'Chennai Intl (MAA)',
    'Rajiv Gandhi Hyderabad (HYD)',
    'Netaji Subhash Chandra Bose Kolkata (CCU)',
  ],
  MY: [
    'Kuala Lumpur Intl (KUL)',
    'Penang Intl (PEN)',
    'Kota Kinabalu (BKI)',
  ],
  BR: ['São Paulo-Guarulhos (GRU)', 'Rio de Janeiro-Galeão (GIG)'],
  MX: ['Mexico City Intl (MEX)', 'Cancún Intl (CUN)'],
  ES: ['Madrid-Barajas (MAD)', 'Barcelona-El Prat (BCN)'],
  IT: ['Rome Fiumicino (FCO)', 'Milan Malpensa (MXP)'],
  NL: ['Amsterdam Schiphol (AMS)'],
  SG: ['Singapore Changi (SIN)'],
  AE: ['Dubai Intl (DXB)', 'Abu Dhabi Intl (AUH)'],
  ZA: ['O.R. Tambo Johannesburg (JNB)', 'Cape Town Intl (CPT)'],
  EG: ['Cairo Intl (CAI)'],
  NZ: ['Auckland Airport (AKL)'],
  AR: ['Ministro Pistarini Ezeiza (EZE)'],
};

// Generates a reproducible, balanced dataset simulating the exact distribution of Kaggle Airline Dataset
export function generateSyntheticAirlineDataset(count = 300): AirlineDataRecord[] {
  const records: AirlineDataRecord[] = [];
  const firstNames = ['James', 'Emma', 'Liam', 'Olivia', 'Noah', 'Sophia', 'Alexander', 'Mia', 'William', 'Ava', 'Lucas', 'Isabella', 'Henry', 'Evelyn', 'Benjamin', 'Amelia', 'Sebastian', 'Harper', 'Jack', 'Charlotte'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
  const statuses: FlightStatus[] = ['On Time', 'Delayed', 'Cancelled'];

  // Seeded pseudo-random generator for reproducibility
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (let i = 1; i <= count; i++) {
    const countryObj = COUNTRIES[Math.floor(rand() * COUNTRIES.length)];
    const countryAirports = AIRPORTS[countryObj.code] || ['International Airport'];
    const airport = countryAirports[Math.floor(rand() * countryAirports.length)];
    const nationality = rand() > 0.4 ? countryObj.name : NATIONALITIES[Math.floor(rand() * NATIONALITIES.length)];
    const gender: 'Male' | 'Female' = rand() > 0.48 ? 'Male' : 'Female';
    const age = Math.floor(rand() * 70) + 18;

    // Date generation across 2025/2026
    const month = Math.floor(rand() * 12) + 1;
    const day = Math.floor(rand() * 28) + 1;
    const dateStr = `2025-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const dateObj = new Date(dateStr);
    const dayOfWeek = (dateObj.getDay() + 6) % 7; // 0 = Monday ... 6 = Sunday

    // Status: balanced ~33.3% distribution as observed in real airline dataset benchmark
    const statusIndex = (i % 3);
    const flightStatus = statuses[statusIndex];

    const airlineObj = AIRLINES[Math.floor(rand() * AIRLINES.length)];
    const flightNum = airlineObj.sampleFlightNumbers[Math.floor(rand() * airlineObj.sampleFlightNumbers.length)];

    records.push({
      id: `FL-${1000 + i}`,
      passengerId: `PAX-${50000 + i}`,
      firstName: firstNames[Math.floor(rand() * firstNames.length)],
      lastName: lastNames[Math.floor(rand() * lastNames.length)],
      gender,
      age,
      nationality,
      airline: airlineObj.fullName,
      flightNumber: flightNum,
      airportName: airport,
      airportCountryCode: countryObj.code,
      airportContinent: countryObj.continent,
      departureDate: dateStr,
      depMonth: month,
      depDayOfWeek: dayOfWeek,
      flightStatus,
    });
  }

  return records;
}

export const INITIAL_DATASET = generateSyntheticAirlineDataset(360);

// Generates CSV text content for "Airline Dataset.csv" matching the expected schema
export function generateAirlineCsv(records: AirlineDataRecord[]): string {
  const headers = [
    'Passenger ID',
    'First Name',
    'Last Name',
    'Gender',
    'Age',
    'Nationality',
    'Airport Name',
    'Airport Country Code',
    'Airport Continent',
    'Departure Date',
    'Flight Status',
  ];

  const rows = records.map((r) => [
    `"${r.passengerId}"`,
    `"${r.firstName}"`,
    `"${r.lastName}"`,
    `"${r.gender}"`,
    r.age,
    `"${r.nationality}"`,
    `"${r.airportName}"`,
    `"${r.airportCountryCode}"`,
    `"${r.airportContinent}"`,
    `"${r.departureDate}"`,
    `"${r.flightStatus}"`,
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}
