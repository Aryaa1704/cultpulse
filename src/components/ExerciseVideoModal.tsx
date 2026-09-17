import React, { useState } from 'react';
import {
  X,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle2,
  Flame,
  Zap,
  Info,
  ExternalLink,
  ShieldCheck,
  Maximize2
} from 'lucide-react';
import { ExerciseItem } from '../data/exerciseDatabase';

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
  const [activeTab, setActiveTab] = useState<'video' | 'biomechanics'>('video');

  if (!isOpen || !exercise) return null;

  // Clean, distraction-free YouTube embed URL:
  // - autoplay=1, mute=1 (browsers allow autoplay only when muted)
  // - loop=1 with playlist set to videoEmbedId for continuous repetition
  // - controls=1, modestbranding=1, rel=0, iv_load_policy=3 (no annotations)
  // - showinfo=0, disablekb=1
  const cleanEmbedUrl = `https://www.youtube-nocookie.com/embed/${exercise.videoEmbedId}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${exercise.videoEmbedId}&controls=1&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0&disablekb=0&playsinline=1`;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121315] border border-zinc-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col text-white max-h-[94vh]">
        {/* Header Bar */}
        <div className="p-3.5 md:p-4 bg-[#18191C] border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-black flex items-center justify-center font-bold">
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

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Video Player Container with Watermark / Channel Masking */}
        <div className="relative bg-black flex flex-col items-center justify-center">
          {/* 
            MASKING TECHNIQUE:
            Container is strictly aspect-video and overflow-hidden.
            The iframe is offset -top-[12%] and height is set to 124% with scale-102.
            This mathematically crops out:
            1. YouTube top title bar & channel avatar/subscribe watermark
            2. Any top corner overlay promotions
            Furthermore, the CultPulse HUD overlay sits at top and bottom z-20.
          */}
          <div className="relative w-full aspect-video overflow-hidden bg-zinc-950">
            <iframe
              key={`${exercise.videoEmbedId}-${isMuted}`}
              src={cleanEmbedUrl}
              title={`${exercise.name} Movement Demonstration`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute -top-[12%] -left-[2%] w-[104%] h-[124%] border-0 object-cover pointer-events-auto"
            />

            {/* CultPulse Clean Form HUD Header (Crops out any residual YouTube channel branding) */}
            <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/90 via-black/60 to-transparent flex items-center justify-between pointer-events-none z-10">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] font-mono font-bold text-zinc-200 tracking-wider uppercase">
                  CultPulse Biomechanics Video Drill
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-mono text-amber-300 border border-amber-400/30">
                {exercise.defaultSets} Sets × {exercise.defaultRepsOrDuration}
              </span>
            </div>

            {/* CultPulse Bottom HUD Controls (Crops out bottom YouTube corner icons) */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between z-10 pointer-events-auto">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="px-2.5 py-1 rounded-md bg-black/70 hover:bg-black/90 border border-zinc-700/80 text-[11px] font-mono text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                  <span>{isMuted ? 'Unmute Audio' : 'Mute'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-300">
                <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                  <Flame size={11} />
                  ~{exercise.caloriesBurnPerHour} kcal/hr
                </span>
              </div>
            </div>
          </div>
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

          <div className="flex items-center justify-between pt-1">
            <p className="text-[11px] text-zinc-400">
              <strong className="text-zinc-200">Coach Form Tip:</strong> Keep tension sustained throughout the entire concentric and 3-second eccentric phase.
            </p>

            {onLogExercise && (
              <button
                onClick={() => {
                  onLogExercise(exercise);
                  onClose();
                }}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-black text-xs font-display font-bold rounded-lg flex items-center gap-1.5 transition-colors shrink-0"
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
