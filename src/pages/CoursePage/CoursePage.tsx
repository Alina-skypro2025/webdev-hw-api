import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import styles from "./CoursePage.module.css";

import { getCourses, type Course } from "../../shared/api/courses";

import yogaPage from "../../shared/assets/courses/Yogapage.jpg";
import stretchingPage from "../../shared/assets/courses/Stretching.jpg";
import fitnessPage from "../../shared/assets/courses/Fitness.jpg";
import stepPage from "../../shared/assets/courses/Stepaerobics.jpg";
import bodyflexPage from "../../shared/assets/courses/Bodyflex.jpg";

import manImg from "../../shared/assets/courses/men.jpg";

import { getUser } from "../../shared/lib/auth";
import { addMyCourse, getMyCourseIds } from "../../shared/lib/myCourses";

type CourseId = "yoga" | "stretching" | "fitness" | "stepaerobics" | "bodyflex";

type CourseView = {
  id: CourseId;
  title: string;
  heroBg: string;
  heroImg: string;
  heroImgFit?: "cover" | "contain";
  heroImgPos?: string;
  heroOverlay?: number;
  reasonsTitle: string;
  reasons: Array<{ n: number; text: string }>;
  directionsTitle: string;
  directions: string[];
  promoTitle: string;
  promoBullets: string[];
};

const COURSE_VIEW: Record<CourseId, CourseView> = {
  yoga: {
    id: "yoga",
    title: "Йога",
    heroBg: "#FFC400",
    heroImg: yogaPage,
    heroImgFit: "cover",
    heroImgPos: "right center",
    heroOverlay: 0.0,
    reasonsTitle: "Подойдет для вас, если:",
    reasons: [
      { n: 1, text: "Давно хотели попробовать йогу, но не решались начать" },
      {
        n: 2,
        text: "Хотите укрепить позвоночник, избавиться от болей в спине и суставах",
      },
      { n: 3, text: "Ищете активность, полезную для тела и души" },
    ],
    directionsTitle: "Направления",
    directions: [
      "Йога для новичков",
      "Классическая йога",
      "Кундалини-йога",
      "Йогатерапия",
      "Хатха-йога",
      "Аштанга-йога",
    ],
    promoTitle: "Начните путь\nк новому телу",
    promoBullets: [
      "проработка всех групп мышц",
      "тренировка суставов",
      "улучшение циркуляции крови",
      "упражнения заряжают бодростью",
      "помогают противостоять стрессам",
    ],
  },
  stretching: {
    id: "stretching",
    title: "Стретчинг",
    heroBg: "#2D8FD3",
    heroImg: stretchingPage,
    heroImgFit: "cover",
    heroImgPos: "right center",
    heroOverlay: 0.0,
    reasonsTitle: "Подойдет для вас, если:",
    reasons: [
      { n: 1, text: "Хотите улучшить гибкость и осанку" },
      { n: 2, text: "Нужен мягкий формат тренировок" },
      { n: 3, text: "Хочется снять напряжение после дня" },
    ],
    directionsTitle: "Направления",
    directions: ["Растяжка спины", "Шпагат", "Мобилити", "Здоровая осанка", "Релакс-стретч"],
    promoTitle: "Начните путь\nк новому телу",
    promoBullets: ["улучшение гибкости", "легкость в теле", "поддержка суставов", "снятие напряжения"],
  },
  fitness: {
    id: "fitness",
    title: "Фитнес",
    heroBg: "#F6A019",
    heroImg: fitnessPage,
    heroImgFit: "cover",
    heroImgPos: "right center",
    heroOverlay: 0.0,
    reasonsTitle: "Подойдет для вас, если:",
    reasons: [
      { n: 1, text: "Хотите стать сильнее и выносливее" },
      { n: 2, text: "Нужны тренировки дома без зала" },
      { n: 3, text: "Важно держать форму стабильно" },
    ],
    directionsTitle: "Направления",
    directions: ["Кардио", "Силовые", "Функциональные", "Тонус", "Выносливость"],
    promoTitle: "Начните путь\nк новому телу",
    promoBullets: ["тонус мышц", "выносливость", "энергия", "сжигание калорий"],
  },
  stepaerobics: {
    id: "stepaerobics",
    title: "Степ-аэробика",
    heroBg: "#FF7E69",
    heroImg: stepPage,
    heroImgFit: "cover",
    heroImgPos: "right center",
    heroOverlay: 0.08,
    reasonsTitle: "Подойдет для вас, если:",
    reasons: [
      { n: 1, text: "Хотите больше кардио и движения" },
      { n: 2, text: "Нравится ритм и динамика" },
      { n: 3, text: "Хотите тренировать ноги и ягодицы" },
    ],
    directionsTitle: "Направления",
    directions: ["Базовые шаги", "Комбинации", "Интервалы", "Интенсив"],
    promoTitle: "Начните путь\nк новому телу",
    promoBullets: ["кардио-нагрузка", "координация", "ноги и ягодицы", "энергия"],
  },
  bodyflex: {
    id: "bodyflex",
    title: "Бодифлекс",
    heroBg: "#7d458c",
    heroImg: bodyflexPage,
    heroImgFit: "cover",
    heroImgPos: "right center",
    heroOverlay: 0.35,
    reasonsTitle: "Подойдет для вас, если:",
    reasons: [
      { n: 1, text: "Хотите мягко подтянуть тело" },
      { n: 2, text: "Нужен спокойный темп" },
      { n: 3, text: "Интересны дыхательные практики" },
    ],
    directionsTitle: "Направления",
    directions: ["Дыхание", "Тонус", "Гибкость", "Плавная нагрузка"],
    promoTitle: "Начните путь\nк новому телу",
    promoBullets: ["мягкий тонус", "контроль дыхания", "легкость", "осознанность"],
  },
};


const API_ID_TO_SLUG: Record<string, CourseId> = {
  "6i67sm": "stepaerobics",
  "ab1c3f": "yoga",
  "kfpq8e": "stretching",
  "q02a6i": "bodyflex",
  "ypox9r": "fitness"
};

type HeroCSSVars = CSSProperties & {
  ["--hero-bg"]?: string;
  ["--hero-overlay"]?: string;
};

export function CoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const user = getUser();
  const userKey = user?.email || user?.login || user?.username || "";

  
  const [loading, setLoading] = useState(true);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    
    setLoading(false);
  }, []);

  
  const displayId = useMemo<CourseId | null>(() => {
    if (!courseId) return null;
    
    
    if (courseId in COURSE_VIEW) return courseId as CourseId;
    
    
    if (courseId in API_ID_TO_SLUG) {
      return API_ID_TO_SLUG[courseId];
    }
    
    return null;
  }, [courseId]);

  
  const alreadyAdded = useMemo(() => {
    if (!userKey || !courseId) return false;
    const ids = getMyCourseIds(userKey);
    return ids.includes(courseId);
  }, [userKey, courseId]);

  useEffect(() => {
    setJustAdded(false);
  }, [courseId]);

  function onAddCourse() {
    if (!userKey) {
      navigate("/login?mode=login", { state: { backgroundLocation: location } });
      return;
    }
    if (!courseId) return;
    if (alreadyAdded) return;

    
    addMyCourse(userKey, courseId);
    setJustAdded(true);
  }

  if (!displayId && !loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.notFound}>
            <div className={styles.notFoundTitle}>Курс не найден</div>
            <Link to="/" className={styles.backLink}>
              Назад к списку
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!displayId || loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container} style={{ paddingTop: 60 }}>
          Загрузка...
        </div>
      </div>
    );
  }

  const view = COURSE_VIEW[displayId];

  const btnText = !userKey
    ? "Войдите, чтобы добавить курс"
    : alreadyAdded || justAdded
      ? "Курс добавлен"
      : "Добавить курс";

  const btnDisabled = alreadyAdded || justAdded;

  const heroStyle: HeroCSSVars = {
    background: view.heroBg,
    "--hero-bg": view.heroBg,
    "--hero-overlay": String(view.heroOverlay ?? 0),
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link to="/" className={styles.back}>
          <span className={styles.backIcon}>←</span> Назад к списку
        </Link>

        <section className={styles.card}>
          <div className={styles.hero} style={heroStyle}>
            <div className={styles.heroTitle}>{view.title}</div>

            {view.heroImg ? (
              <img
                className={styles.heroImg}
                src={view.heroImg}
                alt={view.title}
                style={{
                  objectFit: view.heroImgFit ?? "cover",
                  objectPosition: view.heroImgPos ?? "right center",
                }}
              />
            ) : null}
          </div>

          <h2 className={styles.sectionTitle}>{view.reasonsTitle}</h2>

          <div className={styles.reasons}>
            {view.reasons.map((r) => (
              <div key={r.n} className={styles.reason}>
                <div className={styles.reasonNum}>{r.n}</div>
                <div className={styles.reasonText}>{r.text}</div>
              </div>
            ))}
          </div>

          <h2 className={styles.sectionTitle}>{view.directionsTitle}</h2>

          <div className={styles.directions}>
            {view.directions.map((d) => (
              <div key={d} className={styles.directionItem}>
                <span className={styles.directionDot}>✦</span>
                {d}
              </div>
            ))}
          </div>
        </section>

        <section className={styles.bigCard}>
          <div className={styles.bigLeft}>
            <h2 className={styles.bigTitle}>
              {view.promoTitle.split("\n").map((line, idx) => (
                <span key={idx}>
                  {line}
                  <br />
                </span>
              ))}
            </h2>

            <ul className={styles.bigList}>
              {view.promoBullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>

            <button
              className={`${styles.bigBtn} ${btnDisabled ? styles.bigBtnAdded : ""}`}
              type="button"
              onClick={onAddCourse}
              disabled={btnDisabled}
            >
              {btnText}
            </button>
          </div>

          <div className={styles.bigRight}>
            <img className={styles.manImg} src={manImg} alt="Тренировка" />
          </div>
        </section>
      </div>
    </div>
  );
}