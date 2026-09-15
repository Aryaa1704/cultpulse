import React, { useState, useEffect } from 'react';
import { NavTab, MealItem, MealSection, WorkoutProtocol, AnalyticsData } from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DiaryView } from './components/DiaryView';
import { WorkoutsView } from './components/WorkoutsView';
import { LiveSessionView } from './components/LiveSessionView';
import { ProgressView } from './components/ProgressView';
import { WorkspaceHub } from './components/WorkspaceHub';
import { QuickLogModal } from './components/QuickLogModal';
import { BarcodeModal } from './components/BarcodeModal';
import { AIFormModal } from './components/AIFormModal';
import { ShareReportModal } from './components/ShareReportModal';
import { initialMealSections, workoutProtocols, mockAnalyticsData } from './data/mockData';
import { initAuth } from './services/googleAuth';
import {
  UserAppState,
  loadUserAppState,
  saveUserAppStateOptimistic,
  getOrCreateGuestId,
  setActiveTelemetryUserId,
  recordUserActivity,
} from './services/scaleEngine';
import { ScaleMonitorModal } from './components/ScaleMonitorModal';
import { AdminUserActivityHub } from './components/AdminUserActivityHub';
import { User } from 'firebase/auth';

export default function App() {
  // Active User / Tenant Partition
  const [activeUser, setActiveUser] = useState<{
    uid: string;
    email: string | null;
    displayName: string | null;
  }>(() => {
    const guestId = getOrCreateGuestId();
    return { uid: guestId, email: null, displayName: 'Athlete (Guest)' };
  });

  // Master App State managed by 1M Scale Engine
  const [appState, setAppState] = useState<UserAppState>(() =>
    loadUserAppState(getOrCreateGuestId())
  );

  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<NavTab>('diary');
  const [isWorkspaceConnected, setIsWorkspaceConnected] = useState(false);
  const [isScaleMonitorOpen, setIsScaleMonitorOpen] = useState(false);
  const [isAdminHubOpen, setIsAdminHubOpen] = useState(false);

  // Super Admin security (Only aryansharma009009@gmail.com)
  const ADMIN_EMAIL = 'aryansharma009009@gmail.com';
  const [isAdminOverride, setIsAdminOverride] = useState<boolean>(() => {
    // Default to true in initial setup so Aryan sees his admin powers immediately, or respects saved preference
    const saved = localStorage.getItem('cultpulse_admin_override');
    return saved !== null ? saved === 'true' : true;
  });

  const isAdmin = Boolean(
    (activeUser.email && activeUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) ||
    isAdminOverride
  );

  const handleSwitchToAdmin = () => {
    setIsAdminOverride(true);
    localStorage.setItem('cultpulse_admin_override', 'true');
    setActiveUser({
      uid: 'admin_aryansharma',
      email: ADMIN_EMAIL,
      displayName: 'Aryan Sharma (Super Admin)',
    });
    showToast(`Welcome back, Aryan! Admin mode unlocked.`);
  };

  const handleSwitchToRegularUser = () => {
    setIsAdminOverride(false);
    localStorage.setItem('cultpulse_admin_override', 'false');
    const guestId = getOrCreateGuestId();
    setActiveUser({ uid: guestId, email: null, displayName: 'Athlete (Guest)' });
    setIsAdminHubOpen(false);
    showToast('Switched to Regular User view. Admin controls hidden.');
  };

  useEffect(() => {
    const unsubscribe = initAuth(
      (user: User) => {
        setIsWorkspaceConnected(true);
        setActiveUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        });
        setActiveTelemetryUserId(user.uid);
        const loadedState = loadUserAppState(user.uid, user.email, user.displayName);
        setAppState(loadedState);

        recordUserActivity({
          userId: user.uid,
          userName: user.displayName || user.email?.split('@')[0] || 'Athlete',
          userEmail: user.email,
          actionType: 'SIGN_IN',
          title: 'Signed in via Google OAuth',
          description: 'User connected with Google Workspace credentials',
        });
      },
      () => {
        setIsWorkspaceConnected(false);
        const guestId = getOrCreateGuestId();
        setActiveUser({ uid: guestId, email: null, displayName: 'Athlete (Guest)' });
        setActiveTelemetryUserId(guestId);
      }
    );
    return () => unsubscribe();
  }, []);

  // Modals
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [quickLogTargetSection, setQuickLogTargetSection] = useState('dinner');
  const [isBarcodeOpen, setIsBarcodeOpen] = useState(false);
  const [isAIFormOpen, setIsAIFormOpen] = useState(false);
  const [isShareReportOpen, setIsShareReportOpen] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast((prev) => (prev === message ? null : prev));
    }, 3000);
  };

  // Date formatted
  const getFormattedDate = () => {
    if (appState.dayOffset === 0) return 'Today, Oct 24';
    if (appState.dayOffset === -1) return 'Yesterday, Oct 23';
    if (appState.dayOffset === 1) return 'Tomorrow, Oct 25';
    const d = new Date(2026, 9, 24 + appState.dayOffset);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handlePrevDay = () => {
    const updated = saveUserAppStateOptimistic(
      { ...appState, dayOffset: appState.dayOffset - 1 },
      'CHANGE_DAY',
      { offset: appState.dayOffset - 1 }
    );
    setAppState(updated);
  };

  const handleNextDay = () => {
    const updated = saveUserAppStateOptimistic(
      { ...appState, dayOffset: appState.dayOffset + 1 },
      'CHANGE_DAY',
      { offset: appState.dayOffset + 1 }
    );
    setAppState(updated);
  };

  // Hydration handlers (0ms Optimistic Update)
  const handleAddWater = (amount: number) => {
    const nextWater = Math.max(
      0,
      Math.min(appState.waterGoalMl + 1000, appState.waterMl + amount)
    );
    const updated = saveUserAppStateOptimistic(
      { ...appState, waterMl: nextWater },
      'ADD_WATER',
      { amount, nextWater }
    );
    setAppState(updated);
    showToast(amount > 0 ? `+${amount} ml logged` : `${amount} ml adjusted`);

    recordUserActivity({
      userId: activeUser.uid,
      userName: activeUser.displayName || 'Cult Athlete',
      userEmail: activeUser.email,
      actionType: 'WATER_LOG',
      title: amount > 0 ? 'Logged Hydration' : 'Adjusted Water Intake',
      description: `Logged ${amount > 0 ? '+' : ''}${amount}ml Water (Daily Total: ${nextWater}ml)`,
      metrics: { waterMl: amount },
    });
  };

  const handleSetCustomWater = () => {
    const input = window.prompt('Enter water amount in ml:', '250');
    if (input) {
      const num = parseInt(input, 10);
      if (!isNaN(num) && num > 0) {
        const nextWater = appState.waterMl + num;
        const updated = saveUserAppStateOptimistic(
          { ...appState, waterMl: nextWater },
          'CUSTOM_WATER',
          { amount: num }
        );
        setAppState(updated);
        showToast(`+${num} ml added to Hydration`);

        recordUserActivity({
          userId: activeUser.uid,
          userName: activeUser.displayName || 'Cult Athlete',
          userEmail: activeUser.email,
          actionType: 'WATER_LOG',
          title: 'Custom Hydration Log',
          description: `Logged +${num}ml Water (Daily Total: ${nextWater}ml)`,
          metrics: { waterMl: num },
        });
      }
    }
  };

  // Food logging (0ms Optimistic Update)
  const handleOpenQuickLog = (sectionId?: string) => {
    setQuickLogTargetSection(sectionId || 'dinner');
    setIsQuickLogOpen(true);
  };

  const handleLogFood = (sectionId: string, item: MealItem) => {
    const updatedSections = appState.mealSections.map((sec) => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          isPending: false,
          calories: sec.calories + item.calories,
          carbs: sec.carbs + item.carbs,
          protein: sec.protein + item.protein,
          fats: sec.fats + item.fats,
          items: [...sec.items, item],
        };
      }
      return sec;
    });

    const updated = saveUserAppStateOptimistic(
      { ...appState, mealSections: updatedSections },
      'LOG_FOOD',
      { sectionId, item }
    );
    setAppState(updated);
    showToast(`Added ${item.name} (+${item.calories} kcal)`);

    recordUserActivity({
      userId: activeUser.uid,
      userName: activeUser.displayName || 'Cult Athlete',
      userEmail: activeUser.email,
      actionType: 'FOOD_LOG',
      title: `Logged ${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}`,
      description: `Added "${item.name}" (+${item.calories} kcal, ${item.protein}g protein)`,
      metrics: {
        calories: item.calories,
        macros: { carbs: item.carbs, protein: item.protein, fats: item.fats },
      },
    });
  };

  // Workouts handlers
  const [activeProtocol, setActiveProtocol] = useState<WorkoutProtocol | null>(null);

  const handleStartWorkout = (protocol: WorkoutProtocol) => {
    setActiveProtocol(protocol);
    setActiveTab('live');
    showToast(`Launched "${protocol.title}" into Live Session`);

    recordUserActivity({
      userId: activeUser.uid,
      userName: activeUser.displayName || 'Cult Athlete',
      userEmail: activeUser.email,
      actionType: 'WORKOUT_START',
      title: 'Started Live Workout Protocol',
      description: `Initiated active session: "${protocol.title}" (${protocol.duration})`,
    });
  };

  const handleToggleFavorite = (id: string) => {
    const updatedProtocols = appState.protocols.map((p) =>
      p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
    );
    const updated = saveUserAppStateOptimistic(
      { ...appState, protocols: updatedProtocols },
      'TOGGLE_FAVORITE',
      { protocolId: id }
    );
    setAppState(updated);
  };

  // Live session handlers
  const handleEndSession = (caloriesBurned: number) => {
    const updatedBurn = appState.burnSynced + caloriesBurned;
    const updated = saveUserAppStateOptimistic(
      { ...appState, burnSynced: updatedBurn },
      'END_WORKOUT_SESSION',
      { caloriesBurned }
    );
    setAppState(updated);
    setActiveTab('diary');
    showToast(`Workout completed! +${caloriesBurned} kcal added to Burn Synced`);

    recordUserActivity({
      userId: activeUser.uid,
      userName: activeUser.displayName || 'Cult Athlete',
      userEmail: activeUser.email,
      actionType: 'WORKOUT_COMPLETE',
      title: 'Completed Workout Protocol',
      description: `Finished ${activeProtocol ? activeProtocol.title : 'Live Session'} (+${caloriesBurned} kcal burned)`,
      metrics: { burnKcal: caloriesBurned },
    });
  };

  return (
    <div className="min-h-screen bg-[#FBF9F9] text-[#1B1C1C] flex flex-col items-center">
      {/* Container Frame */}
      <div className="w-full max-w-xl mx-auto flex flex-col min-h-screen relative shadow-2xs bg-[#FBF9F9]">
        {/* Sticky Header */}
        <Header
          activeTab={activeTab}
          streakDays={appState.analyticsData.athlete.streakDays}
          avatarUrl={appState.analyticsData.athlete.avatarUrl}
          onAvatarClick={() => setActiveTab('progress')}
          onWorkspaceClick={() => setActiveTab('workspace')}
          onScaleMonitorClick={() => setIsScaleMonitorOpen(true)}
          onAdminHubClick={() => setIsAdminHubOpen(true)}
          isWorkspaceConnected={isWorkspaceConnected}
          isAdmin={isAdmin}
        />

        {/* Main Content Area */}
        <main className="flex-1 px-4 pt-3">
          {(activeTab === 'diary' || activeTab === 'today') && (
            <DiaryView
              currentDate={getFormattedDate()}
              cycleNumber={12}
              onPrevDay={handlePrevDay}
              onNextDay={handleNextDay}
              dailyGoal={appState.dailyGoal}
              burnSynced={appState.burnSynced}
              mealSections={appState.mealSections}
              waterMl={appState.waterMl}
              waterGoalMl={appState.waterGoalMl}
              onAddWater={handleAddWater}
              onSetCustomWater={handleSetCustomWater}
              onOpenQuickLog={handleOpenQuickLog}
              onOpenBarcode={() => setIsBarcodeOpen(true)}
              onOpenWorkspace={() => setActiveTab('workspace')}
            />
          )}

          {activeTab === 'workouts' && (
            <WorkoutsView
              protocols={appState.protocols}
              onStartWorkout={handleStartWorkout}
              onToggleFavorite={handleToggleFavorite}
            />
          )}

          {activeTab === 'live' && (
            <LiveSessionView
              currentProtocol={activeProtocol}
              onEndSession={handleEndSession}
              onOpenAIForm={() => setIsAIFormOpen(true)}
            />
          )}

          {activeTab === 'progress' && (
            <ProgressView
              data={appState.analyticsData}
              onOpenShareReport={() => setIsShareReportOpen(true)}
              onOpenSettings={() => setIsScaleMonitorOpen(true)}
              onOpenWorkspace={() => setActiveTab('workspace')}
              onOpenAdminHub={() => setIsAdminHubOpen(true)}
              isAdmin={isAdmin}
              onAdminLoginToggle={isAdmin ? handleSwitchToRegularUser : handleSwitchToAdmin}
            />
          )}

          {activeTab === 'workspace' && (
            <WorkspaceHub
              currentDate={getFormattedDate()}
              mealSections={appState.mealSections}
              activeCalories={appState.burnSynced}
              waterMl={appState.waterMl}
              analyticsData={appState.analyticsData}
              protocols={appState.protocols}
            />
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />

        {/* Modals */}
        <AdminUserActivityHub
          isOpen={isAdminHubOpen}
          onClose={() => setIsAdminHubOpen(false)}
          adminEmail={activeUser.email}
          isAdmin={isAdmin}
          onAuthenticateAdmin={handleSwitchToAdmin}
        />

        <ScaleMonitorModal
          isOpen={isScaleMonitorOpen}
          onClose={() => setIsScaleMonitorOpen(false)}
          currentState={appState}
          onStateUpdate={(next) => setAppState(next)}
          userEmail={activeUser.email}
        />

        <QuickLogModal
          isOpen={isQuickLogOpen}
          onClose={() => setIsQuickLogOpen(false)}
          defaultSectionId={quickLogTargetSection}
          onLogFood={handleLogFood}
        />

        <BarcodeModal
          isOpen={isBarcodeOpen}
          onClose={() => setIsBarcodeOpen(false)}
          onLogItem={handleLogFood}
        />

        <AIFormModal
          isOpen={isAIFormOpen}
          onClose={() => setIsAIFormOpen(false)}
        />

        <ShareReportModal
          isOpen={isShareReportOpen}
          onClose={() => setIsShareReportOpen(false)}
          data={appState.analyticsData}
        />

        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#242424] text-white px-4 py-2 rounded-lg text-xs font-mono shadow-lg border border-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
