import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./ProfilePage.module.css";

import { getCourses, type Course } from "../../shared/api/courses";
import { getUser, clearAuth } from "../../shared/lib/auth";
import { getMyCourseIds, removeMyCourse } from "../../shared/lib/myCourses";

import yogaImg from "../../shared/assets/courses/Yoga.jpg";
import stretchingImg from "../../shared/assets/courses/Stretching.jpg";
import fitnessImg from "../../shared/assets/courses/Fitness.jpg";
import stepImg from "../../shared/assets/courses/Stepaerobics.jpg";
import bodyflexImg from "../../shared/assets/courses/Bodyflex.jpg";

interface AdaptedCourse extends Course {
  _id: string;
  originalId: string;
  title: string;
}

export function ProfilePage() {
  const navigate = useNavigate();
  const user = getUser();
  const userKey = user?.email || user?.login || user?.username || "";
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const imagesById = useMemo<Record<string, string>>(
    () => ({
      yoga: yogaImg,
      stretching: stretchingImg,
      fitness: fitnessImg,
      stepaerobics: stepImg,
      bodyflex: bodyflexImg,
    }),
    []
  );

  const bgById = useMemo<Record<string, string>>(
    () => ({
      yoga: "#FFC400",
      stretching: "#2D8FD3",
      fitness: "#F6A019",
      stepaerobics: "#FF7E69",
      bodyflex: "#7A3E9D",
    }),
    []
  );

  const nameToIdMap = useMemo<Record<string, string>>(
    () => ({
      Yoga: "yoga",
      Stretching: "stretching",
      Fitness: "fitness",
      StepAirobic: "stepaerobics",
      BodyFlex: "bodyflex",
    }),
    []
  );

  useEffect(() => {
    if (!userKey) {
      navigate("/login?mode=login", { replace: true });
      return;
    }

    getCourses()
      .then((data) => {
        const adapted = data.map((course) => ({
          ...course,
          _id: course._id || course.id,
        }));
        setAllCourses(adapted);
      })
      .catch(() => setAllCourses([]))
      .finally(() => setLoading(false));
  }, [navigate, userKey]);

  const myCourseIds = useMemo(() => {
    if (!userKey) return [];
    return getMyCourseIds(userKey);
  }, [userKey, tick]);

  const myCourses = useMemo<AdaptedCourse[]>(() => {
    const setIds = new Set(myCourseIds);
    return allCourses
      .filter((c) => setIds.has(c._id || c.id))
      .map((course) => {
        const mappedId = nameToIdMap[course.nameEN] || course._id || course.id;
        return {
          ...course,
          _id: mappedId,
          originalId: course._id || course.id,
          title: course.nameRU,
        } as AdaptedCourse;
      });
  }, [allCourses, myCourseIds, nameToIdMap]);

  function onRemove(courseId: string) {
    if (!userKey) return;
    const course = myCourses.find((c) => c._id === courseId);
    const idToRemove = course?.originalId || courseId;
    removeMyCourse(userKey, idToRemove);
    setTick((v) => v + 1);
  }

  function onLogout() {
    clearAuth();
    navigate("/", { replace: true });
  }

  if (loading) return <div className={styles.loading}>Загрузка...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link to="/" className={styles.back}>
          <span className={styles.backIcon}>←</span> Назад к списку курсов
        </Link>

        <div className={styles.topRow}>
          <h1 className={styles.title}>Профиль</h1>
        </div>

        <section className={styles.userCard}>
          <div className={styles.userAvatar} aria-hidden="true" />
          <div className={styles.userInfo}>
            <div className={styles.userName}>
              {user?.name || user?.login || "Пользователь"}
            </div>
            <div className={styles.userLogin}>Логин: {userKey}</div>
            <button className={styles.logoutBtn} type="button" onClick={onLogout}>
              Выйти
            </button>
          </div>
        </section>

        <h2 className={styles.subTitle}>Мои курсы</h2>

        {myCourses.length === 0 ? (
          <div className={styles.empty}>
            Пока нет добавленных курсов. Перейдите на{" "}
            <Link to="/" className={styles.link}>
              главную
            </Link>{" "}
            и нажмите плюсик на курсе.
          </div>
        ) : (
          <div className={styles.grid}>
            {myCourses.map((course) => {
              const img = imagesById[course._id];
              const bg = bgById[course._id] ?? "#e9ecef";

              return (
                <div key={course._id} className={styles.card}>
                  <div className={styles.cardTop} style={{ background: bg }}>
                    {img ? (
                      <img
                        className={styles.cardImg}
                        src={img}
                        alt={course.title}
                      />
                    ) : null}
                    <button
                      type="button"
                      className={styles.removeBtn}
                      aria-label="Удалить курс"
                      title="Удалить курс"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onRemove(course._id);
                      }}
                    >
                      −
                    </button>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.cardTitle}>{course.title}</div>

                    <div className={styles.metaRow}>
                      <span className={styles.metaPill}>
                        {course.durationInDays || 25} дней
                      </span>
                      <span className={styles.metaPill}>
                        {course.dailyDurationInMinutes?.from || 20}-
                        {course.dailyDurationInMinutes?.to || 50} мин/день
                      </span>
                    </div>

                    <div className={styles.metaRow}>
                      <span className={styles.metaPill}>
                        Сложность
                      </span>
                    </div>

                    <div className={styles.progressRow}>
                      <div className={styles.progressText}>
                        Прогресс 0%
                      </div>
                      <div className={styles.progressLine} />
                    </div>

                    <button
                      className={styles.startBtn}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const workoutId = course.originalId || course.id || course._id;
                        window.location.href = `/workout/${workoutId}`;
                      }}
                    >
                      Начать тренировку
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}