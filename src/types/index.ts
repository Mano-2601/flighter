export type FlightStatus = 'On Time' | 'Delayed' | 'Cancelled';

export type ContinentCode = 'NA' | 'EU' | 'AS' | 'OC' | 'AF' | 'SA';

export interface FlightInput {
  airline?: string; // e.g. 'AI - Air India', '6E - IndiGo'
  flightNumber?: string; // e.g. 'AI-101', '6E-2054'
  gender: string;
  age: number;
  nationality: string;
  airportCountryCode: string;
  airportContinent: ContinentCode;
  departureDate: string; // YYYY-MM-DD
}

export interface PredictionResult {
  predictedStatus: FlightStatus;
  probabilities: {
    'On Time': number;
    'Delayed': number;
    'Cancelled': number;
  };
  featureContributions: {
    feature: string;
    label: string;
    impact: number; // positive increases probability of current prediction
    description: string;
  }[];
  timestamp: string;
}

export interface AirlineDataRecord {
  id: string;
  passengerId: string;
  firstName: string;
  lastName: string;
  gender: 'Male' | 'Female';
  age: number;
  nationality: string;
  airline?: string;
  flightNumber?: string;
  airportName: string;
  airportCountryCode: string;
  airportContinent: ContinentCode;
  departureDate: string;
  depMonth: number;
  depDayOfWeek: number;
  flightStatus: FlightStatus;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  testSetSize: number;
  trainSetSize: number;
  confusionMatrix: {
    matrix: number[][]; // 3x3: [actual][predicted]
    labels: FlightStatus[];
  };
  classReports: {
    status: FlightStatus;
    precision: number;
    recall: number;
    f1: number;
    support: number;
  }[];
}

export interface ModelTrainingConfig {
  testSplit: number; // e.g. 0.20
  iterations: number; // e.g. 500
  regularizationC: number; // e.g. 1.0
  features: {
    gender: boolean;
    age: boolean;
    nationality: boolean;
    airportCountryCode: boolean;
    airportContinent: boolean;
    depMonth: boolean;
    depDayOfWeek: boolean;
  };
}
