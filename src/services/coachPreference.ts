// Coach / Athlete Gender Preference Service
// Synchronizes gender-specific demonstration video selection across Workouts, Exercise Library, and Live Sessions.

export type CoachGender = 'male' | 'female';

const STORAGE_KEY = 'cultpulse_coach_gender';

export const getCoachGender = (): CoachGender => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'male' || saved === 'female') {
      return saved;
    }
  } catch (e) {
    // ignore
  }
  return 'male';
};

export const setCoachGender = (gender: CoachGender): void => {
  try {
    localStorage.setItem(STORAGE_KEY, gender);
    window.dispatchEvent(new CustomEvent('cultpulse:coach-gender-change', { detail: { gender } }));
  } catch (e) {
    // ignore
  }
};
