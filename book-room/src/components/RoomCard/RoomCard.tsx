import { Link } from "react-router-dom";
import type { Room } from "../../types/index";
import styles from "./RoomCard.module.css";
import { BookingButton } from "../BookingButton/BookingButton";
import { CapacityIcon, ClockIcon, StatusDotIcon } from "../ui/icons";

interface RoomCardProps {
  room: Room & { available?: boolean };
  selectedDate: Date;
  statusText: string;
  initialTime?: string;     
  initialDuration?: number;
}
  
export const RoomCard = ({ 
  room, 
  selectedDate, 
  statusText, 
  initialTime, 
  initialDuration 
}: RoomCardProps) => {
  const isAvailable = room.available !== false;

  const currentStatusText =
    statusText || (isAvailable ? "Свободна весь день" : "Занята");

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.roomName}>{room.name}</h3>
        <p className={styles.roomFloor}>{room.floor} этаж</p>
      </div>

      <div className={styles.cardDetails}>
        <div>
          {/* Иконка вместимости */}
          <CapacityIcon />
          Вместимость: до {room.capacity} человек
        </div>
        <div>
          {/* Иконка часов */}
          <ClockIcon />
          {" "}
          {currentStatusText}
        </div>
      </div>

      <div
        className={`${styles.statusBanner} ${
          isAvailable ? styles.statusAvailable : styles.statusUnavailable
        }`}
      >
        <span className={styles.statusIndicator}>
          <StatusDotIcon isAvailable={isAvailable}/>
          {isAvailable
            ? "Доступно на выбранное время"
            : "Недоступно на выбранное время"}
        </span>
      </div>

      <div className={styles.cardActions}>
        <Link
          to={`/rooms/${room.id}`}
          state={{ selectedDate: selectedDate.toISOString() }}
          className={styles.btnDetails}
        >
          Подробнее
        </Link>
        <BookingButton
          room={room}
          selectedDate={selectedDate}
          initialTime={initialTime}
          initialDuration={initialDuration}
        />
      </div>
    </div>
  );
};