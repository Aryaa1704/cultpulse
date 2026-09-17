import React, { useState, useMemo } from 'react';
import {
  Search,
  Dumbbell,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Flame,
  Info,
  Check,
  ChevronRight,
  ShieldAlert,
  Zap,
  Play
} from 'lucide-react';
import {
  comprehensiveExerciseDatabase,
  ExerciseItem,
  MuscleGroup,
  ExerciseCategory,
  EquipmentType,
} from '../data/exerciseDatabase';
import { ExerciseVideoModal } from './ExerciseVideoModal';

interface ExerciseLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise?: (exercise: ExerciseItem) => void;
}

export const ExerciseLibraryModal: React.FC<ExerciseLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectExercise,
}) => {
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('All Muscles');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Disciplines');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('All Equipment');
  const [activeExerciseDetail, setActiveExerciseDetail] = useState<ExerciseItem | null>(null);
  const [videoModalExercise, setVideoModalExercise] = useState<ExerciseItem | null>(null);
  const [loggedNotification, setLoggedNotification] = useState<string | null>(null);

  const muscleGroups: string[] = [
    'All Muscles',
    'Chest',
    'Back',
    'Legs',
    'Shoulders',
    'Arms',
    'Core / Abs',
    'Full Body',
  ];

  const categories: string[] = [
    'All Disciplines',
    'Strength',
    'Hypertrophy',
    'Mobility',
    'Flexibility',
    'Endurance',
  ];

  const equipmentList: string[] = [
    'All Equipment',
    'Barbell',
    'Dumbbell',
    'Cables / Machine',
    'Bodyweight',
    'Mat / Resistance Band',
    'Kettlebell',
  ];

  const filteredExercises = useMemo(() => {
    return comprehensiveExerciseDatabase.filter((item) => {
      if (selectedMuscle !== 'All Muscles' && item.muscleGroup !== selectedMuscle) return false;
      if (selectedCategory !== 'All Disciplines' && item.category !== selectedCategory) return false;
      if (selectedEquipment !== 'All Equipment' && item.equipment !== selectedEquipment) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchTarget = item.targetMuscle.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        return matchName || matchTarget || matchDesc;
      }
      return true;
    });
  }, [search, selectedMuscle, selectedCategory, selectedEquipment]);

  if (!isOpen) return null;

  const handleStartOrLog = (ex: ExerciseItem) => {
    if (onSelectExercise) {
      onSelectExercise(ex);
    }
    setLoggedNotification(`Added "${ex.name}" to active workout routine!`);
    setTimeout(() => setLoggedNotification(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FBF9F9] border border-[#E5E5E5] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 md:p-5 bg-white border-b border-[#E5E5E5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#242424] text-white flex items-center justify-center shrink-0">
              <Dumbbell size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-lg md:text-xl text-[#1B1C1C]">
                  Complete Gym Movement Index
                </h2>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded-full">
                  {comprehensiveExerciseDatabase.length} EXERCISES
                </span>
              </div>
              <p className="text-xs text-[#767676] mt-0.5">
                Targeted anatomy by Chest, Back, Legs, Arms, Shoulders, Mobility, Flexibility & Endurance.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-[#767676] hover:text-[#1B1C1C] hover:bg-[#F2F2F2] flex items-center justify-center transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* Search & Modality Selectors */}
        <div className="p-4 bg-white border-b border-[#E5E5E5] space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#767676]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exercise (e.g., Bench Press, Deadlift, 90/90 Hip, Bicep Curl)..."
              className="w-full bg-[#FBF9F9] border border-[#E5E5E5] rounded-xl pl-10 pr-4 py-2.5 text-xs md:text-sm text-[#1B1C1C] placeholder:text-[#767676] focus:outline-hidden focus:border-[#242424]"
            />
          </div>

          {/* Muscle Group Chips */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono text-[#767676] uppercase tracking-wider font-semibold">
              BODY PART / ANATOMY
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {muscleGroups.map((muscle) => (
                <button
                  key={muscle}
                  onClick={() => setSelectedMuscle(muscle)}
                  className={`px-3 py-1.2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    selectedMuscle === muscle
                      ? 'bg-[#242424] text-white shadow-xs'
                      : 'bg-[#F2F2F2] hover:bg-[#EAEAEA] text-[#4A4A4A]'
                  }`}
                >
                  {muscle}
                </button>
              ))}
            </div>
          </div>

          {/* Discipline & Equipment Filter Row */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[#767676] font-mono text-[10px] uppercase">Discipline:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-[#F2F2F2] border border-[#E5E5E5] text-xs font-semibold rounded-md px-2 py-1 text-[#1B1C1C] focus:outline-hidden"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[#767676] font-mono text-[10px] uppercase">Equipment:</span>
              <select
                value={selectedEquipment}
                onChange={(e) => setSelectedEquipment(e.target.value)}
                className="bg-[#F2F2F2] border border-[#E5E5E5] text-xs font-semibold rounded-md px-2 py-1 text-[#1B1C1C] focus:outline-hidden"
              >
                {equipmentList.map((eq) => (
                  <option key={eq} value={eq}>{eq}</option>
                ))}
              </select>
            </div>

            {(selectedMuscle !== 'All Muscles' || selectedCategory !== 'All Disciplines' || selectedEquipment !== 'All Equipment' || search) && (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedMuscle('All Muscles');
                  setSelectedCategory('All Disciplines');
                  setSelectedEquipment('All Equipment');
                }}
                className="text-xs text-rose-600 hover:underline inline-flex items-center gap-1 ml-auto"
              >
                <RotateCcw size={12} />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Notification Bar */}
        {loggedNotification && (
          <div className="p-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
            <Check size={14} className="text-emerald-600" />
            <span>{loggedNotification}</span>
          </div>
        )}

        {/* Main Exercise Grid / Feed */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredExercises.map((ex) => (
              <div
                key={ex.id}
                className="p-3.5 bg-white border border-[#E5E5E5] hover:border-[#242424] rounded-xl transition-all shadow-2xs flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 bg-[#242424] text-white text-[9px] font-mono font-bold rounded-xs uppercase">
                          {ex.muscleGroup}
                        </span>
                        <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded-xs uppercase ${
                          ex.category === 'Strength' ? 'bg-amber-100 text-amber-900' :
                          ex.category === 'Mobility' ? 'bg-blue-100 text-blue-900' :
                          ex.category === 'Flexibility' ? 'bg-purple-100 text-purple-900' :
                          ex.category === 'Endurance' ? 'bg-rose-100 text-rose-900' :
                          'bg-zinc-100 text-zinc-900'
                        }`}>
                          {ex.category}
                        </span>
                        <span className="text-[10px] text-[#767676]">
                          • {ex.equipment}
                        </span>
                      </div>
                      <h4 className="font-display font-bold text-sm text-[#1B1C1C] mt-1 group-hover:text-black">
                        {ex.name}
                      </h4>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                        {ex.defaultSets} sets × {ex.defaultRepsOrDuration}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#555] leading-relaxed line-clamp-2">
                    {ex.description}
                  </p>

                  <div className="p-2 bg-[#FBF9F9] rounded-lg border border-[#EAEAEA] text-[11px] text-[#444] space-y-1">
                    <span className="font-semibold text-[10px] font-mono uppercase text-[#767676]">KEY TARGET:</span> {ex.targetMuscle}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-[#F2F2F2] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveExerciseDetail(ex)}
                      className="text-xs text-[#242424] font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <Info size={13} />
                      <span>Form Cues</span>
                    </button>

                    <button
                      onClick={() => setVideoModalExercise(ex)}
                      className="text-xs text-amber-700 font-semibold hover:underline inline-flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md"
                    >
                      <Play size={11} fill="currentColor" />
                      <span>Demo</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleStartOrLog(ex)}
                    className="px-3 py-1.5 bg-[#242424] hover:bg-black text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Play size={12} fill="currentColor" />
                    <span>Log Sets</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredExercises.length === 0 && (
            <div className="p-10 text-center bg-white border border-[#E5E5E5] rounded-xl space-y-2">
              <p className="font-medium text-sm text-[#1B1C1C]">No exercises match your search filters</p>
              <p className="text-xs text-[#767676]">Try resetting muscle groups or equipment filters.</p>
            </div>
          )}
        </div>

        {/* Detailed Form & Cue Modal Drawer */}
        {activeExerciseDetail && (
          <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl border border-[#E5E5E5] animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#767676] uppercase">
                    PRO COACHING DRILL & BIOMECHANICS
                  </span>
                  <h3 className="font-display font-bold text-lg text-[#1B1C1C]">
                    {activeExerciseDetail.name}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveExerciseDetail(null)}
                  className="w-7 h-7 rounded-md hover:bg-zinc-100 flex items-center justify-center text-[#767676]"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 bg-zinc-50 border rounded-lg">
                    <span className="text-zinc-500">Target Muscle:</span>
                    <p className="font-bold text-zinc-900">{activeExerciseDetail.targetMuscle}</p>
                  </div>
                  <div className="p-2 bg-zinc-50 border rounded-lg">
                    <span className="text-zinc-500">Burn Rate:</span>
                    <p className="font-bold text-emerald-700">~{activeExerciseDetail.caloriesBurnPerHour} kcal/hr</p>
                  </div>
                </div>

                {/* Watch Movement Video Demo Button */}
                <button
                  onClick={() => setVideoModalExercise(activeExerciseDetail)}
                  className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-black rounded-xl text-xs font-display font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Play size={14} fill="currentColor" />
                  <span>Watch Biomechanics Video Drill</span>
                </button>

                <div>
                  <h5 className="font-bold text-xs text-[#1B1C1C] mb-1.5 flex items-center gap-1.5">
                    <Zap size={14} className="text-amber-500" />
                    <span>Execution Protocol & Form Cues:</span>
                  </h5>
                  <ul className="space-y-1.5 list-disc pl-4 text-[#333]">
                    {activeExerciseDetail.formCues.map((cue, idx) => (
                      <li key={idx} className="leading-snug">{cue}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] space-y-1">
                  <span className="font-bold">Coach Tip for Safety:</span>
                  <p>Never sacrifice form for ego load. Control the 3-second eccentric phase on every repetition to maximize muscle protein synthesis and prevent ligament strain.</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setActiveExerciseDetail(null)}
                  className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg text-xs font-semibold hover:bg-zinc-200"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleStartOrLog(activeExerciseDetail);
                    setActiveExerciseDetail(null);
                  }}
                  className="px-4 py-2 bg-[#242424] text-white rounded-lg text-xs font-semibold hover:bg-black"
                >
                  Add To Workout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Exercise Video Player Modal */}
      <ExerciseVideoModal
        exercise={videoModalExercise}
        isOpen={Boolean(videoModalExercise)}
        onClose={() => setVideoModalExercise(null)}
      />
    </div>
  );
};
