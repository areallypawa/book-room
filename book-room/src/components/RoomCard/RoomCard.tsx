import { Link } from "react-router-dom";
import type { Room } from "../../types/index"; 
import styles from "./RoomCard.module.css"; 

interface RoomCardProps {
  room: Room & { available?: boolean };
  selectedDate: Date;
  statusText?: string; 
}

export const RoomCard = ({ room, selectedDate, statusText }: RoomCardProps) => {
  const isAvailable = room.available !== false;

  const currentStatusText = statusText || (isAvailable ? "Свободна весь день" : "Занята");

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.roomName}>{room.name}</h3>
        <p className={styles.roomFloor}>{room.floor} этаж</p>
      </div>

      <div className={styles.cardDetails}>
        <div>
          {/* Иконка вместимости */}
          <svg style={{ marginRight: "8px" }} width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.3341 13V11.6667C10.3341 10.9594 10.0531 10.2811 9.55297 9.78105C9.05283 9.28095 8.3745 9 7.6672 9H3.66688C2.95958 9 2.28125 9.28095 1.78111 9.78105C1.28097 10.2811 1 10.9594 1 11.6667V13M10.3341 1.08529C10.906 1.23353 11.4124 1.56746 11.774 2.03466C12.1355 2.50186 12.3317 3.07588 12.3317 3.66662C12.3317 4.25736 12.1355 4.83138 11.774 5.29858C11.4124 5.76578 10.906 6.09971 10.3341 6.24795M14.3344 12.9999V11.6666C14.334 11.0757 14.1373 10.5018 13.7753 10.0348C13.4132 9.56783 12.9064 9.2343 12.3342 9.08659M8.33392 3.66667C8.33392 5.13943 7.13992 6.33333 5.66704 6.33333C4.19416 6.33333 3.00016 5.13943 3.00016 3.66667C3.00016 2.19391 4.19416 1 5.66704 1C7.13992 1 8.33392 2.19391 8.33392 3.66667Z" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Вместимость: до {room.capacity} человек
        </div>
        <div>
          {/* Иконка часов */}
          <svg style={{ marginRight: "5px" }} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.6672 3.66688V7.6672L10.3341 9.00064M14.3344 7.6672C14.3344 11.3494 11.3494 14.3344 7.6672 14.3344C3.98501 14.3344 1 11.3494 1 7.6672C1 3.98501 3.98501 1 7.6672 1C11.3494 1 14.3344 3.98501 14.3344 7.6672Z" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          </svg>{" "}
          {currentStatusText}
        </div>
      </div>

      <div className={`${styles.statusBanner} ${isAvailable ? styles.statusAvailable : styles.statusUnavailable}`}>
        <span style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "8px" }}>
          <svg width="6" height="6" viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="3" cy="3" r="3" fill={isAvailable ? "#0D9488" : "#94A3B8"} />
          </svg>
          {isAvailable ? "Доступно на выбранное время" : "Недоступно на выбранное время"}
        </span>
      </div>

      <div className={styles.cardActions}>
        <Link to={`/rooms/${room.id}`} state={{ selectedDate: selectedDate.toISOString() }} className={styles.btnDetails}>
          Подробнее
        </Link>
        <button className={`${styles.btnBook} ${!isAvailable ? styles.btnBookDisabled : ""}`} disabled={!isAvailable}>
          Забронировать
        </button>
      </div>
    </div>
  );
};