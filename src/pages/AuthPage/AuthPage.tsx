import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./AuthPage.module.css";
import { setToken, setUser } from "../../shared/lib/auth";

const API_URL = "https://wedev-api.sky.pro/api/fitness/auth";

type Mode = "login" | "register";

function useQueryMode(): Mode {
  const { search } = useLocation();
  const mode = new URLSearchParams(search).get("mode");
  return mode === "register" ? "register" : "login";
}

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialMode = useQueryMode();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [repeatPasswordError, setRepeatPasswordError] = useState("");
  const [commonError, setCommonError] = useState("");

  const isRegister = mode === "register";
  const title = useMemo(() => (isRegister ? "Регистрация" : "Вход"), [isRegister]);

  function closeModal() {
    const state = location.state as { backgroundLocation?: Location } | null;
    if (state?.backgroundLocation) {
      navigate(-1);
      return;
    }
    navigate("/");
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function switchMode(next: Mode) {
    setMode(next);
    setEmailError("");
    setPasswordError("");
    setRepeatPasswordError("");
    setCommonError("");
    navigate(`/login?mode=${next}`, { replace: true, state: location.state });
  }

  function validate(): boolean {
    let ok = true;

    setEmailError("");
    setPasswordError("");
    setRepeatPasswordError("");
    setCommonError("");

    const em = email.trim();

    if (!em) {
      setEmailError("Введите эл. почту");
      ok = false;
    } else if (!/^\S+@\S+\.\S+$/.test(em)) {
      setEmailError("Введите корректный Email");
      ok = false;
    }

    if (!password) {
      setPasswordError("Введите пароль");
      ok = false;
    }

    if (isRegister) {
      if (!repeatPassword) {
        setRepeatPasswordError("Повторите пароль");
        ok = false;
      } else if (repeatPassword !== password) {
        setRepeatPasswordError("Пароли не совпадают");
        ok = false;
      }
    }

    return ok;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    try {
      setCommonError("");
      
      const endpoint = isRegister ? "/register" : "/login";
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
       
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 || response.status === 404) {
          if (data.message?.includes("уже существует")) {
            setEmailError("Пользователь с таким email уже существует");
          } else if (data.message?.includes("не найден")) {
            setEmailError("Пользователь с таким email не найден");
          } else if (data.message?.includes("Неверный пароль")) {
            setPasswordError("Неверный пароль");
          } else if (data.message?.includes("корректный Email")) {
            setEmailError("Введите корректный Email");
          } else if (data.message?.includes("спецсимволов") || data.message?.includes("заглавную")) {
            setPasswordError(data.message);
          } else {
            setPasswordError(data.message || "Ошибка авторизации");
          }
        } else {
          setCommonError("Что-то пошло не так. Попробуйте позже.");
        }
        return;
      }

      
      if (data.token) {
        setToken(data.token);
        setUser({
          email: email.trim(),
          name: email.trim().split("@")[0],
        });
        closeModal();
      }
      
      if (isRegister) {
        setCommonError("");
        switchMode("login");
        setPassword("");
        setRepeatPassword("");
      }
      
    } catch {
      setCommonError("Что-то пошло не так. Попробуйте позже.");
    }
  }

  const primaryText = isRegister ? "Зарегистрироваться" : "Войти";
  const secondaryText = isRegister ? "Войти" : "Зарегистрироваться";
  const disabled = !email.trim() || !password || (isRegister ? !repeatPassword : false);

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <button className={styles.backdrop} type="button" onClick={closeModal} aria-label="Закрыть" />
      <form className={styles.card} onSubmit={onSubmit} noValidate>
        <div className={styles.logoRow}>
          <span className={styles.logoMark} aria-hidden="true">
            <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 2L11 8L3 14V2Z" fill="#00C2FF" />
              <path d="M11 2L19 8L11 14V2Z" fill="#B8FF00" />
            </svg>
          </span>
          <div className={styles.logoText}>SkyFitnessPro</div>
        </div>

        <div className={styles.title}>{title}</div>
        {commonError ? <div className={styles.commonError}>{commonError}</div> : null}

        <div className={styles.fields}>
          <label className={styles.field}>
            <input
              className={`${styles.input} ${emailError ? styles.inputError : ""}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Эл. почта"
              autoComplete={isRegister ? "email" : "username"}
            />
            {emailError ? <div className={styles.errorText}>{emailError}</div> : null}
          </label>

          <label className={styles.field}>
            <input
              className={`${styles.input} ${passwordError ? styles.inputError : ""}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
            />
            {passwordError ? <div className={styles.errorText}>{passwordError}</div> : null}
          </label>

          {isRegister ? (
            <label className={styles.field}>
              <input
                className={`${styles.input} ${repeatPasswordError ? styles.inputError : ""}`}
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                placeholder="Повторите пароль"
                type="password"
                autoComplete="new-password"
              />
              {repeatPasswordError ? <div className={styles.errorText}>{repeatPasswordError}</div> : null}
            </label>
          ) : null}
        </div>

        <div className={styles.actions}>
          <button className={styles.primaryBtn} type="submit" disabled={disabled}>
            {primaryText}
          </button>
          <button
            className={styles.secondaryBtn}
            type="button"
            onClick={() => switchMode(isRegister ? "login" : "register")}
          >
            {secondaryText}
          </button>
        </div>
      </form>
    </div>
  );
}