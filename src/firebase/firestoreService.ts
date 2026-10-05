import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { auth, db } from './config';
import { AirlineDataRecord, FlightInput, FlightStatus, ModelMetrics, PredictionResult } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || false,
      isAnonymous: auth.currentUser?.isAnonymous || false,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface SavedPredictionDocument {
  id: string;
  userId: string;
  userEmail?: string;
  airline?: string;
  flightNumber?: string;
  gender: string;
  age: number;
  nationality: string;
  airportCountryCode: string;
  airportContinent: string;
  departureDate: string;
  predictedStatus: FlightStatus;
  confidence: number;
  probabilities: {
    'On Time': number;
    'Delayed': number;
    'Cancelled': number;
  };
  createdAtIso: string;
}

export interface SavedModelCheckpointDocument {
  id: string;
  testSplit: number;
  iterations: number;
  regularizationC: number;
  accuracy: number;
  f1Score: number;
  precision: number;
  recall: number;
  testSetSize: number;
  trainSetSize: number;
  savedBy?: string;
  createdAtIso: string;
}

// 1. Save prediction to Firestore
export async function savePrediction(
  input: FlightInput,
  result: PredictionResult
): Promise<string> {
  const path = 'predictions';
  const predictionId = `pred_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const currentUser = auth.currentUser;

  const payload = {
    id: predictionId,
    userId: currentUser?.uid || 'guest_user',
    userEmail: currentUser?.email || 'Anonymous Traveler',
    airline: input.airline || 'AI - Air India',
    flightNumber: input.flightNumber || 'AI-101',
    gender: input.gender,
    age: input.age,
    nationality: input.nationality,
    airportCountryCode: input.airportCountryCode,
    airportContinent: input.airportContinent,
    departureDate: input.departureDate,
    predictedStatus: result.predictedStatus,
    confidence: result.probabilities[result.predictedStatus],
    probabilities: result.probabilities,
    createdAt: serverTimestamp(),
    createdAtIso: new Date().toISOString(),
  };

  try {
    const docRef = doc(db, path, predictionId);
    await setDoc(docRef, payload);
    return predictionId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${path}/${predictionId}`);
  }
}

// 2. Fetch recent predictions
export async function fetchRecentPredictions(maxCount = 25): Promise<SavedPredictionDocument[]> {
  const path = 'predictions';
  try {
    const q = query(collection(db, path), limit(maxCount));
    const snapshot = await getDocs(q);
    const list: SavedPredictionDocument[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      list.push({
        id: d.id,
        userId: data.userId || '',
        userEmail: data.userEmail || 'Anonymous',
        gender: data.gender,
        age: data.age,
        nationality: data.nationality,
        airportCountryCode: data.airportCountryCode,
        airportContinent: data.airportContinent,
        departureDate: data.departureDate,
        predictedStatus: data.predictedStatus,
        confidence: data.confidence || 0,
        probabilities: data.probabilities || { 'On Time': 0.33, Delayed: 0.33, Cancelled: 0.33 },
        createdAtIso: data.createdAtIso || new Date().toISOString(),
      });
    });
    // Sort descending by creation
    return list.sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// 3. Delete prediction
export async function deletePrediction(id: string): Promise<void> {
  const path = `predictions/${id}`;
  try {
    await deleteDoc(doc(db, 'predictions', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 4. Save trained model checkpoint
export async function saveModelCheckpoint(
  metrics: ModelMetrics,
  config: { testSplit: number; iterations: number; regularizationC: number }
): Promise<string> {
  const path = 'model_checkpoints';
  const checkpointId = `ckpt_${Date.now()}`;
  const currentUser = auth.currentUser;

  const payload = {
    id: checkpointId,
    testSplit: config.testSplit,
    iterations: config.iterations,
    regularizationC: config.regularizationC,
    accuracy: metrics.accuracy,
    f1Score: metrics.f1Score,
    precision: metrics.precision,
    recall: metrics.recall,
    testSetSize: metrics.testSetSize,
    trainSetSize: metrics.trainSetSize,
    savedBy: currentUser?.email || 'System / Auto',
    createdAt: serverTimestamp(),
    createdAtIso: new Date().toISOString(),
  };

  try {
    const docRef = doc(db, path, checkpointId);
    await setDoc(docRef, payload);
    return checkpointId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${path}/${checkpointId}`);
  }
}

// 5. Fetch model checkpoints
export async function fetchModelCheckpoints(): Promise<SavedModelCheckpointDocument[]> {
  const path = 'model_checkpoints';
  try {
    const q = query(collection(db, path), limit(20));
    const snapshot = await getDocs(q);
    const list: SavedModelCheckpointDocument[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      list.push({
        id: d.id,
        testSplit: data.testSplit || 0.2,
        iterations: data.iterations || 500,
        regularizationC: data.regularizationC || 1.0,
        accuracy: data.accuracy || 0,
        f1Score: data.f1Score || 0,
        precision: data.precision || 0,
        recall: data.recall || 0,
        testSetSize: data.testSetSize || 0,
        trainSetSize: data.trainSetSize || 0,
        savedBy: data.savedBy,
        createdAtIso: data.createdAtIso || new Date().toISOString(),
      });
    });
    return list.sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// 6. Batch sync dataset into Firestore
export async function syncDatasetBatch(records: AirlineDataRecord[]): Promise<number> {
  const path = 'dataset';
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Please sign in to sync datasets with the cloud database.');
  }

  try {
    // Sync first 50 records in batch for efficiency
    const slice = records.slice(0, 50);
    const batch = writeBatch(db);

    slice.forEach((r) => {
      const docRef = doc(db, path, r.passengerId.replace(/[^a-zA-Z0-9_\-]/g, '_'));
      batch.set(docRef, {
        passengerId: r.passengerId,
        firstName: r.firstName,
        lastName: r.lastName,
        gender: r.gender,
        age: r.age,
        nationality: r.nationality,
        airportName: r.airportName,
        airportCountryCode: r.airportCountryCode,
        airportContinent: r.airportContinent,
        departureDate: r.departureDate,
        flightStatus: r.flightStatus,
        syncedAt: serverTimestamp(),
      });
    });

    await batch.commit();
    return slice.length;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 7. Load dataset from Firestore
export async function loadDatasetFromFirestore(): Promise<AirlineDataRecord[]> {
  const path = 'dataset';
  try {
    const snapshot = await getDocs(collection(db, path));
    const records: AirlineDataRecord[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      const dObj = new Date(data.departureDate + 'T12:00:00Z');
      records.push({
        id: d.id,
        passengerId: data.passengerId,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        age: data.age,
        nationality: data.nationality,
        airportName: data.airportName,
        airportCountryCode: data.airportCountryCode,
        airportContinent: data.airportContinent,
        departureDate: data.departureDate,
        depMonth: isNaN(dObj.getTime()) ? 6 : dObj.getUTCMonth() + 1,
        depDayOfWeek: isNaN(dObj.getTime()) ? 3 : (dObj.getUTCDay() + 6) % 7,
        flightStatus: data.flightStatus,
      });
    });
    return records;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}
