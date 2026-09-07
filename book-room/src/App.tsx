import { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useWebSockets } from "./hooks/useWebSockets"; 
import { WarningIcon, LogoIcon } from "./components/ui/icons"; 
import styles from "./App.module.css";

export const App = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useWebSockets(); 

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
      {isOffline && (
        <div className={styles.offlineBanner}>
          <span>
            <WarningIcon /> 
          </span>{" "}
          Соединение потеряно. Переподключение...
        </div>
      )}

      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <div className={styles.logoIcon}>
            <LogoIcon /> 
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