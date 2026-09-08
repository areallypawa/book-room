import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import type { Room } from "../../types/index"; 
import { Calendar } from "../../components/Calendar/Calendar";
import { BookingButton } from "../BookingButton/BookingButton";
import { BookingModal } from "../BookingModal/BookingModal";
import { BookingDetailsModal } from "../BookingDetailsModal/BookingDetailsModal"; 
import { SuccessToast } from "../Toasts/SuccesToast/SuccessToast";
import styles from "./RoomSchedule.module.css";

interface Booking {
  id: string;
  roomId: string;
  userId: string;
  title: string;
  comment?: string;
  startsAt: string;
  endsAt: string;
  room?: { name: string; floor?: number };
}

interface RoomScheduleProps {
  room: Room; 
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const fetchRoomBookings = async (roomId: string, date: Date): Promise<Booking[]> => {
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

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Стейты для создания брони по клику на пустое время
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("12:00");

  // Стейты для просмотра информации о существующей брони (зеленая/серая плашка)
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<Booking | null>(null);

  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState("");

  const hours = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00",
    "15:00", "16:00", "17:00", "18:00", "19:00", "20:00",
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
    const months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
    const monthName = months[date.getMonth()];
    const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    const weekdays = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
    return `${day} ${capitalizedMonth}, ${weekdays[date.getDay()]}`;
  };

  const calculateBookingStyle = (startsAt: string, endsAt: string) => {
    const startDate = new Date(startsAt);
    const endDate = new Date(endsAt);
    const getMoscowHours = (d: Date) => {
      const options: Intl.DateTimeFormatOptions = { timeZone: "Europe/Moscow", hour: "numeric", minute: "numeric", hour12: false };
      const parts = new Intl.DateTimeFormat("en-US", options).formatToParts(d);
      const h = parseInt(parts.find(p => p.type === "hour")?.value || "0", 10);
      const m = parseInt(parts.find(p => p.type === "minute")?.value || "0", 10);
      return h + m / 60;
    };
    let startHour = getMoscowHours(startDate);
    let endHour = getMoscowHours(endDate);

    if (endHour <= startHour && endDate > startDate) endHour = 24;

    const baseHour = 9;
    const hourHeight = 48;

    startHour = Math.max(baseHour, startHour);
    endHour = Math.min(21, endHour);

    const topOffset = (startHour - baseHour) * hourHeight;
    const durationHours = endHour - startHour;

    if (durationHours <= 0) return { display: "none" };

    return {
      top: `${topOffset + 6}px`,
      height: `${durationHours * hourHeight}px`,
    };
  };

  if (isError) {
    return (
      <div className={styles.scheduleCard}>
        <div className={styles.errorContainer}>
          <h3 className={styles.errorTitle}>Не удалось загрузить расписание</h3>
          <button className={styles.retryButton} onClick={() => refetch()}>Попробовать снова</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.scheduleCard}>
      <div className={styles.scheduleHeader}>
        <div className={styles.scheduleTitleWrapper}>
          <h3>Расписание на день</h3>
          <p>{formatDateLabel(selectedDate)}</p>
        </div>

        <div style={{ position: "relative" }}>
          <Calendar
            align="right"
            isOpen={isCalendarOpen}
            selectedDate={selectedDate}
            onSelectDate={(newDate) => {
              onDateChange(new Date(newDate));
              setIsCalendarOpen(false);
            }}
            onToggle={() => setIsCalendarOpen(!isCalendarOpen)}
            onClose={() => setIsCalendarOpen(false)}
          />
        </div>
      </div>

      <div className={styles.timeline}>
        {hours.map((time, index) => (
          <div 
            key={index} 
            className={styles.timeRow}
            onClick={() => {
              setSelectedTimeSlot(time);
              setIsModalOpen(true);
            }}
          >
            <span className={styles.timeLabel}>{time}</span>
          </div>
        ))}

        {isLoading ? (
          <div style={{ padding: "20px", textAlign: "center", color: "#94a3b8" }}>Загрузка расписания...</div>
        ) : (
          bookings.map((booking) => {
            const style = calculateBookingStyle(booking.startsAt, booking.endsAt);
            if (style.display === "none") return null;

            const isMyBooking = booking.userId === "user-konstantin";

            return (
              <div
                key={booking.id}
                className={`${styles.bookingSlot} ${isMyBooking ? styles.slotGreen : styles.slotGray}`}
                style={style}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedBookingForDetails(booking);  
                }}
              >
                {isMyBooking ? booking.title : "Занято"}
              </div>
            );
          })
        )}
      </div>

      <div className={styles.actionsFooter}>
        <BookingButton room={room} selectedDate={selectedDate} />
      </div>

      {/* Модалка создания брони по клику на время */}
      <BookingModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        roomId={room.id}
        roomName={room.name}
        floor={room.floor}
        initialDate={selectedDate}
        initialTime={selectedTimeSlot}
        initialDuration={60}
        onSuccess={(text) => {
          setToastText(text); 
          setShowToast(true);
          setIsModalOpen(false);
          refetch();
        }}
      />

      {/* Модалка с информацией о существующей брони */}
      <BookingDetailsModal
        isOpen={!!selectedBookingForDetails}
        onClose={() => setSelectedBookingForDetails(null)}
        booking={selectedBookingForDetails}
      />

      {showToast && (
        <SuccessToast 
          roomName={room.name}
          dateTimeText={`${toastText} MSK`} 
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};