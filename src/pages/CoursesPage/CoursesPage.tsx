import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCourses, type Course } from "../../shared/api/courses";

import styles from "./CoursesPage.module.css";

import yogaImg from "../../shared/assets/courses/Yoga.jpg";
import stretchingImg from "../../shared/assets/courses/Stretching.jpg";
import fitnessImg from "../../shared/assets/courses/Fitness.jpg";
import stepImg from "../../shared/assets/courses/Stepaerobics.jpg";
import bodyflexImg from "../../shared/assets/courses/Bodyflex.jpg";

import { getUser } from "../../shared/lib/auth";

const STORAGE_KEY = "sky_user_courses";

function IconCalendar() {
  return (
    <svg className={styles.badgeIcon} viewBox="0 0 24 24" fill="none">
      <path
        d="M7 3v2M17 3v2M4.5 8.5h15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6.5 5h11A3.5 3.5 0 0 1 21 8.5v9A3.5 3.5 0 0 1 17.5 21h-11A3.5 3.5 0 0 1 3 17.5v-9A3.5 3.5 0 0 1 6.5 5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function IconClock() {
  return (
    <svg className={styles.badgeIcon} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 7v5l3 2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 12a9 9 0 1 1-18 0a9 9 0 0 1 18 0Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function IconSignal() {
  return (
    <svg className={styles.badgeIcon} viewBox="0 0 24 24" fill="none">
      <path
        d="M6 18v-3M10 18v-6M14 18v-9M18 18V8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface AdaptedCourse extends Course {
  _id: string;
  originalId: string;
  title: string;
  nameEN: string;
  nameRU: string;
}

export function CoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

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

  const nameToIdMap = useMemo(() => ({
    Yoga: "yoga",
    Stretching: "stretching",
    Fitness: "fitness",
    StepAirobic: "stepaerobics",
    BodyFlex: "bodyflex",
  }), []);

  useEffect(() => {
    getCourses()
      .then(setCourses)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const adaptedCourses = useMemo(() => {
    return courses
      .filter(c => nameToIdMap[c.nameEN])
      .map(c => ({
        ...c,
        _id: nameToIdMap[c.nameEN],
        originalId: c._id,
        title: c.nameRU,
      }));
  }, [courses, nameToIdMap]);

  function onPlusClick(e: React.MouseEvent, courseId: string) {
    e.preventDefault();
    e.stopPropagation();

    const user = getUser();
    const userKey = user?.email || user?.login || user?.username;
    if (!userKey) {
      navigate("/login?mode=login");
      return;
    }

    const course = adaptedCourses.find(c => c._id === courseId);
    const idToSave = course?.originalId || courseId;
    
    const key = `${STORAGE_KEY}_${userKey}`;
    const saved = localStorage.getItem(key);
    const courses = saved ? JSON.parse(saved) : [];
    
    if (!courses.includes(idToSave)) {
      courses.push(idToSave);
      localStorage.setItem(key, JSON.stringify(courses));
    }
    
    navigate("/profile");
  }

  if (loading) return <div className={styles.state}>Загрузка...</div>;

  return (
    <div className={styles.page}>
      <main className={styles.container}>
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>
            Начните заниматься спортом<br />и улучшите качество жизни
          </h1>
          <div className={styles.heroBubble}>
            Измени свое<br />тело за полгода!
            <span className={styles.heroBubbleTail} />
          </div>
        </section>

        <section className={styles.grid}>
          {adaptedCourses.map((c) => {
            const img = imagesById[c._id];
            const bg = bgById[c._id] ?? "#e9ecef";

            return (
              <Link key={c._id} to={`/course/${c.originalId}`} className={styles.card}>
                <div className={styles.cardImageWrap} style={{ background: bg }}>
                  {img && <img src={img} alt={c.title} className={styles.cardImage} />}
                  <button
                    type="button"
                    className={styles.plus}
                    onClick={(e) => onPlusClick(e, c._id)}
                  >+</button>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardTitle}>{c.title}</div>
                  <div className={styles.badges}>
                    <span className={styles.badge}>
                      <IconCalendar /> {c.durationInDays || 25} дней
                    </span>
                    <span className={styles.badge}>
                      <IconClock /> {c.dailyDurationInMinutes?.from || 20}-{c.dailyDurationInMinutes?.to || 50} мин/день
                    </span>
                    <span className={styles.badge}>
                      <IconSignal /> Сложность
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </section>

        <div className={styles.bottom}>
          <button 
            className={styles.toTopBtn} 
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Наверх ↑
          </button>
        </div>
      </main>
    </div>
  );
}