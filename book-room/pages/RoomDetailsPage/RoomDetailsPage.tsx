import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../src/api/axios";
import type { Room } from "../../src/types/index";
import styles from "./RoomDetailsPage.module.css";

const fetchRoomDetails = async (roomId: string): Promise<Room> => {
  const { data } = await api.get(`/rooms/${roomId}`);
  return data;
};

export const RoomDetailsPage = () => {
  const { roomId } = useParams<{ roomId: string }>();

  const {
    data: room,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["room", roomId],
    queryFn: () => fetchRoomDetails(roomId!),
    enabled: !!roomId,
  });

  // Часы для таймлайна от 09:00 до 20:00
  const hours = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
  ];

  if (isLoading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        Загрузка информации о комнате...
      </div>
    );
  }

  if (isError || !room) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#b91c1c" }}>
        Не удалось загрузить данные переговорной.
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* Хлебные крошки */}
      <div className={styles.breadcrumbs}>
        <Link to="/rooms" className={styles.breadcrumbLink}>
          Переговорные
        </Link>
        <span>/</span>
        <span className={styles.breadcrumbLink}>Офис Москва</span>
        <span>/</span>
        <span className={styles.breadcrumbCurrent}>
          Комната &quot;{room.name}&quot;
        </span>
      </div>

      <div className={styles.contentGrid}>
        {/* ЛЕВАЯ КОЛОНКА: Информация о комнате */}
        <div className={styles.infoCard}>
          <h1 className={styles.roomTitle}>{room.name}</h1>
          <p className={styles.roomSubtitle}>Офис Москва · ул. Лесная 7</p>

          <div className={styles.featuresList}>
            <div className={styles.featureItem}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.0004 15.75V14.25C12.0004 13.4544 11.6843 12.6913 11.1216 12.1287C10.5589 11.5661 9.79582 11.25 9.00011 11.25H4.49975C3.70404 11.25 2.94092 11.5661 2.37826 12.1287C1.81561 12.6913 1.49951 13.4544 1.49951 14.25V15.75M12.0004 2.34595C12.6437 2.51272 13.2135 2.8884 13.6202 3.41399C14.027 3.93959 14.2477 4.58536 14.2477 5.24995C14.2477 5.91453 14.027 6.5603 13.6202 7.0859C13.2135 7.6115 12.6437 7.98717 12.0004 8.15395M16.5007 15.7499V14.2499C16.5002 13.5852 16.279 12.9395 15.8717 12.4141C15.4644 11.8888 14.8942 11.5136 14.2505 11.3474M9.75017 5.25C9.75017 6.90685 8.40692 8.25 6.74993 8.25C5.09294 8.25 3.74969 6.90685 3.74969 5.25C3.74969 3.59315 5.09294 2.25 6.74993 2.25C8.40692 2.25 9.75017 3.59315 9.75017 5.25Z"
                  stroke="#0D9488"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              Вместимость: до {room.capacity} человек
            </div>
            <div className={styles.featureItem}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.7504 1.49951L9.00011 5.24981L5.24981 1.49951M2.99963 5.24981H15.0006C15.8291 5.24981 16.5007 5.92144 16.5007 6.74993V15.0006C16.5007 15.8291 15.8291 16.5007 15.0006 16.5007H2.99963C2.17114 16.5007 1.49951 15.8291 1.49951 15.0006V6.74993C1.49951 5.92144 2.17114 5.24981 2.99963 5.24981Z"
                  stroke="#0D9488"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              Проектор и ТВ-панель 4K
            </div>
            <div className={styles.featureItem}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.75025 15.7493H15.7508M15.8812 5.10874C16.2778 4.71231 16.5006 4.1746 16.5007 3.6139C16.5008 3.0532 16.2781 2.51544 15.8816 2.11891C15.4852 1.72239 14.9474 1.49958 14.3866 1.49951C13.8259 1.49944 13.288 1.72211 12.8915 2.11854L2.88109 12.1301C2.70693 12.3037 2.57814 12.5175 2.50605 12.7526L1.51521 16.0165C1.49583 16.0814 1.49436 16.1503 1.51098 16.2159C1.52759 16.2816 1.56166 16.3415 1.60957 16.3893C1.65748 16.4371 1.71745 16.4711 1.78311 16.4876C1.84877 16.5041 1.91767 16.5025 1.98251 16.483L5.24755 15.4931C5.48244 15.4216 5.69622 15.2936 5.8701 15.1203L15.8812 5.10874Z"
                  stroke="#0D9488"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              Маркерная доска
            </div>
            <div className={styles.featureItem}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.0004 9.7502L15.9179 12.3617C15.9744 12.3993 16.04 12.4208 16.1078 12.4241C16.1755 12.4273 16.2429 12.4121 16.3027 12.3801C16.3625 12.3481 16.4125 12.3005 16.4474 12.2423C16.4822 12.1841 16.5007 12.1175 16.5007 12.0497V5.9027C16.5007 5.83672 16.4833 5.7719 16.4503 5.71478C16.4172 5.65767 16.3697 5.61029 16.3125 5.57742C16.2553 5.54456 16.1904 5.52737 16.1244 5.52759C16.0584 5.52781 15.9937 5.54544 15.9367 5.5787L12.0004 7.8752M2.99963 4.5H10.5002C11.3287 4.5 12.0004 5.17157 12.0004 6V12C12.0004 12.8284 11.3287 13.5 10.5002 13.5H2.99963C2.17114 13.5 1.49951 12.8284 1.49951 12V6C1.49951 5.17157 2.17114 4.5 2.99963 4.5Z"
                  stroke="#0D9488"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              Система видеоконференций
            </div>
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА: Расписание на день */}
        <div className={styles.scheduleCard}>
          <div className={styles.scheduleHeader}>
            <div className={styles.scheduleTitleWrapper}>
              <h3>Расписание на день</h3>
              <p>Четверг, 24 октября</p>
            </div>
            <button className={styles.dateButton}>
              <svg 
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.33333 1.33301V3.99989M10.6667 1.33301V3.99989M2 6.66677H14M3.33333 2.66645H12.6667C13.403 2.66645 14 3.26345 14 3.99989V13.334C14 14.0704 13.403 14.6674 12.6667 14.6674H3.33333C2.59695 14.6674 2 14.0704 2 13.334V3.99989C2 3.26345 2.59695 2.66645 3.33333 2.66645Z"
                  stroke="#475569"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              Выбрать дату
            </button>
          </div>

          {/* Таймлайн */}
          <div className={styles.timeline}>
            {hours.map((time, index) => (
              <div key={index} className={styles.timeRow}>
                <span className={styles.timeLabel}>{time}</span>
              </div>
            ))}

            {/* Пример занятых слотов (можно динамически выводить из броней) */}
            <div
              className={`${styles.bookingSlot} ${styles.slotGreen}`}
              style={{ top: "100px", height: "44px" }}
            >
              Daily Sync / Команда разработки
            </div>

            <div
              className={`${styles.bookingSlot} ${styles.slotGray}`}
              style={{ top: "288px", height: "44px" }}
            >
              Занято
            </div>
          </div>

          <div className={styles.actionsFooter}>
            <button className={styles.bookButton}>Забронировать комнату</button>
          </div>
        </div>
      </div>
    </div>
  );
};
