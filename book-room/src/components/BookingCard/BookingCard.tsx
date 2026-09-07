import styles from "./BookingCard.module.css";
import { InfoIcon, DotSeparatorIcon } from "../ui/icons"

const formatMonth = (iso: string) => {
  const months = ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"];
  return months[new Date(iso).getMonth()];
};

const formatDay = (iso: string) => new Date(iso).getDate();

const formatTimeRange = (startIso: string, endIso: string) => {
  const s = new Date(startIso);
  const e = new Date(endIso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(s.getHours())}:${pad(s.getMinutes())} - ${pad(e.getHours())}:${pad(e.getMinutes())} MSK`;
};

interface BookingCardProps {
  booking: any;
  showCancel: boolean;
  onCancel: () => void; 
  isCanceling: boolean;
}

export const BookingCard = ({ booking, showCancel, onCancel, isCanceling }: BookingCardProps) => {
  return (
    <div className={styles.card}>
      <div className={styles.dateBlock}>
        <span className={styles.month}>{formatMonth(booking.startsAt)}</span>
        <span className={styles.day}>{formatDay(booking.startsAt)}</span>
      </div>

      <div className={styles.infoBlock}>
        <h3 className={styles.title}>{booking.title}</h3>
        
        <div className={styles.roomInfo}>
          <InfoIcon />
          <span className={styles.roomName}>{booking.room?.name || "Неизвестная комната"}</span>
          <DotSeparatorIcon />
          <span>{booking.room?.floor ? `${booking.room.floor} этаж` : "Этаж не указан"}</span>
          <DotSeparatorIcon />
          <span>{formatTimeRange(booking.startsAt, booking.endsAt)}</span>
        </div>
      </div>

      {showCancel && (
        <button 
          className={styles.cancelButton}
          onClick={onCancel} // убрали window.confirm
          disabled={isCanceling}
        >
          {isCanceling ? "Отмена..." : "Отменить"}
        </button>
      )}
    </div>
  );
};