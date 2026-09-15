import React, { useState } from 'react';
import { NavTab, MealItem, MealSection, WorkoutProtocol, AnalyticsData } from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DiaryView } from './components/DiaryView';
import { WorkoutsView } from './components/WorkoutsView';
import { LiveSessionView } from './components/LiveSessionView';
import { ProgressView } from './components/ProgressView';
import { QuickLogModal } from './components/QuickLogModal';
import { BarcodeModal } from './components/BarcodeModal';
import { AIFormModal } from './components/AIFormModal';
import { ShareReportModal } from './components/ShareReportModal';
import { initialMealSections, workoutProtocols, mockAnalyticsData } from './data/mockData';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<NavTab>('diary');

  // Diary Date State
  const [dayOffset, setDayOffset] = useState(0);
  const [cycleNumber, setCycleNumber] = useState(12);

  // Diary Data State
  const [dailyGoal, setDailyGoal] = useState(2200);
  const [burnSynced, setBurnSynced] = useState(400);
  const [mealSections, setMealSections] = useState<MealSection[]>(initialMealSections);
  const [waterMl, setWaterMl] = useState(1750);
  const waterGoalMl = 3000;

  // Workouts State
  const [protocols, setProtocols] = useState<WorkoutProtocol[]>(workoutProtocols);
  const [activeProtocol, setActiveProtocol] = useState<WorkoutProtocol | null>(null);

  // Analytics State
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(mockAnalyticsData);

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
    if (dayOffset === 0) return 'Today, Oct 24';
    if (dayOffset === -1) return 'Yesterday, Oct 23';
    if (dayOffset === 1) return 'Tomorrow, Oct 25';
    const d = new Date(2026, 9, 24 + dayOffset);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handlePrevDay = () => {
    setDayOffset((prev) => prev - 1);
  };

  const handleNextDay = () => {
    setDayOffset((prev) => prev + 1);
  };

  // Hydration handlers
  const handleAddWater = (amount: number) => {
    setWaterMl((prev) => {
      const next = Math.max(0, Math.min(waterGoalMl + 1000, prev + amount));
      return next;
    });
    showToast(amount > 0 ? `+${amount} ml logged` : `${amount} ml adjusted`);
  };

  const handleSetCustomWater = () => {
    const input = window.prompt('Enter water amount in ml:', '250');
    if (input) {
      const num = parseInt(input, 10);
      if (!isNaN(num) && num > 0) {
        setWaterMl((prev) => prev + num);
        showToast(`+${num} ml added to Hydration`);
      }
    }
  };

  // Food logging
  const handleOpenQuickLog = (sectionId?: string) => {
    setQuickLogTargetSection(sectionId || 'dinner');
    setIsQuickLogOpen(true);
  };

  const handleLogFood = (sectionId: string, item: MealItem) => {
    setMealSections((prevSections) =>
      prevSections.map((sec) => {
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
      })
    );
    showToast(`Added ${item.name} (+${item.calories} kcal)`);
  };

  // Workouts handlers
  const handleStartWorkout = (protocol: WorkoutProtocol) => {
    setActiveProtocol(protocol);
    setActiveTab('live');
    showToast(`Launched "${protocol.title}" into Live Session`);
  };

  const handleToggleFavorite = (id: string) => {
    setProtocols((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    );
  };

  // Live session handlers
  const handleEndSession = (caloriesBurned: number) => {
    setBurnSynced((prev) => prev + caloriesBurned);
    setActiveTab('diary');
    showToast(`Workout completed! +${caloriesBurned} kcal added to Burn Synced`);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F9] text-[#1B1C1C] flex flex-col items-center">
      {/* Container Frame */}
      <div className="w-full max-w-xl mx-auto flex flex-col min-h-screen relative shadow-2xs bg-[#FBF9F9]">
        {/* Sticky Header */}
        <Header
          activeTab={activeTab}
          streakDays={analyticsData.athlete.streakDays}
          avatarUrl={analyticsData.athlete.avatarUrl}
          onAvatarClick={() => setActiveTab('progress')}
        />

        {/* Main Content Area */}
        <main className="flex-1 px-4 pt-3">
          {(activeTab === 'diary' || activeTab === 'today') && (
            <DiaryView
              currentDate={getFormattedDate()}
              cycleNumber={cycleNumber}
              onPrevDay={handlePrevDay}
              onNextDay={handleNextDay}
              dailyGoal={dailyGoal}
              burnSynced={burnSynced}
              mealSections={mealSections}
              waterMl={waterMl}
              waterGoalMl={waterGoalMl}
              onAddWater={handleAddWater}
              onSetCustomWater={handleSetCustomWater}
              onOpenQuickLog={handleOpenQuickLog}
              onOpenBarcode={() => setIsBarcodeOpen(true)}
            />
          )}

          {activeTab === 'workouts' && (
            <WorkoutsView
              protocols={protocols}
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
              data={analyticsData}
              onOpenShareReport={() => setIsShareReportOpen(true)}
              onOpenSettings={() => showToast('Telemetry settings synced with Apple Health & Wearables')}
            />
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />

        {/* Modals */}
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
          data={analyticsData}
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
