import React from 'react';
import { NavTab } from '../types';

interface HeaderProps {
  activeTab: NavTab;
  streakDays?: number;
  avatarUrl?: string;
  onAvatarClick?: () => void;
  onWorkspaceClick?: () => void;
  isWorkspaceConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  streakDays = 7,
  avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
  onAvatarClick,
  onWorkspaceClick,
  isWorkspaceConnected = false,
}) => {
  const getSubTitle = () => {
    switch (activeTab) {
      case 'diary':
      case 'today':
        return 'DIARY';
      case 'workouts':
        return 'ARCHIVE';
      case 'live':
        return 'LIVE SESSION';
      case 'progress':
        return 'ANALYTICS';
      case 'workspace':
        return 'WORKSPACE';
      default:
        return 'DIARY';
    }
  };

  const getStreakLabel = () => {
    if (activeTab === 'diary' || activeTab === 'today') return `• ${streakDays} DAYS STREAK`;
    if (activeTab === 'workouts') return `• ${streakDays} STREAK`;
    if (activeTab === 'live') return `${streakDays} DAYS`;
    return `• ${streakDays} Days`;
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F9]/95 backdrop-blur-md border-b border-[#E5E5E5] px-4 py-3 max-w-xl mx-auto w-full flex items-center justify-between">
      {/* Brand & Section */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-md bg-[#242424] text-white flex items-center justify-center font-bold text-xs shadow-xs">
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
          <span className="font-display font-bold text-lg tracking-tight text-[#1B1C1C]">
            CultPulse
          </span>
          <span className="text-[11px] font-mono tracking-widest text-[#767676] font-medium uppercase">
            {getSubTitle()}
          </span>
        </div>
      </div>

      {/* Streak Badge, Workspace Button & Avatar */}
      <div className="flex items-center gap-2">
        <button
          onClick={onWorkspaceClick}
          title="Google Workspace (Drive, Sheets, Calendar, Contacts, Gmail)"
          className={`px-2 py-1 rounded-full border text-[11px] font-medium flex items-center gap-1.5 transition-colors shadow-2xs ${
            activeTab === 'workspace'
              ? 'bg-[#242424] border-[#242424] text-white'
              : 'bg-white border-[#E5E5E5] text-[#242424] hover:border-[#242424]'
          }`}
        >
          <span className="font-display font-bold text-[11px]">G</span>
          <span className="hidden sm:inline">Workspace</span>
          {isWorkspaceConnected && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          )}
        </button>

        <div className="px-2 py-1 rounded-full bg-[#F2F2F2] border border-[#E5E5E5] text-[11px] font-medium text-[#242424] flex items-center gap-1 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#242424]"></span>
          <span>{getStreakLabel()}</span>
        </div>

        <button
          onClick={onAvatarClick}
          aria-label="Profile"
          className="relative w-8 h-8 rounded-full overflow-hidden border border-[#C4C7C7] hover:border-[#242424] transition-colors focus:outline-hidden shrink-0"
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
