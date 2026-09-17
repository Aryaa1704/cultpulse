import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Dumbbell,
  RefreshCw,
  Sun,
  Moon,
  Cookie,
  Plus,
  Droplet,
  Barcode,
  Camera,
  Sparkles,
  Sliders,
  Check,
} from 'lucide-react';
import { MealSection, DietaryPreference } from '../types';
import { useAppSettings } from '../services/appSettingsContext';

interface DiaryViewProps {
  currentDate: string;
  cycleNumber: number;
  onPrevDay: () => void;
  onNextDay: () => void;
  dailyGoal: number;
  burnSynced: number;
  mealSections: MealSection[];
  waterMl: number;
  waterGoalMl: number;
  dietaryPreference?: DietaryPreference;
  onStartWorkoutTab?: () => void;
  onAddWater: (amount: number) => void;
  onSetCustomWater: () => void;
  onOpenQuickLog: (sectionId?: string) => void;
  onOpenBarcode: () => void;
  onOpenRecipeMaker?: () => void;
  onOpenWorkspace?: () => void;
}

export const DiaryView: React.FC<DiaryViewProps> = ({
  currentDate,
  cycleNumber,
  onPrevDay,
  onNextDay,
  dailyGoal,
  burnSynced,
  mealSections,
  waterMl,
  waterGoalMl,
  dietaryPreference = 'veg',
  onStartWorkoutTab,
  onAddWater,
  onSetCustomWater,
  onOpenQuickLog,
  onOpenBarcode,
  onOpenRecipeMaker,
  onOpenWorkspace,
}) => {
  const { t } = useAppSettings();

  // Calculate total food logged
  const totalFoodLogged = mealSections.reduce((acc, sec) => acc + sec.calories, 0);
  const remainingKcal = dailyGoal - totalFoodLogged + burnSynced;

  // Calculate total macros
  const totalCarbs = mealSections.reduce((acc, sec) => acc + sec.carbs, 0);
  const totalProtein = mealSections.reduce((acc, sec) => acc + sec.protein, 0);
  const totalFats = mealSections.reduce((acc, sec) => acc + sec.fats, 0);

  // Targets
  const targetCarbs = 275;
  const targetProtein = 110;
  const targetFats = 73;

  const carbsPct = Math.min(100, Math.round((totalCarbs / targetCarbs) * 100));
  const proteinPct = Math.min(100, Math.round((totalProtein / targetProtein) * 100));
  const fatsPct = Math.min(100, Math.round((totalFats / targetFats) * 100));

  const glassesFilled = Math.min(10, Math.floor((waterMl / waterGoalMl) * 10));

  const getMealIcon = (id: string) => {
    switch (id) {
      case 'breakfast':
        return <Sun size={18} className="text-[#4A4A4A] dark:text-zinc-300" />;
      case 'lunch':
        return <Sun size={18} className="text-[#4A4A4A] dark:text-zinc-300" strokeWidth={2.2} />;
      case 'dinner':
        return <Moon size={18} className="text-[#4A4A4A] dark:text-zinc-300" />;
      case 'snacks':
        return <Cookie size={18} className="text-[#4A4A4A] dark:text-zinc-300" />;
      default:
        return <Sun size={18} className="text-[#4A4A4A] dark:text-zinc-300" />;
    }
  };

  const getMealName = (section: MealSection) => {
    switch (section.id) {
      case 'breakfast':
        return t('diary_breakfast');
      case 'lunch':
        return t('diary_lunch');
      case 'dinner':
        return t('diary_dinner');
      case 'snacks':
        return t('diary_snacks');
      default:
        return section.name;
    }
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Date Bar */}
      <div className="flex items-center justify-between px-1 py-1">
        <button
          onClick={onPrevDay}
          id="btn-prev-day"
          aria-label="Previous Day"
          className="p-1.5 rounded-md hover:bg-[#F2F2F2] dark:hover:bg-[#232427] text-[#4A4A4A] dark:text-zinc-300 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-[#4A4A4A] dark:text-zinc-300" />
          <span className="font-display font-semibold text-[#1B1C1C] dark:text-white text-sm md:text-base">
            {currentDate}
          </span>
          <span className="px-2 py-0.5 bg-[#F2F2F2] dark:bg-[#232427] border border-[#E5E5E5] dark:border-[#2C2D30] text-[11px] font-mono tracking-wider font-medium text-[#4A4A4A] dark:text-zinc-300 rounded-xs">
            CYCLE {cycleNumber}
          </span>
        </div>

        <button
          onClick={onNextDay}
          id="btn-next-day"
          aria-label="Next Day"
          className="p-1.5 rounded-md hover:bg-[#F2F2F2] dark:hover:bg-[#232427] text-[#4A4A4A] dark:text-zinc-300 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Energy Balance Card */}
      <div className="bg-white dark:bg-[#1A1B1D] border border-[#E5E5E5] dark:border-[#2C2D30] rounded-xl p-5 md:p-6 shadow-2xs transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono font-medium tracking-widest text-[#767676] dark:text-[#9E9E9E] uppercase">
            ENERGY BALANCE
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F2F2F2] dark:bg-[#232427] text-[11px] font-medium text-[#242424] dark:text-zinc-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#242424] dark:bg-emerald-400"></span>
            <span>ON TARGET</span>
          </div>
        </div>

        {/* Big Remaining Calories */}
        <div className="flex items-baseline gap-2 mb-6">
          <span className="font-display text-4xl font-bold tracking-tight text-[#1B1C1C] dark:text-white">
            {remainingKcal.toLocaleString()}
          </span>
          <span className="text-sm text-[#767676] dark:text-[#9E9E9E] font-normal">
            kcal {t('diary_remaining').toLowerCase()}
          </span>
        </div>

        {/* 3 Metric Breakdown */}
        <div className="grid grid-cols-3 gap-2 border-t border-b border-[#E5E5E5] dark:border-[#2C2D30] py-3.5 mb-5">
          <div className="border-r border-[#E5E5E5] dark:border-[#2C2D30] pr-2">
            <div className="text-[11px] text-[#767676] dark:text-[#9E9E9E]">{t('diary_daily_budget')}</div>
            <div className="font-display font-bold text-lg text-[#1B1C1C] dark:text-white">
              {dailyGoal.toLocaleString()}
            </div>
          </div>
          <div className="border-r border-[#E5E5E5] dark:border-[#2C2D30] px-2">
            <div className="text-[11px] text-[#767676] dark:text-[#9E9E9E]">{t('diary_consumed')}</div>
            <div className="font-display font-bold text-lg text-[#1B1C1C] dark:text-white">
              - {totalFoodLogged.toLocaleString()}
            </div>
          </div>
          <div className="pl-2">
            <div className="text-[11px] text-[#767676] dark:text-[#9E9E9E]">{t('diary_burned')}</div>
            <div className="font-display font-bold text-lg text-[#1B1C1C] dark:text-white">
              + {burnSynced.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Macro Split Section */}
        <div>
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="text-[11px] font-mono font-medium tracking-widest text-[#767676] dark:text-[#9E9E9E] uppercase">
              MACRO SPLIT
            </span>
            <span className="text-[11px] font-mono text-[#767676] dark:text-[#9E9E9E]">50C / 25P / 25F Ratio</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {/* Carbs */}
            <div className="bg-[#FBF9F9] dark:bg-[#232427] border border-[#E5E5E5] dark:border-[#2C2D30] rounded-lg p-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-[11px] tracking-wide text-[#1B1C1C] dark:text-white">
                  {t('scanner_carbs').toUpperCase()}
                </span>
                <span className="text-[11px] font-mono bg-[#E5E5E5] dark:bg-[#34363B] text-[#242424] dark:text-zinc-200 px-1.5 py-0.5 rounded-xs font-semibold">
                  {carbsPct}%
                </span>
              </div>
              <div className="w-full bg-[#E5E5E5] dark:bg-[#34363B] h-1.5 rounded-full overflow-hidden mb-2">
                <div
                  className="bg-[#242424] dark:bg-amber-400 h-full transition-all duration-300"
                  style={{ width: `${carbsPct}%` }}
                ></div>
              </div>
              <div className="font-display font-bold text-sm text-[#1B1C1C] dark:text-white">
                {Math.round(totalCarbs)}g
              </div>
              <div className="text-[10px] text-[#767676] dark:text-[#9E9E9E]">of {targetCarbs}g</div>
            </div>

            {/* Protein */}
            <div className="bg-[#FBF9F9] dark:bg-[#232427] border border-[#E5E5E5] dark:border-[#2C2D30] rounded-lg p-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-[11px] tracking-wide text-[#1B1C1C] dark:text-white">
                  {t('scanner_protein').toUpperCase()}
                </span>
                <span className="text-[11px] font-mono bg-[#E5E5E5] dark:bg-[#34363B] text-[#242424] dark:text-zinc-200 px-1.5 py-0.5 rounded-xs font-semibold">
                  {proteinPct}%
                </span>
              </div>
              <div className="w-full bg-[#E5E5E5] dark:bg-[#34363B] h-1.5 rounded-full overflow-hidden mb-2">
                <div
                  className="bg-[#242424] dark:bg-emerald-400 h-full transition-all duration-300"
                  style={{ width: `${proteinPct}%` }}
                ></div>
              </div>
              <div className="font-display font-bold text-sm text-[#1B1C1C] dark:text-white">
                {Math.round(totalProtein)}g
              </div>
              <div className="text-[10px] text-[#767676] dark:text-[#9E9E9E]">of {targetProtein}g</div>
            </div>

            {/* Fats */}
            <div className="bg-[#FBF9F9] dark:bg-[#232427] border border-[#E5E5E5] dark:border-[#2C2D30] rounded-lg p-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-[11px] tracking-wide text-[#1B1C1C] dark:text-white">
                  {t('scanner_fats').toUpperCase()}
                </span>
                <span className="text-[11px] font-mono bg-[#E5E5E5] dark:bg-[#34363B] text-[#242424] dark:text-zinc-200 px-1.5 py-0.5 rounded-xs font-semibold">
                  {fatsPct}%
                </span>
              </div>
              <div className="w-full bg-[#E5E5E5] dark:bg-[#34363B] h-1.5 rounded-full overflow-hidden mb-2">
                <div
                  className="bg-[#242424] dark:bg-rose-400 h-full transition-all duration-300"
                  style={{ width: `${fatsPct}%` }}
                ></div>
              </div>
              <div className="font-display font-bold text-sm text-[#1B1C1C] dark:text-white">
                {Math.round(totalFats)}g
              </div>
              <div className="text-[10px] text-[#767676] dark:text-[#9E9E9E]">of {targetFats}g</div>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Food & Recipe Generator Suite */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Smart Food & Barcode Scanner Card */}
        <div className="bg-white dark:bg-[#1A1B1D] border-2 border-emerald-500/30 dark:border-emerald-500/40 rounded-xl p-4 shadow-2xs flex flex-col justify-between gap-3 transition-colors">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Camera size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm text-[#1B1C1C] dark:text-white">
                  {t('scanner_title')}
                </span>
                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono font-bold rounded-full">
                  VISION AI
                </span>
              </div>
              <div className="text-xs text-[#767676] dark:text-[#9E9E9E] mt-0.5">
                {t('scanner_plate_desc')}
              </div>
            </div>
          </div>

          <button
            onClick={onOpenBarcode}
            id="btn-scan-food-plate"
            className="w-full px-3.5 py-2 bg-[#242424] hover:bg-black dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Barcode size={14} className="text-amber-400 dark:text-amber-300" />
            <span>{t('scanner_scan_button')}</span>
          </button>
        </div>

        {/* AI Pantry Recipe Maker Card (Cook from Raw Materials) */}
        <div className="bg-white dark:bg-[#1A1B1D] border-2 border-amber-500/30 dark:border-amber-500/40 rounded-xl p-4 shadow-2xs flex flex-col justify-between gap-3 transition-colors">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm text-[#1B1C1C] dark:text-white">
                  Cook from Ingredients
                </span>
                <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-mono font-bold rounded-full">
                  RECIPE AI
                </span>
              </div>
              <div className="text-xs text-[#767676] dark:text-[#9E9E9E] mt-0.5">
                Tell AI your available raw materials to generate custom dishes & macros
              </div>
            </div>
          </div>

          <button
            onClick={onOpenRecipeMaker}
            id="btn-cook-from-ingredients"
            className="w-full px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Sparkles size={14} />
            <span>Generate Dish & Macros</span>
          </button>
        </div>
      </div>

      {/* Synced Workout Card */}
      <div className="bg-white dark:bg-[#1A1B1D] border border-[#E5E5E5] dark:border-[#2C2D30] rounded-xl p-4 flex items-center justify-between shadow-2xs transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#F2F2F2] dark:bg-[#232427] border border-[#E5E5E5] dark:border-[#2C2D30] flex items-center justify-center text-[#242424] dark:text-white">
            <Dumbbell size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm text-[#1B1C1C] dark:text-white">
                {burnSynced > 0 ? 'Active Training Session' : 'No Workouts Completed Today'}
              </span>
              {burnSynced > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Synced"></span>
              )}
            </div>
            <div className="text-xs text-[#767676] dark:text-[#9E9E9E]">
              {burnSynced > 0 ? (
                'Live workout burn synced to diary'
              ) : onStartWorkoutTab ? (
                <button
                  type="button"
                  onClick={onStartWorkoutTab}
                  className="text-amber-700 dark:text-amber-400 hover:underline font-medium inline-flex items-center gap-1"
                >
                  Start a workout routine in Workouts tab →
                </button>
              ) : (
                'Log active workouts to record calorie burn'
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="font-display font-bold text-base text-[#1B1C1C] dark:text-white">
            {burnSynced > 0 ? `+${burnSynced}` : '0'}
          </span>
          <div className="text-[10px] font-mono text-[#767676] dark:text-[#9E9E9E] uppercase">KCAL</div>
        </div>
      </div>

      {/* Google Workspace Cloud Sync Card */}
      <div className="bg-white dark:bg-[#1A1B1D] border border-[#E5E5E5] dark:border-[#2C2D30] rounded-xl p-3.5 flex items-center justify-between shadow-2xs transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#242424] dark:bg-zinc-800 text-white flex items-center justify-center font-bold text-xs">
            G
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-[#1B1C1C] dark:text-white">Google Workspace Hub</span>
              <span className="px-1.5 py-0.2 bg-[#F2F2F2] dark:bg-[#232427] text-[9px] font-mono rounded-xs text-[#767676] dark:text-[#9E9E9E]">
                5 SERVICES
              </span>
            </div>
            <div className="text-[11px] text-[#767676] dark:text-[#9E9E9E]">Drive • Sheets • Calendar • Contacts • Gmail</div>
          </div>
        </div>
        <button
          onClick={onOpenWorkspace}
          className="py-1.5 px-2.5 bg-[#F2F2F2] dark:bg-[#232427] hover:bg-[#242424] dark:hover:bg-white hover:text-white dark:hover:text-[#1B1C1C] rounded-lg text-xs font-semibold text-[#242424] dark:text-zinc-200 transition-colors"
        >
          Open Sync
        </button>
      </div>

      {/* Meal Timeline Section */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-mono font-medium tracking-widest text-[#767676] dark:text-[#9E9E9E] uppercase">
            MEAL TIMELINE
          </span>
          <span className="text-xs text-[#767676] dark:text-[#9E9E9E] font-medium">4 Periods</span>
        </div>

        {mealSections.map((section) => {
          return (
            <div
              key={section.id}
              className="bg-white dark:bg-[#1A1B1D] border border-[#E5E5E5] dark:border-[#2C2D30] rounded-xl p-4 shadow-2xs transition-all"
            >
              {/* Header row of meal section */}
              <div className="flex items-center justify-between pb-3 border-b border-[#F2F2F2] dark:border-[#2C2D30]">
                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded-md bg-[#FBF9F9] dark:bg-[#232427] mt-0.5">
                    {getMealIcon(section.id)}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-[#1B1C1C] dark:text-white">
                      {getMealName(section)}
                    </div>
                    <div className="text-xs text-[#767676] dark:text-[#9E9E9E]">
                      {section.isPending && section.calories === 0 ? (
                        '0 kcal logged'
                      ) : (
                        `${section.calories} kcal • ${section.carbs}g C • ${section.protein}g P • ${section.fats}g F`
                      )}
                    </div>
                  </div>
                </div>

                {section.isPending && section.items.length === 0 ? (
                  <span className="px-2 py-0.5 bg-[#F2F2F2] dark:bg-[#232427] text-[#767676] dark:text-[#9E9E9E] text-[10px] font-mono font-semibold rounded-xs uppercase tracking-wider">
                    PENDING
                  </span>
                ) : (
                  <button
                    onClick={() => onOpenQuickLog(section.id)}
                    id={`add-food-${section.id}`}
                    className="flex items-center gap-1 text-xs font-medium text-[#242424] dark:text-[#EAEAEA] bg-[#FBF9F9] dark:bg-[#232427] border border-[#E5E5E5] dark:border-[#2C2D30] px-2.5 py-1 rounded-md hover:bg-[#F2F2F2] dark:hover:bg-[#2C2D30] transition-colors"
                  >
                    <Plus size={13} />
                    <span>{t('diary_add_food')}</span>
                  </button>
                )}
              </div>

              {/* Items or Pending Banner */}
              {section.items.length > 0 ? (
                <div className="divide-y divide-[#F2F2F2] dark:divide-[#2C2D30]">
                  {section.items.map((item) => (
                    <div
                      key={item.id}
                      className="py-2.5 flex items-center justify-between gap-3 text-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 rounded-md object-cover border border-[#E5E5E5] dark:border-[#2C2D30] shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-[#F2F2F2] dark:bg-[#232427] border border-[#E5E5E5] dark:border-[#2C2D30] flex items-center justify-center shrink-0 text-[#767676] dark:text-[#9E9E9E]">
                            <Sparkles size={16} />
                          </div>
                        )}
                        <div className="min-w-0 truncate">
                          <div className="font-medium text-xs text-[#1B1C1C] dark:text-white truncate">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-[#767676] dark:text-[#9E9E9E] truncate">
                            {item.portion} • {item.carbs}g C • {item.protein}g P • {item.fats}g F
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-display font-semibold text-xs text-[#1B1C1C] dark:text-white">
                          {item.calories}
                        </div>
                        <div className="text-[10px] text-[#767676] dark:text-[#9E9E9E]">kcal</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-3 bg-[#FBF9F9] dark:bg-[#232427] border border-dashed border-[#E0E0E0] dark:border-[#333538] rounded-xl p-3 flex items-center justify-between">
                  <div className="pr-2">
                    <div className="font-medium text-xs text-[#1B1C1C] dark:text-white flex items-center gap-1.5">
                      <span>No items logged yet</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-white dark:bg-[#1C1D1F] border border-[#E5E5E5] dark:border-[#383A3D] text-[#767676] dark:text-zinc-400 uppercase">
                        {dietaryPreference === 'veg'
                          ? '🥦 Pure Veg'
                          : dietaryPreference === 'eggetarian'
                          ? '🥚 Egg + Veg'
                          : '🍗 Non-Veg'}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#767676] dark:text-[#9E9E9E] mt-0.5">
                      Snap a photo with Smart Food Scanner or tap to log manually
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenQuickLog(section.id)}
                    id={`btn-log-${section.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#242424] hover:bg-[#1B1C1C] dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-[#1B1C1C] text-xs font-medium rounded-lg shrink-0 shadow-xs transition-colors"
                  >
                    <Plus size={13} />
                    <span>Log {section.name}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Hydration Tracker Card */}
      <div className="bg-white dark:bg-[#1A1B1D] border border-[#E5E5E5] dark:border-[#2C2D30] rounded-xl p-5 shadow-2xs transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplet size={16} className="text-[#242424] dark:text-sky-400" />
            <span className="text-xs font-mono font-medium tracking-widest text-[#1B1C1C] dark:text-white uppercase">
              {t('diary_water').toUpperCase()}
            </span>
          </div>
          <div className="font-display text-sm text-[#1B1C1C] dark:text-white">
            <span className="font-bold">{waterMl.toLocaleString()}</span>
            <span className="text-[#767676] dark:text-[#9E9E9E] font-normal"> / {waterGoalMl.toLocaleString()} ml</span>
          </div>
        </div>

        {/* 10 Glass visual indicators */}
        <div className="grid grid-cols-10 gap-1.5 bg-[#FBF9F9] dark:bg-[#232427] border border-[#E5E5E5] dark:border-[#2C2D30] p-2.5 rounded-lg mb-3">
          {Array.from({ length: 10 }).map((_, index) => {
            const isFilled = index < glassesFilled;
            return (
              <button
                key={index}
                onClick={() => onAddWater(isFilled ? -250 : 250)}
                title={isFilled ? 'Remove 250ml' : 'Add 250ml'}
                aria-label={`Water glass ${index + 1} of 10 ${isFilled ? 'filled' : 'empty'}`}
                className={`h-7 rounded-sm flex items-center justify-center transition-all ${
                  isFilled
                    ? 'bg-[#242424] dark:bg-sky-500 text-white'
                    : 'bg-white dark:bg-[#1A1B1D] border border-[#E5E5E5] dark:border-[#2C2D30] text-[#C4C7C7] dark:text-zinc-500 hover:border-[#767676] dark:hover:border-zinc-400'
                }`}
              >
                <Droplet size={12} fill={isFilled ? 'currentColor' : 'none'} />
              </button>
            );
          })}
        </div>

        {/* Quick Stepper Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onAddWater(250)}
            id="btn-add-250ml"
            className="py-2 bg-[#FBF9F9] dark:bg-[#232427] hover:bg-[#F2F2F2] dark:hover:bg-[#2C2D30] border border-[#E5E5E5] dark:border-[#2C2D30] rounded-md text-xs font-medium text-[#242424] dark:text-[#EAEAEA] flex items-center justify-center gap-1 transition-colors"
          >
            <Plus size={12} />
            <span>250 ml</span>
          </button>
          <button
            onClick={() => onAddWater(500)}
            id="btn-add-500ml"
            className="py-2 bg-[#FBF9F9] dark:bg-[#232427] hover:bg-[#F2F2F2] dark:hover:bg-[#2C2D30] border border-[#E5E5E5] dark:border-[#2C2D30] rounded-md text-xs font-medium text-[#242424] dark:text-[#EAEAEA] flex items-center justify-center gap-1 transition-colors"
          >
            <Plus size={12} />
            <span>500 ml</span>
          </button>
          <button
            onClick={onSetCustomWater}
            id="btn-custom-ml"
            className="py-2 bg-[#FBF9F9] dark:bg-[#232427] hover:bg-[#F2F2F2] dark:hover:bg-[#2C2D30] border border-[#E5E5E5] dark:border-[#2C2D30] rounded-md text-xs font-medium text-[#242424] dark:text-[#EAEAEA] flex items-center justify-center gap-1 transition-colors"
          >
            <Sliders size={12} />
            <span>Custom</span>
          </button>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-16 left-0 right-0 max-w-5xl lg:max-w-6xl mx-auto px-3 sm:px-6 pointer-events-none z-30">
        <div className="grid grid-cols-3 gap-2 sm:gap-3 pointer-events-auto shadow-lg">
          <button
            onClick={onOpenBarcode}
            id="btn-scan-barcode"
            className="py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl bg-white/95 dark:bg-[#1A1B1D]/95 backdrop-blur-md border border-[#242424] dark:border-[#3C3D42] text-[#242424] dark:text-white hover:bg-[#F2F2F2] dark:hover:bg-[#28292E] font-display font-semibold text-[11px] sm:text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Barcode size={15} strokeWidth={2.2} className="shrink-0" />
            <span className="truncate">{t('diary_barcode_lookup').toUpperCase()}</span>
          </button>
          <button
            onClick={onOpenRecipeMaker}
            id="btn-quick-cook"
            className="py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-display font-bold text-[11px] sm:text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Sparkles size={15} strokeWidth={2.2} className="shrink-0" />
            <span className="truncate">COOK WITH AI</span>
          </button>
          <button
            onClick={() => onOpenQuickLog()}
            id="btn-quick-log"
            className="py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl bg-[#242424] hover:bg-[#1B1C1C] dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-[#1B1C1C] font-display font-semibold text-[11px] sm:text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Plus size={15} strokeWidth={2.5} className="shrink-0" />
            <span className="truncate">{t('diary_quick_log').toUpperCase()}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
