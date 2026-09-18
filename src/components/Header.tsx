import React, { useState, useRef, useEffect } from 'react';
import {
  LifeBuoy,
  Target,
  Sun,
  Moon,
  Globe,
  MoreVertical,
  Check,
  Flame,
  FolderGit2,
  ChevronRight,
  X,
} from 'lucide-react';
import { NavTab, UserGoal, DietaryPreference } from '../types';
import { USER_GOALS } from '../data/goalConfigs';
import { useAppSettings } from '../services/appSettingsContext';
import { getActiveUserGender, setActiveUserGender } from '../services/googleAuth';

interface HeaderProps {
  activeTab: NavTab;
  streakDays?: number;
  avatarUrl?: string;
  userEmail?: string | null;
  userDisplayName?: string | null;
  dietaryPreference?: DietaryPreference;
  onAvatarClick?: () => void;
  onWorkspaceClick?: () => void;
  onScaleMonitorClick?: () => void;
  onAdminHubClick?: () => void;
  onSupportClick?: () => void;
  onGoalClick?: () => void;
  onDietClick?: () => void;
  onAuthClick?: () => void;
  currentGoal?: UserGoal;
  isWorkspaceConnected?: boolean;
  isAdmin?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  streakDays = 7,
  avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
  userEmail,
  userDisplayName,
  dietaryPreference = 'veg',
  onAvatarClick,
  onWorkspaceClick,
  onScaleMonitorClick,
  onAdminHubClick,
  onSupportClick,
  onGoalClick,
  onDietClick,
  onAuthClick,
  currentGoal = 'muscle_building',
  isWorkspaceConnected = false,
  isAdmin = false,
}) => {
  const { theme, toggleTheme, language, setLanguage, supportedLanguages, t } = useAppSettings();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentGender, setCurrentGender] = useState<'male' | 'female'>(() => getActiveUserGender());
  const langMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Sync gender on storage or custom event
  useEffect(() => {
    const handleGenderUpdate = () => {
      setCurrentGender(getActiveUserGender());
    };
    window.addEventListener('storage', handleGenderUpdate);
    window.addEventListener('cultpulse_gender_changed', handleGenderUpdate);
    return () => {
      window.removeEventListener('storage', handleGenderUpdate);
      window.removeEventListener('cultpulse_gender_changed', handleGenderUpdate);
    };
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
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

  const handleToggleGender = () => {
    const nextGender = currentGender === 'male' ? 'female' : 'male';
    setActiveUserGender(nextGender);
    setCurrentGender(nextGender);
    window.dispatchEvent(new Event('cultpulse_gender_changed'));
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F9]/95 dark:bg-[#121314]/95 backdrop-blur-md border-b border-[#E5E5E5] dark:border-[#252628] px-3 sm:px-6 safe-header-top max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto w-full max-w-full flex items-center justify-between transition-colors">
      {/* Brand & Section Indicator */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#242424] dark:bg-amber-400 text-white dark:text-black flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
          {activeTab === 'live' ? (
            <span className="text-xs sm:text-sm">⚡</span>
          ) : activeTab === 'diary' || activeTab === 'today' ? (
            <span className="text-xs sm:text-sm">⚡</span>
          ) : activeTab === 'workspace' ? (
            <span className="font-display font-bold text-xs">G</span>
          ) : (
            <span className="font-mono font-bold tracking-tighter text-[10px] sm:text-[11px]">CP</span>
          )}
        </div>
        <div className="flex items-baseline gap-1 sm:gap-1.5 min-w-0">
          <span className="font-display font-bold text-base sm:text-lg tracking-tight text-[#1B1C1C] dark:text-white truncate">
            CultPulse
          </span>
          <span className="hidden md:inline text-[9px] sm:text-[11px] font-mono tracking-widest text-[#767676] dark:text-zinc-400 font-medium uppercase truncate">
            {getSubTitle()}
          </span>
        </div>
      </div>

      {/* Action Controls & Utilities */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink min-w-0">
        {/* Dietary Preference Quick Selector (Icon only on mobile, text on desktop) */}
        {onDietClick && (
          <button
            onClick={onDietClick}
            id="header-diet-badge"
            title="Change Dietary Lifestyle (Veg / Eggetarian / Non-Veg)"
            className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-[10px] font-mono font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors shadow-2xs shrink-0"
          >
            <span className="text-xs leading-none">
              {dietaryPreference === 'veg' ? '🥦' : dietaryPreference === 'eggetarian' ? '🥚' : '🍗'}
            </span>
            <span className="hidden sm:inline">
              {dietaryPreference === 'veg' ? 'VEG' : dietaryPreference === 'eggetarian' ? 'EGG' : 'NON-VEG'}
            </span>
          </button>
        )}

        {/* Athlete Gender Demonstrator Quick Selector */}
        <button
          onClick={handleToggleGender}
          id="header-gender-badge"
          title={`Active Demonstrator: ${currentGender === 'male' ? 'Coach Marcus (Male)' : 'Coach Maya (Female)'}. Click to switch.`}
          className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300 text-[10px] font-mono font-bold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors shadow-2xs shrink-0"
        >
          <span className="text-xs leading-none">{currentGender === 'female' ? '👩' : '👨'}</span>
          <span className="hidden sm:inline">
            {currentGender === 'female' ? 'FEMALE' : 'MALE'}
          </span>
        </button>

        {/* DESKTOP/TABLET ONLY CONTROLS (sm:flex) */}
        {/* Fitness Goal Quick Selector */}
        {onGoalClick && (
          <button
            onClick={onGoalClick}
            id="header-goal-badge"
            title={t('header_change_goal')}
            className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-[#1B1C1C] dark:bg-[#252629] text-white text-[10px] font-mono font-bold hover:bg-black dark:hover:bg-[#333538] transition-colors border border-transparent dark:border-[#383a3d]"
          >
            <Target size={12} className="text-amber-400" />
            <span>{USER_GOALS[currentGoal]?.title?.split(' ')[0] || t('header_goal')}</span>
          </button>
        )}

        {/* Theme Switcher: Default (Light) <-> Dark Mode (Available on all screens) */}
        <button
          onClick={toggleTheme}
          id="btn-toggle-theme"
          title={theme === 'dark' ? t('header_theme_default') : t('header_theme_dark')}
          aria-label={theme === 'dark' ? 'Switch to Default Theme' : 'Switch to Dark Theme'}
          className="p-2 sm:p-1.5 rounded-full bg-white dark:bg-[#1E1F21] border border-[#E5E5E5] dark:border-[#2C2D30] text-[#4A4A4A] dark:text-zinc-200 hover:text-[#1B1C1C] dark:hover:text-white transition-colors shrink-0 min-w-[32px] min-h-[32px] flex items-center justify-center cursor-pointer active:scale-95"
        >
          {theme === 'dark' ? (
            <Sun size={14} className="text-amber-400" />
          ) : (
            <Moon size={14} className="text-[#4A4A4A]" />
          )}
        </button>

        {/* Language Selector Dropdown (Desktop / Tablet) */}
        <div className="relative hidden sm:block" ref={langMenuRef}>
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

        {/* Help & Support Button (Desktop / Tablet) */}
        {onSupportClick && (
          <button
            onClick={onSupportClick}
            title={t('header_support')}
            className="hidden sm:flex p-1.5 rounded-full bg-white dark:bg-[#1E1F21] border border-[#E5E5E5] dark:border-[#2C2D30] hover:border-[#242424] text-[#4A4A4A] dark:text-zinc-300 hover:text-[#1B1C1C] dark:hover:text-white transition-colors"
          >
            <LifeBuoy size={14} />
          </button>
        )}

        {/* Workspace Hub Button (Desktop / Tablet) */}
        <button
          onClick={onWorkspaceClick}
          title={t('header_workspace')}
          className={`hidden sm:flex px-2 py-1 rounded-full border text-[11px] font-medium items-center gap-1.5 transition-colors ${
            activeTab === 'workspace'
              ? 'bg-[#242424] dark:bg-amber-400 border-[#242424] dark:border-amber-400 text-white dark:text-black font-bold'
              : 'bg-white dark:bg-[#1E1F21] border-[#E5E5E5] dark:border-[#2C2D30] text-[#242424] dark:text-zinc-200 hover:border-[#242424]'
          }`}
        >
          <span className="font-display font-bold text-[11px]">G</span>
          <span>Workspace</span>
          {isWorkspaceConnected && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          )}
        </button>

        {/* Streak Pill (Large Screen only) */}
        <div className="hidden md:flex px-2 py-1 rounded-full bg-[#F2F2F2] dark:bg-[#1E1F21] border border-[#E5E5E5] dark:border-[#2C2D30] text-[10px] font-mono font-medium text-[#242424] dark:text-zinc-200 items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#242424] dark:bg-amber-400"></span>
          <span>{getStreakLabel()}</span>
        </div>

        {/* MOBILE UTILITIES MENU TOGGLE (sm:hidden) */}
        <div className="relative sm:hidden" ref={mobileMenuRef}>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            id="btn-mobile-utilities-menu"
            title="More Options & Settings"
            aria-label="More Options & Settings"
            className="p-1.5 rounded-full bg-white dark:bg-[#1E1F21] border border-[#E5E5E5] dark:border-[#2C2D30] text-[#4A4A4A] dark:text-zinc-200 hover:text-[#1B1C1C] dark:hover:text-white transition-colors relative"
          >
            <MoreVertical size={14} />
            {isWorkspaceConnected && (
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#121314]"></span>
            )}
          </button>

          {/* Mobile Popover Drawer */}
          {isMobileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1C1D1F] border border-[#E5E5E5] dark:border-[#2C2D30] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
              <div className="px-2.5 py-1.5 border-b border-[#F0F0F0] dark:border-[#2A2B2D] flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#767676] dark:text-zinc-400 uppercase font-semibold">
                  Quick Utilities
                </span>
                <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
                  <Flame size={11} fill="currentColor" />
                  <span>{streakDays}d Streak</span>
                </span>
              </div>

              {/* Goal Selector Item */}
              {onGoalClick && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onGoalClick();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between text-[#1B1C1C] dark:text-zinc-200 hover:bg-[#F5F5F5] dark:hover:bg-[#252629] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Target size={14} className="text-amber-500" />
                    <span>Goal: <strong>{USER_GOALS[currentGoal]?.title?.split(' ')[0] || 'Fitness'}</strong></span>
                  </div>
                  <ChevronRight size={13} className="text-zinc-400" />
                </button>
              )}

              {/* Workspace Hub Item */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onWorkspaceClick?.();
                }}
                className="w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between text-[#1B1C1C] dark:text-zinc-200 hover:bg-[#F5F5F5] dark:hover:bg-[#252629] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#242424] dark:bg-zinc-700 text-white flex items-center justify-center font-bold text-[9px]">
                    G
                  </div>
                  <span>Google Workspace</span>
                </div>
                {isWorkspaceConnected ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                ) : (
                  <ChevronRight size={13} className="text-zinc-400" />
                )}
              </button>

              {/* Language Selection Quick Submenu */}
              <div className="px-2.5 py-1.5 border-t border-b border-[#F0F0F0] dark:border-[#2A2B2D] space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#767676] dark:text-zinc-400 uppercase">
                  <Globe size={11} />
                  <span>Language ({language.toUpperCase()})</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {supportedLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition-colors ${
                        language === lang.code
                          ? 'bg-[#1B1C1C] dark:bg-amber-400 text-white dark:text-black font-bold'
                          : 'bg-[#F2F2F2] dark:bg-[#252629] text-[#555] dark:text-zinc-300'
                      }`}
                    >
                      {lang.code.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Support & Biomechanics Help */}
              {onSupportClick && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onSupportClick();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between text-[#1B1C1C] dark:text-zinc-200 hover:bg-[#F5F5F5] dark:hover:bg-[#252629] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <LifeBuoy size={14} className="text-blue-500" />
                    <span>Help & Biomechanics Desk</span>
                  </div>
                  <ChevronRight size={13} className="text-zinc-400" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Avatar or Sign In button */}
        {!userEmail ? (
          <button
            onClick={onAuthClick}
            id="btn-header-signin"
            className="px-3 sm:px-3.5 py-1.5 rounded-full bg-[#242424] hover:bg-black dark:bg-amber-400 dark:hover:bg-amber-500 text-white dark:text-black font-semibold text-[11px] sm:text-xs transition-all shadow-xs shrink-0 cursor-pointer active:scale-95 min-h-[32px] flex items-center justify-center"
          >
            Sign In
          </button>
        ) : (
          <button
            onClick={onAvatarClick}
            aria-label="Profile"
            title={`Logged in as ${userDisplayName || userEmail}`}
            className="relative w-8 h-8 rounded-full overflow-hidden border border-[#C4C7C7] dark:border-zinc-600 hover:border-[#242424] transition-colors focus:outline-hidden shrink-0 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 cursor-pointer active:scale-95"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={userDisplayName || 'Athlete'}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="font-bold text-xs text-[#1B1C1C] dark:text-white">
                {(userDisplayName || userEmail || 'A')[0].toUpperCase()}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
};

