import React, { useState } from 'react';
import { Dumbbell, Flame, Utensils, Zap, Activity, Check, ArrowRight, Sparkles, Globe } from 'lucide-react';
import { UserGoal } from '../types';
import { USER_GOALS } from '../data/goalConfigs';
import { useAppSettings } from '../services/appSettingsContext';

interface GoalSelectionModalProps {
  isOpen: boolean;
  onSelectGoal: (goal: UserGoal) => void;
  currentGoal?: UserGoal;
  isInitialOnboarding?: boolean;
}

export const GoalSelectionModal: React.FC<GoalSelectionModalProps> = ({
  isOpen,
  onSelectGoal,
  currentGoal = 'muscle_building',
  isInitialOnboarding = true,
}) => {
  const [selected, setSelected] = useState<UserGoal>(currentGoal);
  const { language, setLanguage, supportedLanguages, t } = useAppSettings();

  if (!isOpen) return null;

  const getIcon = (id: UserGoal) => {
    switch (id) {
      case 'muscle_building':
        return <Dumbbell className="w-6 h-6 text-amber-500" />;
      case 'fat_loss':
        return <Flame className="w-6 h-6 text-orange-500" />;
      case 'diet_nutrition':
        return <Utensils className="w-6 h-6 text-emerald-500" />;
      case 'endurance_hiit':
        return <Zap className="w-6 h-6 text-yellow-500" />;
      case 'general_fitness':
        return <Activity className="w-6 h-6 text-sky-500" />;
    }
  };

  const getGoalTitle = (id: UserGoal): string => {
    switch (id) {
      case 'muscle_building':
        return t('goal_muscle_title');
      case 'fat_loss':
        return t('goal_fat_loss_title');
      case 'diet_nutrition':
        return t('goal_diet_title');
      case 'endurance_hiit':
        return t('goal_endurance_title');
      case 'general_fitness':
        return t('goal_general_title');
    }
  };

  const getGoalDesc = (id: UserGoal): string => {
    switch (id) {
      case 'muscle_building':
        return t('goal_muscle_desc');
      case 'fat_loss':
        return t('goal_fat_loss_desc');
      case 'diet_nutrition':
        return t('goal_diet_desc');
      case 'endurance_hiit':
        return t('goal_endurance_desc');
      case 'general_fitness':
        return t('goal_general_desc');
    }
  };

  const handleConfirm = () => {
    onSelectGoal(selected);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FBF9F9] dark:bg-[#161718] border border-[#E5E5E5] dark:border-[#2A2B2D] rounded-2xl w-full max-w-xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col transition-colors">
        {/* Header */}
        <div className="p-5 md:p-6 bg-white dark:bg-[#1C1D1F] border-b border-[#E5E5E5] dark:border-[#2A2B2D]">
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-[#242424] text-white text-[11px] font-mono font-bold tracking-wider rounded-full uppercase">
                {isInitialOnboarding ? t('goal_modal_setup') : t('goal_modal_change')}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                <Sparkles size={11} />
                <span>{t('goal_modal_personalized')}</span>
              </span>
            </div>

            {/* Language Selector at Login / Onboarding */}
            <div className="flex items-center gap-1 bg-[#F2F2F2] dark:bg-[#252628] px-2 py-1 rounded-lg border border-[#E5E5E5] dark:border-[#333]">
              <Globe size={13} className="text-[#767676] dark:text-zinc-400" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                aria-label={t('goal_language_label')}
                className="bg-transparent text-xs text-[#1B1C1C] dark:text-zinc-200 font-medium focus:outline-none cursor-pointer"
              >
                {supportedLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code} className="dark:bg-[#1C1D1F] dark:text-white">
                    {lang.flag} {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h2 className="font-display font-bold text-xl md:text-2xl text-[#1B1C1C] dark:text-white tracking-tight">
            {t('goal_modal_heading')}
          </h2>
          <p className="text-xs md:text-sm text-[#767676] dark:text-zinc-400 mt-1 leading-relaxed">
            {t('goal_modal_subheading')}
          </p>
        </div>

        {/* Goals List */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-3">
          {(Object.keys(USER_GOALS) as UserGoal[]).map((goalKey) => {
            const config = USER_GOALS[goalKey];
            const isChosen = selected === goalKey;

            return (
              <div
                key={goalKey}
                onClick={() => setSelected(goalKey)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  isChosen
                    ? 'bg-white dark:bg-[#222326] border-[#1B1C1C] dark:border-amber-400 shadow-md ring-1 ring-[#1B1C1C] dark:ring-amber-400'
                    : 'bg-white/80 dark:bg-[#1E1F21] border-[#E5E5E5] dark:border-[#2C2D30] hover:border-[#999] hover:bg-white dark:hover:bg-[#252629]'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isChosen
                        ? 'bg-[#1B1C1C] dark:bg-amber-400 text-white dark:text-black'
                        : 'bg-[#F2F2F2] dark:bg-[#2A2B2E] text-[#4A4A4A] dark:text-zinc-300'
                    }`}
                  >
                    {getIcon(goalKey)}
                  </div>
                  <div>
                    <span className="font-display font-bold text-sm md:text-base text-[#1B1C1C] dark:text-white">
                      {getGoalTitle(goalKey)}
                    </span>
                    <p className="text-xs text-[#4A4A4A] dark:text-zinc-300 mt-1 leading-relaxed">
                      {getGoalDesc(goalKey)}
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-[11px] font-mono text-[#767676] dark:text-zinc-400 flex-wrap">
                      <span className="bg-[#F2F2F2] dark:bg-[#2A2B2E] px-2 py-0.5 rounded text-[#242424] dark:text-zinc-200 font-semibold">
                        Target: {config.targetKcal} kcal
                      </span>
                      <span>Protein: {config.targetProtein}g</span>
                      <span>Modality: {config.recommendedModality}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 mt-1">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isChosen
                        ? 'border-[#1B1C1C] dark:border-amber-400 bg-[#1B1C1C] dark:bg-amber-400 text-white dark:text-black'
                        : 'border-[#CCC] dark:border-zinc-600 bg-white dark:bg-[#1E1F21]'
                    }`}
                  >
                    {isChosen && <Check size={12} strokeWidth={3} />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white dark:bg-[#1C1D1F] border-t border-[#E5E5E5] dark:border-[#2A2B2D] flex items-center justify-between gap-3">
          <div className="text-xs text-[#767676] dark:text-zinc-400">
            {t('goal_selected')}: <strong className="text-[#1B1C1C] dark:text-white">{getGoalTitle(selected)}</strong>
          </div>
          <button
            onClick={handleConfirm}
            id="btn-confirm-goal"
            className="px-5 py-2.5 bg-[#1B1C1C] dark:bg-amber-400 hover:bg-black dark:hover:bg-amber-500 text-white dark:text-black text-xs md:text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-sm"
          >
            <span>{t('goal_continue')}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

