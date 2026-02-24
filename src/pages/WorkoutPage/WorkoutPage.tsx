import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import styles from "./WorkoutPage.module.css";

import { getUser } from "../../shared/lib/auth";
import { 
  getCourseWorkouts, 
  getWorkoutProgress, 
  saveWorkoutProgress,
  type Workout,
  type WorkoutProgress as APIWorkoutProgress
} from "../../shared/api/courses";

function clampInt(v: string) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

const API_ID_TO_SLUG: Record<string, string> = {
  "6i67sm": "stepaerobics",
  "ab1c3f": "yoga",
  "kfpq8e": "stretching",
  "q02a6i": "bodyflex",
  "ypox9r": "fitness"
};

export function WorkoutPage() {
  const navigate = useNavigate();
  const params = useParams<{ workoutId: string }>();
  const courseIdRaw = params.workoutId || "";
  
  const courseSlug = useMemo(() => {
    if (["yoga", "stretching", "fitness", "stepaerobics", "bodyflex"].includes(courseIdRaw)) {
      return courseIdRaw;
    }
    if (courseIdRaw in API_ID_TO_SLUG) {
      return API_ID_TO_SLUG[courseIdRaw];
    }
    return null;
  }, [courseIdRaw]);

  const user = getUser();
  const userKey = user?.email || user?.login || user?.username || "";

  useEffect(() => {
    if (!userKey) {
      navigate("/login?mode=login", { replace: true });
      return;
    }
    if (!courseSlug) {
      navigate("/profile", { replace: true });
      return;
    }
  }, [userKey, courseSlug, navigate]);

  
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!courseSlug) return;
    
    
    const slugToId = Object.entries(API_ID_TO_SLUG).find(([, slug]) => slug === courseSlug)?.[0] || courseSlug;
    
    getCourseWorkouts(slugToId)
      .then((data) => {
        setWorkouts(data);
        setLoading(false);
      })
      .catch(() => {
        setWorkouts([]);
        setLoading(false);
      });
  }, [courseSlug]);

  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>("");
  const [isSelectOpen, setIsSelectOpen] = useState(true);

  useEffect(() => {
    if (workouts.length > 0 && !selectedWorkoutId) {
      setSelectedWorkoutId(workouts[0]._id);
    }
  }, [workouts, selectedWorkoutId]);

  const selectedWorkout: Workout | null = useMemo(() => {
    return workouts.find((w) => w._id === selectedWorkoutId) || null;
  }, [workouts, selectedWorkoutId]);

  const [progress, setProgress] = useState({
    forwardBends: 0,
    backBends: 0,
    legRaises: 0,
  });

  const percent = useMemo(() => {
    const total = progress.forwardBends + progress.backBends + progress.legRaises;
    const max = 300; 
    return Math.min(Math.round((total / max) * 100), 100);
  }, [progress]);

  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  
  useEffect(() => {
    if (!courseSlug || !userKey || !selectedWorkoutId) return;
    
    const slugToId = Object.entries(API_ID_TO_SLUG).find(([, slug]) => slug === courseSlug)?.[0] || courseSlug;
    
    getWorkoutProgress(slugToId, selectedWorkoutId)
      .then((data: APIWorkoutProgress) => {
        setProgress({
          forwardBends: data.progressData[0] || 0,
          backBends: data.progressData[1] || 0,
          legRaises: data.progressData[2] || 0,
        });
      })
      .catch(() => {
        
      });
  }, [courseSlug, userKey, selectedWorkoutId]);

  if (!courseSlug) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.notFound}>
            <div className={styles.notFoundTitle}>Тренировка не найдена</div>
            <Link to="/profile" className={styles.backLink}>Назад</Link>
          </div>
        </div>
      </div>
    );
  }

  const courseTitleMap: Record<string, string> = {
    yoga: "Йога",
    stretching: "Стретчинг",
    fitness: "Фитнес",
    stepaerobics: "Степ-аэробика",
    bodyflex: "Бодифлекс",
  };

  function openProgress() {
    setIsProgressOpen(true);
  }

  
  async function saveProgress() {
    if (!courseSlug || !userKey || !selectedWorkoutId) return;

    const slugToId = Object.entries(API_ID_TO_SLUG).find(([, slug]) => slug === courseSlug)?.[0] || courseSlug;

    try {
      await saveWorkoutProgress(slugToId, selectedWorkoutId, [
        progress.forwardBends,
        progress.backBends,
        progress.legRaises,
      ]);
      
      setIsProgressOpen(false);
      setIsSuccessOpen(true);
      window.setTimeout(() => setIsSuccessOpen(false), 1200);
    } catch (error) {
      
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link to="/profile" className={styles.back}>
          <span className={styles.backIcon}>←</span> Назад
        </Link>

        <h1 className={styles.title}>{courseTitleMap[courseSlug] ?? "Тренировка"}</h1>

        <div className={styles.videoCard}>
          <div className={styles.videoWrap}>
            {selectedWorkout ? (
              <iframe
                className={styles.iframe}
                src={selectedWorkout.video}
                title={selectedWorkout.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className={styles.videoPlaceholder}>Загрузка тренировки...</div>
            )}
          </div>
        </div>

        <div className={styles.exCard}>
          <div className={styles.exTitle}>
            Упражнения тренировки {selectedWorkout ? selectedWorkout._id.replace("day-", "") : ""}
          </div>

          <div className={styles.exGrid}>
            <div className={styles.exItem}>
              <div className={styles.exName}>Наклоны вперед</div>
              <div className={styles.exValue}>{progress.forwardBends}</div>
              <div className={styles.exLine} style={{ width: `${Math.min(progress.forwardBends, 100)}%` }} />
            </div>
            <div className={styles.exItem}>
              <div className={styles.exName}>Наклоны назад</div>
              <div className={styles.exValue}>{progress.backBends}</div>
              <div className={styles.exLine} style={{ width: `${Math.min(progress.backBends, 100)}%` }} />
            </div>
            <div className={styles.exItem}>
              <div className={styles.exName}>Поднятие ног, согнутых в коленях</div>
              <div className={styles.exValue}>{progress.legRaises}</div>
              <div className={styles.exLine} style={{ width: `${Math.min(progress.legRaises, 100)}%` }} />
            </div>
          </div>

          <button 
            className={styles.progressBtn} 
            type="button" 
            onClick={openProgress} 
            disabled={!selectedWorkout}
          >
            {percent > 0 ? "Обновить свой прогресс" : "Заполнить свой прогресс"}
          </button>
        </div>
      </div>

      {isSelectOpen ? (
        <div className={styles.overlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <div className={styles.modalTitle}>Выберите тренировку</div>
            <div className={styles.list}>
              {workouts.map((w) => {
                const checked = w._id === selectedWorkoutId;
                return (
                  <button
                    key={w._id}
                    type="button"
                    className={`${styles.listItem} ${checked ? styles.listItemActive : ""}`}
                    onClick={() => setSelectedWorkoutId(w._id)}
                  >
                    <span className={`${styles.radio} ${checked ? styles.radioOn : ""}`} />
                    <span className={styles.listTexts}>
                      <span className={styles.listMain}>{w.name}</span>
                      <span className={styles.listSub}>Упражнения: {w.exercises?.length || 0}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              className={styles.modalBtn}
              type="button"
              disabled={!selectedWorkoutId}
              onClick={() => setIsSelectOpen(false)}
            >
              Начать
            </button>
          </div>
        </div>
      ) : null}

      {isProgressOpen ? (
        <div className={styles.overlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <div className={styles.modalTitle}>Мой прогресс</div>
            <div className={styles.form}>
              <label className={styles.field}>
                <span className={styles.label}>Сколько раз вы сделали наклоны вперед?</span>
                <input
                  className={styles.input}
                  inputMode="numeric"
                  value={String(progress.forwardBends)}
                  onChange={(e) => setProgress((p) => ({ ...p, forwardBends: clampInt(e.target.value) }))}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Сколько раз вы сделали наклоны назад?</span>
                <input
                  className={styles.input}
                  inputMode="numeric"
                  value={String(progress.backBends)}
                  onChange={(e) => setProgress((p) => ({ ...p, backBends: clampInt(e.target.value) }))}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Сколько раз вы сделали поднятие ног, согнутых в коленях?</span>
                <input
                  className={styles.input}
                  inputMode="numeric"
                  value={String(progress.legRaises)}
                  onChange={(e) => setProgress((p) => ({ ...p, legRaises: clampInt(e.target.value) }))}
                />
              </label>
            </div>
            <button className={styles.modalBtn} type="button" onClick={saveProgress}>
              Сохранить
            </button>
          </div>
        </div>
      ) : null}
      {isSuccessOpen ? (
        <div className={styles.overlay} role="dialog" aria-modal="true">
          <div className={styles.success}>
            <div className={styles.successTitle}>Ваш прогресс засчитан!</div>
            <div className={styles.successIcon}>✓</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}