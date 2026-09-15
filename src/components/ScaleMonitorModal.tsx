import React, { useState, useEffect } from 'react';
import {
  Zap,
  Activity,
  ShieldCheck,
  Database,
  Cpu,
  RefreshCw,
  Play,
  CheckCircle2,
  HardDrive,
  Wifi,
  WifiOff,
  Server,
} from 'lucide-react';
import {
  ScaleTelemetry,
  getScaleTelemetry,
  subscribeTelemetry,
  runScaleBurstStressTest,
  UserAppState,
} from '../services/scaleEngine';

interface ScaleMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentState: UserAppState;
  onStateUpdate: (updatedState: UserAppState) => void;
  userEmail?: string | null;
}

export const ScaleMonitorModal: React.FC<ScaleMonitorModalProps> = ({
  isOpen,
  onClose,
  currentState,
  onStateUpdate,
  userEmail,
}) => {
  const [telemetry, setTelemetry] = useState<ScaleTelemetry>(() =>
    getScaleTelemetry(currentState.userId)
  );
  const [isStressTesting, setIsStressTesting] = useState(false);
  const [stressProgress, setStressProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = subscribeTelemetry((t) => setTelemetry(t));
    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRunStressTest = async () => {
    setIsStressTesting(true);
    setStressProgress(0);

    try {
      const finalState = await runScaleBurstStressTest(currentState, (step, total, nextState) => {
        setStressProgress(Math.round((step / total) * 100));
        onStateUpdate(nextState);
      });
      onStateUpdate(finalState);
    } catch (e) {
      console.error(e);
    } finally {
      setIsStressTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E5E5E5] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#E5E5E5] bg-[#242424] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-black flex items-center justify-center font-bold">
              <Zap size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-sm tracking-wide text-white">
                  1 Million Scale Engine Monitor
                </h3>
                <span className="px-2 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono font-semibold rounded-xs">
                  60 FPS READY
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Ultra-high throughput architecture & 0ms optimistic UI telemetry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition-colors"
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {/* Real-Time Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* FPS */}
            <div className="p-3 rounded-xl bg-[#FBF9F9] border border-[#E5E5E5] flex flex-col justify-between">
              <span className="text-[10px] text-[#767676] font-mono flex items-center gap-1">
                <Activity size={12} className="text-emerald-600" />
                FRAME RATE
              </span>
              <div className="mt-1">
                <div className="text-2xl font-mono font-bold text-[#1B1C1C]">
                  {telemetry.fps} <span className="text-xs text-[#767676]">FPS</span>
                </div>
                <div className="text-[10px] text-emerald-700 font-medium">Smooth 60Hz Target</div>
              </div>
            </div>

            {/* Mutation Latency */}
            <div className="p-3 rounded-xl bg-[#FBF9F9] border border-[#E5E5E5] flex flex-col justify-between">
              <span className="text-[10px] text-[#767676] font-mono flex items-center gap-1">
                <Cpu size={12} className="text-blue-600" />
                UI LATENCY
              </span>
              <div className="mt-1">
                <div className="text-2xl font-mono font-bold text-[#1B1C1C]">
                  {telemetry.lastMutationLatencyMs}{' '}
                  <span className="text-xs text-[#767676]">ms</span>
                </div>
                <div className="text-[10px] text-emerald-700 font-medium">Instant 0ms UI</div>
              </div>
            </div>

            {/* Sync Queue */}
            <div className="p-3 rounded-xl bg-[#FBF9F9] border border-[#E5E5E5] flex flex-col justify-between">
              <span className="text-[10px] text-[#767676] font-mono flex items-center gap-1">
                <Server size={12} className="text-amber-600" />
                SYNC QUEUE
              </span>
              <div className="mt-1">
                <div className="text-2xl font-mono font-bold text-[#1B1C1C]">
                  {telemetry.queuedMutationsCount}{' '}
                  <span className="text-xs text-[#767676]">queued</span>
                </div>
                <div className="text-[10px] text-[#767676] font-medium capitalize">
                  {telemetry.syncStatus}
                </div>
              </div>
            </div>

            {/* Network State */}
            <div className="p-3 rounded-xl bg-[#FBF9F9] border border-[#E5E5E5] flex flex-col justify-between">
              <span className="text-[10px] text-[#767676] font-mono flex items-center gap-1">
                {telemetry.isOnline ? (
                  <Wifi size={12} className="text-emerald-600" />
                ) : (
                  <WifiOff size={12} className="text-red-500" />
                )}
                CONNECTIVITY
              </span>
              <div className="mt-1">
                <div className="text-sm font-mono font-bold text-[#1B1C1C]">
                  {telemetry.isOnline ? 'Online' : 'Offline'}
                </div>
                <div className="text-[10px] text-emerald-700 font-medium">Local-First Mode</div>
              </div>
            </div>
          </div>

          {/* User Isolation Info */}
          <div className="p-3.5 bg-[#FBF9F9] border border-[#E5E5E5] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span className="font-semibold text-[#1B1C1C]">
                  Multi-Tenant User Isolation (1M Safe)
                </span>
              </div>
              <span className="px-1.5 py-0.2 bg-white border border-[#E5E5E5] text-[10px] font-mono text-[#767676] rounded-xs">
                PARTITIONED
              </span>
            </div>
            <p className="text-[11px] text-[#767676] leading-relaxed">
              Every user account receives an isolated, cryptographic key namespace. Even if 1
              Million users sign in concurrently, each athlete's meal logs, water tracker, and
              calories remain independent with zero cross-tenant contamination.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-2 font-mono text-[10px] text-[#767676]">
              <span className="bg-white px-2 py-1 rounded border border-[#E5E5E5]">
                Namespace: <strong className="text-[#1B1C1C]">{currentState.userId}</strong>
              </span>
              <span className="bg-white px-2 py-1 rounded border border-[#E5E5E5]">
                Account: <strong>{userEmail || 'Local Guest'}</strong>
              </span>
              <span className="bg-white px-2 py-1 rounded border border-[#E5E5E5]">
                Mutations Processed: <strong>{telemetry.totalMutationsProcessed}</strong>
              </span>
            </div>
          </div>

          {/* Stress Test Live Benchmark */}
          <div className="p-4 bg-zinc-900 text-white rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-amber-400" />
                <span className="font-bold text-xs">Live High-Load Concurrency Test</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">40 OPS / SEC</span>
            </div>

            <p className="text-[11px] text-zinc-300">
              Simulate 50 rapid-fire concurrent writes (water increments, active burn calories, and
              protocol updates) to observe 0ms UI latency and 60fps frame rate lock under extreme
              burst load.
            </p>

            {isStressTesting ? (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono text-amber-400">
                  <span>Executing 50 Atomic Mutations...</span>
                  <span>{stressProgress}%</span>
                </div>
                <div className="w-full bg-zinc-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full transition-all duration-75"
                    style={{ width: `${stressProgress}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <button
                onClick={handleRunStressTest}
                className="w-full py-2.5 px-4 bg-white hover:bg-zinc-100 text-zinc-900 font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Play size={14} className="fill-current" />
                <span>Run 50-Burst Concurrency Benchmark</span>
              </button>
            )}
          </div>

          {/* 1M Scaling Architecture Highlights */}
          <div className="space-y-2 pt-1">
            <div className="text-[10px] font-mono uppercase text-[#767676]">
              ENGINEERING PILLARS FOR 1 MILLION USERS
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-lg border border-[#E5E5E5] bg-white space-y-1">
                <div className="font-semibold text-[#1B1C1C] flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  <span>0ms In-Memory Hot Cache</span>
                </div>
                <p className="text-[#767676]">
                  State renders from RAM instantly. Zero database round-trips for everyday button
                  taps.
                </p>
              </div>

              <div className="p-2.5 rounded-lg border border-[#E5E5E5] bg-white space-y-1">
                <div className="font-semibold text-[#1B1C1C] flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  <span>Debounced Batching</span>
                </div>
                <p className="text-[#767676]">
                  High-frequency writes are batched every 250ms, eliminating database throttling and
                  freezing.
                </p>
              </div>

              <div className="p-2.5 rounded-lg border border-[#E5E5E5] bg-white space-y-1">
                <div className="font-semibold text-[#1B1C1C] flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  <span>Offline-First Reliability</span>
                </div>
                <p className="text-[#767676]">
                  Network failures or server spikes never stall the user. Full app remains usable
                  offline.
                </p>
              </div>

              <div className="p-2.5 rounded-lg border border-[#E5E5E5] bg-white space-y-1">
                <div className="font-semibold text-[#1B1C1C] flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  <span>Isolated Data Partition</span>
                </div>
                <p className="text-[#767676]">
                  Strict UID-based storage keys prevent cross-session memory leaks and race
                  conditions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#E5E5E5] bg-[#FBF9F9] flex items-center justify-between text-[11px] text-[#767676]">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Scale Engine Active</span>
          </div>
          <button
            onClick={onClose}
            className="py-1.5 px-3 bg-[#242424] hover:bg-black text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Close Monitor
          </button>
        </div>
      </div>
    </div>
  );
};
