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
import { SmartFoodScannerModal } from './components/SmartFoodScannerModal';
import { AIFormModal } from './components/AIFormModal';
import { ShareReportModal } from './components/ShareReportModal';
import { initialMealSections, workoutProtocols, mockAnalyticsData } from './data/mockData';
import { initAuth, getStoredUserSession, logout, StoredUserSession } from './services/googleAuth';
import {
  UserAppState,
  loadUserAppState,
  saveUserAppStateOptimistic,
  getOrCreateGuestId,
  setActiveTelemetryUserId,
  recordUserActivity,
} from './services/scaleEngine';
import { SupportModal } from './components/SupportModal';
import { AuthModal } from './components/AuthModal';
import { DietaryOnboardingModal } from './components/DietaryOnboardingModal';
import { IngredientRecipeModal } from './components/IngredientRecipeModal';
import { sanitizeInput } from './services/securityEngine';
import { UserGoal, DietaryPreference } from './types';
import { USER_GOALS } from './data/goalConfigs';
import { GoalSelectionModal } from './components/GoalSelectionModal';

export default function App() {
  // Active User / Tenant Partition
  const [activeUser, setActiveUser] = useState<{
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL?: string | null;
  }>(() => {
    const session = getStoredUserSession();
    if (session) {
      return {
        uid: session.uid,
        email: session.email,
        displayName: session.displayName,
        photoURL: session.photoURL,
      };
    }
    const guestId = getOrCreateGuestId();
    return { uid: guestId, email: null, displayName: null };
  });

  // Master App State managed by 1M Scale Engine
  const [appState, setAppState] = useState<UserAppState>(() => {
    const session = getStoredUserSession();
    if (session) {
      return loadUserAppState(session.uid, session.email, session.displayName);
    }
    return loadUserAppState(getOrCreateGuestId());
  });

  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<NavTab>('diary');
  const [isWorkspaceConnected, setIsWorkspaceConnected] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDietaryModalOpen, setIsDietaryModalOpen] = useState(false);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);

  const handleAuthSuccess = (session: StoredUserSession) => {
    setActiveUser({
      uid: session.uid,
      email: session.email,
      displayName: session.displayName,
      photoURL: session.photoURL,
    });
    setActiveTelemetryUserId(session.uid);
    const loadedState = loadUserAppState(session.uid, session.email, session.displayName);
    setAppState(loadedState);
    setIsAuthModalOpen(false);
    showToast(`Welcome, ${session.displayName || 'Athlete'}!`);

    // Check if user has already configured their dietary preference
    const savedDiet = localStorage.getItem(`cultpulse_diet_${session.uid}`);
    if (!savedDiet) {
      // Prompt user to select their dietary preference and fitness goals
      setIsDietaryModalOpen(true);
    }
  };

  const handleSignOut = async () => {
    await logout();
    const guestId = getOrCreateGuestId();
    setActiveUser({ uid: guestId, email: null, displayName: null });
    setActiveTelemetryUserId(guestId);
    setAppState(loadUserAppState(guestId));
    setIsWorkspaceConnected(false);
    showToast('Signed out successfully. Switched to guest mode.');
  };

  useEffect(() => {
    const unsubscribe = initAuth(
      (session: StoredUserSession, token: string | null) => {
        setIsWorkspaceConnected(!!token);
        setActiveUser({
          uid: session.uid,
          email: session.email,
          displayName: session.displayName,
          photoURL: session.photoURL,
        });
        setActiveTelemetryUserId(session.uid);
        const loadedState = loadUserAppState(session.uid, session.email, session.displayName);
        setAppState(loadedState);

        recordUserActivity({
          userId: session.uid,
          userName: session.displayName || session.email?.split('@')[0] || 'Athlete',
          userEmail: session.email,
          actionType: 'SIGN_IN',
          title: 'User Authenticated',
          description: `User connected via ${session.provider === 'google' ? 'Google OAuth' : 'Email Authentication'}`,
        });
      },
      () => {
        setIsWorkspaceConnected(false);
        const currentStored = getStoredUserSession();
        if (currentStored) {
          setActiveUser({
            uid: currentStored.uid,
            email: currentStored.email,
            displayName: currentStored.displayName,
            photoURL: currentStored.photoURL,
          });
          setActiveTelemetryUserId(currentStored.uid);
          setAppState(loadUserAppState(currentStored.uid, currentStored.email, currentStored.displayName));
        } else {
          const guestId = getOrCreateGuestId();
          setActiveUser({ uid: guestId, email: null, displayName: null });
          setActiveTelemetryUserId(guestId);
          setAppState(loadUserAppState(guestId));
        }
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

  // Goal Onboarding & Goal Personalization
  const [userGoal, setUserGoal] = useState<UserGoal>(() => {
    const saved = localStorage.getItem('cultpulse_user_goal') as UserGoal | null;
    return saved || 'muscle_building';
  });
  const [isGoalModalOpen, setIsGoalModalOpen] = useState<boolean>(() => {
    return localStorage.getItem('cultpulse_user_goal') === null;
  });

  const handleSelectGoal = (newGoal: UserGoal) => {
    setUserGoal(newGoal);
    localStorage.setItem('cultpulse_user_goal', newGoal);
    setIsGoalModalOpen(false);

    // Synchronize daily caloric target & macro goals dynamically to selected goal
    const goalConfig = USER_GOALS[newGoal];
    if (goalConfig) {
      setAppState((prev) => {
        const updated: UserAppState = {
          ...prev,
          dailyGoal: goalConfig.targetKcal,
          analyticsData: {
            ...prev.analyticsData,
            macroPrecision: {
              ...prev.analyticsData.macroPrecision,
              protein: {
                ...prev.analyticsData.macroPrecision.protein,
                target: goalConfig.targetProtein,
              },
              carbs: {
                ...prev.analyticsData.macroPrecision.carbs,
                target: goalConfig.targetCarbs,
              },
              fats: {
                ...prev.analyticsData.macroPrecision.fats,
                target: goalConfig.targetFats,
              },
            },
          },
        };
        saveUserAppStateOptimistic(updated, 'GOAL_UPDATE', { goal: newGoal });
        return updated;
      });

      // Switch active tab according to user's intent
      if (newGoal === 'diet_nutrition') {
        setActiveTab('diary');
      } else if (newGoal === 'muscle_building' || newGoal === 'endurance_hiit') {
        setActiveTab('workouts');
      }

      showToast(`Goal set: ${goalConfig.title} (${goalConfig.targetKcal} kcal / ${goalConfig.targetProtein}g Protein)`);
    }
  };

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

  const handleSaveDietary = (diet: DietaryPreference, goal: UserGoal, customKcal?: number) => {
    setUserGoal(goal);
    localStorage.setItem('cultpulse_user_goal', goal);
    const updated = saveUserAppStateOptimistic(
      {
        ...appState,
        dietaryPreference: diet,
        dailyGoal: customKcal || USER_GOALS[goal]?.targetKcal || appState.dailyGoal,
      },
      'UPDATE_DIET_PREFERENCE',
      { diet, goal, customKcal }
    );
    setAppState(updated);
    setIsDietaryModalOpen(false);
    showToast(
      `Dietary preference set to ${
        diet === 'veg' ? 'Vegetarian' : diet === 'eggetarian' ? 'Eggetarian' : 'Non-Vegetarian'
      }!`
    );
  };

  return (
    <div className="min-h-screen bg-[#FBF9F9] dark:bg-[#0E0F10] text-[#1B1C1C] dark:text-[#EAEAEA] flex flex-col items-center transition-colors">
      {/* Container Frame */}
      <div className="w-full max-w-5xl lg:max-w-6xl mx-auto flex flex-col min-h-screen relative shadow-2xs bg-[#FBF9F9] dark:bg-[#141517] border-x border-transparent dark:border-[#232427] transition-colors">
        {/* Sticky Header */}
        <Header
          activeTab={activeTab}
          streakDays={appState.analyticsData.athlete.streakDays}
          avatarUrl={activeUser.photoURL || appState.analyticsData.athlete.avatarUrl}
          userEmail={activeUser.email}
          userDisplayName={activeUser.displayName}
          dietaryPreference={appState.dietaryPreference || 'veg'}
          onAvatarClick={() => setActiveTab('progress')}
          onWorkspaceClick={() => setActiveTab('workspace')}
          onSupportClick={() => setIsSupportOpen(true)}
          onGoalClick={() => setIsGoalModalOpen(true)}
          onDietClick={() => setIsDietaryModalOpen(true)}
          onAuthClick={() => setIsAuthModalOpen(true)}
          currentGoal={userGoal}
          isWorkspaceConnected={isWorkspaceConnected}
          isAdmin={false}
        />

        {/* Main Content Area */}
        <main className="flex-1 px-3 sm:px-6 pt-3">
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
              dietaryPreference={appState.dietaryPreference || 'veg'}
              onStartWorkoutTab={() => setActiveTab('workouts')}
              onAddWater={handleAddWater}
              onSetCustomWater={handleSetCustomWater}
              onOpenQuickLog={handleOpenQuickLog}
              onOpenBarcode={() => setIsBarcodeOpen(true)}
              onOpenRecipeMaker={() => setIsRecipeModalOpen(true)}
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
              activeUserName={activeUser.displayName || (activeUser.email ? activeUser.email.split('@')[0] : 'Athlete')}
              onEndSession={handleEndSession}
              onOpenAIForm={() => setIsAIFormOpen(true)}
            />
          )}

          {activeTab === 'progress' && (
            <ProgressView
              data={appState.analyticsData}
              userEmail={activeUser.email}
              userDisplayName={activeUser.displayName}
              dietaryPreference={appState.dietaryPreference || 'veg'}
              onOpenShareReport={() => setIsShareReportOpen(true)}
              onOpenWorkspace={() => setActiveTab('workspace')}
              onOpenSupport={() => setIsSupportOpen(true)}
              onOpenDietaryModal={() => setIsDietaryModalOpen(true)}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              onSignOut={handleSignOut}
              isAdmin={false}
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
        <IngredientRecipeModal
          isOpen={isRecipeModalOpen}
          onClose={() => setIsRecipeModalOpen(false)}
          dietaryPreference={appState.dietaryPreference || 'veg'}
          onLogDish={(sectionId, item) => {
            handleLogFood(sectionId, item);
          }}
        />

        <QuickLogModal
          isOpen={isQuickLogOpen}
          onClose={() => setIsQuickLogOpen(false)}
          defaultSectionId={quickLogTargetSection}
          onLogFood={handleLogFood}
        />

        <SmartFoodScannerModal
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

        {/* User Authentication Modal (Google / Email & Password) */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />

        {/* Dietary Preference & Onboarding Modal (Veg / Egg / Non-Veg & Target Kcal) */}
        <DietaryOnboardingModal
          isOpen={isDietaryModalOpen}
          onClose={() => setIsDietaryModalOpen(false)}
          initialDiet={appState.dietaryPreference || 'veg'}
          initialGoal={userGoal}
          onSave={handleSaveDietary}
        />

        {/* User Help & Support Center (s44810335@gmail.com) */}
        <SupportModal
          isOpen={isSupportOpen}
          onClose={() => setIsSupportOpen(false)}
          userEmail={activeUser.email}
          userName={activeUser.displayName}
        />

        {/* Goal Onboarding & Personalization Modal */}
        <GoalSelectionModal
          isOpen={isGoalModalOpen}
          onSelectGoal={handleSelectGoal}
          currentGoal={userGoal}
          isInitialOnboarding={localStorage.getItem('cultpulse_user_goal') === null}
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
