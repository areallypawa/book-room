import { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useWebSockets } from "./hooks/useWebSockets"; 
import { WarningIcon, LogoIcon } from "./components/ui/icons";
import styles from "./App.module.css";

export const App = () => {
  const [isNetworkOffline, setIsNetworkOffline] = useState(!navigator.onLine);
  // Достаем статус веб-сокета из хука
  const { wsStatus } = useWebSockets(); 

  useEffect(() => {
    const handleOnline = () => setIsNetworkOffline(false);
    const handleOffline = () => setIsNetworkOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Показываем баннер, если нет интернета ИЛИ отвалился веб-сокет
  const showWarningBanner = isNetworkOffline || wsStatus === "disconnected" || wsStatus === "reconnecting";

  const getBannerMessage = () => {
    if (isNetworkOffline) return "Отсутствует подключение к интернету.";
    if (wsStatus === "reconnecting") return "Связь с сервером потеряна. Переподключение...";
    return "Связь с сервером потеряна.";
  };

  return (
    <div className={styles.layout}>
      {/* Динамический желтый баннер сверху */}
      {showWarningBanner && (
        <div className={styles.offlineBanner}>
          <span>
            <WarningIcon />
          </span>{" "}
          {getBannerMessage()}
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