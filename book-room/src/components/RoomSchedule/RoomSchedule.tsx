import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import type { Room } from "../../types/index"; 
import { Calendar } from "../../components/Calendar/Calendar";
import { BookingButton } from "../BookingButton/BookingButton";
import styles from "./RoomSchedule.module.css";

interface Booking {
  id: string;
  roomId: string;
  userId: string;
  title: string;
  startsAt: string;
  endsAt: string;
}

interface RoomScheduleProps {
  room: Room; 
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const fetchRoomBookings = async (
  roomId: string,
  date: Date
): Promise<Booking[]> => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const { data } = await api.get(`/rooms/${roomId}/bookings`, {
    params: {
      from: startOfDay.toISOString(),
      to: endOfDay.toISOString(),
    },
    timeout: 5000,
  });

  return Array.isArray(data) ? data : data.items || [];
};

export const RoomSchedule = ({ room, selectedDate, onDateChange }: RoomScheduleProps) => {
  const roomId = room.id;
  
  const formattedDate = [
    selectedDate.getFullYear(),
    String(selectedDate.getMonth() + 1).padStart(2, "0"),
    String(selectedDate.getDate()).padStart(2, "0"),
  ].join("-");

  const [calendarOpen, setCalendarOpen] = useState(false);

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

  const {
    data: bookings = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["room-bookings", roomId, formattedDate],
    queryFn: () => fetchRoomBookings(roomId, selectedDate),
    enabled: !!roomId,
  });

  const formatDateLabel = (date: Date) => {
    const day = date.getDate();
    const months = [
      "января",
      "февраля",
      "марта",
      "апреля",
      "мая",
      "июня",
      "июля",
      "августа",
      "сентября",
      "октября",
      "ноября",
      "декабря",
    ];
    const monthName = months[date.getMonth()];
    const capitalizedMonth =
      monthName.charAt(0).toUpperCase() + monthName.slice(1);
    const weekdays = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
    const weekdayName = weekdays[date.getDay()];
    return `${day} ${capitalizedMonth}, ${weekdayName}`;
  };

  const calculateBookingStyle = (startsAt: string, endsAt: string) => {
    const startDate = new Date(startsAt);
    const endDate = new Date(endsAt);
    const getMoscowHours = (d: Date) => {
      const options: Intl.DateTimeFormatOptions = { 
        timeZone: "Europe/Moscow", 
        hour: "numeric", 
        minute: "numeric", 
        hour12: false 
      };
      const parts = new Intl.DateTimeFormat("en-US", options).formatToParts(d);
      const h = parseInt(parts.find(p => p.type === "hour")?.value || "0", 10);
      const m = parseInt(parts.find(p => p.type === "minute")?.value || "0", 10);
      return h + m / 60;
    };
    let startHour = getMoscowHours(startDate);
    let endHour = getMoscowHours(endDate);

    if (endHour <= startHour && endDate > startDate) {
      endHour = 24;
    }

    const baseHour = 9;
    const hourHeight = 48;

    startHour = Math.max(baseHour, startHour);
    endHour = Math.min(21, endHour);

    const topOffset = (startHour - baseHour) * hourHeight;
    const durationHours = endHour - startHour;

    if (durationHours <= 0) return { display: "none" };

    const height = durationHours * hourHeight;

    return {
      top: `${topOffset + 6}px`,
      height: `${height}px`,
    };
  };

  // Если произошла ошибка запроса, рендерим блок ошибки
  if (isError) {
    return (
      <div className={styles.scheduleCard}>
        <div className={styles.errorContainer}>
          <svg
            className={styles.errorIcon}
            width="120"
            height="120"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="120" height="120" rx="60" fill="#FEE2E2" />
            <path
              d="M59.9998 52.9982V62.3315M59.9998 71.6649H60.0232M82.7041 73.9987L64.0375 41.3321C63.6305 40.6139 63.0402 40.0165 62.327 39.6009C61.6137 39.1853 60.803 38.9663 59.9775 38.9663C59.152 38.9663 58.3412 39.1853 57.628 39.6009C56.9147 40.0165 56.3245 40.6139 55.9175 41.3321L37.2508 73.9987C36.8394 74.7112 36.6237 75.5198 36.6255 76.3426C36.6273 77.1653 36.8466 77.973 37.2612 78.6837C37.6757 79.3943 38.2708 79.9828 38.9861 80.3893C39.7014 80.7959 40.5114 81.0061 41.3341 80.9987H78.6675C79.4862 80.9979 80.2904 80.7817 80.9991 80.3717C81.7079 79.9618 82.2963 79.3726 82.7053 78.6633C83.1144 77.954 83.3296 77.1496 83.3294 76.3309C83.3291 75.5121 83.1135 74.7078 82.7041 73.9987Z"
              stroke="#EF4444"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <h3 className={styles.errorTitle}>Не удалось загрузить расписание</h3>
          <p className={styles.errorSubtitle}>
            Произошла ошибка при загрузке расписания переговорной
          </p>
          <button className={styles.retryButton} onClick={() => refetch()}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  // Обычный рендер при успешной загрузке
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
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Выбрать дату
          </button>

          {calendarOpen && (
            <Calendar
              align="right"
              selectedDate={selectedDate}
              onSelectDate={(newDate) => {
                onDateChange(new Date(newDate));
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

        {isLoading ? (
          <div
            style={{ padding: "20px", textAlign: "center", color: "#94a3b8" }}
          >
            Загрузка расписания...
          </div>
        ) : (
          bookings.map((booking) => {
            const style = calculateBookingStyle(
              booking.startsAt,
              booking.endsAt
            );

            if (style.display === "none") return null;

            const isMyBooking = booking.userId === "user-konstantin";

            return (
              <div
                key={booking.id}
                className={`${styles.bookingSlot} ${
                  isMyBooking ? styles.slotGreen : styles.slotGray
                }`}
                style={style}
              >
                {isMyBooking ? booking.title : "Занято"}
              </div>
            );
          })
        )}
      </div>

      <div className={styles.actionsFooter}>
        <BookingButton 
          room={room} 
          selectedDate={selectedDate} 
        />
      </div>
    </div>
  );
};
