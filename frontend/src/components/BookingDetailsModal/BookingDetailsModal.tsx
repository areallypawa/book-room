import styles from "./BookingDetailsModal.module.css";
import { ModalRoomIcon, ModalDateIcon, InfoIcon } from "../ui/icons";
import { ExportIcsButton } from "../ExportIcsButton/ExportIcsButton"; 

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;          
    userId: string;      
    title: string;
    comment?: string;
    startsAt: string;
    endsAt: string;
    room?: { name: string; floor?: number };
  } | null;
}

const formatModalDate = (startIso: string, endIso: string) => {
  const s = new Date(startIso);
  const e = new Date(endIso);
  const weekdays = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
  const months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${weekdays[s.getDay()]}, ${s.getDate()} ${months[s.getMonth()]}, ${pad(s.getHours())}:${pad(s.getMinutes())} - ${pad(e.getHours())}:${pad(e.getMinutes())}`;
};

export const BookingDetailsModal = ({ isOpen, onClose, booking }: BookingDetailsModalProps) => {
  if (!isOpen || !booking) return null;

  // Проверяем, принадлежит ли бронь текущему пользователю
  const isMyBooking = booking.userId === "user-konstantin";

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>Информация о бронировании</h2>
        
        <div className={styles.bookingCard}>
          <h4 className={styles.bookingTitle}>{booking.title}</h4>
          
          <div className={styles.infoRow}>
            <ModalRoomIcon />
            <span>Комната &quot;{booking.room?.name || "Неизвестно"}&quot;{booking.room?.floor ? `, ${booking.room.floor} этаж` : ""}</span>
          </div>

          <div className={styles.infoRow}>
            <ModalDateIcon />
            <span>{formatModalDate(booking.startsAt, booking.endsAt)}</span>
          </div>

          {booking.comment && (
            <div className={styles.commentRow}>
              <InfoIcon />
              <span className={styles.commentText}>{booking.comment}</span>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          {isMyBooking && (
            <ExportIcsButton 
            bookings={[ 
              {
                id: booking.id,
                title: booking.title,
                comment: booking.comment,
                startsAt: booking.startsAt,
                endsAt: booking.endsAt,
                roomName: booking.room?.name,
              }
            ]}
            fileName={`My_booking.ics`}
            />
          )}
          
          <button type="button" className={styles.btnClose} onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};