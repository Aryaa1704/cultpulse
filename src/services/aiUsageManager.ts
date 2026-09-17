// CultPulse AI Fair-Usage & Quota Management
// Enforces:
// 1. Strict Member Authentication (Guests cannot consume AI vision tokens)
// 2. Daily Fair-Usage Limit (3 AI Scans per day per user for Breakfast, Lunch, Dinner)
// 3. Quota reset everyday at 00:00 local midnight

export const DAILY_SCAN_LIMIT = 3;

export const getTodayDateKey = (): string => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export interface UserAIQuotaStatus {
  isGuest: boolean;
  userId: string;
  scansUsed: number;
  scansRemaining: number;
  limit: number;
  canScan: boolean;
  lockReason?: 'GUEST_RESTRICTED' | 'DAILY_LIMIT_REACHED';
}

export const getUserAIQuotaStatus = (
  userId?: string | null,
  userEmail?: string | null
): UserAIQuotaStatus => {
  const isGuest = !userEmail || !userId || userId.startsWith('guest-');
  
  if (isGuest) {
    return {
      isGuest: true,
      userId: userId || 'guest',
      scansUsed: 0,
      scansRemaining: 0,
      limit: DAILY_SCAN_LIMIT,
      canScan: false,
      lockReason: 'GUEST_RESTRICTED',
    };
  }

  const dateKey = getTodayDateKey();
  const storageKey = `cultpulse_ai_scans_${userId}_${dateKey}`;
  
  let used = 0;
  try {
    const stored = localStorage.getItem(storageKey);
    used = stored ? parseInt(stored, 10) : 0;
    if (isNaN(used)) used = 0;
  } catch {
    used = 0;
  }

  const remaining = Math.max(0, DAILY_SCAN_LIMIT - used);
  const canScan = remaining > 0;

  return {
    isGuest: false,
    userId,
    scansUsed: used,
    scansRemaining: remaining,
    limit: DAILY_SCAN_LIMIT,
    canScan,
    lockReason: canScan ? undefined : 'DAILY_LIMIT_REACHED',
  };
};

export const consumeUserDailyScan = (userId: string): number => {
  const dateKey = getTodayDateKey();
  const storageKey = `cultpulse_ai_scans_${userId}_${dateKey}`;
  
  let used = 0;
  try {
    const stored = localStorage.getItem(storageKey);
    used = stored ? parseInt(stored, 10) : 0;
    if (isNaN(used)) used = 0;
    const updated = used + 1;
    localStorage.setItem(storageKey, updated.toString());
    return updated;
  } catch (err) {
    console.warn('Failed to update daily scan quota:', err);
    return used + 1;
  }
};
