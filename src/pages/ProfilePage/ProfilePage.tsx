import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./ProfilePage.module.css";

import { getCourses } from "../../shared/api/courses";
import { getUser, clearAuth } from "../../shared/lib/auth";
import type { Course } from "../../shared/api/courses";

import yogaImg from "../../shared/assets/courses/Yoga.jpg";
import stretchingImg from "../../shared/assets/courses/Stretching.jpg";
import fitnessImg from "../../shared/assets/courses/Fitness.jpg";
import stepImg from "../../shared/assets/courses/Stepaerobics.jpg";
import bodyflexImg from "../../shared/assets/courses/Bodyflex.jpg";

const STORAGE_KEY = "sky_user_courses";

interface AdaptedCourse {
  _id: string;
  originalId: string;
  title: string;
  durationInDays?: number;
  dailyDurationInMinutes?: {
    from: number;
    to: number;
  };
  img: string;
  bg: string;
}

export function ProfilePage() {
  const navigate = useNavigate();
  const user = getUser();
  const userKey = user?.email || user?.login || user?.username || "";
  
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const imagesById = useMemo(() => ({
    yoga: yogaImg,
    stretching: stretchingImg,
    fitness: fitnessImg,
    stepaerobics: stepImg,
    bodyflex: bodyflexImg,
  }), []);

  const bgById = useMemo(() => ({
    yoga: "#FFC400",
    stretching: "#2D8FD3",
    fitness: "#F6A019",
    stepaerobics: "#FF7E69",
    bodyflex: "#7A3E9D",
  }), []);

  const nameToId = useMemo(() => ({
    Yoga: "yoga",
    Stretching: "stretching",
    Fitness: "fitness",
    StepAirobic: "stepaerobics",
    BodyFlex: "bodyflex",
  }), []);

  
  useEffect(() => {
    if (!userKey) {
      navigate("/login?mode=login", { replace: true });
      return;
    }

    getCourses()
      .then((data) => {
        setAllCourses(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userKey, navigate]);

  
  const myCourseIds = useMemo(() => {
    if (!userKey) return [];
    const key = `${STORAGE_KEY}_${userKey}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  }, [userKey, refreshTrigger]);

 
  const myCourses = useMemo<AdaptedCourse[]>(() => {
    return allCourses
      .filter(course => myCourseIds.includes(course._id))
      .map(course => {
        const mappedId = nameToId[course.nameEN || ""] || course._id;
        return {
          _id: mappedId,
          originalId: course._id,
          title: course.nameRU || course.title,
          durationInDays: course.durationInDays,
          dailyDurationInMinutes: course.dailyDurationInMinutes,
          img: imagesById[mappedId as keyof typeof imagesById],
          bg: bgById[mappedId as keyof typeof bgById] || "#e9ecef",
        };
      });
  }, [allCourses, myCourseIds, nameToId, imagesById, bgById]);

  // Удаление курса
  function onRemove(originalId: string) {
    const key = `${STORAGE_KEY}_${userKey}`;
    const saved = localStorage.getItem(key);
    const ids = saved ? JSON.parse(saved) : [];
    const updated = ids.filter((id: string) => id !== originalId);
    localStorage.setItem(key, JSON.stringify(updated));
    setRefreshTrigger(prev => prev + 1);
  }

  if (loading) return <div className={styles.loading}>Загрузка...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link to="/" className={styles.back}>← Назад к списку курсов</Link>
        
        <div className={styles.topRow}>
          <h1 className={styles.title}>Профиль</h1>
        </div>

        <section className={styles.userCard}>
          <div className={styles.userAvatar} />
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user?.name || "Пользователь"}</div>
            <div className={styles.userLogin}>Логин: {userKey}</div>
            <button 
              className={styles.logoutBtn} 
              onClick={() => { 
                clearAuth(); 
                navigate("/"); 
              }}
            >
              Выйти
            </button>
          </div>
        </section>

        <h2 className={styles.subTitle}>Мои курсы</h2>

        {myCourses.length === 0 ? (
          <div className={styles.empty}>
            Пока нет добавленных курсов. Перейдите на{" "}
            <Link to="/" className={styles.link}>главную</Link>{" "}
            и нажмите плюсик на курсе.
          </div>
        ) : (
          <div className={styles.grid}>
            {myCourses.map((course) => (
              <div key={course._id} className={styles.card}>
                <div className={styles.cardTop} style={{ background: course.bg }}>
                  <img 
                    className={styles.cardImg} 
                    src={course.img} 
                    alt={course.title} 
                  />
                  <button
                    className={styles.removeBtn}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRemove(course.originalId);
                    }}
                  >−</button>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardTitle}>{course.title}</div>
                  <div className={styles.metaRow}>
                    <span className={styles.metaPill}>{course.durationInDays || 25} дней</span>
                    <span className={styles.metaPill}>
                      {course.dailyDurationInMinutes?.from || 20}-
                      {course.dailyDurationInMinutes?.to || 50} мин/день
                    </span>
                  </div>
                  <div className={styles.metaRow}>
                    <span className={styles.metaPill}>Сложность</span>
                  </div>
                  <button
                    className={styles.startBtn}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = `/workout/${course.originalId}`;
                    }}
                  >
                    Начать тренировку
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}