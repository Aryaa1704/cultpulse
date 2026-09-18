import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { Drill, WorkoutProtocol } from '../types';
import { liveDrills } from '../data/mockData';
import { getActiveUserGender } from '../services/googleAuth';
import { ExerciseVideoModal } from './ExerciseVideoModal';
import { comprehensiveExerciseDatabase } from '../data/exerciseDatabase';

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
  const [userGender, setUserGender] = useState<'male' | 'female'>(() => getActiveUserGender());
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [selectedDrillModal, setSelectedDrillModal] = useState<any | null>(null);

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
          imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80',
          videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/39/Burpee.webm',
          femaleVideoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/39/Burpee.webm',
          femalePosterUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80',
        },
        {
          id: 'dance-2',
          number: '02/06',
          name: 'Fast Salsa Step & Cross Reach',
          sets: 3,
          workSeconds: 45,
          load: 'High Tempo',
          impact: 'MODERATE',
          imageUrl: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&auto=format&fit=crop&q=80',
          videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Interval_Push-ups.webm',
          femaleVideoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Interval_Push-ups.webm',
          femalePosterUrl: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&auto=format&fit=crop&q=80',
        },
        {
          id: 'dance-3',
          number: '03/06',
          name: 'Cardio Core Sweeps & Lateral Slide',
          sets: 3,
          workSeconds: 45,
          load: 'Bodyweight',
          impact: 'MODERATE',
          imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
          videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Leg_raises_-_exercise_demonstration_video.webm',
          femaleVideoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Leg_raises_-_exercise_demonstration_video.webm',
          femalePosterUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
        },
        {
          id: 'dance-4',
          number: '04/06',
          name: 'Cardio Chassé & High Knee Jumps',
          sets: 3,
          workSeconds: 45,
          load: 'High Intensity',
          impact: 'HIGH IMPACT',
          imageUrl: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=800&auto=format&fit=crop&q=80',
          videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/39/Burpee.webm',
          femaleVideoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/39/Burpee.webm',
          femalePosterUrl: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=800&auto=format&fit=crop&q=80',
        },
        {
          id: 'dance-5',
          number: '05/06',
          name: 'Groove Drop & Isometric Squat',
          sets: 2,
          workSeconds: 45,
          load: 'Bodyweight',
          impact: 'MODERATE',
          imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80',
          videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Squat_-_exercise_demonstration_video.webm',
          femaleVideoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Squat_-_exercise_demonstration_video.webm',
          femalePosterUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80',
        },
        {
          id: 'dance-6',
          number: '06/06',
          name: 'Cooldown Harmonic Breathing & Stretch',
          sets: 1,
          workSeconds: 60,
          load: 'Recovery',
          impact: 'LOW IMPACT',
          imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80',
          videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Squat_-_exercise_demonstration_video.webm',
          femaleVideoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Squat_-_exercise_demonstration_video.webm',
          femalePosterUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80',
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
          imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=80',
          videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Squat_-_exercise_demonstration_video.webm',
          femaleVideoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Squat_-_exercise_demonstration_video.webm',
          femalePosterUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=80',
        },
        {
          id: 'str-2',
          number: '02/06',
          name: 'Romanian Deadlifts (Posterior Chain)',
          sets: 3,
          workSeconds: 45,
          load: '20kg - 30kg',
          impact: 'MODERATE',
          imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
          videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/62/Deadlift_-_exercise_demonstration_video.webm',
          femaleVideoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/62/Deadlift_-_exercise_demonstration_video.webm',
          femalePosterUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
        },
        {
          id: 'str-3',
          number: '03/06',
          name: 'Standing Overhead Military Press',
          sets: 3,
          workSeconds: 45,
          load: '12kg - 18kg',
          impact: 'HIGH IMPACT',
          imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80',
          videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Shoulder_press_-_exercise_demonstration_video.webm',
          femaleVideoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Shoulder_press_-_exercise_demonstration_video.webm',
          femalePosterUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80',
        },
        {
          id: 'str-4',
          number: '04/06',
          name: 'Bent-Over Dumbbell Rows',
          sets: 3,
          workSeconds: 45,
          load: '14kg - 20kg',
          impact: 'MODERATE',
          imageUrl: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?w=800&auto=format&fit=crop&q=80',
          videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Bent-over_row_-_exercise_demonstration_video.webm',
          femaleVideoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Bent-over_row_-_exercise_demonstration_video.webm',
          femalePosterUrl: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?w=800&auto=format&fit=crop&q=80',
        },
        {
          id: 'str-5',
          number: '05/06',
          name: 'Tempo Push-Ups with 2s Isometric Hold',
          sets: 3,
          workSeconds: 45,
          load: 'Bodyweight',
          impact: 'MODERATE',
          imageUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800&auto=format&fit=crop&q=80',
          videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Interval_Push-ups.webm',
          femaleVideoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Interval_Push-ups.webm',
          femalePosterUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800&auto=format&fit=crop&q=80',
        },
        {
          id: 'str-6',
          number: '06/06',
          name: 'Core Hollow Body Hold & Plank',
          sets: 2,
          workSeconds: 45,
          load: 'Bodyweight',
          impact: 'LOW IMPACT',
          imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80',
          videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Leg_raises_-_exercise_demonstration_video.webm',
          femaleVideoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Leg_raises_-_exercise_demonstration_video.webm',
          femalePosterUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80',
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
          imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80',
          videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Interval_Push-ups.webm',
          femaleVideoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Interval_Push-ups.webm',
          femalePosterUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80',
        },
        {
          id: 'yoga-2',
          number: '02/06',
          name: 'Low Lunge Hip Flexor Deep Opener',
          sets: 2,
          workSeconds: 50,
          load: 'Flexibility',
          impact: 'LOW IMPACT',
          imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80',
          videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Squat_-_exercise_demonstration_video.webm',
          femaleVideoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Squat_-_exercise_demonstration_video.webm',
          femalePosterUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80',
        },
        {
          id: 'yoga-3',
          number: '03/06',
          name: 'Warrior II & Reverse Warrior Hold',
          sets: 2,
          workSeconds: 45,
          load: 'Isometric',
          impact: 'LOW IMPACT',
          imageUrl: 'https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?w=800&auto=format&fit=crop&q=80',
          videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Squat_-_exercise_demonstration_video.webm',
          femaleVideoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Squat_-_exercise_demonstration_video.webm',
          femalePosterUrl: 'https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?w=800&auto=format&fit=crop&q=80',
        },
        {
          id: 'yoga-4',
          number: '04/06',
          name: 'Pigeon Pose Glute & Piriformis Release',
          sets: 2,
          workSeconds: 50,
          load: 'Flexibility',
          impact: 'LOW IMPACT',
          imageUrl: 'https://images.unsplash.com/photo-1552196563-552361a45935?w=800&auto=format&fit=crop&q=80',
          videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Squat_-_exercise_demonstration_video.webm',
          femaleVideoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Squat_-_exercise_demonstration_video.webm',
          femalePosterUrl: 'https://images.unsplash.com/photo-1552196563-552361a45935?w=800&auto=format&fit=crop&q=80',
        },
        {
          id: 'yoga-5',
          number: '05/06',
          name: 'Thoracic Windmill & Spine Twist',
          sets: 2,
          workSeconds: 45,
          load: 'Mobility',
          impact: 'LOW IMPACT',
          imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80',
          videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Leg_raises_-_exercise_demonstration_video.webm',
          femaleVideoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Leg_raises_-_exercise_demonstration_video.webm',
          femalePosterUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80',
        },
        {
          id: 'yoga-6',
          number: '06/06',
          name: 'Savasana Guided Recovery Breath',
          sets: 1,
          workSeconds: 60,
          load: 'Parasympathetic',
          impact: 'LOW IMPACT',
          imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80',
          videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Interval_Push-ups.webm',
          femaleVideoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Interval_Push-ups.webm',
          femalePosterUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80',
        },
      ];
    }

    // Default: HIIT & Conditioning
    return [
      {
        id: 'hiit-1',
        number: '01/06',
        name: 'Full Chest-to-Floor Burpees Burst',
        sets: 3,
        workSeconds: 45,
        load: 'Cardio Max',
        impact: 'HIGH IMPACT',
        imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
        videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/39/Burpee.webm',
        femaleVideoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/39/Burpee.webm',
        femalePosterUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
      },
      {
        id: 'hiit-2',
        number: '02/06',
        name: 'Dumbbell Thrusters (Squat to Press)',
        sets: 3,
        workSeconds: 45,
        load: '10kg - 16kg',
        impact: 'HIGH IMPACT',
        imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80',
        videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Squat_-_exercise_demonstration_video.webm',
        femaleVideoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Squat_-_exercise_demonstration_video.webm',
        femalePosterUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80',
      },
      {
        id: 'hiit-3',
        number: '03/06',
        name: 'Rapid Mountain Climbers & Core Drive',
        sets: 3,
        workSeconds: 45,
        load: 'Core Speed',
        impact: 'HIGH IMPACT',
        imageUrl: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=800&auto=format&fit=crop&q=80',
        videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Leg_raises_-_exercise_demonstration_video.webm',
        femaleVideoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Leg_raises_-_exercise_demonstration_video.webm',
        femalePosterUrl: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=800&auto=format&fit=crop&q=80',
      },
      {
        id: 'hiit-4',
        number: '04/06',
        name: 'Tempo Pushups with Core Tension',
        sets: 3,
        workSeconds: 45,
        load: 'Bodyweight',
        impact: 'HIGH IMPACT',
        imageUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800&auto=format&fit=crop&q=80',
        videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Interval_Push-ups.webm',
        femaleVideoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Interval_Push-ups.webm',
        femalePosterUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800&auto=format&fit=crop&q=80',
      },
      {
        id: 'hiit-5',
        number: '05/06',
        name: 'Kettlebell / Dumbbell Russian Swings',
        sets: 3,
        workSeconds: 45,
        load: '16kg - 20kg',
        impact: 'MODERATE',
        imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
        videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/62/Deadlift_-_exercise_demonstration_video.webm',
        femaleVideoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/62/Deadlift_-_exercise_demonstration_video.webm',
        femalePosterUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
      },
      {
        id: 'hiit-6',
        number: '06/06',
        name: 'Plank Shoulder Taps & Iso Hold',
        sets: 2,
        workSeconds: 45,
        load: 'Core Stability',
        impact: 'LOW IMPACT',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80',
        videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Leg_raises_-_exercise_demonstration_video.webm',
        femaleVideoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Leg_raises_-_exercise_demonstration_video.webm',
        femalePosterUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80',
      },
    ];
  }, [currentProtocol]);

  const totalDuration = (currentProtocol?.duration || 20) * 60;
  const protocolCalories = currentProtocol?.calories || 320;
  
  // Single Coach matching active user gender (no dual buttons)
  const coachName = userGender === 'female' ? 'Coach Maya (Pro Trainer)' : 'Coach Marcus (Elite Strength)';
  const resolvedAthleteName = activeUserName?.split(' ')[0] || 'Athlete';

  const [isPlaying, setIsPlaying] = useState(true);
  const [secondsRemaining, setSecondsRemaining] = useState(45);
  const [totalSecondsRemaining, setTotalSecondsRemaining] = useState(totalDuration);
  const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
  const [isRestPhase, setIsRestPhase] = useState(false);
  const [restSecondsRemaining, setRestSecondsRemaining] = useState(15);

  const [heartRate, setHeartRate] = useState(115);
  const [activeCalories, setActiveCalories] = useState(0);
  const [isVoiceOn, setIsVoiceOn] = useState(true);

  // Dynamic Coach Cues
  const coachCues = useMemo(() => {
    return [
      `${coachName.split(' ')[1].toUpperCase()}: "3, 2, 1... Push the pace, ${resolvedAthleteName}!"`,
      `${coachName.split(' ')[1].toUpperCase()}: "Keep your core braced and control the movement!"`,
      `${coachName.split(' ')[1].toUpperCase()}: "Halfway through this interval! Dig deep!"`,
      `${coachName.split(' ')[1].toUpperCase()}: "Outstanding technique, ${resolvedAthleteName}! Finish strong!"`,
      `${coachName.split(' ')[1].toUpperCase()}: "Smooth cadence, breathe through your diaphragm!"`,
    ];
  }, [coachName, resolvedAthleteName]);

  const [coachCue, setCoachCue] = useState(coachCues[0]);

  const currentDrill = dynamicDrills[currentDrillIndex] || dynamicDrills[0];
  const nextDrill = currentDrillIndex < dynamicDrills.length - 1 ? dynamicDrills[currentDrillIndex + 1] : null;

  // Active video & poster based on athlete gender
  const activeVideoUrl = userGender === 'female' 
    ? (currentDrill.femaleVideoUrl || currentDrill.videoUrl)
    : currentDrill.videoUrl;

  const activePosterUrl = userGender === 'female'
    ? (currentDrill.femalePosterUrl || currentDrill.imageUrl)
    : currentDrill.imageUrl;

  // Control video playback in sync with session state
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying && !isRestPhase) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, isRestPhase, currentDrillIndex]);

  // Interval and Telemetry Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        if (!isRestPhase) {
          setSecondsRemaining((prev) => {
            if (prev <= 1) {
              // Trigger rest transition
              if (currentDrillIndex < dynamicDrills.length - 1) {
                setIsRestPhase(true);
                setRestSecondsRemaining(15);
              } else {
                // Workout completed
                onEndSession(Math.round(activeCalories));
              }
              return 45;
            }
            return prev - 1;
          });
        } else {
          setRestSecondsRemaining((prev) => {
            if (prev <= 1) {
              // End rest, start next drill
              setIsRestPhase(false);
              setCurrentDrillIndex((idx) => Math.min(dynamicDrills.length - 1, idx + 1));
              setSecondsRemaining(45);
              return 15;
            }
            return prev - 1;
          });
        }

        setTotalSecondsRemaining((prev) => Math.max(0, prev - 1));

        // Real-time calorie burn accumulation
        setActiveCalories((prev) => {
          const burnPerSecond = protocolCalories / Math.max(300, totalDuration);
          return Math.round((prev + burnPerSecond) * 10) / 10;
        });

        // Dynamic physiological heart rate calculation
        setHeartRate((prev) => {
          const targetHR = isRestPhase ? 122 : 148 + Math.sin(Date.now() / 6000) * 10;
          const step = (targetHR - prev) * 0.08 + (Math.random() * 2 - 1);
          return Math.min(172, Math.max(105, Math.round(prev + step)));
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, isRestPhase, currentDrillIndex, dynamicDrills.length, protocolCalories, totalDuration, activeCalories, onEndSession]);

  // Coach cues rotation
  useEffect(() => {
    const cueTimer = setInterval(() => {
      if (isPlaying && isVoiceOn) {
        setCoachCue(coachCues[Math.floor(Math.random() * coachCues.length)]);
      }
    }, 10000);
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
      setIsRestPhase(false);
      setSecondsRemaining(45);
    }
  };

  const handleNextDrill = () => {
    if (currentDrillIndex < dynamicDrills.length - 1) {
      setCurrentDrillIndex((prev) => prev + 1);
      setIsRestPhase(false);
      setSecondsRemaining(45);
    }
  };

  const handleRewind10 = () => {
    setSecondsRemaining((prev) => Math.min(60, prev + 10));
  };

  const handleForward10 = () => {
    setSecondsRemaining((prev) => Math.max(1, prev - 10));
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
            Instructor: <span className="font-semibold text-[#1B1C1C] dark:text-white">{coachName}</span> • Athlete: <span className="font-semibold text-[#1B1C1C] dark:text-white">{resolvedAthleteName} ({userGender === 'male' ? 'Male 👨' : 'Female 👩'})</span>
          </div>
        </div>

        <button
          onClick={() => onEndSession(Math.round(activeCalories))}
          id="btn-header-end-workout"
          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Square size={13} fill="currentColor" />
          <span>End Workout</span>
        </button>
      </div>

      {/* Real-time Telemetry Strip (3 cards in 1 row) */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 bg-white dark:bg-[#1C1C1E] border border-[#E5E5E5] dark:border-neutral-800 rounded-xl p-2 sm:p-3 shadow-2xs">
        {/* Heart Rate */}
        <div className="flex items-center gap-1.5 sm:gap-2 border-r border-[#E5E5E5] dark:border-neutral-800 pr-1 sm:pr-2 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-[#FBF9F9] dark:bg-neutral-900 border border-[#E5E5E5] dark:border-neutral-700 flex items-center justify-center text-[#242424] dark:text-neutral-200 shrink-0">
            <Heart size={14} className="text-red-600 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="font-display font-bold text-xs sm:text-sm text-[#1B1C1C] dark:text-neutral-100 flex items-baseline gap-0.5 sm:gap-1 truncate">
              <span>{heartRate}</span>
              <span className="text-[9px] sm:text-[10px] font-mono text-[#767676] dark:text-neutral-400">BPM</span>
            </div>
            <div className="text-[9px] sm:text-[10px] text-[#767676] dark:text-neutral-400 truncate">
              {heartRate > 150 ? 'Zone 4 (Peak)' : heartRate > 130 ? 'Zone 3' : 'Zone 2'}
            </div>
          </div>
        </div>

        {/* Burned Real-Time */}
        <div className="flex items-center gap-1.5 sm:gap-2 border-r border-[#E5E5E5] dark:border-neutral-800 px-1 sm:px-2 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-[#FBF9F9] dark:bg-neutral-900 border border-[#E5E5E5] dark:border-neutral-700 flex items-center justify-center text-[#242424] dark:text-neutral-200 shrink-0">
            <Flame size={14} className="text-amber-600" />
          </div>
          <div className="min-w-0">
            <div className="font-display font-bold text-xs sm:text-sm text-[#1B1C1C] dark:text-neutral-100 flex items-baseline gap-0.5 sm:gap-1 truncate">
              <span>{Math.round(activeCalories)}</span>
              <span className="text-[9px] sm:text-[10px] font-mono text-[#767676] dark:text-neutral-400">KCAL</span>
            </div>
            <div className="text-[9px] sm:text-[10px] text-[#767676] dark:text-neutral-400 truncate">Active Burn</div>
          </div>
        </div>

        {/* Remaining Time */}
        <div className="flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-2 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-[#FBF9F9] dark:bg-neutral-900 border border-[#E5E5E5] dark:border-neutral-700 flex items-center justify-center text-[#242424] dark:text-neutral-200 shrink-0">
            <Clock size={14} className="text-[#4A4A4A] dark:text-neutral-400" />
          </div>
          <div className="min-w-0">
            <div className="font-display font-bold text-xs sm:text-sm text-[#1B1C1C] dark:text-neutral-100 truncate">
              {formatTime(totalSecondsRemaining)}
            </div>
            <div className="text-[9px] sm:text-[10px] font-mono text-[#767676] dark:text-neutral-400 uppercase truncate">REMAINING</div>
          </div>
        </div>
      </div>

      {/* Video Workout Stage - Plays Direct Movement Video */}
      <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-black border border-[#E5E5E5] dark:border-zinc-800 shadow-lg">
        {!isRestPhase ? (
          /* Active Work Interval: HD Video Playing */
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              key={`${activeVideoUrl}-${currentDrillIndex}`}
              src={activeVideoUrl}
              poster={activePosterUrl}
              autoPlay={isPlaying}
              loop
              muted={isMuted}
              playsInline
              controls={false}
              className="w-full h-full object-cover brightness-95 contrast-105"
            />

            {/* Dark overlay gradients for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/60 pointer-events-none"></div>

            {/* Top Badges */}
            <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 flex items-center justify-between gap-1 flex-wrap">
              <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] sm:text-xs font-medium font-mono min-w-0 max-w-[65%] truncate">
                <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                <span className="truncate">{currentDrill.number} • {currentDrill.name}</span>
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="px-2 sm:px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] sm:text-xs font-mono flex items-center gap-1"
                >
                  {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                  <span>{isMuted ? 'Muted' : 'Sound'}</span>
                </button>

                <div className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] sm:text-xs font-mono">
                  <Zap size={12} className="text-yellow-400" />
                  <span>{currentDrill.impact}</span>
                </div>
              </div>
            </div>

            {/* Audio Coach Cue Bar */}
            <div className="absolute bottom-3 left-3 right-3">
              <div className="px-3 py-2 rounded-lg bg-black/75 backdrop-blur-md border border-white/15 text-white/90 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 truncate pr-2">
                  <Volume2 size={15} className="text-amber-400 shrink-0" />
                  <span className="font-mono text-[11px] truncate tracking-tight">{coachCue}</span>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
              </div>
            </div>
          </div>
        ) : (
          /* Rest Transition Card */
          <div className="relative w-full h-full bg-[#0d0e10] p-6 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/40 flex items-center justify-center mb-3 shadow-xl animate-pulse">
              <span className="text-2xl font-display font-bold">{restSecondsRemaining}s</span>
            </div>
            <h3 className="font-display font-bold text-xl text-white mb-1">
              Recovery & Hydration Period
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mb-4">
              Take deep diaphragmatic breaths, sip water, and reset your form posture.
            </p>

            {nextDrill && (
              <div className="p-3 bg-zinc-900 border border-zinc-700/80 rounded-xl flex items-center gap-3 text-left max-w-md w-full">
                <img
                  src={userGender === 'female' ? (nextDrill.femalePosterUrl || nextDrill.imageUrl) : nextDrill.imageUrl}
                  alt={nextDrill.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-mono text-amber-400 uppercase font-bold">NEXT DRILL</div>
                  <div className="font-semibold text-xs text-white truncate">{nextDrill.name}</div>
                  <div className="text-[11px] text-zinc-400">{nextDrill.load} • {nextDrill.impact}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interval Progress & Big Timer */}
      <div className="bg-white dark:bg-[#1C1C1E] border border-[#E5E5E5] dark:border-neutral-800 rounded-xl p-4 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#1B1C1C] dark:text-neutral-200">
            {isRestPhase ? 'RECOVERY TRANSITION' : `ACTIVE INTERVAL (${currentDrill.workSeconds}S WORK)`}
          </span>
          <span className="font-mono text-[#767676] dark:text-neutral-400">
            Drill {currentDrillIndex + 1} of {dynamicDrills.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#E5E5E5] dark:bg-neutral-800 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isRestPhase ? 'bg-blue-500' : 'bg-[#242424] dark:bg-amber-400'
            }`}
            style={{
              width: isRestPhase
                ? `${Math.max(5, ((15 - restSecondsRemaining) / 15) * 100)}%`
                : `${Math.max(5, ((45 - secondsRemaining) / 45) * 100)}%`,
            }}
          ></div>
        </div>

        {/* Interval Timer Big Display */}
        <div className="flex items-end justify-between pt-1">
          <div>
            <div className="text-[10px] font-mono tracking-widest text-[#767676] dark:text-neutral-400 uppercase">
              {isRestPhase ? 'REST COUNTDOWN' : 'INTERVAL TIMER'}
            </div>
            <div className="font-display font-bold text-3xl md:text-4xl text-[#1B1C1C] dark:text-neutral-100 tracking-tight">
              00:{(isRestPhase ? restSecondsRemaining : secondsRemaining).toString().padStart(2, '0')}{' '}
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
            <img
              src={userGender === 'female' ? (nextDrill.femalePosterUrl || nextDrill.imageUrl) : nextDrill.imageUrl}
              alt={nextDrill.name}
              className="w-11 h-11 rounded-lg object-cover border border-[#E5E5E5] dark:border-neutral-700"
            />
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
            onClick={() => {
              // Find matching database exercise to open modal
              const match = comprehensiveExerciseDatabase.find(
                (e) => e.name.toLowerCase().includes(nextDrill.name.toLowerCase()) || nextDrill.name.toLowerCase().includes(e.name.toLowerCase())
              ) || comprehensiveExerciseDatabase[0];
              setSelectedDrillModal(match);
            }}
            aria-label="Preview next drill video"
            title="Inspect full biomechanics drill"
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
          <span className="text-[10px] text-[#767676] dark:text-neutral-400">Coach Guidance</span>
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

      {/* Drill Inspection Modal if user taps preview */}
      {selectedDrillModal && (
        <ExerciseVideoModal
          exercise={selectedDrillModal}
          isOpen={true}
          onClose={() => setSelectedDrillModal(null)}
          userGender={userGender}
        />
      )}
    </div>
  );
};
