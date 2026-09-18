import React, { useState, useMemo } from 'react';
import {
  Search,
  Heart,
  Clock,
  Zap,
  Star,
  Play,
  RotateCcw,
  X,
  SlidersHorizontal,
  Dumbbell,
  Sparkles,
  Flame,
  Activity,
  Layers,
  ChevronRight,
  Info,
  CheckCircle2,
  Tv,
  HelpCircle
} from 'lucide-react';
import { WorkoutProtocol } from '../types';
import { ExerciseLibraryModal } from './ExerciseLibraryModal';
import { ExerciseVideoModal } from './ExerciseVideoModal';
import {
  comprehensiveExerciseDatabase,
  MuscleGroup,
  ExerciseCategory,
  ExerciseItem
} from '../data/exerciseDatabase';
import { useAppSettings } from '../services/appSettingsContext';
import { getActiveUserGender } from '../services/googleAuth';

interface WorkoutsViewProps {
  protocols: WorkoutProtocol[];
  onStartWorkout: (protocol: WorkoutProtocol) => void;
  onToggleFavorite: (id: string) => void;
}

export const WorkoutsView: React.FC<WorkoutsViewProps> = ({
  protocols,
  onStartWorkout,
  onToggleFavorite,
}) => {
  const { t } = useAppSettings();
  const [activeTabMode, setActiveTabMode] = useState<'exercises' | 'protocols'>('exercises');
  const [showProtocolExplanation, setShowProtocolExplanation] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModality, setSelectedModality] = useState<string>('All Disciplines');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [durationFilter, setDurationFilter] = useState<string>('Any');
  const [equipmentFilter, setEquipmentFilter] = useState<string>('All');
  const [isExerciseIndexOpen, setIsExerciseIndexOpen] = useState(false);
  const [videoModalExercise, setVideoModalExercise] = useState<ExerciseItem | null>(null);

  const userGender = getActiveUserGender();

  // Targeted anatomy selection
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'All'>('All');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'All'>('All');
  const [selectedExerciseDetail, setSelectedExerciseDetail] = useState<ExerciseItem | null>(null);

  const modalities = ['All Disciplines', 'HIIT', 'Strength', 'Mobility / Yoga'];

  const muscleGroups: (MuscleGroup | 'All')[] = [
    'All',
    'Chest',
    'Back',
    'Legs',
    'Shoulders',
    'Arms',
    'Core / Abs',
    'Full Body',
  ];

  const categories: (ExerciseCategory | 'All')[] = [
    'All',
    'Strength',
    'Hypertrophy',
    'Mobility',
    'Flexibility',
    'Endurance',
  ];

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedModality('All Disciplines');
    setDifficultyFilter('All');
    setDurationFilter('Any');
    setEquipmentFilter('All');
    setSelectedMuscle('All');
    setSelectedCategory('All');
  };

  // Filtered exercises
  const filteredExercises = useMemo(() => {
    return comprehensiveExerciseDatabase.filter((item) => {
      if (selectedMuscle !== 'All' && item.muscleGroup !== selectedMuscle) return false;
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.targetMuscle.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedMuscle, selectedCategory, searchQuery]);

  // Filtered protocols
  const filteredProtocols = useMemo(() => {
    return protocols.filter((p) => {
      if (selectedModality !== 'All Disciplines') {
        if (selectedModality === 'Mobility / Yoga' && p.modality !== 'Mobility / Yoga') return false;
        if (selectedModality === 'HIIT' && p.modality !== 'HIIT' && p.modality !== 'Dance') return false;
        if (selectedModality === 'Strength' && p.modality !== 'Strength') return false;
      }

      if (difficultyFilter !== 'All') {
        if (difficultyFilter === 'Beginner' && p.difficulty !== 'Beginner') return false;
        if (difficultyFilter === 'Int.' && p.difficulty !== 'Intermediate') return false;
        if (difficultyFilter === 'Adv.' && p.difficulty !== 'Advanced') return false;
      }

      if (durationFilter !== 'Any') {
        if (durationFilter === '15m' && p.duration > 15) return false;
        if (durationFilter === '30m' && (p.duration < 20 || p.duration > 35)) return false;
        if (durationFilter === '45m+' && p.duration < 40) return false;
      }

      if (equipmentFilter !== 'All') {
        if (equipmentFilter === 'Bodyweight' && !p.equipment.toLowerCase().includes('bodyweight') && !p.equipment.toLowerCase().includes('no equipment')) return false;
        if (equipmentFilter === 'Dumbbells' && !p.equipment.toLowerCase().includes('dumbbells')) return false;
        if (equipmentFilter === 'Mat' && !p.equipment.toLowerCase().includes('mat')) return false;
      }

      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(query) ||
          p.instructor.toLowerCase().includes(query) ||
          p.equipment.toLowerCase().includes(query) ||
          p.difficulty.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [protocols, selectedModality, difficultyFilter, durationFilter, equipmentFilter, searchQuery]);

  return (
    <div className="space-y-4 pb-28">
      {/* Title & Top Header */}
      <div className="pt-2 px-1 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono tracking-widest text-[#767676] dark:text-zinc-400 uppercase font-semibold mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#242424] dark:bg-amber-400"></span>
            <span>FITNESS & BIOMECHANICS ENGINE</span>
          </div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-[#1B1C1C] dark:text-white tracking-tight">
            {t('workouts_title')}
          </h1>
          <p className="text-xs md:text-sm text-[#767676] dark:text-zinc-400 mt-1 leading-relaxed">
            {t('workouts_subtitle')} • Demonstrator: <strong className="text-[#1B1C1C] dark:text-amber-400">{userGender === 'female' ? 'Female Athlete (Coach Maya)' : 'Male Athlete (Coach Marcus)'}</strong>
          </p>
        </div>

        <button
          onClick={() => setIsExerciseIndexOpen(true)}
          id="btn-open-exercise-index"
          className="px-3.5 py-2 bg-[#242424] dark:bg-amber-400 hover:bg-black dark:hover:bg-amber-500 text-white dark:text-black text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors self-start md:self-auto shrink-0"
        >
          <Dumbbell size={14} className="text-amber-400 dark:text-black" />
          <span>{t('workouts_anatomy_directory')}</span>
        </button>
      </div>

      {/* Mode Switcher Tabs: Exercise Movement Library vs Guided Class Protocols */}
      <div className="bg-white dark:bg-[#18191B] border border-[#E5E5E5] dark:border-zinc-800 rounded-2xl p-1.5 shadow-2xs flex items-center gap-2">
        <button
          onClick={() => setActiveTabMode('exercises')}
          id="tab-mode-exercises"
          className={`flex-1 py-2.5 px-3 rounded-xl font-display font-bold text-xs flex items-center justify-center gap-2 transition-all ${
            activeTabMode === 'exercises'
              ? 'bg-[#1B1C1C] dark:bg-amber-400 text-white dark:text-black shadow-xs'
              : 'text-[#555] dark:text-zinc-400 hover:bg-[#F2F2F2] dark:hover:bg-zinc-800'
          }`}
        >
          <Tv size={15} />
          <span>Exercise Video Library ({filteredExercises.length})</span>
        </button>

        <button
          onClick={() => setActiveTabMode('protocols')}
          id="tab-mode-protocols"
          className={`flex-1 py-2.5 px-3 rounded-xl font-display font-bold text-xs flex items-center justify-center gap-2 transition-all ${
            activeTabMode === 'protocols'
              ? 'bg-[#1B1C1C] dark:bg-amber-400 text-white dark:text-black shadow-xs'
              : 'text-[#555] dark:text-zinc-400 hover:bg-[#F2F2F2] dark:hover:bg-zinc-800'
          }`}
        >
          <Layers size={15} />
          <span>Guided Class Protocols ({filteredProtocols.length})</span>
        </button>
      </div>

      {/* Architectural Explanation Banner for Guided Protocols */}
      {showProtocolExplanation && (
        <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs flex items-start gap-2.5 text-[#333] dark:text-zinc-300 relative animate-in fade-in">
          <HelpCircle size={17} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1 pr-6">
            <span className="font-bold text-[#1B1C1C] dark:text-amber-300 font-mono text-[11px] uppercase tracking-wide block">
              Dono Sections Ka Difference (Exercises vs Guided Protocols):
            </span>
            <p className="text-[11px] leading-relaxed text-[#4A4A4A] dark:text-zinc-300">
              • <strong>Exercise Video Library:</strong> Single exercise movement drills (Squat, Deadlift, Pushup, Pullup) jisme aap direct video form demonstration, 3-1-1 tempo pacing, aur biomechanics cues dekh sakte hain.<br />
              • <strong>Guided Protocols:</strong> Yeh complete 20 se 45 minute ke live workout sessions hote hain. Inhe click karte hi Live Session shuru ho jata hai jisme interval timer, heart-rate pacing, audio coaching aur rest interval automatically chalte hain.
            </p>
          </div>
          <button
            onClick={() => setShowProtocolExplanation(false)}
            aria-label="Dismiss banner"
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Global Search Bar */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#767676] dark:text-zinc-400"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={activeTabMode === 'exercises' ? 'Search exercises by name, target muscle or category...' : t('workouts_search_placeholder')}
          className="w-full bg-white dark:bg-[#1E1F21] border border-[#E5E5E5] dark:border-[#2C2D30] rounded-xl pl-10 pr-9 py-2.5 text-xs md:text-sm text-[#1B1C1C] dark:text-white placeholder:text-[#767676] dark:placeholder:text-zinc-500 focus:outline-hidden focus:border-[#242424] dark:focus:border-amber-400 transition-colors shadow-2xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#767676] dark:text-zinc-400 hover:text-[#1B1C1C] dark:hover:text-white"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* TAB 1: EXERCISE VIDEO LIBRARY */}
      {activeTabMode === 'exercises' && (
        <div className="space-y-4">
          {/* Muscle Group Quick Selector Chips */}
          <div className="bg-white dark:bg-[#18191A] border border-[#E5E5E5] dark:border-[#262729] rounded-2xl p-3.5 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[11px] font-bold text-[#767676] dark:text-zinc-400 uppercase">
                Select Muscle Group: <strong className="text-[#1B1C1C] dark:text-amber-400">{selectedMuscle}</strong>
              </span>
              <button
                onClick={() => {
                  setSelectedMuscle('All');
                  setSelectedCategory('All');
                }}
                className="text-[11px] text-[#767676] dark:text-zinc-400 hover:text-[#1B1C1C] dark:hover:text-amber-400 underline"
              >
                Reset Filter
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {muscleGroups.map((muscle) => {
                const isSelected = selectedMuscle === muscle;
                return (
                  <button
                    key={muscle}
                    onClick={() => setSelectedMuscle(muscle)}
                    className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-all ${
                      isSelected
                        ? 'bg-[#1B1C1C] dark:bg-amber-400 text-white dark:text-black shadow-2xs font-semibold'
                        : 'bg-[#F5F5F5] dark:bg-[#232427] text-[#4A4A4A] dark:text-zinc-300 hover:bg-[#EBEBEB] dark:hover:bg-[#2C2D31] border border-transparent'
                    }`}
                  >
                    {muscle}
                  </button>
                );
              })}
            </div>

            {/* Discipline Categories */}
            <div className="pt-2 border-t border-[#F2F2F2] dark:border-[#262729] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-mono text-[#767676] dark:text-zinc-400 uppercase shrink-0">Discipline:</span>
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 text-[11px] rounded-lg whitespace-nowrap transition-colors ${
                      isSelected
                        ? 'bg-amber-400 text-black font-bold'
                        : 'bg-white dark:bg-[#232427] border border-[#E5E5E5] dark:border-[#2C2D31] text-[#555] dark:text-zinc-300 hover:bg-white/80'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid of Exercises with HD Thumbnails & Instant Video Triggers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredExercises.map((ex) => {
              const isDetailActive = selectedExerciseDetail?.id === ex.id;
              const thumbnailSrc = userGender === 'female' 
                ? (ex.femalePosterUrl || ex.imageUrl)
                : (ex.malePosterUrl || ex.imageUrl);

              return (
                <div
                  key={ex.id}
                  className={`bg-white dark:bg-[#18191B] border rounded-2xl p-3 shadow-2xs transition-all flex flex-col justify-between ${
                    isDetailActive
                      ? 'border-amber-400 dark:border-amber-500 ring-1 ring-amber-400/40'
                      : 'border-[#E5E5E5] dark:border-zinc-800/80 hover:border-zinc-400 dark:hover:border-zinc-700'
                  }`}
                >
                  <div>
                    {/* Thumbnail Stage */}
                    <div
                      onClick={() => setVideoModalExercise(ex)}
                      className="relative aspect-16/9 w-full rounded-xl overflow-hidden bg-zinc-950 cursor-pointer group shadow-xs mb-3"
                    >
                      <img
                        src={thumbnailSrc}
                        alt={ex.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center">
                        <div className="w-11 h-11 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play size={16} fill="currentColor" className="ml-0.5" />
                        </div>
                      </div>

                      {/* Top Overlay Badges */}
                      <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                        <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-amber-300 text-[9px] font-mono font-bold uppercase">
                          {ex.muscleGroup}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-white text-[9px] font-mono font-bold uppercase">
                          {ex.difficulty}
                        </span>
                      </div>

                      {/* Bottom Trainer Badge */}
                      <div className="absolute bottom-2 left-2 text-white text-[10px] font-mono font-medium drop-shadow-md">
                        {userGender === 'female' ? '👩 Coach Maya Drill' : '👨 Coach Marcus Drill'}
                      </div>
                    </div>

                    {/* Exercise Title & Info */}
                    <div className="space-y-1">
                      <h3 className="font-display font-bold text-sm text-[#1B1C1C] dark:text-white leading-snug">
                        {ex.name}
                      </h3>
                      <p className="text-[11px] text-[#767676] dark:text-zinc-400 font-mono">
                        Target: <span className="text-[#1B1C1C] dark:text-zinc-200 font-medium">{ex.targetMuscle}</span> • {ex.equipment}
                      </p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                        {ex.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 mt-3 border-t border-[#F2F2F2] dark:border-zinc-800 flex items-center gap-2">
                    <button
                      onClick={() => setVideoModalExercise(ex)}
                      className="flex-1 py-1.5 px-3 bg-amber-400 hover:bg-amber-500 text-black text-xs font-display font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Play size={12} fill="currentColor" />
                      <span>Watch Drill</span>
                    </button>

                    <button
                      onClick={() => setSelectedExerciseDetail(isDetailActive ? null : ex)}
                      title="Toggle Form Cues"
                      className="px-2.5 py-1.5 border border-[#E5E5E5] dark:border-zinc-700 hover:bg-[#F2F2F2] dark:hover:bg-zinc-800 rounded-lg text-xs text-[#555] dark:text-zinc-300 transition-colors"
                    >
                      {isDetailActive ? 'Hide Cues' : 'Form Cues'}
                    </button>
                  </div>

                  {/* Expanded Form Cues */}
                  {isDetailActive && (
                    <div className="mt-3 pt-2.5 border-t border-amber-200 dark:border-amber-800 space-y-1.5 animate-in fade-in">
                      <span className="text-[10px] font-mono uppercase text-amber-500 font-bold block">
                        Biomechanics Cues:
                      </span>
                      <ul className="space-y-1 text-[11px] text-zinc-700 dark:text-zinc-300 list-disc list-inside">
                        {ex.formCues.map((cue, idx) => (
                          <li key={idx}>{cue}</li>
                        ))}
                      </ul>
                      <div className="pt-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                        Pacing: 3s Eccentric • 1s Isometric • 1s Drive
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredExercises.length === 0 && (
            <div className="bg-white dark:bg-[#18191B] border border-[#E5E5E5] dark:border-zinc-800 rounded-2xl p-8 text-center space-y-2">
              <p className="text-sm font-semibold text-[#1B1C1C] dark:text-white">No exercises match the selected filters</p>
              <p className="text-xs text-[#767676] dark:text-zinc-400">Try choosing another muscle group or resetting filters.</p>
              <button
                onClick={resetFilters}
                className="text-xs text-amber-500 font-semibold underline"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GUIDED CLASS PROTOCOLS */}
      {activeTabMode === 'protocols' && (
        <div className="space-y-4">
          {/* Modality Chips & Filters */}
          <div className="bg-white dark:bg-[#18191A] border border-[#E5E5E5] dark:border-[#262729] rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between text-xs pb-1 border-b border-[#F2F2F2] dark:border-[#262729]">
              <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-wider text-[#1B1C1C] dark:text-white uppercase">
                <Layers size={13} />
                <span>Class Protocols ({filteredProtocols.length} Available)</span>
              </div>
              <span className="text-xs text-[#767676] dark:text-zinc-400 font-mono">
                Full-Length Training Sessions
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {modalities.map((modality) => {
                const isSelected = selectedModality === modality;
                return (
                  <button
                    key={modality}
                    onClick={() => setSelectedModality(modality)}
                    className={`px-3 py-1.5 text-xs rounded-xl whitespace-nowrap transition-colors font-medium ${
                      isSelected
                        ? 'bg-[#242424] dark:bg-amber-400 text-white dark:text-black font-bold'
                        : 'bg-[#FBF9F9] dark:bg-[#232427] border border-[#E5E5E5] dark:border-[#2E3034] text-[#4A4A4A] dark:text-zinc-300 hover:bg-[#F2F2F2]'
                    }`}
                  >
                    {modality}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Protocols Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProtocols.map((protocol) => (
              <div
                key={protocol.id}
                className="bg-white dark:bg-[#1C1C1E] border border-[#E5E5E5] dark:border-[#262729] rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Media Banner with Badges */}
                  <div className="relative aspect-16/8 w-full overflow-hidden bg-[#E5E5E5] dark:bg-zinc-800">
                    <img
                      src={protocol.thumbnailUrl}
                      alt={protocol.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-sm bg-[#1B1C1C]/90 backdrop-blur-md text-white font-mono text-[9px] font-bold uppercase tracking-wider">
                        {protocol.modality}
                      </span>
                      <span className="px-2 py-0.5 rounded-sm bg-white/90 backdrop-blur-md text-[#1B1C1C] font-mono text-[9px] font-bold uppercase tracking-wider">
                        {protocol.difficulty}
                      </span>
                    </div>

                    <button
                      onClick={() => onToggleFavorite(protocol.id)}
                      aria-label="Favorite"
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
                    >
                      <Heart
                        size={14}
                        fill={protocol.isFavorite ? '#ef4444' : 'none'}
                        className={protocol.isFavorite ? 'text-red-500' : 'text-white'}
                      />
                    </button>

                    {/* Bottom Metadata Overlay */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white">
                      <div className="flex items-center gap-2.5">
                        <span className="flex items-center gap-1 text-[10px] font-mono">
                          <Clock size={11} />
                          <span>{protocol.duration}m</span>
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-mono">
                          <Zap size={11} className="text-yellow-400" />
                          <span>{protocol.calories} kcal</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-mono">
                        <Star size={11} className="text-yellow-400" fill="#facc15" />
                        <span>{protocol.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Workout Details & CTA */}
                  <div className="p-3.5 space-y-2">
                    <div>
                      <h3 className="font-display font-bold text-sm text-[#1B1C1C] dark:text-white leading-snug">
                        {protocol.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-[#767676] dark:text-zinc-400">
                        <div className="w-4 h-4 rounded-full bg-[#F2F2F2] dark:bg-zinc-800 border border-[#E5E5E5] dark:border-zinc-700 flex items-center justify-center text-[9px] font-bold text-[#1B1C1C] dark:text-white">
                          {protocol.instructor[0]}
                        </div>
                        <span>
                          {protocol.instructor} • {protocol.equipment}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 pt-0">
                  <button
                    onClick={() => onStartWorkout(protocol)}
                    id={`begin-protocol-${protocol.id}`}
                    className="w-full py-2.5 px-3 bg-[#242424] dark:bg-amber-400 hover:bg-[#1B1C1C] dark:hover:bg-amber-500 text-white dark:text-black text-xs font-display font-semibold tracking-wider uppercase rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Play size={12} fill="currentColor" />
                    <span>Launch Live Protocol Session</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredProtocols.length === 0 && (
            <div className="bg-white dark:bg-[#18191A] border border-[#E5E5E5] dark:border-[#262729] rounded-2xl p-8 text-center space-y-2">
              <p className="text-sm font-medium text-[#1B1C1C] dark:text-white">No protocols match the selected filters</p>
              <button
                onClick={resetFilters}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-amber-500 underline"
              >
                <RotateCcw size={13} />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Complete Gym Movement Index Modal */}
      <ExerciseLibraryModal
        isOpen={isExerciseIndexOpen}
        onClose={() => setIsExerciseIndexOpen(false)}
      />

      {/* Exercise Form Demonstration Video Modal with Gender Support */}
      <ExerciseVideoModal
        exercise={videoModalExercise}
        isOpen={Boolean(videoModalExercise)}
        onClose={() => setVideoModalExercise(null)}
        userGender={userGender}
      />
    </div>
  );
};
