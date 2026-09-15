import React, { useState, useEffect } from 'react';
import {
  Users,
  Activity,
  Flame,
  Droplets,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Smartphone,
  ChevronRight,
  RefreshCw,
  Utensils,
  Dumbbell,
  LogIn,
  SlidersHorizontal,
  X,
  Radio,
  BarChart3,
} from 'lucide-react';
import {
  RegisteredUserSummary,
  UserActivityEvent,
  subscribeGlobalActivity,
  subscribeUserDirectory,
  toggleCommunityLiveSimulation,
  recordUserActivity,
} from '../services/scaleEngine';

interface AdminUserActivityHubProps {
  isOpen: boolean;
  onClose: () => void;
  adminEmail?: string | null;
  isAdmin?: boolean;
  onAuthenticateAdmin?: () => void;
}

export const AdminUserActivityHub: React.FC<AdminUserActivityHubProps> = ({
  isOpen,
  onClose,
  adminEmail,
  isAdmin = false,
  onAuthenticateAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'stream' | 'users'>('stream');
  const [activities, setActivities] = useState<UserActivityEvent[]>([]);
  const [users, setUsers] = useState<RegisteredUserSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activityFilter, setActivityFilter] = useState<'ALL' | 'FOOD' | 'WATER' | 'WORKOUT' | 'AUTH'>('ALL');
  const [isLivePulseActive, setIsLivePulseActive] = useState(true);
  const [selectedUser, setSelectedUser] = useState<RegisteredUserSummary | null>(null);

  useEffect(() => {
    if (!isOpen || !isAdmin) return;

    const unsubAct = subscribeGlobalActivity((acts) => setActivities(acts));
    const unsubUsers = subscribeUserDirectory((usrs) => setUsers(usrs));

    return () => {
      unsubAct();
      unsubUsers();
    };
  }, [isOpen, isAdmin]);

  if (!isOpen) return null;

  // Security Guard: If not Super Admin, show Access Denied
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="bg-white border border-[#E5E5E5] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
            <ShieldAlert size={26} />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-[#1B1C1C]">
              Access Restricted to Super Admin
            </h3>
            <p className="text-xs text-[#767676] mt-1 leading-relaxed">
              Global user telemetry, real-time activity feeds, and athlete directories are confidential.
              Access is strictly restricted to the application owner:
            </p>
            <div className="mt-2.5 px-3 py-1.5 bg-[#F2F2F2] rounded-lg border border-[#E5E5E5] text-xs font-mono font-semibold text-[#1B1C1C]">
              aryansharma009009@gmail.com
            </div>
          </div>

          <div className="pt-2 space-y-2">
            {onAuthenticateAdmin && (
              <button
                onClick={onAuthenticateAdmin}
                className="w-full py-2.5 px-4 bg-[#1E1E1E] hover:bg-black text-white text-xs font-display font-bold uppercase tracking-wider rounded-xl transition-colors shadow-xs"
              >
                Authenticate as Super Admin
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-white hover:bg-[#F2F2F2] border border-[#E5E5E5] text-[#242424] text-xs font-medium rounded-xl transition-colors"
            >
              Back to App
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleTogglePulse = () => {
    const next = !isLivePulseActive;
    setIsLivePulseActive(next);
    toggleCommunityLiveSimulation(next);
  };

  const filteredActivities = activities.filter((act) => {
    if (activityFilter === 'FOOD' && act.actionType !== 'FOOD_LOG') return false;
    if (activityFilter === 'WATER' && act.actionType !== 'WATER_LOG') return false;
    if (activityFilter === 'WORKOUT' && act.actionType !== 'WORKOUT_START' && act.actionType !== 'WORKOUT_COMPLETE') return false;
    if (activityFilter === 'AUTH' && act.actionType !== 'SIGN_IN') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        act.userName.toLowerCase().includes(q) ||
        (act.userEmail && act.userEmail.toLowerCase().includes(q)) ||
        act.title.toLowerCase().includes(q) ||
        act.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || (u.email && u.email.toLowerCase().includes(q));
  });

  const totalCalories = users.reduce((sum, u) => sum + (u.caloriesLoggedToday || 0), 0);
  const totalWater = users.reduce((sum, u) => sum + (u.waterLoggedToday || 0), 0);
  const onlineCount = users.filter((u) => u.status === 'online').length;

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 10) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'FOOD_LOG':
        return <Utensils size={14} className="text-amber-600" />;
      case 'WATER_LOG':
        return <Droplets size={14} className="text-blue-500" />;
      case 'WORKOUT_COMPLETE':
      case 'WORKOUT_START':
        return <Dumbbell size={14} className="text-emerald-600" />;
      case 'SIGN_IN':
        return <LogIn size={14} className="text-purple-600" />;
      default:
        return <Activity size={14} className="text-[#767676]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E5E5E5] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-4 border-b border-[#E5E5E5] bg-[#1E1E1E] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-black flex items-center justify-center font-bold shadow-md">
              <Users size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-sm tracking-wide text-white">
                  Admin User Telemetry & Live Activity Hub
                </h3>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold rounded-xs">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Live monitoring for all athlete sign-ins, workouts, meals & hydration
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition-colors"
          >
            ×
          </button>
        </div>

        {/* Global KPI Metrics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-[#E5E5E5] bg-[#FBF9F9] text-xs">
          <div className="p-3 border-r border-[#E5E5E5]">
            <div className="text-[10px] font-mono text-[#767676] flex items-center gap-1">
              <Users size={12} className="text-zinc-700" />
              REGISTERED USERS
            </div>
            <div className="text-lg font-mono font-bold text-[#1B1C1C] mt-0.5">
              {users.length}{' '}
              <span className="text-[10px] text-emerald-600 font-normal">
                ({onlineCount} online)
              </span>
            </div>
          </div>

          <div className="p-3 border-r border-[#E5E5E5]">
            <div className="text-[10px] font-mono text-[#767676] flex items-center gap-1">
              <Activity size={12} className="text-emerald-600" />
              TOTAL ACTIONS LOGGED
            </div>
            <div className="text-lg font-mono font-bold text-[#1B1C1C] mt-0.5">
              {activities.length} <span className="text-[10px] text-[#767676]">events</span>
            </div>
          </div>

          <div className="p-3 border-r border-[#E5E5E5]">
            <div className="text-[10px] font-mono text-[#767676] flex items-center gap-1">
              <Flame size={12} className="text-orange-600" />
              COLLECTIVE CALORIES
            </div>
            <div className="text-lg font-mono font-bold text-[#1B1C1C] mt-0.5">
              {totalCalories.toLocaleString()} <span className="text-[10px] text-[#767676]">kcal</span>
            </div>
          </div>

          <div className="p-3">
            <div className="text-[10px] font-mono text-[#767676] flex items-center gap-1">
              <Droplets size={12} className="text-blue-600" />
              HYDRATION TOTAL
            </div>
            <div className="text-lg font-mono font-bold text-[#1B1C1C] mt-0.5">
              {(totalWater / 1000).toFixed(1)} <span className="text-[10px] text-[#767676]">Liters</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs & Controls */}
        <div className="px-4 py-2.5 bg-white border-b border-[#E5E5E5] flex flex-wrap items-center justify-between gap-2">
          {/* Tab Selector */}
          <div className="flex items-center gap-1 p-0.5 bg-[#F2F2F2] rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveTab('stream')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                activeTab === 'stream'
                  ? 'bg-white text-[#1B1C1C] shadow-2xs font-semibold'
                  : 'text-[#767676] hover:text-[#1B1C1C]'
              }`}
            >
              <Radio size={13} className={activeTab === 'stream' ? 'text-amber-600 animate-pulse' : ''} />
              <span>Live Action Stream</span>
              <span className="px-1.5 py-0.2 bg-[#E5E5E5] text-[10px] font-mono rounded-full">
                {activities.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                activeTab === 'users'
                  ? 'bg-white text-[#1B1C1C] shadow-2xs font-semibold'
                  : 'text-[#767676] hover:text-[#1B1C1C]'
              }`}
            >
              <Users size={13} />
              <span>All Users & Telemetry</span>
              <span className="px-1.5 py-0.2 bg-[#E5E5E5] text-[10px] font-mono rounded-full">
                {users.length}
              </span>
            </button>
          </div>

          {/* Live Pulse Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleTogglePulse}
              title="Toggle automatic simulated pulse for background active athletes"
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono flex items-center gap-1.5 border transition-colors ${
                isLivePulseActive
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-zinc-100 border-zinc-300 text-zinc-600'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isLivePulseActive ? 'bg-emerald-500 animate-ping' : 'bg-zinc-400'
                }`}
              ></span>
              <span>Live Pulse: {isLivePulseActive ? 'ACTIVE' : 'PAUSED'}</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="px-4 py-2 bg-[#FBF9F9] border-b border-[#E5E5E5] flex flex-wrap items-center justify-between gap-2">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#767676]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'stream' ? 'Search actions or users...' : 'Search by name or email...'}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E5E5E5] rounded-lg text-xs placeholder-[#767676] focus:outline-hidden focus:border-[#242424]"
            />
          </div>

          {/* Filters for Stream */}
          {activeTab === 'stream' && (
            <div className="flex items-center gap-1 text-[11px]">
              {(['ALL', 'FOOD', 'WATER', 'WORKOUT', 'AUTH'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActivityFilter(filter)}
                  className={`px-2 py-1 rounded border text-[10px] font-mono uppercase transition-colors ${
                    activityFilter === filter
                      ? 'bg-[#242424] text-white border-[#242424]'
                      : 'bg-white text-[#767676] border-[#E5E5E5] hover:border-[#242424]'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[350px]">
          {activeTab === 'stream' ? (
            /* Live Action Stream View */
            <div className="space-y-2">
              {filteredActivities.length === 0 ? (
                <div className="text-center py-12 text-[#767676] space-y-2">
                  <Activity size={32} className="mx-auto text-zinc-300" />
                  <p className="text-xs">No matching user activities found.</p>
                </div>
              ) : (
                filteredActivities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 bg-white hover:bg-[#FBF9F9] border border-[#E5E5E5] rounded-xl flex items-start justify-between gap-3 transition-colors group shadow-2xs"
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Avatar */}
                      <div className="relative">
                        <img
                          src={act.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80'}
                          alt={act.userName}
                          className="w-8 h-8 rounded-full object-cover border border-[#E5E5E5]"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-white border border-[#E5E5E5]">
                          {getActionIcon(act.actionType)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-xs text-[#1B1C1C]">
                            {act.userName}
                          </span>
                          {act.userEmail === 'aryansharma009009@gmail.com' && (
                            <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[9px] font-mono font-bold rounded-xs">
                              OWNER
                            </span>
                          )}
                          <span className="text-[11px] text-[#767676]">• {act.title}</span>
                        </div>

                        <p className="text-xs text-[#242424]">{act.description}</p>

                        {/* Badges / Metrics */}
                        <div className="flex items-center gap-2 pt-1 text-[10px] font-mono text-[#767676]">
                          {act.metrics?.calories && (
                            <span className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">
                              +{act.metrics.calories} kcal
                            </span>
                          )}
                          {act.metrics?.waterMl && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              +{act.metrics.waterMl} ml
                            </span>
                          )}
                          {act.metrics?.burnKcal && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              🔥 -{act.metrics.burnKcal} kcal
                            </span>
                          )}
                          {act.deviceInfo && (
                            <span className="hidden sm:inline text-zinc-400">
                              {act.deviceInfo}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-mono text-[#767676]">
                        {formatTimeAgo(act.timestamp)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Users Directory View */
            <div className="space-y-2">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-[#767676]">
                  <Users size={32} className="mx-auto text-zinc-300" />
                  <p className="text-xs mt-2">No users matching search.</p>
                </div>
              ) : (
                filteredUsers.map((usr) => (
                  <div
                    key={usr.userId}
                    onClick={() => setSelectedUser(usr)}
                    className="p-3 bg-white hover:bg-[#FBF9F9] border border-[#E5E5E5] hover:border-[#242424] rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all shadow-2xs group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={usr.avatarUrl}
                          alt={usr.name}
                          className="w-10 h-10 rounded-full object-cover border border-[#E5E5E5]"
                          referrerPolicy="no-referrer"
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                            usr.status === 'online'
                              ? 'bg-emerald-500'
                              : usr.status === 'idle'
                              ? 'bg-amber-400'
                              : 'bg-zinc-400'
                          }`}
                        ></span>
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-[#1B1C1C] group-hover:text-black">
                            {usr.name}
                          </span>
                          {usr.role === 'admin' ? (
                            <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[9px] font-mono font-bold rounded-xs">
                              ADMIN
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 bg-zinc-100 text-zinc-700 text-[9px] font-mono rounded-xs">
                              {usr.role.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#767676]">
                          {usr.email || 'Anonymous Guest Session'}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400">
                          {usr.device}
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex items-center gap-3 text-right">
                      <div className="hidden sm:block text-xs">
                        <div className="font-mono font-bold text-[#1B1C1C]">
                          {usr.caloriesLoggedToday} / {usr.dailyCalorieGoal} kcal
                        </div>
                        <div className="text-[10px] text-[#767676] font-mono">
                          💧 {usr.waterLoggedToday} ml • 🔥 {usr.activeBurnToday} kcal
                        </div>
                      </div>

                      <div className="p-1.5 rounded-lg bg-zinc-100 group-hover:bg-[#242424] group-hover:text-white transition-colors">
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* User Dossier Drilldown Modal */}
        {selectedUser && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white border border-[#E5E5E5] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl space-y-4 p-5 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src={selectedUser.avatarUrl}
                    alt={selectedUser.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#E5E5E5]"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-[#1B1C1C] flex items-center gap-1.5">
                      {selectedUser.name}
                      {selectedUser.role === 'admin' && (
                        <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[9px] font-mono font-bold rounded-xs">
                          ADMIN
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-[#767676]">{selectedUser.email || 'Guest User'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-[#1B1C1C] flex items-center justify-center text-sm font-bold transition-colors"
                >
                  ×
                </button>
              </div>

              {/* User Telemetry Overview */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-[#FBF9F9] border border-[#E5E5E5]">
                  <div className="text-[10px] font-mono text-[#767676]">CALORIES</div>
                  <div className="font-mono font-bold text-sm text-[#1B1C1C] mt-0.5">
                    {selectedUser.caloriesLoggedToday}
                  </div>
                  <div className="text-[9px] text-[#767676]">Goal: {selectedUser.dailyCalorieGoal}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#FBF9F9] border border-[#E5E5E5]">
                  <div className="text-[10px] font-mono text-[#767676]">WATER</div>
                  <div className="font-mono font-bold text-sm text-blue-700 mt-0.5">
                    {selectedUser.waterLoggedToday} ml
                  </div>
                  <div className="text-[9px] text-[#767676]">Tracked</div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#FBF9F9] border border-[#E5E5E5]">
                  <div className="text-[10px] font-mono text-[#767676]">BURN</div>
                  <div className="font-mono font-bold text-sm text-orange-600 mt-0.5">
                    {selectedUser.activeBurnToday} kcal
                  </div>
                  <div className="text-[9px] text-[#767676]">Active</div>
                </div>
              </div>

              {/* Metadata Details */}
              <div className="p-3 bg-[#FBF9F9] border border-[#E5E5E5] rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between text-[#767676]">
                  <span>User UID:</span>
                  <span className="font-mono text-[#1B1C1C] font-semibold">
                    {selectedUser.userId}
                  </span>
                </div>
                <div className="flex justify-between text-[#767676]">
                  <span>Active Device:</span>
                  <span className="font-mono text-[#1B1C1C]">{selectedUser.device}</span>
                </div>
                <div className="flex justify-between text-[#767676]">
                  <span>Streak Days:</span>
                  <span className="font-mono text-[#1B1C1C] font-semibold">
                    {selectedUser.streakDays} Days Active
                  </span>
                </div>
                <div className="flex justify-between text-[#767676]">
                  <span>Workouts Completed:</span>
                  <span className="font-mono text-[#1B1C1C] font-semibold">
                    {selectedUser.workoutsCompleted} Sessions
                  </span>
                </div>
                <div className="flex justify-between text-[#767676]">
                  <span>Last Action:</span>
                  <span className="font-mono text-emerald-700 font-semibold">
                    {formatTimeAgo(selectedUser.lastActive)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="w-full py-2 bg-[#242424] hover:bg-black text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 border-t border-[#E5E5E5] bg-[#FBF9F9] flex items-center justify-between text-[11px] text-[#767676]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>
              Connected as Super Admin: <strong>{adminEmail || 'aryansharma009009@gmail.com'}</strong>
            </span>
          </div>
          <button
            onClick={onClose}
            className="py-1.5 px-3 bg-[#242424] hover:bg-black text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
