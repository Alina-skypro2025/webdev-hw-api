import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Layout.module.css";
import { clearAuth, getUser, type AuthUser } from "../../../shared/lib/auth";


import logoImg from "../../../shared/assets/courses/logo.jpg";

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUserState] = useState<AuthUser | null>(() => getUser());
  const [open, setOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onAuth = () => setUserState(getUser());
    window.addEventListener("auth", onAuth);
    window.addEventListener("storage", onAuth);
    return () => {
      window.removeEventListener("auth", onAuth);
      window.removeEventListener("storage", onAuth);
    };
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const displayName = useMemo(() => {
    if (!user) return "";
    return user.name || user.email.split("@")[0];
  }, [user]);

  function onLogout() {
    clearAuth();
    setOpen(false);
    navigate("/");
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div>
           
            <img className={styles.brandLogo} src={logoImg} alt="SkyFitnessPro" />
            <div className={styles.brandSub}>Онлайн-тренировки для занятий дома</div>
          </div>

          {!user ? (
            <Link className={styles.loginBtn} to="/login" state={{ backgroundLocation: location }}>
              Войти
            </Link>
          ) : (
            <div className={styles.userWrap} ref={menuRef}>
              <button
                type="button"
                className={styles.userBtn}
                onClick={() => setOpen((v) => !v)}
              >
                <span className={styles.userIcon} aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 12c2.76 0 5-2.24 5-5S14.76 2 12 2 7 4.24 7 7s2.24 5 5 5Z"
                      fill="currentColor"
                      opacity="0.7"
                    />
                    <path
                      d="M4 22c0-4.42 3.58-8 8-8s8 3.58 8 8"
                      stroke="currentColor"
                      strokeWidth="2"
                      opacity="0.7"
                    />
                  </svg>
                </span>
                <span className={styles.userName}>{displayName}</span>
                <span className={styles.chev} aria-hidden="true">
                  ▾
                </span>
              </button>

              {open ? (
                <div className={styles.dropdown}>
                  <div className={styles.ddName}>{displayName}</div>
                  <div className={styles.ddEmail}>{user.email}</div>

                  <Link
                    className={styles.ddPrimary}
                    to="/profile"
                    onClick={() => setOpen(false)}
                  >
                    Мой профиль
                  </Link>

                  <button className={styles.ddSecondary} type="button" onClick={onLogout}>
                    Выйти
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
