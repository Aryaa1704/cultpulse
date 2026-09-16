// CultPulse 1M Scale Engine: High-Throughput User State, 0ms Optimistic UI & Sync Manager
import { MealSection, WorkoutProtocol, AnalyticsData, DietaryPreference } from '../types';
import { emptyMealSections, workoutProtocols, mockAnalyticsData } from '../data/mockData';
import { sanitizeInput } from './securityEngine';

export interface UserAppState {
  userId: string;
  userEmail?: string | null;
  displayName?: string | null;
  dietaryPreference?: DietaryPreference;
  dayOffset: number;
  dailyGoal: number;
  burnSynced: number;
  waterMl: number;
  waterGoalMl: number;
  mealSections: MealSection[];
  protocols: WorkoutProtocol[];
  analyticsData: AnalyticsData;
  updatedAt: number;
  version: number;
}

export interface ScaleTelemetry {
  fps: number;
  lastMutationLatencyMs: number;
  queuedMutationsCount: number;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  isOnline: boolean;
  totalMutationsProcessed: number;
  storageBytesUsed: number;
  activeUserId: string;
}

export interface UserActivityEvent {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string | null;
  userAvatar?: string;
  actionType: 'FOOD_LOG' | 'WATER_LOG' | 'WORKOUT_START' | 'WORKOUT_COMPLETE' | 'SIGN_IN' | 'DATE_CHANGE' | 'DAY_RESET' | 'CUSTOM';
  title: string;
  description: string;
  metrics?: {
    calories?: number;
    waterMl?: number;
    burnKcal?: number;
    macros?: { carbs: number; protein: number; fats: number };
  };
  deviceInfo?: string;
  timestamp: number;
}

export interface RegisteredUserSummary {
  userId: string;
  name: string;
  email: string | null;
  avatarUrl: string;
  role: 'admin' | 'athlete' | 'trainer';
  status: 'online' | 'idle' | 'offline';
  lastActive: number;
  caloriesLoggedToday: number;
  dailyCalorieGoal: number;
  activeBurnToday: number;
  waterLoggedToday: number;
  streakDays: number;
  workoutsCompleted: number;
  currentDayMealCount: number;
  device: string;
}

const STORAGE_PREFIX = 'cultpulse_scale_user_';
const GUEST_ID_KEY = 'cultpulse_guest_device_id';
const GLOBAL_ACTIVITY_KEY = 'cultpulse_global_activity_feed';
const GLOBAL_USERS_KEY = 'cultpulse_global_users_directory';

export function getOrCreateGuestId(): string {
  let guestId = localStorage.getItem(GUEST_ID_KEY);
  if (!guestId) {
    guestId = 'guest_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  return guestId;
}

// In-Memory Hot Cache for 0ms access
const memoryCache: Map<string, UserAppState> = new Map();

// Debounce timer map for background persistence
let debounceSaveTimer: any = null;
const mutationQueue: { id: string; type: string; payload: any; timestamp: number }[] = [];

// Listeners for telemetry
type TelemetryListener = (telemetry: ScaleTelemetry) => void;
const telemetryListeners: Set<TelemetryListener> = new Set();

type ActivityListener = (activities: UserActivityEvent[]) => void;
const activityListeners: Set<ActivityListener> = new Set();

type UsersListener = (users: RegisteredUserSummary[]) => void;
const usersListeners: Set<UsersListener> = new Set();

let lastFrameTime = performance.now();
let frameCount = 0;
let currentFps = 60;
let totalMutations = 0;
let lastLatencyMs = 0.4;
let syncStatus: 'synced' | 'syncing' | 'offline' | 'error' = 'synced';

// Pre-seeded Active Community Athletes for the Admin Telemetry Hub
const defaultCommunityUsers: RegisteredUserSummary[] = [
  {
    userId: 'usr_aryan_admin',
    name: 'Aryan Sharma',
    email: 'admin.protected@cultpulse.internal',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
    role: 'admin',
    status: 'online',
    lastActive: Date.now() - 1000 * 30, // 30s ago
    caloriesLoggedToday: 2150,
    dailyCalorieGoal: 2200,
    activeBurnToday: 420,
    waterLoggedToday: 2250,
    streakDays: 14,
    workoutsCompleted: 1,
    currentDayMealCount: 4,
    device: 'Web Client • Chrome on MacOS (60 FPS)',
  },
  {
    userId: 'usr_priya_01',
    name: 'Priya Patel',
    email: 'priya.patel@fitness.io',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&auto=format&fit=crop&q=80',
    role: 'athlete',
    status: 'online',
    lastActive: Date.now() - 1000 * 90,
    caloriesLoggedToday: 1840,
    dailyCalorieGoal: 2000,
    activeBurnToday: 510,
    waterLoggedToday: 2750,
    streakDays: 21,
    workoutsCompleted: 2,
    currentDayMealCount: 3,
    device: 'PWA Mobile • iOS 18 (Safari)',
  },
  {
    userId: 'usr_marcus_02',
    name: 'Marcus Vance',
    email: 'marcus.v@hypertrophy.net',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
    role: 'trainer',
    status: 'online',
    lastActive: Date.now() - 1000 * 240,
    caloriesLoggedToday: 2850,
    dailyCalorieGoal: 3000,
    activeBurnToday: 780,
    waterLoggedToday: 3500,
    streakDays: 45,
    workoutsCompleted: 2,
    currentDayMealCount: 5,
    device: 'Android • Pixel 9 Pro',
  },
  {
    userId: 'usr_elena_03',
    name: 'Elena Rostova',
    email: 'elena.rostova@crossfit.org',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80',
    role: 'athlete',
    status: 'idle',
    lastActive: Date.now() - 1000 * 600,
    caloriesLoggedToday: 1950,
    dailyCalorieGoal: 2100,
    activeBurnToday: 620,
    waterLoggedToday: 2100,
    streakDays: 8,
    workoutsCompleted: 1,
    currentDayMealCount: 3,
    device: 'Web Client • Edge on Windows 11',
  },
  {
    userId: 'usr_rohan_04',
    name: 'Rohan Mehta',
    email: 'rohan.mehta@cultfit.in',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
    role: 'athlete',
    status: 'offline',
    lastActive: Date.now() - 1000 * 3600 * 2,
    caloriesLoggedToday: 1650,
    dailyCalorieGoal: 2400,
    activeBurnToday: 350,
    waterLoggedToday: 1500,
    streakDays: 3,
    workoutsCompleted: 1,
    currentDayMealCount: 2,
    device: 'PWA Mobile • Samsung Galaxy S24',
  },
];

const initialActivities: UserActivityEvent[] = [
  {
    id: 'act_seed_1',
    userId: 'usr_aryan_admin',
    userName: 'Aryan Sharma',
    userEmail: 'admin.protected@cultpulse.internal',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
    actionType: 'FOOD_LOG',
    title: 'Logged Dinner',
    description: 'Added Grilled Salmon & Roasted Asparagus (+480 kcal, 42g protein)',
    metrics: { calories: 480, macros: { carbs: 12, protein: 42, fats: 22 } },
    deviceInfo: 'MacOS Chrome',
    timestamp: Date.now() - 1000 * 45,
  },
  {
    id: 'act_seed_2',
    userId: 'usr_priya_01',
    userName: 'Priya Patel',
    userEmail: 'priya.patel@fitness.io',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&auto=format&fit=crop&q=80',
    actionType: 'WORKOUT_COMPLETE',
    title: 'Completed Live Protocol',
    description: 'Finished "Metabolic Conditioning & Core" session (+380 kcal burned)',
    metrics: { burnKcal: 380 },
    deviceInfo: 'iOS Safari',
    timestamp: Date.now() - 1000 * 120,
  },
  {
    id: 'act_seed_3',
    userId: 'usr_marcus_02',
    userName: 'Marcus Vance',
    userEmail: 'marcus.v@hypertrophy.net',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
    actionType: 'WATER_LOG',
    title: 'Logged Hydration',
    description: 'Logged +500ml Water (Daily Total: 3,500ml - Target Achieved)',
    metrics: { waterMl: 500 },
    deviceInfo: 'Android Pixel 9',
    timestamp: Date.now() - 1000 * 300,
  },
  {
    id: 'act_seed_4',
    userId: 'usr_elena_03',
    userName: 'Elena Rostova',
    userEmail: 'elena.rostova@crossfit.org',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80',
    actionType: 'SIGN_IN',
    title: 'User Authenticated',
    description: 'Signed in via Google OAuth with 5 Workspace scopes authorized',
    deviceInfo: 'Windows Edge',
    timestamp: Date.now() - 1000 * 650,
  },
];

// Initialize Global Activity Store
let globalActivities: UserActivityEvent[] = [];
let globalUsers: RegisteredUserSummary[] = [];

try {
  const cachedActs = localStorage.getItem(GLOBAL_ACTIVITY_KEY);
  globalActivities = cachedActs ? JSON.parse(cachedActs) : initialActivities;
} catch {
  globalActivities = initialActivities;
}

try {
  const cachedUsers = localStorage.getItem(GLOBAL_USERS_KEY);
  globalUsers = cachedUsers ? JSON.parse(cachedUsers) : defaultCommunityUsers;
} catch {
  globalUsers = defaultCommunityUsers;
}

// Start FPS loop (lightweight, runs via requestAnimationFrame)
if (typeof window !== 'undefined') {
  function measureFps(now: number) {
    frameCount++;
    const delta = now - lastFrameTime;
    if (delta >= 1000) {
      currentFps = Math.round((frameCount * 1000) / delta);
      frameCount = 0;
      lastFrameTime = now;
      notifyTelemetry();
    }
    requestAnimationFrame(measureFps);
  }
  requestAnimationFrame(measureFps);

  window.addEventListener('online', () => {
    syncStatus = 'syncing';
    notifyTelemetry();
    flushMutationQueue();
  });

  window.addEventListener('offline', () => {
    syncStatus = 'offline';
    notifyTelemetry();
  });
}

function calculateStorageSize(userId: string): number {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + userId);
    return raw ? raw.length * 2 : 0;
  } catch {
    return 0;
  }
}

export function getScaleTelemetry(userId: string): ScaleTelemetry {
  return {
    fps: currentFps,
    lastMutationLatencyMs: Math.round(lastLatencyMs * 100) / 100,
    queuedMutationsCount: mutationQueue.length,
    syncStatus: typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : syncStatus,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    totalMutationsProcessed: totalMutations,
    storageBytesUsed: calculateStorageSize(userId),
    activeUserId: userId,
  };
}

export function subscribeTelemetry(listener: TelemetryListener): () => void {
  telemetryListeners.add(listener);
  return () => {
    telemetryListeners.delete(listener);
  };
}

let activeSubscribedUserId = 'default';
export function setActiveTelemetryUserId(uid: string) {
  activeSubscribedUserId = uid;
  notifyTelemetry();
}

function notifyTelemetry() {
  const telemetry = getScaleTelemetry(activeSubscribedUserId);
  telemetryListeners.forEach((fn) => {
    try {
      fn(telemetry);
    } catch (e) {
      console.error(e);
    }
  });
}

// ========================
// GLOBAL ACTIVITY & USER REGISTRY
// ========================

export function getGlobalActivities(): UserActivityEvent[] {
  return globalActivities;
}

export function getGlobalUsers(): RegisteredUserSummary[] {
  return globalUsers;
}

export function subscribeGlobalActivity(listener: ActivityListener): () => void {
  activityListeners.add(listener);
  listener(globalActivities);
  return () => {
    activityListeners.delete(listener);
  };
}

export function subscribeUserDirectory(listener: UsersListener): () => void {
  usersListeners.add(listener);
  listener(globalUsers);
  return () => {
    usersListeners.delete(listener);
  };
}

function notifyGlobalActivities() {
  try {
    localStorage.setItem(GLOBAL_ACTIVITY_KEY, JSON.stringify(globalActivities.slice(0, 100)));
  } catch (e) {
    console.warn('Failed to persist global activities:', e);
  }
  activityListeners.forEach((fn) => {
    try {
      fn([...globalActivities]);
    } catch (e) {
      console.error(e);
    }
  });
}

function notifyGlobalUsers() {
  try {
    localStorage.setItem(GLOBAL_USERS_KEY, JSON.stringify(globalUsers));
  } catch (e) {
    console.warn('Failed to persist users:', e);
  }
  usersListeners.forEach((fn) => {
    try {
      fn([...globalUsers]);
    } catch (e) {
      console.error(e);
    }
  });
}

export function recordUserActivity(event: Omit<UserActivityEvent, 'id' | 'timestamp'>) {
  const fullEvent: UserActivityEvent = {
    ...event,
    title: sanitizeInput(event.title),
    description: sanitizeInput(event.description),
    userName: sanitizeInput(event.userName),
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
  };

  globalActivities = [fullEvent, ...globalActivities].slice(0, 150);
  notifyGlobalActivities();

  // Update user in directory as well
  upsertUserInDirectory({
    userId: event.userId,
    name: event.userName,
    email: event.userEmail || null,
    avatarUrl: event.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
    lastActive: Date.now(),
    status: 'online',
  });
}

export function upsertUserInDirectory(patch: Partial<RegisteredUserSummary> & { userId: string; name: string }) {
  const existingIdx = globalUsers.findIndex((u) => u.userId === patch.userId);
  if (existingIdx >= 0) {
    globalUsers[existingIdx] = {
      ...globalUsers[existingIdx],
      ...patch,
      lastActive: Date.now(),
      status: 'online',
    };
  } else {
    const isOwner = patch.userId === 'usr_aryan_admin' || patch.role === 'admin';
    const newUser: RegisteredUserSummary = {
      userId: patch.userId,
      name: sanitizeInput(patch.name),
      email: patch.email || null,
      avatarUrl: patch.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
      role: isOwner ? 'admin' : 'athlete',
      status: 'online',
      lastActive: Date.now(),
      caloriesLoggedToday: patch.caloriesLoggedToday || 0,
      dailyCalorieGoal: patch.dailyCalorieGoal || 2200,
      activeBurnToday: patch.activeBurnToday || 0,
      waterLoggedToday: patch.waterLoggedToday || 0,
      streakDays: patch.streakDays || 1,
      workoutsCompleted: patch.workoutsCompleted || 0,
      currentDayMealCount: patch.currentDayMealCount || 0,
      device: patch.device || (typeof navigator !== 'undefined' ? `${navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'} Client` : 'Web Browser'),
    };
    globalUsers = [newUser, ...globalUsers];
  }
  notifyGlobalUsers();
}

// Live Community Simulation Engine (Generates live realistic actions from community athletes)
let simulationInterval: any = null;
let isSimulationActive = true;

export function toggleCommunityLiveSimulation(enable: boolean) {
  isSimulationActive = enable;
  if (!enable && simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
    return;
  }

  if (enable && !simulationInterval && typeof window !== 'undefined') {
    startCommunitySimulation();
  }
}

function startCommunitySimulation() {
  if (simulationInterval) clearInterval(simulationInterval);

  const sampleActions = [
    {
      user: defaultCommunityUsers[1], // Priya
      type: 'WATER_LOG' as const,
      title: 'Logged Hydration',
      description: 'Added +250ml Electrolyte Water',
      metrics: { waterMl: 250 },
    },
    {
      user: defaultCommunityUsers[2], // Marcus
      type: 'FOOD_LOG' as const,
      title: 'Logged Post-Workout Fuel',
      description: 'Added Whey Isolate Shake & Banana (+320 kcal, 36g protein)',
      metrics: { calories: 320, macros: { carbs: 32, protein: 36, fats: 3 } },
    },
    {
      user: defaultCommunityUsers[3], // Elena
      type: 'WORKOUT_COMPLETE' as const,
      title: 'Completed Workout',
      description: 'Finished 45-minute HIIT Protocol (+420 kcal burned)',
      metrics: { burnKcal: 420 },
    },
    {
      user: defaultCommunityUsers[4], // Rohan
      type: 'FOOD_LOG' as const,
      title: 'Logged Lunch',
      description: 'Added Brown Rice Bowl with Tofu & Broccoli (+520 kcal)',
      metrics: { calories: 520, macros: { carbs: 64, protein: 28, fats: 14 } },
    },
  ];

  simulationInterval = setInterval(() => {
    if (!isSimulationActive) return;
    const randomAction = sampleActions[Math.floor(Math.random() * sampleActions.length)];
    recordUserActivity({
      userId: randomAction.user.userId,
      userName: randomAction.user.name,
      userEmail: randomAction.user.email,
      userAvatar: randomAction.user.avatarUrl,
      actionType: randomAction.type,
      title: randomAction.title,
      description: randomAction.description,
      metrics: randomAction.metrics,
      deviceInfo: randomAction.user.device,
    });
  }, 12000); // realistic 12s live pulse
}

// Auto-start simulation on boot
if (typeof window !== 'undefined') {
  startCommunitySimulation();
}

// Load state with multi-tier fallback (Memory -> LocalStorage -> Default Template)
export function loadUserAppState(userId: string, email?: string | null, displayName?: string | null): UserAppState {
  activeSubscribedUserId = userId;

  // Ensure user is present in global directory
  const resolvedName = displayName || (email ? email.split('@')[0] : (userId.startsWith('guest_') ? 'Athlete (Guest)' : 'Cult Athlete'));
  upsertUserInDirectory({
    userId,
    name: resolvedName,
    email: email || null,
    status: 'online',
    lastActive: Date.now(),
  });

  // 1. Check Memory Cache
  if (memoryCache.has(userId)) {
    return memoryCache.get(userId)!;
  }

  // 2. Check LocalStorage
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + userId);
    if (raw) {
      const parsed: UserAppState = JSON.parse(raw);
      if (email) parsed.userEmail = email;
      if (displayName) parsed.displayName = displayName;
      memoryCache.set(userId, parsed);
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to parse cached user state:', err);
  }

  // 3. Fallback Initial Blueprint - Clean, unpolluted state for new users
  const initialData: UserAppState = {
    userId,
    userEmail: email || null,
    displayName: resolvedName,
    dayOffset: 0,
    dailyGoal: 2200,
    burnSynced: 0,
    waterMl: 0,
    waterGoalMl: 3000,
    mealSections: JSON.parse(JSON.stringify(emptyMealSections)),
    protocols: JSON.parse(JSON.stringify(workoutProtocols)),
    analyticsData: {
      ...mockAnalyticsData,
      athlete: {
        ...mockAnalyticsData.athlete,
        name: resolvedName,
      },
    },
    updatedAt: Date.now(),
    version: 1,
  };

  memoryCache.set(userId, initialData);
  saveUserAppStateNow(initialData);
  return initialData;
}

// Synchronous immediate memory update + debounced non-blocking persistent write
export function saveUserAppStateOptimistic(
  state: UserAppState,
  mutationType: string,
  payload?: any
): UserAppState {
  const t0 = performance.now();
  totalMutations++;

  const updatedState: UserAppState = {
    ...state,
    updatedAt: Date.now(),
    version: (state.version || 1) + 1,
  };

  // Immediate hot memory cache update (0ms lag)
  memoryCache.set(updatedState.userId, updatedState);

  // Measure execution speed
  const t1 = performance.now();
  lastLatencyMs = Math.max(0.1, t1 - t0);

  // Push to mutation sync queue
  mutationQueue.push({
    id: `m_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    type: mutationType,
    payload,
    timestamp: Date.now(),
  });

  syncStatus = 'syncing';
  notifyTelemetry();

  // Update user statistics in directory
  const totalCaloriesLogged = updatedState.mealSections.reduce((acc, sec) => acc + sec.calories, 0);
  const totalMeals = updatedState.mealSections.reduce((acc, sec) => acc + sec.items.length, 0);

  upsertUserInDirectory({
    userId: updatedState.userId,
    name: updatedState.displayName || 'Cult Athlete',
    email: updatedState.userEmail || null,
    caloriesLoggedToday: totalCaloriesLogged,
    dailyCalorieGoal: updatedState.dailyGoal,
    activeBurnToday: updatedState.burnSynced,
    waterLoggedToday: updatedState.waterMl,
    currentDayMealCount: totalMeals,
    streakDays: updatedState.analyticsData.athlete.streakDays,
    lastActive: Date.now(),
  });

  // Debounced persistence to avoid blocking UI during fast bursts
  if (debounceSaveTimer) clearTimeout(debounceSaveTimer);
  debounceSaveTimer = setTimeout(() => {
    saveUserAppStateNow(updatedState);
  }, 250);

  return updatedState;
}

function saveUserAppStateNow(state: UserAppState) {
  try {
    localStorage.setItem(STORAGE_PREFIX + state.userId, JSON.stringify(state));
    flushMutationQueue();
  } catch (err) {
    console.error('Persistence error:', err);
    syncStatus = 'error';
    notifyTelemetry();
  }
}

function flushMutationQueue() {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    syncStatus = 'offline';
    notifyTelemetry();
    return;
  }

  setTimeout(() => {
    mutationQueue.length = 0;
    syncStatus = 'synced';
    notifyTelemetry();
  }, 120);
}

// High-Throughput Concurrency / Stress Test Simulator
export function runScaleBurstStressTest(
  currentState: UserAppState,
  onProgress: (step: number, total: number, state: UserAppState) => void
): Promise<UserAppState> {
  return new Promise((resolve) => {
    const totalOps = 50;
    let currentStep = 0;
    let activeState = { ...currentState };

    const interval = setInterval(() => {
      currentStep++;

      if (currentStep % 3 === 0) {
        activeState = saveUserAppStateOptimistic(
          {
            ...activeState,
            waterMl: Math.min(activeState.waterGoalMl + 1000, activeState.waterMl + 50),
          },
          'BURST_WATER_LOG',
          { amount: 50 }
        );
      } else if (currentStep % 3 === 1) {
        activeState = saveUserAppStateOptimistic(
          {
            ...activeState,
            burnSynced: activeState.burnSynced + 10,
          },
          'BURST_CALORIE_BURN',
          { calories: 10 }
        );
      } else {
        const updatedProtocols = activeState.protocols.map((p, idx) =>
          idx === 0 ? { ...p, isFavorite: !p.isFavorite } : p
        );
        activeState = saveUserAppStateOptimistic(
          {
            ...activeState,
            protocols: updatedProtocols,
          },
          'BURST_PROTOCOL_UPDATE'
        );
      }

      onProgress(currentStep, totalOps, activeState);

      if (currentStep >= totalOps) {
        clearInterval(interval);
        resolve(activeState);
      }
    }, 25);
  });
}
