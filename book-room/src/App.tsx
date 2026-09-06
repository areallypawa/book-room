import { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import styles from "./App.module.css";

export const App = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className={styles.layout}>
      {/* Глобальный желтый баннер сверху */}
      {isOffline && (
        <div className={styles.offlineBanner}>
          <span>
            <svg
              width="17"
              height="17"
              viewBox="0 0 17 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.5006 11.5008V8.5006M8.5006 5.50036H8.5081M16.0012 8.5006C16.0012 12.6431 12.6431 16.0012 8.5006 16.0012C4.35813 16.0012 1 12.6431 1 8.5006C1 4.35813 4.35813 1 8.5006 1C12.6431 1 16.0012 4.35813 16.0012 8.5006Z"
                stroke="#854D0E"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </span>{" "}
          Соединение потеряно. Переподключение...
        </div>
      )}

      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <div className={styles.logoIcon}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 16 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.75 1V4.00024M10.75 1V4.00024M1 7.00048H14.5M5.5 11.5008L7 13.001L10 10.0007M2.5 2.50012H13C13.8284 2.50012 14.5 3.17175 14.5 4.00024V14.5011C14.5 15.3296 13.8284 16.0012 13 16.0012H2.5C1.67157 16.0012 1 15.3296 1 14.5011V4.00024C1 3.17175 1.67157 2.50012 2.5 2.50012Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span>BookRoom</span>
        </div>

        <nav className={styles.nav}>
          <NavLink
            to="/rooms"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
            }
          >
            Переговорные
          </NavLink>
          <NavLink
            to="/bookings"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
            }
          >
            Мои бронирования
          </NavLink>
        </nav>

        <div className={styles.userBlock}>
          <span>Константин К.</span>
          <div className={styles.userAvatar}>КК</div>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};
