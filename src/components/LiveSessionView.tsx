import React, { useState, useEffect } from 'react';
import {
  Heart,
  Flame,
  Clock,
  Volume2,
  VolumeX,
  Camera,
  Square,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Eye,
  Dumbbell,
  Zap,
} from 'lucide-react';
import { Drill, WorkoutProtocol } from '../types';
import { liveDrills } from '../data/mockData';

interface LiveSessionViewProps {
  currentProtocol?: WorkoutProtocol | null;
  onEndSession: (caloriesBurned: number) => void;
  onOpenAIForm: () => void;
}

export const LiveSessionView: React.FC<LiveSessionViewProps> = ({
  currentProtocol,
  onEndSession,
  onOpenAIForm,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [secondsRemaining, setSecondsRemaining] = useState(29);
  const [totalSecondsRemaining, setTotalSecondsRemaining] = useState(1125); // 18m 45s
  const [currentDrillIndex, setCurrentDrillIndex] = useState(3); // Drill 04/12
  const [currentSet, setCurrentSet] = useState(2);
  const [heartRate, setHeartRate] = useState(147);
  const [activeCalories, setActiveCalories] = useState(215);
  const [isVoiceOn, setIsVoiceOn] = useState(true);
  const [coachCue, setCoachCue] = useState(
    'RAHUL: "3, 2, 1... Push the pace through the hips!"'
  );

  const currentDrill: Drill = liveDrills[currentDrillIndex] || liveDrills[3];
  const nextDrill: Drill | undefined = liveDrills[currentDrillIndex + 1];

  // Timer interval simulation
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            // Next drill or set
            if (currentDrillIndex < liveDrills.length - 1) {
              setCurrentDrillIndex((idx) => idx + 1);
              return 45;
            } else {
              setIsPlaying(false);
              return 0;
            }
          }
          return prev - 1;
        });

        setTotalSecondsRemaining((prev) => Math.max(0, prev - 1));

        // Slightly oscillate telemetry
        if (Math.random() > 0.6) {
          setHeartRate((prev) => {
            const delta = Math.random() > 0.5 ? 1 : -1;
            return Math.min(168, Math.max(138, prev + delta));
          });
        }
        if (Math.random() > 0.8) {
          setActiveCalories((prev) => prev + 1);
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentDrillIndex]);

  // Coach cues rotation
  useEffect(() => {
    const cues = [
      'RAHUL: "3, 2, 1... Push the pace through the hips!"',
      'RAHUL: "Drive through your heels, keep the core braced!"',
      'RAHUL: "Exhale on the press, inhale on the descent!"',
      'RAHUL: "10 seconds left in this round, stay relentless!"',
    ];
    const cueTimer = setInterval(() => {
      if (isPlaying && isVoiceOn) {
        setCoachCue(cues[Math.floor(Math.random() * cues.length)]);
      }
    }, 12000);
    return () => clearInterval(cueTimer);
  }, [isPlaying, isVoiceOn]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handlePrevDrill = () => {
    if (currentDrillIndex > 0) {
      setCurrentDrillIndex((prev) => prev - 1);
      setSecondsRemaining(45);
    }
  };

  const handleNextDrill = () => {
    if (currentDrillIndex < liveDrills.length - 1) {
      setCurrentDrillIndex((prev) => prev + 1);
      setSecondsRemaining(45);
    }
  };

  const handleRewind10 = () => {
    setSecondsRemaining((prev) => Math.min(45, prev + 10));
  };

  const handleForward10 = () => {
    setSecondsRemaining((prev) => Math.max(1, prev - 10));
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Telemetry Strip (3 cards in 1 row) */}
      <div className="grid grid-cols-3 gap-2 bg-white border border-[#E5E5E5] rounded-xl p-3 shadow-2xs">
        {/* Heart Rate */}
        <div className="flex items-center gap-2 border-r border-[#E5E5E5] pr-2">
          <div className="w-8 h-8 rounded-md bg-[#FBF9F9] border border-[#E5E5E5] flex items-center justify-center text-[#242424] shrink-0">
            <Heart size={16} className="text-red-600 animate-pulse" />
          </div>
          <div>
            <div className="font-display font-bold text-sm text-[#1B1C1C] flex items-baseline gap-1">
              <span>{heartRate}</span>
              <span className="text-[10px] font-mono text-[#767676]">BPM</span>
            </div>
            <div className="text-[10px] text-[#767676] truncate">Zone 4 (Aerobic)</div>
          </div>
        </div>

        {/* Burned */}
        <div className="flex items-center gap-2 border-r border-[#E5E5E5] px-2">
          <div className="w-8 h-8 rounded-md bg-[#FBF9F9] border border-[#E5E5E5] flex items-center justify-center text-[#242424] shrink-0">
            <Flame size={16} className="text-amber-600" />
          </div>
          <div>
            <div className="font-display font-bold text-sm text-[#1B1C1C] flex items-baseline gap-1">
              <span>{activeCalories}</span>
              <span className="text-[10px] font-mono text-[#767676]">KCAL</span>
            </div>
            <div className="text-[10px] text-[#767676] truncate">Est. Active</div>
          </div>
        </div>

        {/* Remaining Time */}
        <div className="flex items-center gap-2 pl-2">
          <div className="w-8 h-8 rounded-md bg-[#FBF9F9] border border-[#E5E5E5] flex items-center justify-center text-[#242424] shrink-0">
            <Clock size={16} className="text-[#4A4A4A]" />
          </div>
          <div>
            <div className="font-display font-bold text-sm text-[#1B1C1C]">
              {formatTime(totalSecondsRemaining)}
            </div>
            <div className="text-[10px] font-mono text-[#767676] uppercase">REMAINING</div>
          </div>
        </div>
      </div>

      {/* Video Workout Stage */}
      <div className="relative aspect-16/10 rounded-xl overflow-hidden bg-black border border-[#E5E5E5] shadow-sm">
        {/* Active workout image */}
        <img
          src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80"
          alt="Athlete overhead dumbbell lift"
          className="w-full h-full object-cover grayscale brightness-90 contrast-110"
          referrerPolicy="no-referrer"
        />

        {/* Dark overlay gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/60 pointer-events-none"></div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-medium font-mono">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span>WORK INTERVAL</span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-mono">
            <Zap size={12} className="text-yellow-400" />
            <span>120% PACE</span>
          </div>
        </div>

        {/* Audio Coach Cue Bar */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="px-3 py-2 rounded-lg bg-black/70 backdrop-blur-md border border-white/15 text-white/90 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 truncate pr-2">
              <Volume2 size={15} className="text-white shrink-0" />
              <span className="font-mono text-[11px] truncate tracking-tight">{coachCue}</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0"></span>
          </div>
        </div>
      </div>

      {/* Interval Progress Bar & Status */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono font-semibold tracking-wider text-[#1B1C1C]">
            WORK (45S)
          </span>
          <span className="text-[#767676] font-medium">Round {currentSet} / 3</span>
          <span className="font-mono text-[#767676]">REST (15S)</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#E5E5E5] h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#242424] h-full transition-all duration-300"
            style={{ width: `${Math.max(5, ((45 - secondsRemaining) / 45) * 100)}%` }}
          ></div>
        </div>

        {/* Interval Timer Big Display */}
        <div className="flex items-end justify-between pt-1">
          <div>
            <div className="text-[10px] font-mono tracking-widest text-[#767676] uppercase">
              INTERVAL TIMER
            </div>
            <div className="font-display font-bold text-3xl md:text-4xl text-[#1B1C1C] tracking-tight">
              00:{secondsRemaining.toString().padStart(2, '0')}{' '}
              <span className="text-sm font-mono text-[#767676] font-medium">SEC</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-mono tracking-widest text-[#767676] uppercase">
              ROUTINE
            </div>
            <div className="font-display font-semibold text-sm md:text-base text-[#1B1C1C] truncate max-w-[170px]">
              {currentProtocol ? currentProtocol.title : 'Full Body Metabolic Blast'}
            </div>
          </div>
        </div>
      </div>

      {/* Playback Controls (Circle buttons row) */}
      <div className="flex items-center justify-center gap-3 md:gap-4 py-1">
        {/* Prev Drill */}
        <button
          onClick={handlePrevDrill}
          disabled={currentDrillIndex === 0}
          aria-label="Previous drill"
          className="w-11 h-11 rounded-full bg-white border border-[#E5E5E5] text-[#242424] hover:bg-[#F2F2F2] disabled:opacity-40 flex items-center justify-center transition-colors shadow-2xs"
        >
          <SkipBack size={18} />
        </button>

        {/* Rewind 10s */}
        <button
          onClick={handleRewind10}
          aria-label="Rewind 10 seconds"
          className="w-11 h-11 rounded-full bg-white border border-[#E5E5E5] text-[#242424] hover:bg-[#F2F2F2] flex items-center justify-center transition-colors shadow-2xs relative"
        >
          <RotateCcw size={18} />
          <span className="absolute text-[8px] font-bold font-mono">10</span>
        </button>

        {/* Main Play / Pause */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? 'Pause workout' : 'Resume workout'}
          className="w-16 h-16 rounded-full bg-[#242424] hover:bg-[#1B1C1C] text-white flex items-center justify-center transition-transform hover:scale-105 shadow-md"
        >
          {isPlaying ? (
            <Pause size={26} fill="currentColor" />
          ) : (
            <Play size={26} fill="currentColor" className="ml-1" />
          )}
        </button>

        {/* Forward 10s */}
        <button
          onClick={handleForward10}
          aria-label="Fast forward 10 seconds"
          className="w-11 h-11 rounded-full bg-white border border-[#E5E5E5] text-[#242424] hover:bg-[#F2F2F2] flex items-center justify-center transition-colors shadow-2xs relative"
        >
          <RotateCw size={18} />
          <span className="absolute text-[8px] font-bold font-mono">10</span>
        </button>

        {/* Next Drill */}
        <button
          onClick={handleNextDrill}
          disabled={currentDrillIndex >= liveDrills.length - 1}
          aria-label="Next drill"
          className="w-11 h-11 rounded-full bg-white border border-[#E5E5E5] text-[#242424] hover:bg-[#F2F2F2] disabled:opacity-40 flex items-center justify-center transition-colors shadow-2xs"
        >
          <SkipForward size={18} />
        </button>
      </div>

      {/* Active Drill Card */}
      <div className="bg-white border-l-4 border-l-[#242424] border border-[#E5E5E5] rounded-xl p-4 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={currentDrill.imageUrl}
            alt={currentDrill.name}
            className="w-12 h-12 rounded-lg object-cover border border-[#E5E5E5] shrink-0"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono text-[#767676] font-medium">
                DRILL {currentDrill.number}
              </span>
              <span className="px-1.5 py-0.2 bg-[#242424] text-white text-[9px] font-mono font-semibold rounded-xs">
                ACTIVE
              </span>
            </div>
            <div className="font-display font-bold text-sm text-[#1B1C1C] truncate max-w-[180px]">
              {currentDrill.name}
            </div>
            <div className="text-[11px] text-[#767676]">
              {currentDrill.sets} Sets × {currentDrill.workSeconds}s • {currentDrill.load}
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="font-display font-bold text-base text-[#1B1C1C]">
            Set {currentSet}
          </div>
          <div className="text-[9px] font-mono tracking-wider text-[#767676] uppercase">
            {currentDrill.impact}
          </div>
        </div>
      </div>

      {/* Up Next Card */}
      {nextDrill && (
        <div className="bg-[#FBF9F9] border border-[#E5E5E5] rounded-xl p-3.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white border border-[#E5E5E5] flex items-center justify-center text-[#4A4A4A] shrink-0">
              <Dumbbell size={18} />
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#767676] uppercase">
                UP NEXT • 00:15 Transition
              </div>
              <div className="font-semibold text-xs text-[#1B1C1C]">{nextDrill.name}</div>
              <div className="text-[11px] text-[#767676]">
                Drill {nextDrill.number.split('/')[0]} • {nextDrill.load} • {nextDrill.workSeconds}s
              </div>
            </div>
          </div>

          <button
            onClick={() => setCurrentDrillIndex(currentDrillIndex + 1)}
            aria-label="Preview next drill"
            className="w-8 h-8 rounded-full border border-[#E5E5E5] bg-white flex items-center justify-center text-[#767676] hover:text-[#1B1C1C] hover:border-[#242424] transition-colors"
          >
            <Eye size={15} />
          </button>
        </div>
      )}

      {/* Utility Action Buttons Row (3 buttons) */}
      <div className="grid grid-cols-3 gap-2.5 pt-1">
        {/* Voice Toggle */}
        <button
          onClick={() => setIsVoiceOn(!isVoiceOn)}
          id="btn-voice-toggle"
          className={`py-2.5 px-2 rounded-xl border transition-colors flex flex-col items-center justify-center text-center ${
            isVoiceOn
              ? 'bg-white border-[#E5E5E5] text-[#242424]'
              : 'bg-[#F2F2F2] border-[#E5E5E5] text-[#767676]'
          }`}
        >
          {isVoiceOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          <span className="font-semibold text-xs mt-1">Voice: {isVoiceOn ? 'ON' : 'OFF'}</span>
          <span className="text-[10px] text-[#767676]">Coach Cues</span>
        </button>

        {/* AI Form Check */}
        <button
          onClick={onOpenAIForm}
          id="btn-ai-form"
          className="py-2.5 px-2 rounded-xl bg-white border border-[#E5E5E5] hover:border-[#242424] text-[#242424] transition-colors flex flex-col items-center justify-center text-center shadow-2xs"
        >
          <Camera size={16} />
          <span className="font-semibold text-xs mt-1">AI Form</span>
          <span className="text-[10px] text-emerald-600 font-medium">Ready</span>
        </button>

        {/* End Early */}
        <button
          onClick={() => onEndSession(activeCalories)}
          id="btn-end-session"
          className="py-2.5 px-2 rounded-xl bg-white border border-[#E5E5E5] hover:border-red-500 text-red-600 transition-colors flex flex-col items-center justify-center text-center shadow-2xs"
        >
          <Square size={16} fill="currentColor" />
          <span className="font-semibold text-xs mt-1">End Early</span>
          <span className="text-[10px] text-[#767676]">Save Log</span>
        </button>
      </div>
    </div>
  );
};
