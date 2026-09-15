import React from 'react';
import { LayoutGrid, Dumbbell, BookOpen, PlayCircle, BarChart2 } from 'lucide-react';
import { NavTab } from '../types';
import { useAppSettings } from '../services/appSettingsContext';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const { t } = useAppSettings();

  const tabs = [
    { id: 'today' as NavTab, label: t('nav_dashboard'), icon: LayoutGrid },
    { id: 'workouts' as NavTab, label: t('nav_workouts'), icon: Dumbbell },
    { id: 'diary' as NavTab, label: t('nav_diary'), icon: BookOpen },
    { id: 'live' as NavTab, label: t('nav_live'), icon: PlayCircle },
    { id: 'progress' as NavTab, label: t('nav_progress'), icon: BarChart2 },
  ];

  return (
    <nav
      id="bottom-nav"
      aria-label="Main Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#FBF9F9]/95 dark:bg-[#121314]/95 backdrop-blur-md border-t border-[#E5E5E5] dark:border-[#252628] px-2 py-2 max-w-xl mx-auto transition-colors"
    >
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-btn-${tab.id}`}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 transition-colors rounded-lg ${
                isActive
                  ? 'text-[#1B1C1C] dark:text-white'
                  : 'text-[#767676] dark:text-zinc-400 hover:text-[#242424] dark:hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.3 : 1.7}
                  className={`transition-transform duration-150 ${isActive ? 'scale-105' : ''}`}
                />
                {tab.id === 'live' && (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                )}
              </div>
              <span
                className={`text-[10px] mt-1 tracking-tight font-medium ${
                  isActive
                    ? 'font-semibold text-[#1B1C1C] dark:text-white'
                    : 'text-[#767676] dark:text-zinc-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
