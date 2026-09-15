import React, { useState } from 'react';
import {
  Settings,
  Clock,
  Dumbbell,
  Zap,
  Scale,
  Watch,
  Shield,
  Droplet,
  CheckCircle2,
  Share2,
  Check,
  CheckCircle,
  LifeBuoy,
} from 'lucide-react';
import { AnalyticsData } from '../types';

interface ProgressViewProps {
  data: AnalyticsData;
  onOpenShareReport: () => void;
  onOpenSettings?: () => void;
  onOpenWorkspace?: () => void;
  onOpenAdminHub?: () => void;
  onOpenSupport?: () => void;
  isAdmin?: boolean;
  onAdminLoginToggle?: () => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  data,
  onOpenShareReport,
  onOpenSettings,
  onOpenWorkspace,
  onOpenAdminHub,
  onOpenSupport,
  isAdmin = false,
  onAdminLoginToggle,
}) => {
  const [activeHoverWeek, setActiveHoverWeek] = useState<number | null>(null);

  // Chart coordinates calculation for 4 weeks
  // We have 4 data points for Weight: 72.0 -> 70.8 -> 69.5 -> 68.4
  // Min weight 67, Max weight 73
  // Chart width = 320, height = 130
  const points = [
    { x: 40, y: 32, label: '72.0kg', wk: 'Wk 1', barHeight: 48 },
    { x: 120, y: 55, label: '70.8kg', wk: 'Wk 2', barHeight: 65 },
    { x: 200, y: 78, label: '69.5kg', wk: 'Wk 3', barHeight: 60 },
    { x: 280, y: 98, label: '68.4kg', wk: 'Wk 4', barHeight: 74 },
  ];

  const pathD = `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y} L ${points[2].x} ${points[2].y} L ${points[3].x} ${points[3].y}`;

  return (
    <div className="space-y-4 pb-28">
      {/* Title & Live Status */}
      <div className="pt-2 px-1 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-2xl md:text-3xl text-[#1B1C1C] dark:text-neutral-100 tracking-tight">
              Performance
            </h1>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F2F2F2] dark:bg-neutral-800 text-[10px] font-mono font-semibold text-[#242424] dark:text-neutral-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>LIVE</span>
            </div>
          </div>
          <p className="text-xs text-[#767676] dark:text-neutral-400 mt-0.5">
            Continuous telemetry & weekly adherence
          </p>
        </div>
      </div>

      {/* Athlete Card */}
      <div className="bg-white dark:bg-[#1C1C1E] border border-[#E5E5E5] dark:border-neutral-800 rounded-xl p-4 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={data.athlete.avatarUrl}
            alt={data.athlete.name}
            className="w-12 h-12 rounded-lg object-cover border border-[#E5E5E5] dark:border-neutral-700"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-base text-[#1B1C1C] dark:text-neutral-100">
                {data.athlete.name}
              </span>
              <span className="px-1.5 py-0.2 bg-[#F2F2F2] dark:bg-neutral-800 border border-[#E5E5E5] dark:border-neutral-700 text-[10px] font-mono font-semibold text-[#242424] dark:text-neutral-300 rounded-xs">
                {data.athlete.level}
              </span>
            </div>
            <div className="text-xs text-[#767676] dark:text-neutral-400">
              {data.athlete.streakDays}-Day Streak Active
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Admin Hub: Strictly visible ONLY to authorized Super Admin */}
          {isAdmin && onOpenAdminHub && (
            <button
              onClick={onOpenAdminHub}
              title="Super Admin: User Telemetry & Live Activity (Secured Console)"
              className="px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-[11px] font-mono font-bold hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span>ADMIN HUB</span>
            </button>
          )}

          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            className="p-2 rounded-lg border border-[#E5E5E5] dark:border-neutral-700 hover:border-[#242424] dark:hover:border-neutral-400 text-[#4A4A4A] dark:text-neutral-300 transition-colors"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Week 32 Rhythm Card */}
      <div className="bg-white dark:bg-[#1C1C1E] border border-[#E5E5E5] dark:border-neutral-800 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-[11px] font-semibold tracking-wider text-[#767676] dark:text-neutral-400 uppercase">
            WEEK 32 RHYTHM
          </span>
          <span className="font-medium text-emerald-600 dark:text-emerald-400 text-xs">100% Target Met</span>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {data.weekRhythm.map((item, index) => {
            const isToday = index === 6; // Sunday
            return (
              <div
                key={item.day}
                className={`py-2 px-1 rounded-md border text-center flex flex-col items-center justify-center transition-colors ${
                  isToday
                    ? 'bg-[#242424] dark:bg-white border-[#242424] dark:border-white text-white dark:text-neutral-900'
                    : 'bg-[#FBF9F9] dark:bg-neutral-900/60 border-[#E5E5E5] dark:border-neutral-800 text-[#1B1C1C] dark:text-neutral-200'
                }`}
              >
                <span className="text-[11px] font-medium font-mono mb-1">{item.day}</span>
                <Check
                  size={13}
                  strokeWidth={2.6}
                  className={isToday ? 'text-white dark:text-neutral-900' : 'text-[#4A4A4A] dark:text-neutral-400'}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Lifetime Benchmarks (4 grid stats) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-mono text-[11px] font-semibold tracking-wider text-[#767676] dark:text-neutral-400 uppercase">
            LIFETIME BENCHMARKS
          </span>
          <span className="text-xs text-[#767676] dark:text-neutral-400">All-time</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Training */}
          <div className="bg-white dark:bg-[#1C1C1E] border border-[#E5E5E5] dark:border-neutral-800 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-[#767676] dark:text-neutral-400 mb-1">
              <span className="font-mono text-[10px] uppercase">TRAINING</span>
              <Clock size={14} />
            </div>
            <div className="font-display font-bold text-2xl text-[#1B1C1C] dark:text-neutral-100">
              {data.lifetime.trainingHours}{' '}
              <span className="text-xs font-normal text-[#767676] dark:text-neutral-400">hrs</span>
            </div>
            <div className="text-[11px] text-[#767676] dark:text-neutral-400 mt-1">
              +{data.lifetime.trainingHoursDelta} hrs this week
            </div>
          </div>

          {/* Completed */}
          <div className="bg-white dark:bg-[#1C1C1E] border border-[#E5E5E5] dark:border-neutral-800 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-[#767676] dark:text-neutral-400 mb-1">
              <span className="font-mono text-[10px] uppercase">COMPLETED</span>
              <Dumbbell size={14} />
            </div>
            <div className="font-display font-bold text-2xl text-[#1B1C1C] dark:text-neutral-100">
              {data.lifetime.completedSessions}{' '}
              <span className="text-xs font-normal text-[#767676] dark:text-neutral-400">sessions</span>
            </div>
            <div className="text-[11px] text-[#767676] dark:text-neutral-400 mt-1">
              {data.lifetime.adherence}% adherence
            </div>
          </div>

          {/* Total Output */}
          <div className="bg-white dark:bg-[#1C1C1E] border border-[#E5E5E5] dark:border-neutral-800 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-[#767676] dark:text-neutral-400 mb-1">
              <span className="font-mono text-[10px] uppercase">TOTAL OUTPUT</span>
              <Zap size={14} />
            </div>
            <div className="font-display font-bold text-2xl text-[#1B1C1C] dark:text-neutral-100">
              {data.lifetime.totalOutputKcal.toLocaleString()}{' '}
              <span className="text-xs font-normal text-[#767676] dark:text-neutral-400">kcal</span>
            </div>
            <div className="text-[11px] text-[#767676] dark:text-neutral-400 mt-1">Mifflin-St Jeor</div>
          </div>

          {/* Current Weight */}
          <div className="bg-white dark:bg-[#1C1C1E] border border-[#E5E5E5] dark:border-neutral-800 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-[#767676] dark:text-neutral-400 mb-1">
              <span className="font-mono text-[10px] uppercase">CURRENT WEIGHT</span>
              <Scale size={14} />
            </div>
            <div className="font-display font-bold text-2xl text-[#1B1C1C] dark:text-neutral-100">
              {data.lifetime.currentWeightKg}{' '}
              <span className="text-xs font-normal text-[#767676] dark:text-neutral-400">kg</span>
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              {data.lifetime.weightNetChangeKg} kg net change
            </div>
          </div>
        </div>
      </div>

      {/* Weight & Deficit Trend */}
      <div className="bg-white dark:bg-[#1C1C1E] border border-[#E5E5E5] dark:border-neutral-800 rounded-xl p-5 shadow-2xs space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-[#1B1C1C] dark:text-neutral-100">
              Weight & Deficit Trend
            </h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#242424] dark:bg-white"></span>
                <span className="text-[11px] text-[#767676] dark:text-neutral-400">Weight</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#D4D4D4] dark:bg-neutral-600"></span>
                <span className="text-[11px] text-[#767676] dark:text-neutral-400">Deficit</span>
              </span>
            </div>
          </div>
          <p className="text-xs text-[#767676] dark:text-neutral-400 mt-0.5">
            4-Week progressive deficit adherence
          </p>
        </div>

        {/* Inset chart container */}
        <div className="bg-[#FBF9F9] dark:bg-neutral-900/60 border border-[#E5E5E5] dark:border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs pb-3 border-b border-[#E5E5E5] dark:border-neutral-800 mb-4">
            <span className="font-mono text-[11px] text-[#767676] dark:text-neutral-400">Target: -500 kcal/day</span>
            <span className="font-mono text-[11px] font-semibold text-[#1B1C1C] dark:text-neutral-200">
              96% Compliant
            </span>
          </div>

          {/* SVG Combined Chart */}
          <div className="relative w-full overflow-hidden">
            <svg
              viewBox="0 0 320 120"
              className="w-full h-32 overflow-visible"
              preserveAspectRatio="none"
            >
              {/* Horizontal guideline */}
              <line
                x1="20"
                y1="25"
                x2="300"
                y2="25"
                stroke="currentColor"
                className="text-neutral-200 dark:text-neutral-800"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <line
                x1="20"
                y1="60"
                x2="300"
                y2="60"
                stroke="currentColor"
                className="text-neutral-200 dark:text-neutral-800"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <line
                x1="20"
                y1="95"
                x2="300"
                y2="95"
                stroke="currentColor"
                className="text-neutral-200 dark:text-neutral-800"
                strokeDasharray="3 3"
                strokeWidth="1"
              />

              {/* Deficit Bars */}
              {points.map((pt, idx) => (
                <rect
                  key={`bar-${idx}`}
                  x={pt.x - 9}
                  y={115 - pt.barHeight}
                  width="18"
                  height={pt.barHeight}
                  fill={idx === 3 ? '#4A4A4A' : '#D4D4D4'}
                  rx="2"
                  opacity={activeHoverWeek === idx ? 1 : 0.85}
                  className="transition-all cursor-pointer dark:opacity-75"
                  onMouseEnter={() => setActiveHoverWeek(idx)}
                  onMouseLeave={() => setActiveHoverWeek(null)}
                />
              ))}

              {/* Connecting line for Weight */}
              <path
                d={pathD}
                fill="none"
                stroke="currentColor"
                className="text-[#242424] dark:text-neutral-100"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Dots for Weight */}
              {points.map((pt, idx) => (
                <g key={`pt-${idx}`}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="4"
                    fill="#FFFFFF"
                    stroke="#242424"
                    strokeWidth="2.5"
                    className="cursor-pointer hover:r-5 transition-all dark:stroke-neutral-200"
                    onMouseEnter={() => setActiveHoverWeek(idx)}
                    onMouseLeave={() => setActiveHoverWeek(null)}
                  />
                </g>
              ))}
            </svg>

            {/* Column labels at bottom */}
            <div className="grid grid-cols-4 gap-2 text-center pt-2">
              {data.weightTrend.map((item, idx) => (
                <div
                  key={item.week}
                  className={`text-xs transition-colors ${
                    activeHoverWeek === idx ? 'text-[#1B1C1C] dark:text-neutral-100 font-semibold' : 'text-[#767676] dark:text-neutral-400'
                  }`}
                >
                  <div className="font-mono text-[10px] text-[#767676] dark:text-neutral-400">{item.week}</div>
                  <div className="font-display font-semibold text-xs text-[#1B1C1C] dark:text-neutral-200">
                    {item.weightKg}kg
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Macro Precision */}
      <div className="bg-white dark:bg-[#1C1C1E] border border-[#E5E5E5] dark:border-neutral-800 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-[#1B1C1C] dark:text-neutral-100">Macro Precision</h3>
            <p className="text-xs text-[#767676] dark:text-neutral-400">7-day rolling intake split</p>
          </div>
          <span className="px-2.5 py-0.5 bg-[#F2F2F2] dark:bg-neutral-800 text-[10px] font-mono font-semibold text-[#242424] dark:text-neutral-300 rounded-xs uppercase">
            98% PRECISION
          </span>
        </div>

        {/* Segmented bar */}
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-[#E5E5E5] dark:bg-neutral-800">
          <div
            className="bg-[#242424] dark:bg-neutral-100 h-full"
            style={{ width: `${data.macroPrecision.carbs.actual}%` }}
            title="Carbs 49%"
          ></div>
          <div
            className="bg-[#767676] dark:bg-neutral-400 h-full"
            style={{ width: `${data.macroPrecision.protein.actual}%` }}
            title="Protein 21%"
          ></div>
          <div
            className="bg-[#C4C7C7] dark:bg-neutral-600 h-full"
            style={{ width: `${data.macroPrecision.fats.actual}%` }}
            title="Fats 30%"
          ></div>
        </div>

        {/* 3 rows */}
        <div className="space-y-2.5 pt-1">
          {/* Carbs */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#242424] dark:bg-neutral-100"></span>
              <div>
                <div className="font-semibold text-[#1B1C1C] dark:text-neutral-100">
                  {data.macroPrecision.carbs.name}
                </div>
                <div className="text-[10px] text-[#767676] dark:text-neutral-400">
                  {data.macroPrecision.carbs.subtitle}
                </div>
              </div>
            </div>
            <div className="font-mono text-xs text-[#1B1C1C] dark:text-neutral-200">
              <span className="font-bold">{data.macroPrecision.carbs.actual}%</span>
              <span className="text-[#767676] dark:text-neutral-400"> / {data.macroPrecision.carbs.target}%</span>
            </div>
          </div>

          {/* Protein */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#767676] dark:bg-neutral-400"></span>
              <div>
                <div className="font-semibold text-[#1B1C1C] dark:text-neutral-100">
                  {data.macroPrecision.protein.name}
                </div>
                <div className="text-[10px] text-[#767676] dark:text-neutral-400">
                  {data.macroPrecision.protein.subtitle}
                </div>
              </div>
            </div>
            <div className="font-mono text-xs text-[#1B1C1C] dark:text-neutral-200">
              <span className="font-bold">{data.macroPrecision.protein.actual}%</span>
              <span className="text-[#767676] dark:text-neutral-400"> / {data.macroPrecision.protein.target}%</span>
            </div>
          </div>

          {/* Fats */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#C4C7C7] dark:bg-neutral-600"></span>
              <div>
                <div className="font-semibold text-[#1B1C1C] dark:text-neutral-100">
                  {data.macroPrecision.fats.name}
                </div>
                <div className="text-[10px] text-[#767676] dark:text-neutral-400">
                  {data.macroPrecision.fats.subtitle}
                </div>
              </div>
            </div>
            <div className="font-mono text-xs text-[#1B1C1C] dark:text-neutral-200">
              <span className="font-bold">{data.macroPrecision.fats.actual}%</span>
              <span className="text-[#767676] dark:text-neutral-400"> / {data.macroPrecision.fats.target}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wearables Pipeline */}
      <div className="bg-white dark:bg-[#1C1C1E] border border-[#E5E5E5] dark:border-neutral-800 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Watch size={16} className="text-[#242424] dark:text-neutral-200" />
            <span className="font-display font-semibold text-[#1B1C1C] dark:text-neutral-100">
              Wearables Pipeline
            </span>
          </div>
          <span className="text-[11px] text-[#767676] dark:text-neutral-400">{data.wearables.lastSynced}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#FBF9F9] dark:bg-neutral-900/60 border border-[#E5E5E5] dark:border-neutral-800 rounded-lg p-3">
            <div className="text-[10px] font-mono uppercase text-[#767676] dark:text-neutral-400">
              TODAY'S STEPS
            </div>
            <div className="font-display font-bold text-xl text-[#1B1C1C] dark:text-neutral-100 mt-0.5">
              {data.wearables.todaySteps.toLocaleString()}
            </div>
          </div>

          <div className="bg-[#FBF9F9] dark:bg-neutral-900/60 border border-[#E5E5E5] dark:border-neutral-800 rounded-lg p-3">
            <div className="text-[10px] font-mono uppercase text-[#767676] dark:text-neutral-400">
              ACTIVE OUTPUT
            </div>
            <div className="font-display font-bold text-xl text-[#1B1C1C] dark:text-neutral-100 mt-0.5">
              {data.wearables.activeOutputKcal}{' '}
              <span className="text-xs font-normal text-[#767676] dark:text-neutral-400">kcal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Milestones Card */}
      <div className="bg-white dark:bg-[#1C1C1E] border border-[#E5E5E5] dark:border-neutral-800 rounded-xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div>
            <h3 className="font-display font-bold text-base text-[#1B1C1C] dark:text-neutral-100">Milestones</h3>
            <p className="text-xs text-[#767676] dark:text-neutral-400">Proof of consistency</p>
          </div>
          <span className="text-xs font-medium text-[#767676] dark:text-neutral-400">3 Unlocked</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {data.milestones.map((m) => (
            <div
              key={m.id}
              className="bg-[#FBF9F9] dark:bg-neutral-900/60 border border-[#E5E5E5] dark:border-neutral-800 rounded-lg p-3 text-center flex flex-col items-center justify-center space-y-1.5"
            >
              <div className="w-8 h-8 rounded-full bg-white dark:bg-neutral-800 border border-[#E5E5E5] dark:border-neutral-700 flex items-center justify-center text-[#242424] dark:text-neutral-200">
                {m.icon === 'shield' && <Shield size={16} />}
                {m.icon === 'droplet' && <Droplet size={16} />}
                {m.icon === 'check-circle' && <CheckCircle2 size={16} />}
              </div>
              <div className="font-semibold text-xs text-[#1B1C1C] dark:text-neutral-100">{m.title}</div>
              <div className="text-[10px] text-[#767676] dark:text-neutral-400">{m.subtitle}</div>
            </div>
          ))}
        </div>

        {/* Next milestone */}
        <div className="bg-[#FBF9F9] dark:bg-neutral-900/60 border border-[#E5E5E5] dark:border-neutral-800 rounded-lg p-3 flex items-center justify-between text-xs">
          <span className="font-medium text-[#1B1C1C] dark:text-neutral-200">
            Next: <span className="font-semibold">{data.nextMilestone.title}</span>
          </span>
          <span className="text-[11px] font-mono text-[#767676] dark:text-neutral-400">
            {data.nextMilestone.remaining} to go
          </span>
        </div>
      </div>

      {/* Share & Workspace Buttons */}
      <div className="pt-1 space-y-2">
        <button
          onClick={onOpenWorkspace}
          id="btn-workspace-sync"
          className="w-full py-3 px-4 bg-white dark:bg-neutral-800 hover:bg-[#F2F2F2] dark:hover:bg-neutral-700 border border-[#242424] dark:border-neutral-600 text-[#242424] dark:text-neutral-200 font-display font-semibold text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 transition-colors shadow-2xs"
        >
          <span className="w-4 h-4 rounded-full bg-[#242424] dark:bg-white text-white dark:text-[#242424] text-[9px] flex items-center justify-center font-bold">
            G
          </span>
          <span>Google Workspace Hub (Drive, Sheets, Calendar)</span>
        </button>

        <button
          onClick={onOpenShareReport}
          id="btn-share-report"
          className="w-full py-3 px-4 bg-[#242424] dark:bg-white hover:bg-[#1B1C1C] dark:hover:bg-neutral-200 text-white dark:text-[#1B1C1C] font-display font-semibold text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
        >
          <Share2 size={15} />
          <span>Share Pulse Report</span>
        </button>

        {/* Help & Support Channel */}
        <button
          onClick={onOpenSupport}
          id="btn-open-support"
          className="w-full py-3 px-4 bg-amber-50/70 dark:bg-amber-950/40 hover:bg-amber-100/80 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200 font-display font-semibold text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 transition-colors shadow-2xs"
        >
          <LifeBuoy size={15} className="text-amber-800 dark:text-amber-400" />
          <span>Help & Support Center (s44810335@gmail.com)</span>
        </button>

        <p className="text-center text-[10px] text-[#767676] dark:text-neutral-400 font-mono mt-3">
          CultPulse Open Analytics • Zero paywalls • 100% unlocked forever
        </p>

        {/* Discreet Super Admin Authentication Controls (Zero Email Leakage) */}
        <div className="pt-2 text-center">
          {isAdmin ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Logged in as Super Admin (Verified System Owner)</span>
              {onAdminLoginToggle && (
                <button
                  onClick={onAdminLoginToggle}
                  className="underline hover:text-black ml-1 text-[9px] uppercase font-bold"
                >
                  Switch to Regular User
                </button>
              )}
            </div>
          ) : (
            onAdminLoginToggle && (
              <button
                onClick={onAdminLoginToggle}
                className="text-[10px] font-mono text-[#767676] hover:text-[#242424] underline transition-colors"
              >
                🔐 System Administrator Console (Passkey Protected)
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
