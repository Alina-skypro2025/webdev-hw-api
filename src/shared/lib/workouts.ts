export type WorkoutItem = {
  id: string;        
  title: string;     
  subtitle: string;  
  youtubeId: string; 
};

export type CourseId = "yoga" | "stretching" | "fitness" | "stepaerobics" | "bodyflex";

export const WORKOUTS_BY_COURSE: Record<CourseId, WorkoutItem[]> = {
  yoga: [
    { id: "day-1", title: "Утренняя практика", subtitle: "Йога на каждый день / 1 день", youtubeId: "oCNnybFq-mQ" },
    { id: "day-2", title: "Красота и здоровье", subtitle: "Йога на каждый день / 2 день", youtubeId: "5AAry9LZzYw" },
    { id: "day-3", title: "Асаны стоя", subtitle: "Йога на каждый день / 3 день", youtubeId: "FAtd__R2pzM" },
    { id: "day-4", title: "Растягиваем мышцы бедра", subtitle: "Йога на каждый день / 4 день", youtubeId: "KA9CS_sVL_g" },
    { id: "day-5", title: "Гибкость спины", subtitle: "Йога на каждый день / 5 день", youtubeId: "cmxCEZCfiPQ" },
  ],
  stretching: [
    { id: "day-1", title: "Легкая растяжка", subtitle: "Стретчинг / 1 день", youtubeId: "AHhPoKBXBWQ" },
    { id: "day-2", title: "Мобилити", subtitle: "Стретчинг / 2 день", youtubeId: "4pfCBO3BGvg" },
  ],
  fitness: [
    { id: "day-1", title: "Кардио", subtitle: "Фитнес / 1 день", youtubeId: "IbA1zVI31jU" },
    { id: "day-2", title: "Тонус", subtitle: "Фитнес / 2 день", youtubeId: "4W2GIrvuZUc" },
  ],
  stepaerobics: [
    { id: "day-1", title: "Базовые шаги", subtitle: "Степ-аэробика / 1 день", youtubeId: "sGDbXqAlIpo" },
  ],
  bodyflex: [
    { id: "day-1", title: "Дыхание и тонус", subtitle: "Бодифлекс / 1 день", youtubeId: "5wb0tj-0kqM" },
  ],
};

export function isCourseId(x: string): x is CourseId {
  return x === "yoga" || x === "stretching" || x === "fitness" || x === "stepaerobics" || x === "bodyflex";
}
