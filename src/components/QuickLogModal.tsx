import React, { useState } from 'react';
import { X, Search, Plus, Check } from 'lucide-react';
import { MealItem } from '../types';
import { globalFoodDatabase, searchGlobalFoodDatabase } from '../data/foodDatabase';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSectionId?: string;
  onLogFood: (sectionId: string, item: MealItem) => void;
}

const commonFoods: MealItem[] = [
  {
    id: 'f-1',
    name: 'Grilled Salmon Fillet',
    portion: '150g',
    calories: 280,
    carbs: 0,
    protein: 34,
    fats: 15,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=160&auto=format&fit=crop&q=80',
  },
  {
    id: 'f-2',
    name: 'Brown Rice & Steamed Asparagus',
    portion: '1 bowl (200g)',
    calories: 215,
    carbs: 45,
    protein: 5,
    fats: 2,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=160&auto=format&fit=crop&q=80',
  },
  {
    id: 'f-3',
    name: 'Avocado Toast on Sourdough',
    portion: '2 slices (140g)',
    calories: 310,
    carbs: 32,
    protein: 9,
    fats: 16,
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=160&auto=format&fit=crop&q=80',
  },
  {
    id: 'f-4',
    name: 'Almond Butter & Banana Smoothie',
    portion: '350ml',
    calories: 260,
    carbs: 38,
    protein: 12,
    fats: 8,
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=160&auto=format&fit=crop&q=80',
  },
  {
    id: 'f-5',
    name: 'Egg White Scramble with Spinach',
    portion: '4 whites (150g)',
    calories: 140,
    carbs: 2,
    protein: 26,
    fats: 1.5,
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=160&auto=format&fit=crop&q=80',
  },
];

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  isOpen,
  onClose,
  defaultSectionId = 'dinner',
  onLogFood,
}) => {
  const [selectedSection, setSelectedSection] = useState(defaultSectionId);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'search' | 'custom'>('search');

  // Custom food inputs
  const [customName, setCustomName] = useState('');
  const [customPortion, setCustomPortion] = useState('1 serving');
  const [customCalories, setCustomCalories] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customFats, setCustomFats] = useState('');

  if (!isOpen) return null;

  const filteredFoods = search.trim()
    ? searchGlobalFoodDatabase(search)
    : [...commonFoods, ...globalFoodDatabase.slice(0, 10)];

  const handleSelectFood = (food: MealItem) => {
    onLogFood(selectedSection, { ...food, id: `logged-${Date.now()}` });
    onClose();
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newItem: MealItem = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      portion: customPortion || '1 serving',
      calories: Number(customCalories) || 200,
      carbs: Number(customCarbs) || 20,
      protein: Number(customProtein) || 15,
      fats: Number(customFats) || 5,
    };

    onLogFood(selectedSection, newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E5E5E5] rounded-2xl w-full max-w-md overflow-hidden shadow-xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#E5E5E5] flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-lg text-[#1B1C1C]">
              Log Nutrition
            </h2>
            <p className="text-xs text-[#767676]">Add meal to kinetic diary</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-md text-[#767676] hover:text-[#1B1C1C] hover:bg-[#F2F2F2] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Section Target Select */}
        <div className="px-5 pt-3 pb-2 border-b border-[#F2F2F2]">
          <div className="text-[10px] font-mono uppercase text-[#767676] mb-1.5 font-medium">
            SELECT PERIOD
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {['breakfast', 'lunch', 'dinner', 'snacks'].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => setSelectedSection(sec)}
                className={`py-1.5 px-2 text-xs rounded-md capitalize font-medium transition-colors ${
                  selectedSection === sec
                    ? 'bg-[#242424] text-white'
                    : 'bg-[#FBF9F9] border border-[#E5E5E5] text-[#4A4A4A] hover:bg-[#F2F2F2]'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="px-5 pt-3 flex gap-2">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'search'
                ? 'bg-[#F2F2F2] text-[#1B1C1C]'
                : 'text-[#767676] hover:text-[#1B1C1C]'
            }`}
          >
            Verified Database
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'custom'
                ? 'bg-[#F2F2F2] text-[#1B1C1C]'
                : 'text-[#767676] hover:text-[#1B1C1C]'
            }`}
          >
            Manual Entry
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'search' ? (
            <>
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#767676]"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search whole foods, brands..."
                  className="w-full bg-[#FBF9F9] border border-[#E5E5E5] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1B1C1C] focus:outline-hidden focus:border-[#242424]"
                />
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-mono text-[#767676] uppercase">
                  RECOMMENDED ITEMS
                </div>
                {filteredFoods.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => handleSelectFood(food)}
                    className="w-full text-left p-2.5 rounded-xl border border-[#E5E5E5] hover:border-[#242424] bg-white transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      {food.image && (
                        <img
                          src={food.image}
                          alt={food.name}
                          className="w-10 h-10 rounded-md object-cover border border-[#E5E5E5]"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div>
                        <div className="font-semibold text-xs text-[#1B1C1C] group-hover:text-black">
                          {food.name}
                        </div>
                        <div className="text-[11px] text-[#767676]">
                          {food.portion} • {food.carbs}g C • {food.protein}g P • {food.fats}g F
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="font-display font-bold text-xs text-[#1B1C1C]">
                          {food.calories}
                        </div>
                        <div className="text-[10px] text-[#767676]">kcal</div>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-[#F2F2F2] flex items-center justify-center text-[#242424] group-hover:bg-[#242424] group-hover:text-white transition-colors">
                        <Plus size={12} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <form onSubmit={handleAddCustom} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-[#1B1C1C] block mb-1">
                  Food Item Name
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Sweet Potato & Flank Steak"
                  className="w-full bg-[#FBF9F9] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-[#242424]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#1B1C1C] block mb-1">
                  Portion / Serving
                </label>
                <input
                  type="text"
                  value={customPortion}
                  onChange={(e) => setCustomPortion(e.target.value)}
                  placeholder="e.g. 1 plate (300g)"
                  className="w-full bg-[#FBF9F9] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-[#242424]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-[#1B1C1C] block mb-1">
                    Calories (kcal)
                  </label>
                  <input
                    type="number"
                    required
                    value={customCalories}
                    onChange={(e) => setCustomCalories(e.target.value)}
                    placeholder="350"
                    className="w-full bg-[#FBF9F9] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-[#242424]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#1B1C1C] block mb-1">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(e.target.value)}
                    placeholder="40"
                    className="w-full bg-[#FBF9F9] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-[#242424]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-[#1B1C1C] block mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(e.target.value)}
                    placeholder="30"
                    className="w-full bg-[#FBF9F9] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-[#242424]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#1B1C1C] block mb-1">
                    Fats (g)
                  </label>
                  <input
                    type="number"
                    value={customFats}
                    onChange={(e) => setCustomFats(e.target.value)}
                    placeholder="10"
                    className="w-full bg-[#FBF9F9] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-[#242424]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-3 py-2.5 bg-[#242424] hover:bg-[#1B1C1C] text-white font-display font-semibold text-xs tracking-wider uppercase rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus size={14} />
                <span>Add Item to {selectedSection}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
