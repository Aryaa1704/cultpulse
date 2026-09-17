import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle2,
  Flame,
  Zap,
  ExternalLink,
  Activity,
  Tv,
  RefreshCw,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { ExerciseItem } from '../data/exerciseDatabase';
import { getCoachGender, setCoachGender, CoachGender } from '../services/coachPreference';

interface ExerciseVideoModalProps {
  exercise: ExerciseItem | null;
  isOpen: boolean;
  onClose: () => void;
  onLogExercise?: (exercise: ExerciseItem) => void;
}

export const ExerciseVideoModal: React.FC<ExerciseVideoModalProps> = ({
  exercise,
  isOpen,
  onClose,
  onLogExercise,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [coachGender, setLocalCoachGender] = useState<CoachGender>(getCoachGender());
  const [playerMode, setPlayerMode] = useState<'video' | 'cadence'>('video');
  const [cadencePhase, setCadencePhase] = useState<'Eccentric (Lowering)' | 'Peak Stretch' | 'Concentric (Drive)' | 'Reset'>('Eccentric (Lowering)');
  const [cadenceTime, setCadenceTime] = useState(3);
  const [repCount, setRepCount] = useState(1);
  const [iframeKey, setIframeKey] = useState(0);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const handleGenderChange = (e: any) => {
      if (e.detail?.gender) {
        setLocalCoachGender(e.detail.gender);
      }
    };
    window.addEventListener('cultpulse:coach-gender-change', handleGenderChange);
    return () => window.removeEventListener('cultpulse:coach-gender-change', handleGenderChange);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsPlaying(true);
      setImageError(false);
      setRepCount(1);
      setLocalCoachGender(getCoachGender());
    }
  }, [isOpen, exercise]);

  const handleToggleCoachGender = (newGender: CoachGender) => {
    setLocalCoachGender(newGender);
    setCoachGender(newGender);
    setIframeKey((k) => k + 1);
  };

  // Visual cadence animator for the Biomechanics coach
  useEffect(() => {
    if (!isOpen || playerMode !== 'cadence') return;

    const interval = setInterval(() => {
      setCadenceTime((prev) => {
        if (prev > 1) return prev - 1;
        
        // Phase transition
        setCadencePhase((currPhase) => {
          if (currPhase === 'Eccentric (Lowering)') {
            return 'Peak Stretch';
          } else if (currPhase === 'Peak Stretch') {
            return 'Concentric (Drive)';
          } else if (currPhase === 'Concentric (Drive)') {
            setRepCount((r) => r + 1);
            return 'Reset';
          } else {
            return 'Eccentric (Lowering)';
          }
        });
        return 3;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, playerMode]);

  if (!isOpen || !exercise) return null;

  // Choose gender-tailored video ID
  const activeVideoId =
    coachGender === 'female' && exercise.femaleVideoEmbedId
      ? exercise.femaleVideoEmbedId
      : exercise.videoEmbedId;

  const startSeconds = exercise.startSeconds || 6;

  // Primary standard YouTube embed URL with optimal flags, starting right past channel intro
  const primaryEmbedUrl = `https://www.youtube.com/embed/${activeVideoId}?start=${startSeconds}&autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}&loop=1&playlist=${activeVideoId}&controls=1&modestbranding=1&rel=0&playsinline=1&enablejsapi=1`;
  
  // High-def thumbnail options
  const hqThumbnail = `https://img.youtube.com/vi/${activeVideoId}/hqdefault.jpg`;
  const fallbackThumbnail = exercise.imageUrl || `https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80`;
  const currentThumbnail = imageError ? fallbackThumbnail : hqThumbnail;

  const handleOpenExternalVideo = () => {
    window.open(`https://www.youtube.com/watch?v=${activeVideoId}&t=${startSeconds}s`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121315] border border-zinc-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col text-white max-h-[94vh]">
        {/* Header Bar */}
        <div className="p-3.5 md:p-4 bg-[#18191C] border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-black flex items-center justify-center font-bold shadow-sm">
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
            {/* Direct Open in New Tab Button */}
            <button
              onClick={handleOpenExternalVideo}
              title="Open full HD video in YouTube (new tab)"
              className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors border border-zinc-700/60"
            >
              <ExternalLink size={13} />
              <span className="hidden sm:inline">Open in YouTube</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
              aria-label="Close modal"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Mode & Gender Selector Bar */}
        <div className="px-3.5 py-2 bg-[#151619] border-b border-zinc-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPlayerMode('video')}
              className={`px-3 py-1 rounded-md font-mono text-[11px] font-bold flex items-center gap-1.5 transition-colors ${
                playerMode === 'video'
                  ? 'bg-amber-400 text-black shadow-2xs'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
              }`}
            >
              <Tv size={12} />
              <span>Video Demonstration</span>
            </button>

            <button
              onClick={() => setPlayerMode('cadence')}
              className={`px-3 py-1 rounded-md font-mono text-[11px] font-bold flex items-center gap-1.5 transition-colors ${
                playerMode === 'cadence'
                  ? 'bg-amber-400 text-black shadow-2xs'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
              }`}
            >
              <Activity size={12} />
              <span>Tempo & Cadence Coach</span>
            </button>
          </div>

          {/* Gender Coach Selector */}
          <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded-lg border border-zinc-800">
            <span className="text-[10px] font-mono text-zinc-400 px-1.5 hidden sm:inline">Trainer:</span>
            <button
              onClick={() => handleToggleCoachGender('male')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold flex items-center gap-1 transition-colors ${
                coachGender === 'male'
                  ? 'bg-amber-400 text-black shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>👨 Male</span>
            </button>
            <button
              onClick={() => handleToggleCoachGender('female')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold flex items-center gap-1 transition-colors ${
                coachGender === 'female'
                  ? 'bg-amber-400 text-black shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>👩 Female</span>
            </button>
          </div>
        </div>

        {/* Video Player & Media Container */}
        <div className="relative bg-black flex flex-col items-center justify-center">
          {playerMode === 'video' ? (
            <div className="relative w-full aspect-video overflow-hidden bg-zinc-950">
              {/* If user hasn't clicked play, show the poster thumbnail */}
              {!isPlaying ? (
                <div 
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 cursor-pointer group"
                >
                  <img
                    src={currentThumbnail}
                    alt={exercise.name}
                    onError={() => setImageError(true)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors flex flex-col items-center justify-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <Play size={26} fill="currentColor" className="ml-1" />
                    </div>
                    <span className="px-3 py-1 bg-black/70 backdrop-blur-md rounded-full text-xs font-mono font-bold text-amber-300 border border-amber-400/40">
                      Click to Stream {coachGender === 'female' ? 'Female' : 'Male'} Movement Drill
                    </span>
                  </div>
                </div>
              ) : (
                <iframe
                  key={`${activeVideoId}-${iframeKey}-${isMuted}`}
                  src={primaryEmbedUrl}
                  title={`${exercise.name} Movement Demonstration`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute -top-[12%] -left-[2%] w-[104%] h-[124%] border-0 object-cover pointer-events-auto"
                />
              )}

              {/* Top HUD Overlay (Completely masks YouTube top channel/title bar) */}
              <div className="absolute top-0 left-0 right-0 py-2.5 px-3 bg-gradient-to-b from-black via-black/80 to-transparent flex items-center justify-between pointer-events-none z-10">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[10px] font-mono font-bold text-zinc-200 tracking-wider uppercase">
                    CultPulse Biomechanics Drill • {coachGender === 'female' ? 'Female Coach' : 'Male Coach'}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-mono text-amber-300 border border-amber-400/30">
                  {exercise.defaultSets} Sets × {exercise.defaultRepsOrDuration}
                </span>
              </div>

              {/* Bottom HUD Controls (Completely masks YouTube corner logo/buttons) */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-between z-10 pointer-events-auto">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="px-2.5 py-1 rounded-md bg-black/80 hover:bg-black border border-zinc-700/80 text-[11px] font-mono text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                    {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                    <span>{isMuted ? 'Unmute Audio' : 'Muted'}</span>
                  </button>

                  <button
                    onClick={() => setIframeKey((k) => k + 1)}
                    title="Reload video player (skips intro)"
                    className="p-1 rounded-md bg-black/80 hover:bg-black border border-zinc-700/80 text-zinc-400 hover:text-white transition-colors"
                  >
                    <RefreshCw size={13} />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-300">
                  <button
                    onClick={handleOpenExternalVideo}
                    className="px-2.5 py-1 rounded-md bg-amber-400 hover:bg-amber-500 text-black font-bold flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink size={11} />
                    <span>Watch Fullscreen</span>
                  </button>
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
                  Active Repetition: <strong className="text-amber-400 text-sm">#{repCount}</strong>
                </span>
              </div>

              {/* Pulsing Visual Tempo Circle */}
              <div className="flex flex-col items-center justify-center space-y-3 my-auto">
                <div className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-700 shadow-2xl ${
                  cadencePhase.includes('Eccentric')
                    ? 'border-blue-500 bg-blue-500/10 scale-95'
                    : cadencePhase.includes('Stretch')
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
                    {cadencePhase.includes('Stretch') && 'Hold the deep stretch position without bouncing. Maximize muscle fiber tension.'}
                    {cadencePhase.includes('Concentric') && 'Drive explosively through the prime movers back to starting position.'}
                    {cadencePhase.includes('Reset') && 'Breathe in, reset spinal posture, and begin the next repetition.'}
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
              <strong className="text-zinc-200">Coach Form Tip:</strong> Keep tension sustained throughout the entire concentric and 3-second eccentric phase.
            </p>

            {onLogExercise && (
              <button
                onClick={() => {
                  onLogExercise(exercise);
                  onClose();
                }}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-black text-xs font-display font-bold rounded-lg flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
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
