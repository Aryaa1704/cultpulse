import React, { useState } from 'react';
import { X, Sparkles, ChefHat, Clock, Flame, Dumbbell, Check, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { DietaryPreference } from '../types';

interface GeneratedRecipe {
  dishName: string;
  prepTime: string;
  difficulty: string;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  ingredientsUsed: string[];
  instructions: string[];
  chefTip: string;
  healthBenefit: string;
  dietaryCategory: string;
  source: string;
}

interface IngredientRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  dietaryPreference?: DietaryPreference;
  onLogDish: (
    sectionId: string,
    item: {
      name: string;
      portion: string;
      calories: number;
      carbs: number;
      protein: number;
      fats: number;
      image?: string;
    }
  ) => void;
}

export const IngredientRecipeModal: React.FC<IngredientRecipeModalProps> = ({
  isOpen,
  onClose,
  dietaryPreference = 'veg',
  onLogDish,
}) => {
  const [ingredientsText, setIngredientsText] = useState('');
  const [targetMeal, setTargetMeal] = useState<'breakfast' | 'lunch' | 'dinner' | 'snacks'>('lunch');
  const [targetKcal, setTargetKcal] = useState<number>(400);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<GeneratedRecipe | null>(null);
  const [isLogged, setIsLogged] = useState(false);

  if (!isOpen) return null;

  // Curated quick ingredients based on user dietary lifestyle
  const commonIngredients =
    dietaryPreference === 'veg'
      ? ['Paneer', 'Spinach', 'Tomatoes', 'Oats', 'Onions', 'Moong Dal', 'Brown Rice', 'Greek Yogurt', 'Bell Peppers', 'Garlic', 'Tofu']
      : dietaryPreference === 'eggetarian'
      ? ['Eggs', 'Paneer', 'Whole Grain Bread', 'Tomatoes', 'Spinach', 'Oats', 'Onions', 'Potatoes', 'Milk', 'Mushrooms', 'Cheese']
      : ['Chicken Breast', 'Eggs', 'Rice', 'Broccoli', 'Fish Fillet', 'Tomatoes', 'Onions', 'Sweet Potato', 'Spinach', 'Greek Yogurt'];

  const handleAddChip = (item: string) => {
    const current = ingredientsText.trim();
    if (!current) {
      setIngredientsText(item);
    } else if (!current.toLowerCase().includes(item.toLowerCase())) {
      setIngredientsText(`${current}, ${item}`);
    }
  };

  const handleGenerate = async () => {
    if (!ingredientsText.trim()) {
      setError('Please enter at least one ingredient you have at home.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecipe(null);
    setIsLogged(false);

    try {
      const res = await fetch('/api/generate-recipe-from-ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: ingredientsText,
          dietaryPreference,
          mealType: targetMeal,
          targetKcal,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate recipe');
      }

      const data: GeneratedRecipe = await res.json();
      setRecipe(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogToDiary = () => {
    if (!recipe) return;

    onLogDish(targetMeal, {
      name: recipe.dishName,
      portion: `1 portion (${recipe.prepTime})`,
      calories: recipe.calories,
      carbs: recipe.carbs,
      protein: recipe.protein,
      fats: recipe.fats,
      image:
        dietaryPreference === 'veg'
          ? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=160&auto=format&fit=crop&q=80'
          : dietaryPreference === 'eggetarian'
          ? 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=160&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=160&auto=format&fit=crop&q=80',
    });

    setIsLogged(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#1A1B1E] border border-[#E5E5E5] dark:border-[#2C2D30] rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#E5E5E5] dark:border-[#2C2D30] bg-[#FBF9F9] dark:bg-[#141517]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ChefHat size={20} />
            </div>
            <div>
              <h2 className="font-display font-bold text-base sm:text-lg text-[#1B1C1C] dark:text-white flex items-center gap-1.5">
                <span>AI Pantry Recipe Maker</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                  {dietaryPreference === 'veg' ? '🥦 VEG' : dietaryPreference === 'eggetarian' ? '🥚 EGG' : '🍗 NON-VEG'}
                </span>
              </h2>
              <p className="text-xs text-[#767676] dark:text-zinc-400">
                Enter your available ingredients, and AI creates a healthy dish with calories & macros.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#767676] hover:text-[#1B1C1C] dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#252629] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Ingredients Input */}
          <div>
            <label className="block text-xs font-mono font-semibold text-[#1B1C1C] dark:text-white uppercase tracking-wider mb-1.5">
              Available Raw Materials / Ingredients:
            </label>
            <textarea
              rows={2}
              value={ingredientsText}
              onChange={(e) => setIngredientsText(e.target.value)}
              placeholder="e.g. 2 eggs, 1 tomato, 1 onion, whole wheat bread, cheese..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5D5D5] dark:border-[#383A3E] bg-white dark:bg-[#121314] text-[#1B1C1C] dark:text-white text-sm focus:outline-hidden focus:border-[#242424] dark:focus:border-amber-400 transition-colors placeholder:text-[#999] dark:placeholder:text-zinc-500"
            />
          </div>

          {/* Quick Tap Chips */}
          <div>
            <div className="text-[11px] font-mono text-[#767676] dark:text-zinc-400 mb-1.5">
              Tap to add ingredients:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {commonIngredients.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleAddChip(item)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F2F2F2] dark:bg-[#25262A] text-[#242424] dark:text-zinc-200 hover:bg-[#E5E5E5] dark:hover:bg-[#303236] transition-colors"
                >
                  + {item}
                </button>
              ))}
            </div>
          </div>

          {/* Meal Type & Target Calories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-mono font-semibold text-[#767676] dark:text-zinc-400 uppercase tracking-wider mb-1">
                Meal Category:
              </label>
              <div className="grid grid-cols-4 gap-1">
                {(['breakfast', 'lunch', 'dinner', 'snacks'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setTargetMeal(m)}
                    className={`py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                      targetMeal === m
                        ? 'bg-[#242424] dark:bg-amber-400 text-white dark:text-black font-bold'
                        : 'bg-[#F2F2F2] dark:bg-[#25262A] text-[#4A4A4A] dark:text-zinc-300'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-semibold text-[#767676] dark:text-zinc-400 uppercase tracking-wider mb-1">
                Target Calories: <span className="text-[#1B1C1C] dark:text-amber-400 font-bold">~{targetKcal} kcal</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="200"
                  max="800"
                  step="50"
                  value={targetKcal}
                  onChange={(e) => setTargetKcal(Number(e.target.value))}
                  className="w-full accent-[#242424] dark:accent-amber-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Action Trigger */}
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-[#242424] hover:bg-black dark:bg-amber-400 dark:hover:bg-amber-500 text-white dark:text-black font-display font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-md cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Crafting Recipe & Calculating Nutrition...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Cook Dish from Ingredients</span>
              </>
            )}
          </button>

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Generated Recipe Card */}
          {recipe && (
            <div className="mt-4 p-4 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-3.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display font-bold text-base sm:text-lg text-[#1B1C1C] dark:text-white">
                    {recipe.dishName}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-[#767676] dark:text-zinc-400 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock size={13} /> {recipe.prepTime}
                    </span>
                    <span>•</span>
                    <span>{recipe.difficulty} Prep</span>
                    <span>•</span>
                    <span className="capitalize">{recipe.mealType}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-display font-bold text-[#1B1C1C] dark:text-amber-400 flex items-center justify-end gap-1">
                    <Flame size={18} className="text-amber-500" />
                    {recipe.calories}
                  </div>
                  <div className="text-[10px] font-mono text-[#767676] dark:text-zinc-400 uppercase">KCAL</div>
                </div>
              </div>

              {/* Macro Nutrients */}
              <div className="grid grid-cols-4 gap-2 bg-white dark:bg-[#161719] p-2.5 rounded-lg border border-[#E5E5E5] dark:border-[#2C2D30] text-center">
                <div>
                  <div className="text-[10px] font-mono text-[#767676] dark:text-zinc-400">PROTEIN</div>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{recipe.protein}g</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-[#767676] dark:text-zinc-400">CARBS</div>
                  <div className="text-sm font-bold text-amber-600 dark:text-amber-400">{recipe.carbs}g</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-[#767676] dark:text-zinc-400">FATS</div>
                  <div className="text-sm font-bold text-rose-600 dark:text-rose-400">{recipe.fats}g</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-[#767676] dark:text-zinc-400">FIBER</div>
                  <div className="text-sm font-bold text-blue-600 dark:text-blue-400">{recipe.fiber}g</div>
                </div>
              </div>

              {/* Cooking Steps */}
              <div>
                <div className="text-xs font-mono font-semibold text-[#1B1C1C] dark:text-white uppercase mb-1.5">
                  How to Cook:
                </div>
                <ol className="space-y-1.5 list-decimal list-inside text-xs text-[#4A4A4A] dark:text-zinc-300">
                  {recipe.instructions.map((step, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {step.replace(/^\d+[\.\)]\s*/, '')}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Chef Tip & Health Benefit */}
              <div className="text-xs bg-white dark:bg-[#161719] p-3 rounded-lg border border-[#E5E5E5] dark:border-[#2C2D30] space-y-1 text-[#4A4A4A] dark:text-zinc-300">
                <div className="font-semibold text-[#1B1C1C] dark:text-amber-300 flex items-center gap-1.5">
                  <ChefHat size={14} />
                  <span>Chef's Tip:</span>
                </div>
                <p>{recipe.chefTip}</p>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400 pt-1">
                  💡 {recipe.healthBenefit}
                </div>
              </div>

              {/* Log Dish Button */}
              <button
                onClick={handleLogToDiary}
                disabled={isLogged}
                className={`w-full py-2.5 rounded-xl font-display font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
                  isLogged
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#242424] hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black cursor-pointer shadow-xs'
                }`}
              >
                {isLogged ? (
                  <>
                    <Check size={16} />
                    <span>Logged to {targetMeal.toUpperCase()}!</span>
                  </>
                ) : (
                  <>
                    <span>Log this Dish to {targetMeal.toUpperCase()} (+{recipe.calories} kcal)</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
