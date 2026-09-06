import { useState } from "react";
import { Calendar } from "../../components/Calendar/Calendar";
import styles from "./RoomShedule.module.css";

interface RoomScheduleProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export const RoomSchedule = ({ selectedDate, onDateChange }: RoomScheduleProps) => {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const hours = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00",
    "15:00", "16:00", "17:00", "18:00", "19:00", "20:00",
  ];

  // Форматирование даты тоже переехало сюда
  const formatDateLabel = (date: Date) => {
    const day = date.getDate();
    const months = [
      "января", "февраля", "марта", "апреля", "мая", "июня",
      "июля", "августа", "сентября", "октября", "ноября", "декабря",
    ];
    const monthName = months[date.getMonth()];
    const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    const weekdays = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
    const weekdayName = weekdays[date.getDay()];
    return `${day} ${capitalizedMonth}, ${weekdayName}`;
  };

  return (
    <div className={styles.scheduleCard}>
      <div className={styles.scheduleHeader}>
        <div className={styles.scheduleTitleWrapper}>
          <h3>Расписание на день</h3>
          <p>{formatDateLabel(selectedDate)}</p>
        </div>
        
        <div style={{ position: "relative" }}>
          <button
            className={styles.dateButton}
            onClick={() => setCalendarOpen(!calendarOpen)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.33333 1.33301V3.99989M10.6667 1.33301V3.99989M2 6.66677H14M3.33333 2.66645H12.6667C13.403 2.66645 14 3.26345 14 3.99989V13.334C14 14.0704 13.403 14.6674 12.6667 14.6674H3.33333C2.59695 14.6674 2 14.0704 2 13.334V3.99989C2 3.26345 2.59695 2.66645 3.33333 2.66645Z" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Выбрать дату
          </button>

          {calendarOpen && (
            <Calendar
              align="right"
              selectedDate={selectedDate}
              onSelectDate={(newDate) => {
                onDateChange(newDate); 
                setCalendarOpen(false); 
              }}
            />
          )}
        </div>
      </div>

      <div className={styles.timeline}>
        {hours.map((time, index) => (
          <div key={index} className={styles.timeRow}>
            <span className={styles.timeLabel}>{time}</span>
          </div>
        ))}

        <div className={`${styles.bookingSlot} ${styles.slotGreen}`} style={{ top: "100px", height: "44px" }}>
          Daily Sync / Команда разработки
        </div>

        <div className={`${styles.bookingSlot} ${styles.slotGray}`} style={{ top: "288px", height: "44px" }}>
          Занято
        </div>
      </div>

      <div className={styles.actionsFooter}>
        <button className={styles.bookButton}>Забронировать комнату</button>
      </div>
    </div>
  );
};