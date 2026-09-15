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
  Sparkles,
  Sliders,
  Check,
} from 'lucide-react';
import { MealSection } from '../types';

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
  onAddWater: (amount: number) => void;
  onSetCustomWater: () => void;
  onOpenQuickLog: (sectionId?: string) => void;
  onOpenBarcode: () => void;
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
  onAddWater,
  onSetCustomWater,
  onOpenQuickLog,
  onOpenBarcode,
}) => {
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
        return <Sun size={18} className="text-[#4A4A4A]" />;
      case 'lunch':
        return <Sun size={18} className="text-[#4A4A4A]" strokeWidth={2.2} />;
      case 'dinner':
        return <Moon size={18} className="text-[#4A4A4A]" />;
      case 'snacks':
        return <Cookie size={18} className="text-[#4A4A4A]" />;
      default:
        return <Sun size={18} className="text-[#4A4A4A]" />;
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
          className="p-1.5 rounded-md hover:bg-[#F2F2F2] text-[#4A4A4A] transition-colors"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-[#4A4A4A]" />
          <span className="font-display font-semibold text-[#1B1C1C] text-sm md:text-base">
            {currentDate}
          </span>
          <span className="px-2 py-0.5 bg-[#F2F2F2] border border-[#E5E5E5] text-[11px] font-mono tracking-wider font-medium text-[#4A4A4A] rounded-xs">
            CYCLE {cycleNumber}
          </span>
        </div>

        <button
          onClick={onNextDay}
          id="btn-next-day"
          aria-label="Next Day"
          className="p-1.5 rounded-md hover:bg-[#F2F2F2] text-[#4A4A4A] transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Energy Balance Card */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 md:p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono font-medium tracking-widest text-[#767676] uppercase">
            ENERGY BALANCE
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F2F2F2] text-[11px] font-medium text-[#242424]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#242424]"></span>
            <span>ON TARGET</span>
          </div>
        </div>

        {/* Big Remaining Calories */}
        <div className="flex items-baseline gap-2 mb-6">
          <span className="font-display text-4xl font-bold tracking-tight text-[#1B1C1C]">
            {remainingKcal.toLocaleString()}
          </span>
          <span className="text-sm text-[#767676] font-normal">kcal remaining</span>
        </div>

        {/* 3 Metric Breakdown */}
        <div className="grid grid-cols-3 gap-2 border-t border-b border-[#E5E5E5] py-3.5 mb-5">
          <div className="border-r border-[#E5E5E5] pr-2">
            <div className="text-[11px] text-[#767676]">Daily Goal</div>
            <div className="font-display font-bold text-lg text-[#1B1C1C]">
              {dailyGoal.toLocaleString()}
            </div>
          </div>
          <div className="border-r border-[#E5E5E5] px-2">
            <div className="text-[11px] text-[#767676]">Food Logged</div>
            <div className="font-display font-bold text-lg text-[#1B1C1C]">
              - {totalFoodLogged.toLocaleString()}
            </div>
          </div>
          <div className="pl-2">
            <div className="text-[11px] text-[#767676]">Burn Synced</div>
            <div className="font-display font-bold text-lg text-[#1B1C1C]">
              + {burnSynced.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Macro Split Section */}
        <div>
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="text-[11px] font-mono font-medium tracking-widest text-[#767676] uppercase">
              MACRO SPLIT
            </span>
            <span className="text-[11px] font-mono text-[#767676]">50C / 25P / 25F Ratio</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {/* Carbs */}
            <div className="bg-[#FBF9F9] border border-[#E5E5E5] rounded-lg p-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-[11px] tracking-wide text-[#1B1C1C]">CARBS</span>
                <span className="text-[11px] font-mono bg-[#E5E5E5] text-[#242424] px-1.5 py-0.5 rounded-xs font-semibold">
                  {carbsPct}%
                </span>
              </div>
              <div className="w-full bg-[#E5E5E5] h-1.5 rounded-full overflow-hidden mb-2">
                <div
                  className="bg-[#242424] h-full transition-all duration-300"
                  style={{ width: `${carbsPct}%` }}
                ></div>
              </div>
              <div className="font-display font-bold text-sm text-[#1B1C1C]">
                {Math.round(totalCarbs)}g
              </div>
              <div className="text-[10px] text-[#767676]">of {targetCarbs}g</div>
            </div>

            {/* Protein */}
            <div className="bg-[#FBF9F9] border border-[#E5E5E5] rounded-lg p-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-[11px] tracking-wide text-[#1B1C1C]">PROTEIN</span>
                <span className="text-[11px] font-mono bg-[#E5E5E5] text-[#242424] px-1.5 py-0.5 rounded-xs font-semibold">
                  {proteinPct}%
                </span>
              </div>
              <div className="w-full bg-[#E5E5E5] h-1.5 rounded-full overflow-hidden mb-2">
                <div
                  className="bg-[#242424] h-full transition-all duration-300"
                  style={{ width: `${proteinPct}%` }}
                ></div>
              </div>
              <div className="font-display font-bold text-sm text-[#1B1C1C]">
                {Math.round(totalProtein)}g
              </div>
              <div className="text-[10px] text-[#767676]">of {targetProtein}g</div>
            </div>

            {/* Fats */}
            <div className="bg-[#FBF9F9] border border-[#E5E5E5] rounded-lg p-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-[11px] tracking-wide text-[#1B1C1C]">FATS</span>
                <span className="text-[11px] font-mono bg-[#E5E5E5] text-[#242424] px-1.5 py-0.5 rounded-xs font-semibold">
                  {fatsPct}%
                </span>
              </div>
              <div className="w-full bg-[#E5E5E5] h-1.5 rounded-full overflow-hidden mb-2">
                <div
                  className="bg-[#242424] h-full transition-all duration-300"
                  style={{ width: `${fatsPct}%` }}
                ></div>
              </div>
              <div className="font-display font-bold text-sm text-[#1B1C1C]">
                {Math.round(totalFats)}g
              </div>
              <div className="text-[10px] text-[#767676]">of {targetFats}g</div>
            </div>
          </div>
        </div>
      </div>

      {/* Synced Workout Card */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#F2F2F2] border border-[#E5E5E5] flex items-center justify-center text-[#242424]">
            <Dumbbell size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm text-[#1B1C1C]">
                Cult.fit 30m HIIT Session
              </span>
              <RefreshCw size={12} className="text-[#767676]" />
            </div>
            <div className="text-xs text-[#767676]">Apple Health • 07:45 AM</div>
          </div>
        </div>
        <div className="text-right">
          <span className="font-display font-bold text-base text-[#1B1C1C]">+400</span>
          <div className="text-[10px] font-mono text-[#767676] uppercase">KCAL</div>
        </div>
      </div>

      {/* Meal Timeline Section */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-mono font-medium tracking-widest text-[#767676] uppercase">
            MEAL TIMELINE
          </span>
          <span className="text-xs text-[#767676] font-medium">4 Periods</span>
        </div>

        {mealSections.map((section) => {
          return (
            <div
              key={section.id}
              className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-2xs transition-all"
            >
              {/* Header row of meal section */}
              <div className="flex items-center justify-between pb-3 border-b border-[#F2F2F2]">
                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded-md bg-[#FBF9F9] mt-0.5">
                    {getMealIcon(section.id)}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-[#1B1C1C]">
                      {section.name}
                    </div>
                    <div className="text-xs text-[#767676]">
                      {section.isPending && section.calories === 0 ? (
                        '0 kcal logged'
                      ) : (
                        `${section.calories} kcal • ${section.carbs}g C • ${section.protein}g P • ${section.fats}g F`
                      )}
                    </div>
                  </div>
                </div>

                {section.isPending && section.items.length === 0 ? (
                  <span className="px-2 py-0.5 bg-[#F2F2F2] text-[#767676] text-[10px] font-mono font-semibold rounded-xs uppercase tracking-wider">
                    PENDING
                  </span>
                ) : (
                  <button
                    onClick={() => onOpenQuickLog(section.id)}
                    id={`add-food-${section.id}`}
                    className="flex items-center gap-1 text-xs font-medium text-[#242424] bg-[#FBF9F9] border border-[#E5E5E5] px-2.5 py-1 rounded-md hover:bg-[#F2F2F2] transition-colors"
                  >
                    <Plus size={13} />
                    <span>Add</span>
                  </button>
                )}
              </div>

              {/* Items or Pending Banner */}
              {section.items.length > 0 ? (
                <div className="divide-y divide-[#F2F2F2]">
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
                            className="w-10 h-10 rounded-md object-cover border border-[#E5E5E5] shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-[#F2F2F2] border border-[#E5E5E5] flex items-center justify-center shrink-0 text-[#767676]">
                            <Sparkles size={16} />
                          </div>
                        )}
                        <div className="min-w-0 truncate">
                          <div className="font-medium text-xs text-[#1B1C1C] truncate">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-[#767676] truncate">
                            {item.portion} • {item.carbs}g C • {item.protein}g P • {item.fats}g F
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-display font-semibold text-xs text-[#1B1C1C]">
                          {item.calories}
                        </div>
                        <div className="text-[10px] text-[#767676]">kcal</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : section.isPending ? (
                <div className="mt-3 bg-[#FBF9F9] border border-[#E5E5E5] rounded-lg p-3.5 flex items-center justify-between">
                  <div className="pr-2">
                    <div className="font-medium text-xs text-[#1B1C1C]">
                      Plan your evening meal
                    </div>
                    <div className="text-[11px] text-[#767676] truncate">
                      {remainingKcal > 0
                        ? `${remainingKcal.toLocaleString()} kcal remaining for optim...`
                        : 'Caloric ceiling reached'}
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenQuickLog('dinner')}
                    id="btn-log-dinner"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#242424] hover:bg-[#1B1C1C] text-white text-xs font-medium rounded-md shrink-0 shadow-xs transition-colors"
                  >
                    <Plus size={13} />
                    <span>Log Dinner</span>
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Hydration Tracker Card */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplet size={16} className="text-[#242424]" />
            <span className="text-xs font-mono font-medium tracking-widest text-[#1B1C1C] uppercase">
              HYDRATION TRACKER
            </span>
          </div>
          <div className="font-display text-sm text-[#1B1C1C]">
            <span className="font-bold">{waterMl.toLocaleString()}</span>
            <span className="text-[#767676] font-normal"> / {waterGoalMl.toLocaleString()} ml</span>
          </div>
        </div>

        {/* 10 Glass visual indicators */}
        <div className="grid grid-cols-10 gap-1.5 bg-[#FBF9F9] border border-[#E5E5E5] p-2.5 rounded-lg mb-3">
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
                    ? 'bg-[#242424] text-white'
                    : 'bg-white border border-[#E5E5E5] text-[#C4C7C7] hover:border-[#767676]'
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
            className="py-2 bg-[#FBF9F9] hover:bg-[#F2F2F2] border border-[#E5E5E5] rounded-md text-xs font-medium text-[#242424] flex items-center justify-center gap-1 transition-colors"
          >
            <Plus size={12} />
            <span>250 ml</span>
          </button>
          <button
            onClick={() => onAddWater(500)}
            id="btn-add-500ml"
            className="py-2 bg-[#FBF9F9] hover:bg-[#F2F2F2] border border-[#E5E5E5] rounded-md text-xs font-medium text-[#242424] flex items-center justify-center gap-1 transition-colors"
          >
            <Plus size={12} />
            <span>500 ml</span>
          </button>
          <button
            onClick={onSetCustomWater}
            id="btn-custom-ml"
            className="py-2 bg-[#FBF9F9] hover:bg-[#F2F2F2] border border-[#E5E5E5] rounded-md text-xs font-medium text-[#242424] flex items-center justify-center gap-1 transition-colors"
          >
            <Sliders size={12} />
            <span>Custom</span>
          </button>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-16 left-0 right-0 max-w-xl mx-auto px-4 pointer-events-none z-30">
        <div className="grid grid-cols-2 gap-3 pointer-events-auto shadow-md">
          <button
            onClick={onOpenBarcode}
            id="btn-scan-barcode"
            className="py-3 px-4 rounded-xl bg-white/95 backdrop-blur-md border border-[#242424] text-[#242424] hover:bg-[#F2F2F2] font-display font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-colors"
          >
            <Barcode size={16} strokeWidth={2.2} />
            <span>SCAN BARCODE</span>
          </button>
          <button
            onClick={() => onOpenQuickLog()}
            id="btn-quick-log"
            className="py-3 px-4 rounded-xl bg-[#242424] hover:bg-[#1B1C1C] text-white font-display font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>QUICK LOG</span>
          </button>
        </div>
      </div>
    </div>
  );
};
