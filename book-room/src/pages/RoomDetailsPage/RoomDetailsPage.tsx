import { useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import type { Room } from "../../types/index";
import styles from "./RoomDetailsPage.module.css";

import { RoomInfo } from "../../components/RoomInfo/RoomInfo";
import { RoomSchedule } from "../../components/RoomSchedule/RoomSchedule";

const fetchRoomDetails = async (roomId: string): Promise<Room> => {
  const { data } = await api.get(`/rooms/${roomId}`);
  return data;
};

const officeNames: Record<string, string> = {
  "office-moscow": "Москва",
  "office-saint-petersburg": "Санкт-Петербург",
};

export const RoomDetailsPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();

  const initialDate = location.state?.selectedDate
    ? new Date(location.state.selectedDate)
    : new Date();

  // оставляем дату здесь, она потом понадобится тебе для отправки на бэкенд при бронировании
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);

  const {
    data: room,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["room", roomId],
    queryFn: () => fetchRoomDetails(roomId!),
    enabled: !!roomId,
  });

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        {/* Скелет хлебных крошек */}
        <div className={`${styles.skeleton} ${styles.skeletonLine}`} style={{ width: "250px", height: "20px", marginBottom: "24px" }}></div>

        <div className={styles.contentGrid}>
          {/* Скелет левой колонки */}
          <div className={styles.infoCard}>
            <div className={`${styles.skeleton} ${styles.skeletonLine}`} style={{ width: "70%", height: "32px", marginBottom: "12px" }}></div>
            <div className={`${styles.skeleton} ${styles.skeletonLine}`} style={{ width: "90%", height: "16px", marginBottom: "32px" }}></div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className={`${styles.skeleton} ${styles.skeletonLine}`} style={{ width: "80%", height: "20px" }}></div>
              <div className={`${styles.skeleton} ${styles.skeletonLine}`} style={{ width: "85%", height: "20px" }}></div>
              <div className={`${styles.skeleton} ${styles.skeletonLine}`} style={{ width: "75%", height: "20px" }}></div>
              <div className={`${styles.skeleton} ${styles.skeletonLine}`} style={{ width: "90%", height: "20px" }}></div>
            </div>
          </div>

          {/* Скелет правой колонки */}
          <div className={styles.scheduleCard}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "40px" }}>
              <div className={`${styles.skeleton} ${styles.skeletonLine}`} style={{ width: "200px", height: "40px" }}></div>
              <div className={`${styles.skeleton} ${styles.skeletonLine}`} style={{ width: "130px", height: "40px", borderRadius: "8px" }}></div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                  <div className={`${styles.skeleton} ${styles.skeletonLine}`} style={{ width: "40px", height: "16px" }}></div>
                  <div className={`${styles.skeleton} ${styles.skeletonLine}`} style={{ flex: 1, height: "2px" }}></div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "40px" }}>
              <div className={`${styles.skeleton} ${styles.skeletonLine}`} style={{ width: "220px", height: "48px", borderRadius: "8px" }}></div>
            </div>
          </div>
        </div>
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
      <div className={styles.breadcrumbs}>
        <Link to="/rooms" className={styles.breadcrumbLink}>Переговорные</Link>
        <span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.25 10.5L8.75 7L5.25 3.5" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
        <span className={styles.breadcrumbLink}>
          Офис {room.officeId ? officeNames[room.officeId] : "Москва"}
        </span>
        <span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.25 10.5L8.75 7L5.25 3.5" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
        <span className={styles.breadcrumbCurrent}>
          Комната &quot;{room.name}&quot;
        </span>
      </div>

      {/* ВОТ ОНО - МАГИЯ КОМПОНЕНТОВ! */}
      <div className={styles.contentGrid}>
        <RoomInfo 
          room={room} 
          officeName={room.officeId ? officeNames[room.officeId] : "Москва"} 
        />
        
        <RoomSchedule 
          selectedDate={selectedDate} 
          onDateChange={setSelectedDate} 
        />
      </div>
    </div>
  );
};