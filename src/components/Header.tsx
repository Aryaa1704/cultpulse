import React, { useState, useRef, useEffect } from 'react';
import { LifeBuoy, Target, Sun, Moon, Globe } from 'lucide-react';
import { NavTab, UserGoal } from '../types';
import { USER_GOALS } from '../data/goalConfigs';
import { useAppSettings } from '../services/appSettingsContext';

interface HeaderProps {
  activeTab: NavTab;
  streakDays?: number;
  avatarUrl?: string;
  onAvatarClick?: () => void;
  onWorkspaceClick?: () => void;
  onScaleMonitorClick?: () => void;
  onAdminHubClick?: () => void;
  onSupportClick?: () => void;
  onGoalClick?: () => void;
  currentGoal?: UserGoal;
  isWorkspaceConnected?: boolean;
  isAdmin?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  streakDays = 7,
  avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
  onAvatarClick,
  onWorkspaceClick,
  onScaleMonitorClick,
  onAdminHubClick,
  onSupportClick,
  onGoalClick,
  currentGoal = 'muscle_building',
  isWorkspaceConnected = false,
  isAdmin = false,
}) => {
  const { theme, toggleTheme, language, setLanguage, supportedLanguages, t } = useAppSettings();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Close language menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSubTitle = () => {
    switch (activeTab) {
      case 'diary':
      case 'today':
        return t('nav_diary').toUpperCase();
      case 'workouts':
        return t('nav_workouts').toUpperCase();
      case 'live':
        return t('nav_live').toUpperCase();
      case 'progress':
        return t('nav_progress').toUpperCase();
      case 'workspace':
        return t('header_workspace').toUpperCase();
      default:
        return t('nav_diary').toUpperCase();
    }
  };

  const getStreakLabel = () => {
    return `${streakDays} ${t('header_day_streak')}`;
  };

  const currentLangObj = supportedLanguages.find((l) => l.code === language) || supportedLanguages[0];

  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F9]/95 dark:bg-[#121314]/95 backdrop-blur-md border-b border-[#E5E5E5] dark:border-[#252628] px-3 sm:px-4 py-2.5 max-w-xl mx-auto w-full flex items-center justify-between transition-colors">
      {/* Brand & Section */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-md bg-[#242424] dark:bg-amber-400 text-white dark:text-black flex items-center justify-center font-bold text-xs shadow-xs">
          {activeTab === 'live' ? (
            <span className="text-sm">⚡</span>
          ) : activeTab === 'diary' || activeTab === 'today' ? (
            <span className="text-sm">⚡</span>
          ) : activeTab === 'workspace' ? (
            <span className="font-display font-bold text-xs">G</span>
          ) : (
            <span className="font-mono font-bold tracking-tighter text-[11px]">CP</span>
          )}
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-display font-bold text-lg tracking-tight text-[#1B1C1C] dark:text-white">
            CultPulse
          </span>
          <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-[#767676] dark:text-zinc-400 font-medium uppercase">
            {getSubTitle()}
          </span>
        </div>
      </div>

      {/* Action Controls & Utilities */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* Fitness Goal Quick Selector */}
        {onGoalClick && (
          <button
            onClick={onGoalClick}
            id="header-goal-badge"
            title={t('header_change_goal')}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#1B1C1C] dark:bg-[#252629] text-white text-[10px] font-mono font-bold hover:bg-black dark:hover:bg-[#333538] transition-colors border border-transparent dark:border-[#383a3d]"
          >
            <Target size={12} className="text-amber-400" />
            <span className="hidden sm:inline">{USER_GOALS[currentGoal]?.title?.split(' ')[0] || t('header_goal')}</span>
            <span className="sm:hidden">{t('header_goal')}</span>
          </button>
        )}

        {/* Theme Switcher: Default (Light) <-> Dark Mode */}
        <button
          onClick={toggleTheme}
          id="btn-toggle-theme"
          title={theme === 'dark' ? t('header_theme_default') : t('header_theme_dark')}
          aria-label={theme === 'dark' ? 'Switch to Default Theme' : 'Switch to Dark Theme'}
          className="p-1.5 rounded-full bg-white dark:bg-[#1E1F21] border border-[#E5E5E5] dark:border-[#2C2D30] text-[#4A4A4A] dark:text-zinc-200 hover:text-[#1B1C1C] dark:hover:text-white transition-colors"
        >
          {theme === 'dark' ? (
            <Sun size={15} className="text-amber-400" />
          ) : (
            <Moon size={15} className="text-[#4A4A4A]" />
          )}
        </button>

        {/* Language Selector Dropdown */}
        <div className="relative" ref={langMenuRef}>
          <button
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            id="btn-header-language"
            title={`${t('header_language')}: ${currentLangObj.name}`}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-white dark:bg-[#1E1F21] border border-[#E5E5E5] dark:border-[#2C2D30] text-[#1B1C1C] dark:text-zinc-200 text-[11px] font-mono font-medium hover:border-[#242424] dark:hover:border-zinc-500 transition-colors"
          >
            <Globe size={13} className="text-[#767676] dark:text-zinc-400" />
            <span className="uppercase">{language}</span>
          </button>

          {isLangMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-36 bg-white dark:bg-[#1C1D1F] border border-[#E5E5E5] dark:border-[#2C2D30] rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1 text-[10px] font-mono text-[#767676] dark:text-zinc-400 uppercase border-b border-[#F0F0F0] dark:border-[#2A2B2D]">
                {t('language_select')}
              </div>
              {supportedLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsLangMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                    language === lang.code
                      ? 'bg-[#F2F2F2] dark:bg-[#2A2B2E] text-[#1B1C1C] dark:text-amber-400 font-bold'
                      : 'text-[#4A4A4A] dark:text-zinc-300 hover:bg-[#FAFAFA] dark:hover:bg-[#222325]'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                  </span>
                  {language === lang.code && <span className="text-[10px]">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Help & Support Button */}
        {onSupportClick && (
          <button
            onClick={onSupportClick}
            title={t('header_support')}
            className="p-1.5 rounded-full bg-white dark:bg-[#1E1F21] border border-[#E5E5E5] dark:border-[#2C2D30] hover:border-[#242424] text-[#4A4A4A] dark:text-zinc-300 hover:text-[#1B1C1C] dark:hover:text-white transition-colors"
          >
            <LifeBuoy size={15} />
          </button>
        )}

        {/* Admin Live Activity Hub Button (Super Admin only) */}
        {isAdmin && onAdminHubClick && (
          <button
            onClick={onAdminHubClick}
            title={t('header_admin')}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-[10px] font-mono font-bold hover:bg-amber-100 transition-colors shadow-2xs"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span>ADMIN</span>
          </button>
        )}

        {/* 1M Scale Engine Monitor Pill */}
        <button
          onClick={onScaleMonitorClick}
          title={t('header_scale')}
          className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono font-medium hover:bg-emerald-100 transition-colors"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-bold">1M: 60FPS</span>
        </button>

        {/* Workspace Hub Button */}
        <button
          onClick={onWorkspaceClick}
          title={t('header_workspace')}
          className={`px-2 py-1 rounded-full border text-[11px] font-medium flex items-center gap-1.5 transition-colors ${
            activeTab === 'workspace'
              ? 'bg-[#242424] dark:bg-amber-400 border-[#242424] dark:border-amber-400 text-white dark:text-black font-bold'
              : 'bg-white dark:bg-[#1E1F21] border-[#E5E5E5] dark:border-[#2C2D30] text-[#242424] dark:text-zinc-200 hover:border-[#242424]'
          }`}
        >
          <span className="font-display font-bold text-[11px]">G</span>
          <span className="hidden sm:inline">Workspace</span>
          {isWorkspaceConnected && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          )}
        </button>

        {/* Streak Pill */}
        <div className="hidden sm:flex px-2 py-1 rounded-full bg-[#F2F2F2] dark:bg-[#1E1F21] border border-[#E5E5E5] dark:border-[#2C2D30] text-[10px] font-mono font-medium text-[#242424] dark:text-zinc-200 items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#242424] dark:bg-amber-400"></span>
          <span>{getStreakLabel()}</span>
        </div>

        {/* Avatar */}
        <button
          onClick={onAvatarClick}
          aria-label="Profile"
          className="relative w-8 h-8 rounded-full overflow-hidden border border-[#C4C7C7] dark:border-zinc-600 hover:border-[#242424] transition-colors focus:outline-hidden shrink-0"
        >
          <img
            src={avatarUrl}
            alt="Alex Rivera"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </button>
      </div>
    </header>
  );
};
