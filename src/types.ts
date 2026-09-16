export type NavTab = 'today' | 'workouts' | 'diary' | 'live' | 'progress' | 'workspace';

export interface MacroData {
  current: number;
  total: number;
  percentage: number;
}

export interface MealItem {
  id: string;
  name: string;
  portion: string;
  carbs: number;
  protein: number;
  fats: number;
  calories: number;
  image?: string;
}

export interface MealSection {
  id: string;
  name: string;
  timeLabel?: string;
  calories: number;
  carbs: number;
  protein: number;
  fats: number;
  items: MealItem[];
  isPending?: boolean;
}

export interface WorkoutProtocol {
  id: string;
  title: string;
  duration: number; // in minutes
  calories: number;
  rating: number;
  instructor: string;
  equipment: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  modality: 'HIIT' | 'Strength' | 'Mobility / Yoga' | 'Dance';
  badge: 'OPEN ACCESS' | 'PRO';
  imageUrl: string;
  isFavorite?: boolean;
}

export interface Drill {
  id: string;
  number: string;
  name: string;
  sets: number;
  workSeconds: number;
  load: string;
  impact: 'HIGH IMPACT' | 'MODERATE' | 'LOW IMPACT';
  imageUrl: string;
}

export interface AnalyticsData {
  athlete: {
    name: string;
    level: string;
    streakDays: number;
    avatarUrl: string;
  };
  weekRhythm: { day: string; checked: boolean }[];
  lifetime: {
    trainingHours: number;
    trainingHoursDelta: number;
    completedSessions: number;
    adherence: number;
    totalOutputKcal: number;
    currentWeightKg: number;
    weightNetChangeKg: number;
  };
  weightTrend: {
    week: string;
    weightKg: number;
    deficitKcal: number;
  }[];
  macroPrecision: {
    carbs: { name: string; subtitle: string; actual: number; target: number };
    protein: { name: string; subtitle: string; actual: number; target: number };
    fats: { name: string; subtitle: string; actual: number; target: number };
  };
  wearables: {
    todaySteps: number;
    activeOutputKcal: number;
    lastSynced: string;
  };
  milestones: {
    id: string;
    title: string;
    subtitle: string;
    icon: string;
    unlocked: boolean;
  }[];
  nextMilestone: {
    title: string;
    remaining: number;
  };
}

export type UserGoal = 'muscle_building' | 'fat_loss' | 'diet_nutrition' | 'endurance_hiit' | 'general_fitness';

export type DietaryPreference = 'veg' | 'non_veg' | 'eggetarian';

export interface UserGoalConfig {
  id: UserGoal;
  title: string;
  description: string;
  iconName: string;
  targetKcal: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
  recommendedModality: string;
  badge: string;
}
