import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import styles from "./WorkoutPage.module.css";

import { getUser } from "../../shared/lib/auth";
import { WORKOUTS_BY_COURSE, isCourseId, type WorkoutItem } from "../../shared/lib/workouts";
import { calcPercent, getWorkoutProgress, setWorkoutProgress, type WorkoutProgress } from "../../shared/lib/workoutProgress";

function clampInt(v: string) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return 0;
  
  return Math.floor(n);
}

export function WorkoutPage() {
  const navigate = useNavigate();
  const params = useParams<{ workoutId: string }>();
  const courseIdRaw = params.workoutId || "";
  const courseId = isCourseId(courseIdRaw) ? courseIdRaw : null;

  const user = getUser();
  const userKey = user?.email || user?.login || user?.username || "";

  const workouts = useMemo(() => {
    if (!courseId) return [];
    return WORKOUTS_BY_COURSE[courseId] || [];
  }, [courseId]);

  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>("");
  const [isSelectOpen, setIsSelectOpen] = useState(true);

  const selectedWorkout: WorkoutItem | null = useMemo(() => {
    return workouts.find((w) => w.id === selectedWorkoutId) || null;
  }, [workouts, selectedWorkoutId]);


  const [progress, setProgress] = useState<WorkoutProgress>({
    forwardBends: 0,
    backBends: 0,
    legRaises: 0,
  });

  const percent = useMemo(() => calcPercent(progress), [progress]);

 
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    if (!userKey) {
      
      navigate("/login?mode=login", { state: { backgroundLocation: location }, replace: false });
      return;
    }
  }, [courseId, userKey, navigate]);

  
  useEffect(() => {
    if (!courseId || !userKey || !selectedWorkoutId) return;
    const p = getWorkoutProgress(userKey, courseId, selectedWorkoutId);
    setProgress(p);
  }, [courseId, userKey, selectedWorkoutId]);

  if (!courseId) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.notFound}>
            <div className={styles.notFoundTitle}>Тренировка не найдена</div>
            <Link to="/" className={styles.backLink}>Назад</Link>
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

  function saveProgress() {
    if (!courseId || !userKey || !selectedWorkoutId) return;

    setWorkoutProgress(userKey, courseId, selectedWorkoutId, progress);
    setIsProgressOpen(false);

    
    setIsSuccessOpen(true);
    window.setTimeout(() => setIsSuccessOpen(false), 1200);
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link to="/profile" className={styles.back}>
          <span className={styles.backIcon}>←</span> Назад
        </Link>

        <h1 className={styles.title}>{courseTitleMap[courseId] ?? "Тренировка"}</h1>

       
        <div className={styles.videoCard}>
          <div className={styles.videoWrap}>
            {selectedWorkout ? (
              <iframe
                className={styles.iframe}
                src={`https://www.youtube.com/embed/${selectedWorkout.youtubeId}`}
                title={selectedWorkout.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className={styles.videoPlaceholder}>Выберите тренировку</div>
            )}
          </div>
        </div>

       
        <div className={styles.exCard}>
          <div className={styles.exTitle}>
            Упражнения тренировки {selectedWorkout ? selectedWorkout.id.replace("day-", "") : ""}
          </div>

          <div className={styles.exGrid}>
            <div className={styles.exItem}>
              <div className={styles.exName}>Наклоны вперед</div>
              <div className={styles.exValue}>{percent}%</div>
              <div className={styles.exLine} />
            </div>

            <div className={styles.exItem}>
              <div className={styles.exName}>Наклоны назад</div>
              <div className={styles.exValue}>{percent}%</div>
              <div className={styles.exLine} />
            </div>

            <div className={styles.exItem}>
              <div className={styles.exName}>Поднятие ног, согнутых в коленях</div>
              <div className={styles.exValue}>{percent}%</div>
              <div className={styles.exLine} />
            </div>
          </div>

          <button className={styles.progressBtn} type="button" onClick={openProgress} disabled={!selectedWorkout}>
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
                const checked = w.id === selectedWorkoutId;
                return (
                  <button
                    key={w.id}
                    type="button"
                    className={`${styles.listItem} ${checked ? styles.listItemActive : ""}`}
                    onClick={() => setSelectedWorkoutId(w.id)}
                  >
                    <span className={`${styles.radio} ${checked ? styles.radioOn : ""}`} />
                    <span className={styles.listTexts}>
                      <span className={styles.listMain}>{w.title}</span>
                      <span className={styles.listSub}>{w.subtitle}</span>
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
