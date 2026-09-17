import React, { useState } from 'react';
import {
  Check,
  Salad,
  Egg,
  Beef,
  Flame,
  Target,
  Dumbbell,
  HeartPulse,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { DietaryPreference, UserGoal } from '../types';

interface DietaryOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDietaryPreference?: DietaryPreference;
  currentGoal?: UserGoal;
  onSave: (diet: DietaryPreference, goal: UserGoal, targetKcal: number) => void;
}

export const DietaryOnboardingModal: React.FC<DietaryOnboardingModalProps> = ({
  isOpen,
  onClose,
  currentDietaryPreference = 'veg',
  currentGoal = 'muscle_building',
  onSave,
}) => {
  const [diet, setDiet] = useState<DietaryPreference>(currentDietaryPreference);
  const [goal, setGoal] = useState<UserGoal>(currentGoal);
  const [targetKcal, setTargetKcal] = useState<number>(2200);

  if (!isOpen) return null;

  const dietOptions: {
    id: DietaryPreference;
    title: string;
    sub: string;
    desc: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      id: 'veg',
      title: 'Vegetarian (शुद्ध शाकाहारी)',
      sub: 'Plant-Based + Dairy',
      desc: 'Pulses, Paneer, Tofu, Sabzi, Roti, Rice, Fruits & Dairy. 100% vegetarian without meat or eggs.',
      icon: <Salad size={22} className="text-emerald-600 dark:text-emerald-400" />,
      color: 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20',
    },
    {
      id: 'eggetarian',
      title: 'Eggetarian (शाकाहारी + अंडा)',
      sub: 'Vegetarian + Whole Eggs & Egg Whites',
      desc: 'All vegetarian staples boosted with whole eggs and egg whites for enhanced bio-available protein.',
      icon: <Egg size={22} className="text-amber-500 dark:text-amber-400" />,
      color: 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20',
    },
    {
      id: 'non_veg',
      title: 'Non-Vegetarian (मांसाहारी)',
      sub: 'Chicken, Fish, Eggs & Whole Foods',
      desc: 'Lean poultry, seafood, eggs, alongside lentils, vegetables, and wholesome carbohydrates.',
      icon: <Beef size={22} className="text-rose-500 dark:text-rose-400" />,
      color: 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20',
    },
  ];

  const goalOptions: {
    id: UserGoal;
    title: string;
    kcal: number;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'muscle_building',
      title: 'Muscle Hypertrophy & Strength',
      kcal: 2400,
      icon: <Dumbbell size={16} className="text-amber-500" />,
    },
    {
      id: 'fat_loss',
      title: 'Fat Loss & Caloric Deficit',
      kcal: 1850,
      icon: <Flame size={16} className="text-rose-500" />,
    },
    {
      id: 'diet_nutrition',
      title: 'Clean Nutrition & Vitality',
      kcal: 2100,
      icon: <HeartPulse size={16} className="text-emerald-500" />,
    },
    {
      id: 'general_fitness',
      title: 'Active Maintenance & Wellness',
      kcal: 2200,
      icon: <Target size={16} className="text-blue-500" />,
    },
  ];

  const handleSelectGoal = (selectedGoal: UserGoal, defaultKcal: number) => {
    setGoal(selectedGoal);
    setTargetKcal(defaultKcal);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(diet, goal, targetKcal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#1C1D1F] border border-[#E5E5E5] dark:border-[#2C2D30] rounded-2xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="space-y-1 text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs font-mono font-semibold">
            <Sparkles size={12} />
            <span>PERSONALIZED DIET & NUTRITION</span>
          </div>
          <h2 className="font-display font-bold text-xl text-[#1B1C1C] dark:text-white">
            What is your dietary lifestyle?
          </h2>
          <p className="text-xs text-[#767676] dark:text-zinc-400">
            CultPulse will tailor your nutrition database, meal recommendations, and macros accordingly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Diet Selection Cards */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-[#1B1C1C] dark:text-white uppercase font-mono tracking-wider">
              1. Dietary Preference
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {dietOptions.map((opt) => {
                const isSelected = diet === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setDiet(opt.id)}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? opt.color
                        : 'border-[#E5E5E5] dark:border-[#2C2D30] bg-white dark:bg-[#232427] hover:border-[#9E9E9E]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-white dark:bg-[#1C1D1F] shadow-2xs shrink-0">
                        {opt.icon}
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-display font-bold text-sm text-[#1B1C1C] dark:text-white flex items-center gap-2">
                          <span>{opt.title}</span>
                        </div>
                        <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                          {opt.sub}
                        </div>
                        <p className="text-xs text-[#767676] dark:text-zinc-400 leading-snug">
                          {opt.desc}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-colors ${
                        isSelected
                          ? 'border-[#242424] dark:border-white bg-[#242424] dark:bg-white text-white dark:text-black'
                          : 'border-[#CCCCCC] dark:border-[#555]'
                      }`}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Primary Fitness Goal */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-[#1B1C1C] dark:text-white uppercase font-mono tracking-wider">
              2. Primary Training Goal
            </label>
            <div className="grid grid-cols-2 gap-2">
              {goalOptions.map((g) => {
                const isSelected = goal === g.id;
                return (
                  <button
                    type="button"
                    key={g.id}
                    onClick={() => handleSelectGoal(g.id, g.kcal)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                      isSelected
                        ? 'border-[#242424] dark:border-amber-400 bg-[#F5F5F5] dark:bg-[#2A2B2E] shadow-2xs'
                        : 'border-[#E5E5E5] dark:border-[#2C2D30] hover:border-[#9E9E9E]'
                    }`}
                  >
                    <div className="shrink-0">{g.icon}</div>
                    <div className="overflow-hidden">
                      <div className="font-semibold text-xs text-[#1B1C1C] dark:text-white truncate">
                        {g.title}
                      </div>
                      <div className="text-[10px] font-mono text-[#767676] dark:text-zinc-400">
                        ~{g.kcal} kcal/day
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily Caloric Target Slider */}
          <div className="p-3.5 bg-[#FBF9F9] dark:bg-[#232427] border border-[#E5E5E5] dark:border-[#2C2D30] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#4A4A4A] dark:text-zinc-300">
                Daily Caloric Ceiling
              </span>
              <span className="font-display font-bold text-sm text-[#1B1C1C] dark:text-white font-mono">
                {targetKcal} kcal
              </span>
            </div>
            <input
              type="range"
              min={1400}
              max={3600}
              step={50}
              value={targetKcal}
              onChange={(e) => setTargetKcal(Number(e.target.value))}
              className="w-full accent-[#242424] dark:accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Submit Action */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-white dark:bg-[#232427] border border-[#E5E5E5] dark:border-[#2C2D30] text-[#1B1C1C] dark:text-white font-medium text-xs rounded-xl hover:bg-[#F5F5F5] dark:hover:bg-[#2A2B2E] transition-colors"
            >
              Skip for now
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-[#242424] hover:bg-[#1B1C1C] dark:bg-amber-400 dark:hover:bg-amber-500 text-white dark:text-black font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <span>Save & Apply Diet</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
