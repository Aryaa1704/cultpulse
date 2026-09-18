import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  CheckCircle2,
  Activity,
  Tv,
  RotateCcw,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { ExerciseItem, getExerciseVideo } from '../data/exerciseDatabase';
import { getActiveUserGender } from '../services/googleAuth';

interface ExerciseVideoModalProps {
  exercise: ExerciseItem | null;
  isOpen: boolean;
  onClose: () => void;
  onLogExercise?: (exercise: ExerciseItem) => void;
  userGender?: 'male' | 'female';
}

export const ExerciseVideoModal: React.FC<ExerciseVideoModalProps> = ({
  exercise,
  isOpen,
  onClose,
  onLogExercise,
  userGender: propGender,
}) => {
  const [activeGender, setActiveGender] = useState<'male' | 'female'>('male');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [playerMode, setPlayerMode] = useState<'video' | 'cadence'>('video');
  const [videoError, setVideoError] = useState(false);
  const [cadencePhase, setCadencePhase] = useState<'Eccentric (3s Lowering)' | 'Isometric (1s Peak)' | 'Concentric (1s Drive)' | 'Reset (Inhale)'>('Eccentric (3s Lowering)');
  const [cadenceTime, setCadenceTime] = useState(3);
  const [repCount, setRepCount] = useState(1);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Sync active gender from props or stored user session
  useEffect(() => {
    if (isOpen) {
      const g = propGender || getActiveUserGender();
      setActiveGender(g);
      setIsPlaying(true);
      setVideoError(false);
      setRepCount(1);
    }
  }, [isOpen, propGender, exercise]);

  // Tempo Cadence Metronome (3-1-1 Tempo)
  useEffect(() => {
    if (!isOpen || playerMode !== 'cadence') return;

    const timer = setInterval(() => {
      setCadenceTime((prev) => {
        if (prev > 1) return prev - 1;

        setCadencePhase((currPhase) => {
          if (currPhase === 'Eccentric (3s Lowering)') {
            return 'Isometric (1s Peak)';
          } else if (currPhase === 'Isometric (1s Peak)') {
            return 'Concentric (1s Drive)';
          } else if (currPhase === 'Concentric (1s Drive)') {
            setRepCount((r) => r + 1);
            return 'Reset (Inhale)';
          } else {
            return 'Eccentric (3s Lowering)';
          }
        });
        return 3;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, playerMode]);

  if (!isOpen || !exercise) return null;

  const videoData = getExerciseVideo(exercise, activeGender);
  const currentVideoUrl = videoData.videoUrl;
  const currentPosterUrl = videoData.posterUrl;

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121315] border border-zinc-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col text-white max-h-[94vh]">
        {/* Header Bar */}
        <div className="p-3.5 md:p-4 bg-[#18191C] border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-black flex items-center justify-center font-bold shadow-xs">
              <Play size={15} fill="currentColor" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-sm md:text-base text-white">
                  {exercise.name}
                </h3>
                <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[9px] font-mono font-bold rounded-full uppercase">
                  {exercise.difficulty}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                {exercise.muscleGroup} • {exercise.targetMuscle} • {exercise.equipment}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Active Trainer Gender Indicator (Matches User Profile) */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/90 border border-zinc-700/60 text-xs font-mono text-zinc-300">
              <span>{activeGender === 'female' ? '👩' : '👨'}</span>
              <span className="font-semibold text-white">
                {activeGender === 'female' ? 'Coach Maya' : 'Coach Marcus'}
              </span>
            </div>

            <button
              onClick={onClose}
              id="btn-close-exercise-video"
              className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
              aria-label="Close modal"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* View Switcher: Video Drill vs Biomechanics Cadence Coach */}
        <div className="px-4 py-2 bg-[#151619] border-b border-zinc-800/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPlayerMode('video')}
              id="btn-switch-video-mode"
              className={`px-3 py-1 rounded-md font-mono text-[11px] font-bold flex items-center gap-1.5 transition-colors ${
                playerMode === 'video'
                  ? 'bg-amber-400 text-black shadow-2xs'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
              }`}
            >
              <Tv size={12} />
              <span>HD Video Drill</span>
            </button>

            <button
              onClick={() => setPlayerMode('cadence')}
              id="btn-switch-cadence-mode"
              className={`px-3 py-1 rounded-md font-mono text-[11px] font-bold flex items-center gap-1.5 transition-colors ${
                playerMode === 'cadence'
                  ? 'bg-amber-400 text-black shadow-2xs'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
              }`}
            >
              <Activity size={12} />
              <span>3-1-1 Tempo Cadence</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
            <span>Burn: <strong className="text-emerald-400">~{exercise.caloriesBurnPerHour} kcal/hr</strong></span>
          </div>
        </div>

        {/* Media Player Stage */}
        <div className="relative bg-black flex flex-col items-center justify-center">
          {playerMode === 'video' ? (
            <div className="relative w-full aspect-video overflow-hidden bg-zinc-950 flex items-center justify-center">
              {!videoError ? (
                <video
                  ref={videoRef}
                  key={`${currentVideoUrl}-${activeGender}`}
                  src={currentVideoUrl}
                  poster={currentPosterUrl}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  controls={false}
                  onError={() => setVideoError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                /* High-Res Visual Frame Demonstration Fallback */
                <div className="relative w-full h-full">
                  <img
                    src={currentPosterUrl}
                    alt={exercise.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col items-center justify-center text-center p-4">
                    <div className="w-14 h-14 rounded-full bg-amber-400 text-black flex items-center justify-center mb-2 shadow-xl">
                      <Sparkles size={24} />
                    </div>
                    <h4 className="text-white font-display font-bold text-base mb-1">
                      {exercise.name} Movement Guide
                    </h4>
                    <p className="text-xs text-zinc-300 font-mono max-w-sm">
                      Target: {exercise.targetMuscle} • {exercise.defaultSets} sets × {exercise.defaultRepsOrDuration}
                    </p>
                  </div>
                </div>
              )}

              {/* Top HUD Overlay (Zero Channel Watermarks) */}
              <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between pointer-events-none z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[10px] font-mono font-bold text-zinc-200 uppercase tracking-wider">
                    {activeGender === 'female' ? 'Coach Maya' : 'Coach Marcus'} • Biomechanics Feed
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-amber-300 border border-amber-400/30">
                  {exercise.defaultSets} Sets × {exercise.defaultRepsOrDuration}
                </span>
              </div>

              {/* Bottom Video Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlayPause}
                    id="btn-video-play-pause"
                    className="px-2.5 py-1.5 rounded-md bg-black/70 hover:bg-black/90 border border-zinc-700/80 text-xs font-mono text-white flex items-center gap-1.5 transition-colors"
                  >
                    {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                    <span>{isPlaying ? 'Pause Drill' : 'Play Drill'}</span>
                  </button>

                  <button
                    onClick={toggleMute}
                    id="btn-video-mute"
                    className="px-2.5 py-1.5 rounded-md bg-black/70 hover:bg-black/90 border border-zinc-700/80 text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                    {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                    <span>{isMuted ? 'Muted' : 'Sound On'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-zinc-300 bg-black/60 px-2 py-1 rounded-md border border-zinc-800">
                    Form Mode: Strict 3-1-1
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Biomechanics Cadence Coach Mode */
            <div className="w-full aspect-video bg-[#0c0d0e] p-6 flex flex-col items-center justify-between relative overflow-hidden border-y border-zinc-800">
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                  TEMPO PACING ENGINE (3-1-1 CADENCE)
                </span>
                <span className="px-3 py-1 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-mono text-white">
                  Completed Reps: <strong className="text-amber-400 text-sm">#{repCount}</strong>
                </span>
              </div>

              {/* Pulsing Visual Tempo Circle */}
              <div className="flex flex-col items-center justify-center space-y-3 my-auto">
                <div className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-700 shadow-2xl ${
                  cadencePhase.includes('Eccentric')
                    ? 'border-blue-500 bg-blue-500/10 scale-95'
                    : cadencePhase.includes('Isometric')
                    ? 'border-amber-400 bg-amber-400/20 scale-105'
                    : 'border-emerald-500 bg-emerald-500/20 scale-110'
                }`}>
                  <span className="text-3xl font-display font-black text-white">{cadenceTime}s</span>
                  <span className="text-[9px] font-mono text-zinc-300 uppercase">Tempo</span>
                </div>

                <div className="text-center space-y-0.5">
                  <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                    {cadencePhase}
                  </span>
                  <p className="text-[11px] text-zinc-400 max-w-xs">
                    {cadencePhase.includes('Eccentric') && 'Lower the resistance slowly under control. Resist gravity for 3 full seconds.'}
                    {cadencePhase.includes('Isometric') && 'Hold peak stretch or lockout position without bouncing. Maintain tension.'}
                    {cadencePhase.includes('Concentric') && 'Drive explosively through the prime movers back to starting position.'}
                    {cadencePhase.includes('Reset') && 'Breathe deeply, reset posture, and initiate the next repetition.'}
                  </p>
                </div>
              </div>

              {/* Target Activation Gauge */}
              <div className="w-full bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">Target Muscle Engagement:</span>
                <span className="text-emerald-400 font-bold">{exercise.targetMuscle} (100% Tension)</span>
              </div>
            </div>
          )}
        </div>

        {/* Biomechanics & Coaching Cues Footer */}
        <div className="p-4 bg-[#16171A] border-t border-zinc-800 space-y-3 overflow-y-auto max-h-56">
          <div>
            <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block mb-1">
              Coaching Drill & Biomechanics Form Cues:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {exercise.formCues.map((cue, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-[#1D1E22] border border-zinc-800 flex items-start gap-2 text-xs"
                >
                  <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center shrink-0 text-[10px] font-bold">
                    {idx + 1}
                  </span>
                  <p className="text-zinc-300 text-[11px] leading-relaxed">
                    {cue}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 border-t border-zinc-800/80">
            <p className="text-[11px] text-zinc-400">
              <strong className="text-zinc-200">Coach Guidance:</strong> Keep tension sustained throughout the entire concentric drive and 3-second eccentric lower.
            </p>

            {onLogExercise && (
              <button
                onClick={() => {
                  onLogExercise(exercise);
                  onClose();
                }}
                id="btn-modal-log-exercise"
                className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-black text-xs font-display font-bold rounded-lg flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
              >
                <CheckCircle2 size={14} />
                <span>Log Exercise Routine</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
