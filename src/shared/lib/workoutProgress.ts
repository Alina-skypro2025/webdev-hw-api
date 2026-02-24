export type WorkoutProgress = {
  forwardBends: number; 
  backBends: number; 
  legRaises: number; 
};

const DEFAULT_PROGRESS: WorkoutProgress = {
  forwardBends: 0,
  backBends: 0,
  legRaises: 0,
};

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getProgressKey(userKey: string, courseId: string, workoutId: string) {
  return `skyfitness:progress:${userKey}:${courseId}:${workoutId}`;
}

export function getWorkoutProgress(userKey: string, courseId: string, workoutId: string): WorkoutProgress {
  const key = getProgressKey(userKey, courseId, workoutId);
  const data = safeParse<WorkoutProgress>(localStorage.getItem(key), DEFAULT_PROGRESS);
  return {
    forwardBends: Number(data.forwardBends) || 0,
    backBends: Number(data.backBends) || 0,
    legRaises: Number(data.legRaises) || 0,
  };
}

export function setWorkoutProgress(
  userKey: string,
  courseId: string,
  workoutId: string,
  progress: WorkoutProgress
) {
  const key = getProgressKey(userKey, courseId, workoutId);
  localStorage.setItem(key, JSON.stringify(progress));
}

export function calcPercent(progress: WorkoutProgress) {

 
  const ok = (progress.forwardBends > 0 && progress.backBends > 0 && progress.legRaises > 0);
  return ok ? 100 : 0;
}
