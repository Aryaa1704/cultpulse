import React, { useState, useMemo } from 'react';
import { Search, Heart, Clock, Zap, Star, Play, RotateCcw, X, SlidersHorizontal } from 'lucide-react';
import { WorkoutProtocol } from '../types';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModality, setSelectedModality] = useState<string>('All Disciplines');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [durationFilter, setDurationFilter] = useState<string>('Any');
  const [equipmentFilter, setEquipmentFilter] = useState<string>('All');

  const modalities = ['All Disciplines', 'HIIT', 'Strength', 'Mobility / Yoga'];

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedModality('All Disciplines');
    setDifficultyFilter('All');
    setDurationFilter('Any');
    setEquipmentFilter('All');
  };

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
      {/* Title & Kinetic Index Header */}
      <div className="pt-2 px-1">
        <div className="flex items-center gap-1.5 text-[11px] font-mono tracking-widest text-[#767676] uppercase font-semibold mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#242424]"></span>
          <span>KINETIC INDEX</span>
        </div>
        <h1 className="font-display font-bold text-2xl md:text-3xl text-[#1B1C1C] tracking-tight">
          Workout Library
        </h1>
        <p className="text-xs md:text-sm text-[#767676] mt-1 leading-relaxed">
          Curated collection of instructional movement, conditioning, and recovery protocols.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#767676]"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search movements, trainers, disciplines..."
          className="w-full bg-white border border-[#E5E5E5] rounded-xl pl-10 pr-9 py-2.5 text-xs md:text-sm text-[#1B1C1C] placeholder:text-[#767676] focus:outline-hidden focus:border-[#242424] transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#767676] hover:text-[#1B1C1C]"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Modality Chips */}
      <div>
        <div className="flex items-center justify-between text-xs mb-2 px-1">
          <span className="text-[11px] font-mono font-medium tracking-widest text-[#767676] uppercase">
            MODALITY
          </span>
          <span className="text-xs text-[#767676]">
            {filteredProtocols.length} {filteredProtocols.length === 1 ? 'Routine' : 'Routines'}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {modalities.map((modality) => {
            const isSelected = selectedModality === modality;
            return (
              <button
                key={modality}
                onClick={() => setSelectedModality(modality)}
                className={`px-3 py-1.5 text-xs rounded-md whitespace-nowrap transition-colors font-medium ${
                  isSelected
                    ? 'bg-[#242424] text-white'
                    : 'bg-white border border-[#E5E5E5] text-[#4A4A4A] hover:bg-[#F2F2F2]'
                }`}
              >
                {modality}
              </button>
            );
          })}
        </div>
      </div>

      {/* Parameters Filter Box */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs pb-1 border-b border-[#F2F2F2]">
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-wider text-[#1B1C1C] uppercase">
            <SlidersHorizontal size={13} />
            <span>PARAMETERS</span>
          </div>
          <button
            onClick={resetFilters}
            className="text-xs text-[#767676] hover:text-[#1B1C1C] underline transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Difficulty */}
        <div>
          <div className="text-[10px] font-mono uppercase text-[#767676] mb-1.5">DIFFICULTY</div>
          <div className="grid grid-cols-4 gap-1.5">
            {['All', 'Beginner', 'Int.', 'Adv.'].map((item) => (
              <button
                key={item}
                onClick={() => setDifficultyFilter(item)}
                className={`py-1 text-xs rounded-sm transition-colors font-medium ${
                  difficultyFilter === item
                    ? 'bg-[#242424] text-white'
                    : 'bg-[#FBF9F9] border border-[#E5E5E5] text-[#4A4A4A] hover:bg-[#F2F2F2]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <div className="text-[10px] font-mono uppercase text-[#767676] mb-1.5">DURATION</div>
          <div className="grid grid-cols-4 gap-1.5">
            {['Any', '15m', '30m', '45m+'].map((item) => (
              <button
                key={item}
                onClick={() => setDurationFilter(item)}
                className={`py-1 text-xs rounded-sm transition-colors font-medium ${
                  durationFilter === item
                    ? 'bg-[#242424] text-white'
                    : 'bg-[#FBF9F9] border border-[#E5E5E5] text-[#4A4A4A] hover:bg-[#F2F2F2]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Equipment */}
        <div>
          <div className="text-[10px] font-mono uppercase text-[#767676] mb-1.5">EQUIPMENT</div>
          <div className="grid grid-cols-4 gap-1.5">
            {['All', 'Bodyweight', 'Dumbbells', 'Mat'].map((item) => (
              <button
                key={item}
                onClick={() => setEquipmentFilter(item)}
                className={`py-1 text-xs rounded-sm transition-colors font-medium ${
                  equipmentFilter === item
                    ? 'bg-[#242424] text-white'
                    : 'bg-[#FBF9F9] border border-[#E5E5E5] text-[#4A4A4A] hover:bg-[#F2F2F2]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Workout Cards List */}
      <div className="space-y-4">
        {filteredProtocols.map((protocol) => {
          return (
            <div
              key={protocol.id}
              className="bg-white border border-[#E5E5E5] rounded-xl overflow-hidden shadow-2xs hover:border-[#4A4A4A] transition-all"
            >
              {/* Media Container with Badges */}
              <div className="relative aspect-16/9 w-full bg-[#1B1C1C] overflow-hidden">
                <img
                  src={protocol.imageUrl}
                  alt={protocol.title}
                  className="w-full h-full object-cover opacity-90 hover:scale-102 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                {/* Top Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-mono tracking-wider font-semibold rounded-xs uppercase">
                    {protocol.badge}
                  </span>
                  <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-mono tracking-wider font-semibold rounded-xs uppercase">
                    {protocol.difficulty}
                  </span>
                </div>

                {/* Favorite Heart */}
                <button
                  onClick={() => onToggleFavorite(protocol.id)}
                  aria-label="Toggle favorite"
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                >
                  <Heart
                    size={16}
                    fill={protocol.isFavorite ? '#ef4444' : 'none'}
                    className={protocol.isFavorite ? 'text-red-500' : 'text-white'}
                  />
                </button>

                {/* Bottom Stats Overlay */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white/90 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[11px] font-mono">
                      <Clock size={12} />
                      <span>{protocol.duration}m</span>
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-mono">
                      <Zap size={12} className="text-yellow-400" />
                      <span>{protocol.calories} kcal</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-mono">
                    <Star size={12} className="text-yellow-400" fill="#facc15" />
                    <span>{protocol.rating}</span>
                  </div>
                </div>
              </div>

              {/* Workout Details & CTA */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-display font-bold text-base text-[#1B1C1C] leading-snug">
                    {protocol.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-[#767676]">
                    <div className="w-5 h-5 rounded-full bg-[#F2F2F2] border border-[#E5E5E5] flex items-center justify-center text-[10px] font-bold text-[#1B1C1C]">
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
                  className="w-full py-2.5 px-4 bg-[#242424] hover:bg-[#1B1C1C] text-white text-xs font-display font-semibold tracking-wider uppercase rounded-lg flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <Play size={13} fill="currentColor" />
                  <span>BEGIN PROTOCOL</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredProtocols.length === 0 && (
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-8 text-center space-y-2">
            <p className="text-sm font-medium text-[#1B1C1C]">No routines found</p>
            <p className="text-xs text-[#767676]">Try adjusting your search query or reset parameters.</p>
            <button
              onClick={resetFilters}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[#242424] underline"
            >
              <RotateCcw size={13} />
              <span>Reset all filters</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
