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
  Info
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModality, setSelectedModality] = useState<string>('All Disciplines');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [durationFilter, setDurationFilter] = useState<string>('Any');
  const [equipmentFilter, setEquipmentFilter] = useState<string>('All');
  const [isExerciseIndexOpen, setIsExerciseIndexOpen] = useState(false);
  const [videoModalExercise, setVideoModalExercise] = useState<ExerciseItem | null>(null);

  // Side panel targeted anatomy selection
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'All'>('Chest');
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

  // Filtered exercises for the dedicated Left Side Panel
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

  const filteredProtocols = useMemo(() => {
    return protocols.filter((p) => {
      // Modality filter
      if (selectedModality !== 'All Disciplines') {
        if (selectedModality === 'Mobility / Yoga' && p.modality !== 'Mobility / Yoga') return false;
        if (selectedModality === 'HIIT' && p.modality !== 'HIIT' && p.modality !== 'Dance') return false;
        if (selectedModality === 'Strength' && p.modality !== 'Strength') return false;
      }

      // Difficulty filter
      if (difficultyFilter !== 'All') {
        if (difficultyFilter === 'Beginner' && p.difficulty !== 'Beginner') return false;
        if (difficultyFilter === 'Int.' && p.difficulty !== 'Intermediate') return false;
        if (difficultyFilter === 'Adv.' && p.difficulty !== 'Advanced') return false;
      }

      // Duration filter
      if (durationFilter !== 'Any') {
        if (durationFilter === '15m' && p.duration > 15) return false;
        if (durationFilter === '30m' && (p.duration < 20 || p.duration > 35)) return false;
        if (durationFilter === '45m+' && p.duration < 40) return false;
      }

      // Equipment filter
      if (equipmentFilter !== 'All') {
        if (equipmentFilter === 'Bodyweight' && !p.equipment.toLowerCase().includes('bodyweight') && !p.equipment.toLowerCase().includes('no equipment')) return false;
        if (equipmentFilter === 'Dumbbells' && !p.equipment.toLowerCase().includes('dumbbells')) return false;
        if (equipmentFilter === 'Mat' && !p.equipment.toLowerCase().includes('mat')) return false;
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(query);
        const matchInstructor = p.instructor.toLowerCase().includes(query);
        const matchEquipment = p.equipment.toLowerCase().includes(query);
        const matchDifficulty = p.difficulty.toLowerCase().includes(query);
        return matchTitle || matchInstructor || matchEquipment || matchDifficulty;
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
            <span>WORKOUT & ANATOMY ENGINE</span>
          </div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-[#1B1C1C] dark:text-white tracking-tight">
            {t('workouts_title')}
          </h1>
          <p className="text-xs md:text-sm text-[#767676] dark:text-zinc-400 mt-1 leading-relaxed">
            {t('workouts_subtitle')}
          </p>
        </div>

        <button
          onClick={() => setIsExerciseIndexOpen(true)}
          className="px-3.5 py-2 bg-[#242424] dark:bg-amber-400 hover:bg-black dark:hover:bg-amber-500 text-white dark:text-black text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors self-start md:self-auto shrink-0"
        >
          <Dumbbell size={14} className="text-amber-400 dark:text-black" />
          <span>{t('workouts_anatomy_directory')}</span>
        </button>
      </div>

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
          placeholder={t('workouts_search_placeholder')}
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

      {/* DUAL-PANEL LAYOUT: LEFT PANEL (Exercises & Body Parts) + RIGHT PANEL (Curated Routines) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT PANEL: EXERCISE LIBRARY BY MUSCLE & DISCIPLINE */}
        <div className="lg:col-span-6 bg-white dark:bg-[#18191A] border border-[#E5E5E5] dark:border-[#262729] rounded-2xl shadow-2xs overflow-hidden flex flex-col transition-colors">
          {/* Panel Header */}
          <div className="p-3.5 bg-[#FBF9F9] dark:bg-[#1D1E20] border-b border-[#E5E5E5] dark:border-[#262729] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#242424] dark:bg-amber-400 text-amber-400 dark:text-black flex items-center justify-center font-bold">
                <Dumbbell size={14} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#1B1C1C] dark:text-white uppercase font-mono tracking-wider">
                  {t('workouts_side_panel_title')}
                </h3>
                <p className="text-[11px] text-[#767676] dark:text-zinc-400">
                  {t('workouts_side_panel_subtitle')} ({filteredExercises.length})
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedMuscle('All');
                setSelectedCategory('All');
              }}
              className="text-[11px] text-[#767676] dark:text-zinc-400 hover:text-[#1B1C1C] dark:hover:text-amber-400 underline transition-colors"
            >
              {t('workouts_show_all')}
            </button>
          </div>

          {/* Muscle Group Quick Selectors */}
          <div className="p-3 border-b border-[#F2F2F2] dark:border-[#262729] bg-white dark:bg-[#18191A] space-y-2">
            <div className="text-[10px] font-mono uppercase text-[#767676] dark:text-zinc-400 font-bold flex items-center justify-between">
              <span>{t('workouts_body_part')}</span>
              <span className="text-[#1B1C1C] dark:text-amber-400 font-semibold">{selectedMuscle}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {muscleGroups.map((muscle) => {
                const isSelected = selectedMuscle === muscle;
                return (
                  <button
                    key={muscle}
                    onClick={() => setSelectedMuscle(muscle)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
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
          </div>

          {/* Discipline / Category Filter Tabs */}
          <div className="px-3 py-2 border-b border-[#F2F2F2] dark:border-[#262729] bg-[#FAFAFA] dark:bg-[#1B1C1E] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-mono text-[#767676] dark:text-zinc-400 uppercase shrink-0">{t('workouts_type')}:</span>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-0.5 text-[11px] rounded-md whitespace-nowrap transition-colors ${
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

          {/* Scrollable Exercise Items List */}
          <div className="max-h-[560px] overflow-y-auto divide-y divide-[#F2F2F2] dark:divide-[#252629] p-2 space-y-1">
            {filteredExercises.map((ex) => {
              const isDetailActive = selectedExerciseDetail?.id === ex.id;
              return (
                <div
                  key={ex.id}
                  onClick={() => setSelectedExerciseDetail(isDetailActive ? null : ex)}
                  className={`p-3 rounded-xl transition-all cursor-pointer ${
                    isDetailActive
                      ? 'bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 shadow-2xs'
                      : 'hover:bg-[#FBF9F9] dark:hover:bg-[#202124] border border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-[#1B1C1C] dark:text-white">{ex.name}</span>
                        <span className="px-1.5 py-0.2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[9px] font-mono font-bold rounded-xs uppercase">
                          {ex.muscleGroup}
                        </span>
                        <span className={`px-1.5 py-0.2 text-[9px] font-mono font-bold rounded-xs uppercase ${
                          ex.category === 'Mobility' || ex.category === 'Flexibility'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            : ex.category === 'Endurance'
                            ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300'
                        }`}>
                          {ex.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#767676] dark:text-zinc-400 line-clamp-1">
                        {ex.targetMuscle} • {ex.equipment}
                      </p>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-2">
                      <div>
                        <span className="text-[11px] font-mono font-semibold text-[#1B1C1C] dark:text-white">
                          {ex.defaultSets} × {ex.defaultRepsOrDuration}
                        </span>
                        <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                          {ex.difficulty}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setVideoModalExercise(ex);
                        }}
                        title="Watch Exercise Demonstration Video"
                        className="w-7 h-7 rounded-lg bg-amber-400/20 hover:bg-amber-400/35 text-amber-900 dark:text-amber-300 flex items-center justify-center transition-colors shadow-2xs shrink-0"
                      >
                        <Play size={12} fill="currentColor" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail when clicked */}
                  {isDetailActive && (
                    <div className="mt-3 pt-2.5 border-t border-amber-200/80 dark:border-amber-800/60 space-y-2.5 animate-in fade-in duration-200 text-xs">
                      <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-[11px]">
                        {ex.description}
                      </p>

                      {/* Watch Video Demo Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setVideoModalExercise(ex);
                        }}
                        className="w-full py-2 bg-amber-400 hover:bg-amber-500 text-black rounded-lg text-xs font-display font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                      >
                        <Play size={13} fill="currentColor" />
                        <span>Watch Biomechanics Video Drill</span>
                      </button>

                      <div className="bg-white/80 dark:bg-[#141517] p-2.5 rounded-lg border border-amber-200 dark:border-amber-800 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-[#1B1C1C] dark:text-amber-400 uppercase block">
                          {t('workouts_form_cues')}:
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-[11px] text-zinc-600 dark:text-zinc-300">
                          {ex.formCues.map((cue, i) => (
                            <li key={i}>{cue}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 font-mono pt-1">
                        <span>{t('workouts_burn_rate')}: ~{ex.caloriesBurnPerHour} kcal/hr</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">{t('workouts_ready')}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredExercises.length === 0 && (
              <div className="py-8 text-center space-y-2">
                <p className="text-xs font-semibold text-[#1B1C1C] dark:text-white">{t('workouts_no_matches')}</p>
                <p className="text-[11px] text-[#767676] dark:text-zinc-400">Try choosing another muscle group or resetting filters.</p>
                <button
                  onClick={resetFilters}
                  className="text-xs text-[#242424] dark:text-amber-400 font-semibold underline"
                >
                  {t('workouts_reset_filters')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: FULL PROTOCOLS & GUIDED WORKOUT ROUTINES */}
        <div className="lg:col-span-6 space-y-4">
          {/* Modality Chips & Routine Counter */}
          <div className="bg-white dark:bg-[#18191A] border border-[#E5E5E5] dark:border-[#262729] rounded-2xl p-4 shadow-2xs space-y-3 transition-colors">
            <div className="flex items-center justify-between text-xs pb-1 border-b border-[#F2F2F2] dark:border-[#262729]">
              <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-wider text-[#1B1C1C] dark:text-white uppercase">
                <Layers size={13} />
                <span>{t('workouts_guided_protocols')}</span>
              </div>
              <span className="text-xs text-[#767676] dark:text-zinc-400 font-mono font-semibold">
                {filteredProtocols.length} {t('workouts_routines_count')}
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {modalities.map((modality) => {
                const isSelected = selectedModality === modality;
                return (
                  <button
                    key={modality}
                    onClick={() => setSelectedModality(modality)}
                    className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors font-medium ${
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

            {/* Quick Filters (Difficulty / Duration) */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <div className="text-[9px] font-mono uppercase text-[#767676] dark:text-zinc-400 mb-1">{t('workouts_difficulty')}</div>
                <div className="grid grid-cols-4 gap-1">
                  {['All', 'Beginner', 'Int.', 'Adv.'].map((item) => (
                    <button
                      key={item}
                      onClick={() => setDifficultyFilter(item)}
                      className={`py-1 text-[10px] rounded-sm transition-colors font-medium ${
                        difficultyFilter === item
                          ? 'bg-[#242424] dark:bg-amber-400 text-white dark:text-black font-bold'
                          : 'bg-[#FBF9F9] dark:bg-[#232427] border border-[#E5E5E5] dark:border-[#2E3034] text-[#4A4A4A] dark:text-zinc-300'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[9px] font-mono uppercase text-[#767676] dark:text-zinc-400 mb-1">{t('workouts_duration')}</div>
                <div className="grid grid-cols-4 gap-1">
                  {['Any', '15m', '30m', '45m+'].map((item) => (
                    <button
                      key={item}
                      onClick={() => setDurationFilter(item)}
                      className={`py-1 text-[10px] rounded-sm transition-colors font-medium ${
                        durationFilter === item
                          ? 'bg-[#242424] dark:bg-amber-400 text-white dark:text-black font-bold'
                          : 'bg-[#FBF9F9] dark:bg-[#232427] border border-[#E5E5E5] dark:border-[#2E3034] text-[#4A4A4A] dark:text-zinc-300'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Routine Cards List */}
          <div className="space-y-3">
            {filteredProtocols.map((protocol) => {
              return (
                <div
                  key={protocol.id}
                  className="bg-white dark:bg-[#18191A] border border-[#E5E5E5] dark:border-[#262729] rounded-xl overflow-hidden shadow-2xs hover:border-[#4A4A4A] dark:hover:border-zinc-500 transition-all"
                >
                  {/* Media Banner with Badges */}
                  <div className="relative aspect-16/7 w-full overflow-hidden bg-[#E5E5E5] dark:bg-zinc-800">
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
                  <div className="p-3.5 space-y-2.5">
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

                    <button
                      onClick={() => onStartWorkout(protocol)}
                      id={`begin-protocol-${protocol.id}`}
                      className="w-full py-2 px-3 bg-[#242424] dark:bg-amber-400 hover:bg-[#1B1C1C] dark:hover:bg-amber-500 text-white dark:text-black text-[11px] font-display font-semibold tracking-wider uppercase rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Play size={12} fill="currentColor" />
                      <span>{t('workouts_begin_protocol')}</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredProtocols.length === 0 && (
              <div className="bg-white dark:bg-[#18191A] border border-[#E5E5E5] dark:border-[#262729] rounded-xl p-8 text-center space-y-2">
                <p className="text-sm font-medium text-[#1B1C1C] dark:text-white">{t('workouts_no_matches')}</p>
                <p className="text-xs text-[#767676] dark:text-zinc-400">Try adjusting your search query or reset parameters.</p>
                <button
                  onClick={resetFilters}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[#242424] dark:text-amber-400 underline"
                >
                  <RotateCcw size={13} />
                  <span>{t('workouts_reset_filters')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Complete Gym Movement Index Modal */}
      <ExerciseLibraryModal
        isOpen={isExerciseIndexOpen}
        onClose={() => setIsExerciseIndexOpen(false)}
      />

      {/* Exercise Form Demonstration Video Modal */}
      <ExerciseVideoModal
        exercise={videoModalExercise}
        isOpen={Boolean(videoModalExercise)}
        onClose={() => setVideoModalExercise(null)}
      />
    </div>
  );
};
