import React, { useState, useEffect, useMemo } from 'react';
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
  Activity,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Maximize2,
} from 'lucide-react';
import { Drill, WorkoutProtocol } from '../types';
import { liveDrills } from '../data/mockData';
import { getCoachGender, setCoachGender, CoachGender } from '../services/coachPreference';
import { ExerciseVideoModal } from './ExerciseVideoModal';
import { ExerciseItem, comprehensiveExerciseDatabase } from '../data/exerciseDatabase';

interface LiveSessionViewProps {
  currentProtocol?: WorkoutProtocol | null;
  activeUserName?: string | null;
  onEndSession: (caloriesBurned: number) => void;
  onOpenAIForm: () => void;
}

export const LiveSessionView: React.FC<LiveSessionViewProps> = ({
  currentProtocol,
  activeUserName,
  onEndSession,
  onOpenAIForm,
}) => {
  // Derive protocol-specific drills based on modality
  const dynamicDrills: Drill[] = useMemo(() => {
    const modality = currentProtocol?.modality || 'HIIT';

    if (modality === 'Dance') {
      return [
        {
          id: 'dance-1',
          number: '01/06',
          name: 'Warm-up Cardio Rhythm Bounce',
          sets: 2,
          workSeconds: 45,
          load: 'Bodyweight',
          impact: 'LOW IMPACT',
          imageUrl:
            'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&auto=format&fit=crop&q=80',
          videoEmbedId: 'gCzgc_RelBA',
          femaleVideoEmbedId: 'ZWk19OVon2k',
          startSeconds: 5,
        },
        {
          id: 'dance-2',
          number: '02/06',
          name: 'Fast Salsa Step & Cross Reach',
          sets: 3,
          workSeconds: 45,
          load: 'High Tempo',
          impact: 'MODERATE',
          imageUrl:
            'https://images.unsplash.com/photo-1547153760-18fc86324498?w=400&auto=format&fit=crop&q=80',
          videoEmbedId: 'oa_82zS7d-0',
          femaleVideoEmbedId: 'm4n07nIqKFc',
          startSeconds: 6,
        },
        {
          id: 'dance-3',
          number: '03/06',
          name: 'Afrobeat Hip Rolls & Lateral Slide',
          sets: 3,
          workSeconds: 45,
          load: 'Bodyweight',
          impact: 'MODERATE',
          imageUrl:
            'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80',
          videoEmbedId: 'ZWk19OVon2k',
          femaleVideoEmbedId: '7P2r6Yp8G5I',
          startSeconds: 5,
        },
        {
          id: 'dance-4',
          number: '04/06',
          name: 'Cardio Chassé & High Knee Jumps',
          sets: 3,
          workSeconds: 45,
          load: 'High Intensity',
          impact: 'HIGH IMPACT',
          imageUrl:
            'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=400&auto=format&fit=crop&q=80',
          videoEmbedId: 'gCzgc_RelBA',
          femaleVideoEmbedId: 'ZWk19OVon2k',
          startSeconds: 8,
        },
        {
          id: 'dance-5',
          number: '05/06',
          name: 'Groove Drop & Floor Sweep',
          sets: 2,
          workSeconds: 45,
          load: 'Bodyweight',
          impact: 'MODERATE',
          imageUrl:
            'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&auto=format&fit=crop&q=80',
          videoEmbedId: 'oa_82zS7d-0',
          femaleVideoEmbedId: 'm4n07nIqKFc',
          startSeconds: 6,
        },
        {
          id: 'dance-6',
          number: '06/06',
          name: 'Cooldown Harmonic Breathing & Stretch',
          sets: 1,
          workSeconds: 60,
          load: 'Recovery',
          impact: 'LOW IMPACT',
          imageUrl:
            'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&auto=format&fit=crop&q=80',
          videoEmbedId: 'sTANio_2E0Q',
          femaleVideoEmbedId: 'sTANio_2E0Q',
          startSeconds: 5,
        },
      ];
    }

    if (modality === 'Strength') {
      return [
        {
          id: 'str-1',
          number: '01/06',
          name: 'Deep Barbell / Dumbbell Squats',
          sets: 4,
          workSeconds: 45,
          load: '16kg - 24kg',
          impact: 'HIGH IMPACT',
          imageUrl:
            'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&auto=format&fit=crop&q=80',
          videoEmbedId: 'bEv6CCg2BC8',
          femaleVideoEmbedId: 'aclHkVaku9U',
          startSeconds: 6,
        },
        {
          id: 'str-2',
          number: '02/06',
          name: 'Romanian Deadlifts (Posterior Chain)',
          sets: 3,
          workSeconds: 45,
          load: '20kg - 30kg',
          impact: 'MODERATE',
          imageUrl:
            'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&auto=format&fit=crop&q=80',
          videoEmbedId: 'JCXUYuzwNrM',
          femaleVideoEmbedId: 'UItWltVZZmE',
          startSeconds: 8,
        },
        {
          id: 'str-3',
          number: '03/06',
          name: 'Standing Overhead Military Press',
          sets: 3,
          workSeconds: 45,
          load: '12kg - 18kg',
          impact: 'HIGH IMPACT',
          imageUrl:
            'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&auto=format&fit=crop&q=80',
          videoEmbedId: '2yjwXTZQDDI',
          femaleVideoEmbedId: 'qEwKCR5JCog',
          startSeconds: 6,
        },
        {
          id: 'str-4',
          number: '04/06',
          name: 'Bent-Over Dumbbell Rows',
          sets: 3,
          workSeconds: 45,
          load: '14kg - 20kg',
          impact: 'MODERATE',
          imageUrl:
            'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&auto=format&fit=crop&q=80',
          videoEmbedId: 'roCP6wCXPqo',
          femaleVideoEmbedId: '2m8VpS5s7U0',
          startSeconds: 5,
        },
        {
          id: 'str-5',
          number: '05/06',
          name: 'Tempo Push-Ups with 2s Isometric Hold',
          sets: 3,
          workSeconds: 45,
          load: 'Bodyweight',
          impact: 'MODERATE',
          imageUrl:
            'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&auto=format&fit=crop&q=80',
          videoEmbedId: 'IODxDxX7oi4',
          femaleVideoEmbedId: 'W4sF5tWvI_w',
          startSeconds: 6,
        },
        {
          id: 'str-6',
          number: '06/06',
          name: 'Core Hollow Body Hold & Plank',
          sets: 2,
          workSeconds: 45,
          load: 'Bodyweight',
          impact: 'LOW IMPACT',
          imageUrl:
            'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&auto=format&fit=crop&q=80',
          videoEmbedId: 'pSHjTRCQxIw',
          femaleVideoEmbedId: 'ASdvN_XEl_c',
          startSeconds: 5,
        },
      ];
    }

    if (modality === 'Mobility / Yoga') {
      return [
        {
          id: 'yoga-1',
          number: '01/06',
          name: 'Sun Salutation & Downward Dog Flow',
          sets: 2,
          workSeconds: 50,
          load: 'Bodyweight',
          impact: 'LOW IMPACT',
          imageUrl:
            'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&auto=format&fit=crop&q=80',
          videoEmbedId: 'g_tea8ZNk5A',
          femaleVideoEmbedId: 'sTANio_2E0Q',
          startSeconds: 5,
        },
        {
          id: 'yoga-2',
          number: '02/06',
          name: 'Low Lunge Hip Flexor Deep Opener',
          sets: 2,
          workSeconds: 50,
          load: 'Flexibility',
          impact: 'LOW IMPACT',
          imageUrl:
            'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&auto=format&fit=crop&q=80',
          videoEmbedId: 'g_tea8ZNk5A',
          femaleVideoEmbedId: 'sTANio_2E0Q',
          startSeconds: 15,
        },
        {
          id: 'yoga-3',
          number: '03/06',
          name: 'Warrior II & Reverse Warrior Hold',
          sets: 2,
          workSeconds: 45,
          load: 'Isometric',
          impact: 'LOW IMPACT',
          imageUrl:
            'https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?w=400&auto=format&fit=crop&q=80',
          videoEmbedId: '2Y24b4Oq3gY',
          femaleVideoEmbedId: 'sTANio_2E0Q',
          startSeconds: 6,
        },
        {
          id: 'yoga-4',
          number: '04/06',
          name: 'Pigeon Pose Glute & Piriformis Release',
          sets: 2,
          workSeconds: 50,
          load: 'Flexibility',
          impact: 'LOW IMPACT',
          imageUrl:
            'https://images.unsplash.com/photo-1552196563-552361a45935?w=400&auto=format&fit=crop&q=80',
          videoEmbedId: 'g_tea8ZNk5A',
          femaleVideoEmbedId: 'sTANio_2E0Q',
          startSeconds: 25,
        },
        {
          id: 'yoga-5',
          number: '05/06',
          name: 'Thoracic Windmill & Spine Twist',
          sets: 2,
          workSeconds: 45,
          load: 'Mobility',
          impact: 'LOW IMPACT',
          imageUrl:
            'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&auto=format&fit=crop&q=80',
          videoEmbedId: 'g_tea8ZNk5A',
          femaleVideoEmbedId: 'sTANio_2E0Q',
          startSeconds: 35,
        },
        {
          id: 'yoga-6',
          number: '06/06',
          name: 'Savasana Guided Recovery Breath',
          sets: 1,
          workSeconds: 60,
          load: 'Parasympathetic',
          impact: 'LOW IMPACT',
          imageUrl:
            'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&auto=format&fit=crop&q=80',
          videoEmbedId: 'g_tea8ZNk5A',
          femaleVideoEmbedId: 'sTANio_2E0Q',
          startSeconds: 45,
        },
      ];
    }

    // Default: HIIT & Conditioning
    return liveDrills && liveDrills.length > 0
      ? liveDrills
      : [
          {
            id: 'hiit-1',
            number: '01/06',
            name: 'Explosive High Knees Burst',
            sets: 3,
            workSeconds: 45,
            load: 'Cardio Max',
            impact: 'HIGH IMPACT',
            imageUrl:
              'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80',
            videoEmbedId: 'OAJ_J3EZrx8',
            femaleVideoEmbedId: '8opcQdC-5gk',
            startSeconds: 6,
          },
          {
            id: 'hiit-2',
            number: '02/06',
            name: 'Dumbbell Thrusters (Squat to Press)',
            sets: 3,
            workSeconds: 45,
            load: '10kg - 16kg',
            impact: 'HIGH IMPACT',
            imageUrl:
              'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&auto=format&fit=crop&q=80',
            videoEmbedId: 'L219ltL15zk',
            femaleVideoEmbedId: 'M0u_QW_v7nI',
            startSeconds: 6,
          },
          {
            id: 'hiit-3',
            number: '03/06',
            name: 'Full Chest-to-Floor Burpees',
            sets: 3,
            workSeconds: 45,
            load: 'Bodyweight',
            impact: 'HIGH IMPACT',
            imageUrl:
              'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=400&auto=format&fit=crop&q=80',
            videoEmbedId: '1ExU8CRl4eU',
            femaleVideoEmbedId: '1B_mZ1h0l4M',
            startSeconds: 6,
          },
          {
            id: 'hiit-4',
            number: '04/06',
            name: 'Rapid Mountain Climbers',
            sets: 3,
            workSeconds: 45,
            load: 'Core Speed',
            impact: 'HIGH IMPACT',
            imageUrl:
              'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400&auto=format&fit=crop&q=80',
            videoEmbedId: 'de_tv0WjK54',
            femaleVideoEmbedId: 'nmwgirgXLYM',
            startSeconds: 5,
          },
          {
            id: 'hiit-5',
            number: '05/06',
            name: 'Kettlebell / Dumbbell Speed Swings',
            sets: 3,
            workSeconds: 45,
            load: '16kg - 20kg',
            impact: 'MODERATE',
            imageUrl:
              'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80',
            videoEmbedId: 'roCP6wCXPqo',
            femaleVideoEmbedId: '2m8VpS5s7U0',
            startSeconds: 5,
          },
          {
            id: 'hiit-6',
            number: '06/06',
            name: 'Plank Shoulder Taps & Hold',
            sets: 2,
            workSeconds: 45,
            load: 'Core Stability',
            impact: 'LOW IMPACT',
            imageUrl:
              'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&auto=format&fit=crop&q=80',
            videoEmbedId: 'pSHjTRCQxIw',
            femaleVideoEmbedId: 'ASdvN_XEl_c',
            startSeconds: 5,
          },
        ];
  }, [currentProtocol]);

  const totalDuration = (currentProtocol?.duration || 20) * 60;
  const protocolCalories = currentProtocol?.calories || 320;
  const instructor = currentProtocol?.instructor || 'Coach';
  const resolvedAthleteName = activeUserName?.split(' ')[0] || 'Athlete';

  const [isPlaying, setIsPlaying] = useState(true);
  const [secondsRemaining, setSecondsRemaining] = useState(45);
  const [totalSecondsRemaining, setTotalSecondsRemaining] = useState(totalDuration);
  const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);

  // Coach Gender preference & video controls
  const [coachGender, setLocalCoachGender] = useState<CoachGender>(getCoachGender());
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [selectedExerciseForModal, setSelectedExerciseForModal] = useState<ExerciseItem | null>(null);

  useEffect(() => {
    const handleGenderChange = (e: any) => {
      if (e.detail?.gender) {
        setLocalCoachGender(e.detail.gender);
      }
    };
    window.addEventListener('cultpulse:coach-gender-change', handleGenderChange);
    return () => window.removeEventListener('cultpulse:coach-gender-change', handleGenderChange);
  }, []);

  const handleToggleCoachGender = (newGender: CoachGender) => {
    setLocalCoachGender(newGender);
    setCoachGender(newGender);
    setIframeKey((k) => k + 1);
  };

  // Dynamic real-time telemetry starting at authentic values:
  // Heart rate starts at warmup rate (115 BPM) and rises naturally with intervals
  const [heartRate, setHeartRate] = useState(115);
  // Active calories start at 0 and accrue in real-time as user exercises
  const [activeCalories, setActiveCalories] = useState(0);
  const [isVoiceOn, setIsVoiceOn] = useState(true);

  // Dynamic Coach Cues with real instructor and athlete names
  const coachCues = useMemo(() => {
    return [
      `${instructor.toUpperCase()}: "3, 2, 1... Push the pace, ${resolvedAthleteName}!"`,
      `${instructor.toUpperCase()}: "Keep your core braced and breathe, ${resolvedAthleteName}!"`,
      `${instructor.toUpperCase()}: "Drive through your heels, beautiful form ${resolvedAthleteName}!"`,
      `${instructor.toUpperCase()}: "15 seconds left in this round, stay relentless!"`,
      `${instructor.toUpperCase()}: "Exhale on exertion, inhale on the reset, ${resolvedAthleteName}!"`,
      `${instructor.toUpperCase()}: "Great energy! Finish this interval strong!"`,
    ];
  }, [instructor, resolvedAthleteName]);

  const [coachCue, setCoachCue] = useState(coachCues[0]);

  const currentDrill: Drill = dynamicDrills[currentDrillIndex] || dynamicDrills[0];
  const nextDrill: Drill | undefined = dynamicDrills[currentDrillIndex + 1];

  // Resolve current active video embed ID based on drill and selected coach gender
  const activeVideoId = useMemo(() => {
    if (coachGender === 'female' && currentDrill.femaleVideoEmbedId) {
      return currentDrill.femaleVideoEmbedId;
    }
    if (currentDrill.videoEmbedId) {
      return currentDrill.videoEmbedId;
    }
    if (coachGender === 'female' && currentProtocol?.femaleVideoEmbedId) {
      return currentProtocol.femaleVideoEmbedId;
    }
    return currentProtocol?.videoEmbedId || 'OAJ_J3EZrx8';
  }, [coachGender, currentDrill, currentProtocol]);

  const startSeconds = currentDrill.startSeconds || currentProtocol?.startSeconds || 6;
  const embedUrl = `https://www.youtube.com/embed/${activeVideoId}?start=${startSeconds}&autoplay=${isPlaying ? 1 : 0}&mute=${isAudioMuted ? 1 : 0}&loop=1&playlist=${activeVideoId}&controls=1&modestbranding=1&rel=0&playsinline=1&enablejsapi=1`;
  const hqThumbnail = `https://img.youtube.com/vi/${activeVideoId}/hqdefault.jpg`;

  // Timer interval simulation
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            // Next drill or set
            if (currentDrillIndex < dynamicDrills.length - 1) {
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

        // Real-time calorie accumulation based on protocol burn rate
        setActiveCalories((prev) => {
          const burnPerSecond = protocolCalories / Math.max(300, totalDuration);
          const newKcal = prev + burnPerSecond;
          return Math.round(newKcal * 10) / 10;
        });

        // Dynamic physiological heart rate calculation
        setHeartRate((prev) => {
          // Warm up gradually towards target zone (135 - 165 BPM)
          const targetHR = 145 + Math.sin(Date.now() / 6000) * 12;
          const step = (targetHR - prev) * 0.08 + (Math.random() * 2 - 1);
          return Math.min(172, Math.max(108, Math.round(prev + step)));
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentDrillIndex, dynamicDrills.length, protocolCalories, totalDuration]);

  // Coach cues rotation
  useEffect(() => {
    const cueTimer = setInterval(() => {
      if (isPlaying && isVoiceOn) {
        setCoachCue(coachCues[Math.floor(Math.random() * coachCues.length)]);
      }
    }, 11000);
    return () => clearInterval(cueTimer);
  }, [isPlaying, isVoiceOn, coachCues]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handlePrevDrill = () => {
    if (currentDrillIndex > 0) {
      setCurrentDrillIndex((prev) => prev - 1);
      setSecondsRemaining(45);
    }
  };

  const handleNextDrill = () => {
    if (currentDrillIndex < dynamicDrills.length - 1) {
      setCurrentDrillIndex((prev) => prev + 1);
      setSecondsRemaining(45);
    }
  };

  const handleRewind10 = () => {
    setSecondsRemaining((prev) => Math.min(60, prev + 10));
  };

  const handleForward10 = () => {
    setSecondsRemaining((prev) => Math.max(1, prev - 10));
  };

  const handleOpenDetailedModal = () => {
    const matched = comprehensiveExerciseDatabase.find(
      (e) => e.name.toLowerCase().includes(currentDrill.name.toLowerCase()) || currentDrill.name.toLowerCase().includes(e.name.toLowerCase())
    );
    if (matched) {
      setSelectedExerciseForModal(matched);
    } else {
      setSelectedExerciseForModal({
        id: currentDrill.id,
        name: currentDrill.name,
        muscleGroup: 'Full Body',
        category: 'Strength',
        targetMuscle: 'Prime Movers & Core',
        equipment: currentDrill.load || 'Bodyweight',
        difficulty: 'Intermediate',
        defaultSets: currentDrill.sets,
        defaultRepsOrDuration: `${currentDrill.workSeconds}s`,
        caloriesBurnPerHour: 420,
        videoEmbedId: activeVideoId,
        femaleVideoEmbedId: currentDrill.femaleVideoEmbedId,
        startSeconds: startSeconds,
        imageUrl: currentDrill.imageUrl,
        description: `High-intensity movement drill designed to build cardiovascular resilience, muscular endurance, and neuromuscular coordination.`,
        formCues: [
          'Maintain a braced core with neutral lumbar spine alignment.',
          'Control both concentric driving phase and eccentric lowering tempo.',
          'Maintain rhythmic breathing: exhale during exertion, inhale during recovery.',
        ],
      });
    }
  };

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-200">
      {/* Session Title & Modality Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-[11px] font-mono tracking-wider font-bold text-red-600 dark:text-red-400 uppercase">
              LIVE TRAINING PROTOCOL
            </span>
          </div>
          <h2 className="font-display font-bold text-lg text-[#1B1C1C] dark:text-white">
            {currentProtocol ? currentProtocol.title : 'High Octane Metabolic Blast'}
          </h2>
          <div className="text-xs text-[#767676] dark:text-zinc-400">
            Instructor: <span className="font-semibold text-[#1B1C1C] dark:text-white">{instructor}</span> • Athlete: <span className="font-semibold text-[#1B1C1C] dark:text-white">{resolvedAthleteName}</span>
          </div>
        </div>

        {/* Coach Gender Switcher in Top Bar */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-[#1C1C1E] p-1 rounded-xl border border-[#E5E5E5] dark:border-neutral-800 shadow-2xs">
          <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 px-1 hidden sm:inline">Trainer:</span>
          <button
            onClick={() => handleToggleCoachGender('male')}
            className={`px-2 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-colors ${
              coachGender === 'male'
                ? 'bg-amber-400 text-black shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <span>👨 Male</span>
          </button>
          <button
            onClick={() => handleToggleCoachGender('female')}
            className={`px-2 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-colors ${
              coachGender === 'female'
                ? 'bg-amber-400 text-black shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <span>👩 Female</span>
          </button>
        </div>
      </div>

      {/* Real-time Telemetry Strip (3 cards in 1 row) */}
      <div className="grid grid-cols-3 gap-2 bg-white dark:bg-[#1C1C1E] border border-[#E5E5E5] dark:border-neutral-800 rounded-xl p-3 shadow-2xs">
        {/* Heart Rate */}
        <div className="flex items-center gap-2 border-r border-[#E5E5E5] dark:border-neutral-800 pr-2">
          <div className="w-8 h-8 rounded-md bg-[#FBF9F9] dark:bg-neutral-900 border border-[#E5E5E5] dark:border-neutral-700 flex items-center justify-center text-[#242424] dark:text-neutral-200 shrink-0">
            <Heart size={16} className="text-red-600 animate-pulse" />
          </div>
          <div>
            <div className="font-display font-bold text-sm text-[#1B1C1C] dark:text-neutral-100 flex items-baseline gap-1">
              <span>{heartRate}</span>
              <span className="text-[10px] font-mono text-[#767676] dark:text-neutral-400">BPM</span>
            </div>
            <div className="text-[10px] text-[#767676] dark:text-neutral-400 truncate">
              {heartRate > 150 ? 'Zone 4 (Peak)' : heartRate > 130 ? 'Zone 3 (Aerobic)' : 'Zone 2 (Warmup)'}
            </div>
          </div>
        </div>

        {/* Burned Real-Time */}
        <div className="flex items-center gap-2 border-r border-[#E5E5E5] dark:border-neutral-800 px-2">
          <div className="w-8 h-8 rounded-md bg-[#FBF9F9] dark:bg-neutral-900 border border-[#E5E5E5] dark:border-neutral-700 flex items-center justify-center text-[#242424] dark:text-neutral-200 shrink-0">
            <Flame size={16} className="text-amber-600" />
          </div>
          <div>
            <div className="font-display font-bold text-sm text-[#1B1C1C] dark:text-neutral-100 flex items-baseline gap-1">
              <span>{Math.round(activeCalories)}</span>
              <span className="text-[10px] font-mono text-[#767676] dark:text-neutral-400">KCAL</span>
            </div>
            <div className="text-[10px] text-[#767676] dark:text-neutral-400 truncate">Active Burn</div>
          </div>
        </div>

        {/* Remaining Time */}
        <div className="flex items-center gap-2 pl-2">
          <div className="w-8 h-8 rounded-md bg-[#FBF9F9] dark:bg-neutral-900 border border-[#E5E5E5] dark:border-neutral-700 flex items-center justify-center text-[#242424] dark:text-neutral-200 shrink-0">
            <Clock size={16} className="text-[#4A4A4A] dark:text-neutral-400" />
          </div>
          <div>
            <div className="font-display font-bold text-sm text-[#1B1C1C] dark:text-neutral-100">
              {formatTime(totalSecondsRemaining)}
            </div>
            <div className="text-[10px] font-mono text-[#767676] dark:text-neutral-400 uppercase">REMAINING</div>
          </div>
        </div>
      </div>

      {/* Video Workout Stage - Interactive Video Stream Player */}
      <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-black border border-[#E5E5E5] dark:border-zinc-800 shadow-md">
        {isPlaying ? (
          /* Live Streaming Video Iframe with Anti-Branding Crop */
          <div className="relative w-full h-full overflow-hidden bg-black">
            <iframe
              key={`${activeVideoId}-${currentDrillIndex}-${iframeKey}-${isAudioMuted}`}
              src={embedUrl}
              title={`${currentDrill.name} Demonstration`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute -top-[12%] -left-[2%] w-[104%] h-[124%] border-0 object-cover pointer-events-auto"
            />
          </div>
        ) : (
          /* Poster View when paused */
          <div className="relative w-full h-full bg-black cursor-pointer group" onClick={() => setIsPlaying(true)}>
            <img
              src={hqThumbnail}
              alt={currentDrill.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src = currentDrill.imageUrl;
              }}
              className="w-full h-full object-cover brightness-85 group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex flex-col items-center justify-center gap-2">
              <div className="w-14 h-14 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                <Play size={24} fill="currentColor" className="ml-1" />
              </div>
              <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-xs font-mono font-bold text-amber-300 border border-amber-400/30">
                Click to Resume {coachGender === 'female' ? 'Female' : 'Male'} Video Stream
              </span>
            </div>
          </div>
        )}

        {/* Top Overlay Strip (Completely covers YouTube title & channel brand) */}
        <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black via-black/80 to-transparent flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-xs font-display font-bold text-white tracking-wide">
              {currentDrill.name}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white/15 backdrop-blur-md text-[10px] font-mono text-amber-300 border border-white/20">
              {coachGender === 'female' ? 'Female Coach' : 'Male Coach'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              onClick={handleOpenDetailedModal}
              title="Full Biomechanics & Form Analysis"
              className="px-2.5 py-1 rounded-lg bg-black/80 hover:bg-black border border-white/20 text-white text-[11px] font-mono font-semibold flex items-center gap-1 transition-colors"
            >
              <Maximize2 size={12} />
              <span className="hidden sm:inline">Biomechanics Cues</span>
            </button>
          </div>
        </div>

        {/* Bottom HUD Controls (Completely covers YouTube bottom corner logo & provides live toggles) */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/85 to-transparent flex items-center justify-between z-10 pointer-events-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              title={isAudioMuted ? 'Unmute Video Audio' : 'Mute Video Audio'}
              className="px-2.5 py-1 rounded-lg bg-black/80 hover:bg-black border border-white/20 text-[11px] font-mono text-zinc-200 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              {isAudioMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
              <span>{isAudioMuted ? 'Unmute Drill' : 'Muted'}</span>
            </button>

            <button
              onClick={() => setIframeKey((k) => k + 1)}
              title="Reload Drill Video (Skips Intro)"
              className="p-1.5 rounded-lg bg-black/80 hover:bg-black border border-white/20 text-zinc-300 hover:text-white transition-colors"
            >
              <RefreshCw size={13} />
            </button>
          </div>

          {/* Audio Coach Cue Bar */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-black/80 border border-white/15 text-white/90 text-[11px] font-mono max-w-sm truncate">
            <Volume2 size={13} className="text-amber-400 shrink-0" />
            <span className="truncate">{coachCue}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleToggleCoachGender(coachGender === 'male' ? 'female' : 'male')}
              title="Switch between Male and Female coach video"
              className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-500 text-black text-[11px] font-mono font-bold flex items-center gap-1 transition-colors shadow-xs"
            >
              <span>{coachGender === 'female' ? 'Switch to 👨 Male' : 'Switch to 👩 Female'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interval Progress Bar & Status */}
      <div className="bg-white dark:bg-[#1C1C1E] border border-[#E5E5E5] dark:border-neutral-800 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono font-semibold tracking-wider text-[#1B1C1C] dark:text-neutral-100">
            WORK (45S)
          </span>
          <span className="text-[#767676] dark:text-neutral-400 font-medium">
            Drill {currentDrillIndex + 1} of {dynamicDrills.length} • Set {currentSet}/3
          </span>
          <span className="font-mono text-[#767676] dark:text-neutral-400">REST (15S)</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#E5E5E5] dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#242424] dark:bg-amber-400 h-full transition-all duration-300"
            style={{ width: `${Math.max(5, ((45 - secondsRemaining) / 45) * 100)}%` }}
          ></div>
        </div>

        {/* Interval Timer Big Display */}
        <div className="flex items-end justify-between pt-1">
          <div>
            <div className="text-[10px] font-mono tracking-widest text-[#767676] dark:text-neutral-400 uppercase">
              INTERVAL TIMER
            </div>
            <div className="font-display font-bold text-3xl md:text-4xl text-[#1B1C1C] dark:text-neutral-100 tracking-tight">
              00:{secondsRemaining.toString().padStart(2, '0')}{' '}
              <span className="text-sm font-mono text-[#767676] dark:text-neutral-400 font-medium">SEC</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-mono tracking-widest text-[#767676] dark:text-neutral-400 uppercase">
              CURRENT DRILL
            </div>
            <div className="font-display font-semibold text-sm md:text-base text-[#1B1C1C] dark:text-neutral-200 truncate max-w-[200px]">
              {currentDrill.name}
            </div>
            <div className="text-[11px] text-[#767676] dark:text-zinc-400">
              {currentDrill.load} • {currentDrill.impact}
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
          title="Previous Drill"
          className="w-10 h-10 rounded-full border border-[#E5E5E5] dark:border-neutral-700 bg-white dark:bg-neutral-800 flex items-center justify-center text-[#242424] dark:text-neutral-200 hover:bg-[#F2F2F2] dark:hover:bg-neutral-700 transition-colors disabled:opacity-40"
        >
          <SkipBack size={16} />
        </button>

        {/* Rewind 10s */}
        <button
          onClick={handleRewind10}
          title="Rewind 10 seconds"
          className="w-10 h-10 rounded-full border border-[#E5E5E5] dark:border-neutral-700 bg-white dark:bg-neutral-800 flex items-center justify-center text-[#242424] dark:text-neutral-200 hover:bg-[#F2F2F2] dark:hover:bg-neutral-700 transition-colors"
        >
          <RotateCcw size={16} />
        </button>

        {/* Play/Pause Main Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          id="btn-play-pause-live"
          title={isPlaying ? 'Pause Session' : 'Resume Session'}
          className="w-14 h-14 rounded-full bg-[#242424] dark:bg-amber-400 text-white dark:text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" fill="currentColor" />}
        </button>

        {/* Forward 10s */}
        <button
          onClick={handleForward10}
          title="Fast Forward 10 seconds"
          className="w-10 h-10 rounded-full border border-[#E5E5E5] dark:border-neutral-700 bg-white dark:bg-neutral-800 flex items-center justify-center text-[#242424] dark:text-neutral-200 hover:bg-[#F2F2F2] dark:hover:bg-neutral-700 transition-colors"
        >
          <RotateCw size={16} />
        </button>

        {/* Next Drill */}
        <button
          onClick={handleNextDrill}
          disabled={currentDrillIndex >= dynamicDrills.length - 1}
          title="Next Drill"
          className="w-10 h-10 rounded-full border border-[#E5E5E5] dark:border-neutral-700 bg-white dark:bg-neutral-800 flex items-center justify-center text-[#242424] dark:text-neutral-200 hover:bg-[#F2F2F2] dark:hover:bg-neutral-700 transition-colors disabled:opacity-40"
        >
          <SkipForward size={16} />
        </button>
      </div>

      {/* Up Next Drill Preview Card */}
      {nextDrill && (
        <div className="bg-[#FBF9F9] dark:bg-neutral-900/60 border border-[#E5E5E5] dark:border-neutral-800 rounded-xl p-3.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white dark:bg-neutral-800 border border-[#E5E5E5] dark:border-neutral-700 flex items-center justify-center text-[#4A4A4A] dark:text-neutral-300 shrink-0">
              <Dumbbell size={18} />
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#767676] dark:text-neutral-400 uppercase">
                UP NEXT • 00:15 Transition
              </div>
              <div className="font-semibold text-xs text-[#1B1C1C] dark:text-neutral-100">{nextDrill.name}</div>
              <div className="text-[11px] text-[#767676] dark:text-neutral-400">
                Drill {currentDrillIndex + 2} of {dynamicDrills.length} • {nextDrill.load}
              </div>
            </div>
          </div>

          <button
            onClick={() => setCurrentDrillIndex(currentDrillIndex + 1)}
            aria-label="Preview next drill"
            className="w-8 h-8 rounded-full border border-[#E5E5E5] dark:border-neutral-700 bg-white dark:bg-neutral-800 flex items-center justify-center text-[#767676] dark:text-neutral-400 hover:text-[#1B1C1C] dark:hover:text-white hover:border-[#242424] dark:hover:border-neutral-400 transition-colors"
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
              ? 'bg-white dark:bg-neutral-800 border-[#E5E5E5] dark:border-neutral-700 text-[#242424] dark:text-neutral-100'
              : 'bg-[#F2F2F2] dark:bg-neutral-900 border-[#E5E5E5] dark:border-neutral-800 text-[#767676] dark:text-neutral-400'
          }`}
        >
          {isVoiceOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          <span className="font-semibold text-xs mt-1">Voice: {isVoiceOn ? 'ON' : 'OFF'}</span>
          <span className="text-[10px] text-[#767676] dark:text-neutral-400">Coach Cues</span>
        </button>

        {/* AI Form Check */}
        <button
          onClick={onOpenAIForm}
          id="btn-ai-form"
          className="py-2.5 px-2 rounded-xl bg-white dark:bg-neutral-800 border border-[#E5E5E5] dark:border-neutral-700 hover:border-[#242424] dark:hover:border-neutral-500 text-[#242424] dark:text-neutral-100 transition-colors flex flex-col items-center justify-center text-center shadow-2xs"
        >
          <Camera size={16} />
          <span className="font-semibold text-xs mt-1">AI Form</span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Vision Ready</span>
        </button>

        {/* End & Sync Burn */}
        <button
          onClick={() => onEndSession(Math.round(activeCalories))}
          id="btn-end-session"
          className="py-2.5 px-2 rounded-xl bg-white dark:bg-neutral-800 border border-[#E5E5E5] dark:border-neutral-700 hover:border-red-500 text-red-600 dark:text-red-400 transition-colors flex flex-col items-center justify-center text-center shadow-2xs"
        >
          <CheckCircle2 size={16} />
          <span className="font-semibold text-xs mt-1">Finish Session</span>
          <span className="text-[10px] text-[#767676] dark:text-neutral-400">+{Math.round(activeCalories)} kcal</span>
        </button>
      </div>

      {/* Exercise Video Modal for Detailed Biomechanics Cues */}
      {selectedExerciseForModal && (
        <ExerciseVideoModal
          exercise={selectedExerciseForModal}
          isOpen={!!selectedExerciseForModal}
          onClose={() => setSelectedExerciseForModal(null)}
        />
      )}
    </div>
  );
};
