import { useState, useEffect } from "react";
import styles from "./BookingModal.module.css";
import { Calendar } from "../Calendar/Calendar";
import { api } from "../../api/axios";
import { ClockGreenIcon, ErrorSmallIcon } from "../ui/icons";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  roomName: string;
  floor: number;
  initialDate: Date;
  initialTime?: string;
  initialDuration?: number;
  onSuccess: (dateTimeText: string) => void;
}

interface ApiError {
  response?: {
    status?: number;
    data?: {
      error?: {
        code?: string;
        message?: string;
      };
    };
  };
}

export const BookingModal = ({
  isOpen,
  onClose,
  roomName,
  roomId,
  floor,
  initialDate,
  initialTime = "15:00",
  initialDuration = 60,
  onSuccess,
}: BookingModalProps) => {
  const [title, setTitle] = useState("");
  const [hasError, setHasError] = useState(false);
  const [viewState, setViewState] = useState<"form" | "error">("form");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [date, setDate] = useState<Date>(initialDate);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [startTime, setStartTime] = useState(initialTime);
  const [durationMinutes, setDurationMinutes] = useState(initialDuration);
  const [comment, setComment] = useState("");

  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setViewState("form");
      setErrorMessage("");
      setHasError(false);
      setIsCalendarOpen(false);
      setIsLoading(false);
      setDate(initialDate);
    }
  }, [isOpen, initialDate]);

  useEffect(() => {
    if (initialTime) {
      setStartTime(initialTime);
    }
  }, [initialTime]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  if (!isOpen) return null;

  const durationOptions = [
    { label: "15 минут", value: 15 },
    { label: "30 минут", value: 30 },
    { label: "45 минут", value: 45 },
    { label: "1 час", value: 60 },
    { label: "1 час 15 минут", value: 75 },
    { label: "1 час 30 минут", value: 90 },
    { label: "1 час 45 минут", value: 105 },
    { label: "2 часа", value: 120 },
  ];

  const calculateEndTime = (start: string, durationMins: number) => {
    const [hours, minutes] = start.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + durationMins;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMins = totalMinutes % 60;
    return `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;
  };

  const endTime = calculateEndTime(startTime, durationMinutes);

  const formattedDate = date.toLocaleDateString("ru-RU", {
    weekday: "short",
    day: "numeric",
    month: "long",
  });

  const handleSubmit = async () => {
    if (!title.trim()) {
      setHasError(true);
      return;
    }

    setHasError(false);

    const startDate = new Date(date);
    const [hours, minutes] = startTime.split(":").map(Number);
    startDate.setHours(hours, minutes, 0, 0);

    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + durationMinutes);

    const formatToMSKISO = (d: Date) => {
      const pad = (n: number) => String(n).padStart(2, '0');
      const year = d.getFullYear();
      const month = pad(d.getMonth() + 1);
      const day = pad(d.getDate());
      const h = pad(d.getHours());
      const m = pad(d.getMinutes());
      const s = pad(d.getSeconds());
      return `${year}-${month}-${day}T${h}:${m}:${s}+03:00`;
    };

    const workStart = 9 * 60;
    const workEnd = 20 * 60;
    const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
    const endMinutes = endDate.getHours() * 60 + endDate.getMinutes();

    if (startMinutes < workStart || endMinutes > workEnd) {
      setErrorMessage("Бронирование должно полностью находиться в рабочих часах с 09:00 до 20:00");
      setViewState("error");
      return;
    }

    setIsLoading(true);

    try {
      const { data: booking } = await api.post("/bookings", {
        roomId,
        title: title.trim(),
        comment,
        startsAt: formatToMSKISO(startDate),
        endsAt: formatToMSKISO(endDate),
      });

      const createdStart = new Date(booking.startsAt);
      const createdEnd = new Date(booking.endsAt);

      const dateText = createdStart.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
      });

      const startText = createdStart.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Moscow",
      });

      const endText = createdEnd.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Moscow",
      });

      const successText = `${dateText}, ${startText} - ${endText}`;

      onSuccess(successText);
      handleClose();
    } catch (error) {
      const apiError = error as ApiError;
      const errorCode = apiError.response?.data?.error?.code;
      const serverMessage = apiError.response?.data?.error?.message;

      if (
        apiError.response?.status === 409 ||
        errorCode === "BOOKING_CONFLICT" ||
        errorCode === "CONFLICT"
      ) {
        setErrorMessage("Выбранный интервал был забронирован другим сотрудником. Расписание обновлено.");
      } else if (errorCode === "OUTSIDE_WORKING_HOURS") {
        setErrorMessage(serverMessage || "Бронирование должно полностью находиться в рабочих часах с 09:00 до 20:00");
      } else {
        setErrorMessage(serverMessage || "Не удалось создать бронирование. Попробуйте ещё раз.");
      }

      setViewState("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${styles.overlay} ${isClosing ? styles.overlayClosing : ""}`} onClick={handleClose}>
      <div
        className={`${styles.modal} ${isClosing ? styles.modalClosing : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {viewState === "form" && (
          <>
            <div className={styles.header}>
              <h2 className={styles.title}>Новое бронирование</h2>
              <p className={styles.subtitle}>
                Переговорная: <span className={styles.roomName}>{roomName}</span> (Офис Москва, {floor} этаж)
              </p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Тема встречи *</label>
              <input
                type="text"
                placeholder="Укажите тему встречи"
                className={`${styles.input} ${hasError ? styles.inputError : ""}`}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setHasError(false);
                }}
                disabled={isLoading}
              />
              {hasError && <span className={styles.errorText}>Обязательное поле</span>}
            </div>

            <div className={styles.row}>
              <div className={styles.formGroup} style={{ position: "relative" }}>
                <label className={styles.label}>Дата</label>
                <input
                  type="text"
                  className={styles.input}
                  readOnly
                  value={formattedDate}
                  onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                  style={{ cursor: "pointer" }}
                />

                {isCalendarOpen && (
                  <Calendar
                    align="left"
                    isOpen={isCalendarOpen}
                    selectedDate={date}
                    onSelectDate={(newDate) => {
                      setDate(new Date(newDate));
                      setIsCalendarOpen(false);
                    }}
                    onToggle={() => setIsCalendarOpen(!isCalendarOpen)}
                    onClose={() => setIsCalendarOpen(false)}
                  />
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Время начала</label>
                <input
                  type="time"
                  className={styles.input}
                  value={startTime}
                  min="09:00"
                  max="19:45"
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    setViewState("form");
                  }}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Продолжительность</label>
              <select
                className={styles.select}
                value={durationMinutes}
                onChange={(e) => {
                  setDurationMinutes(Number(e.target.value));
                  setViewState("form");
                }}
                disabled={isLoading}
              >
                {durationOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Комментарий</label>
              <textarea
                placeholder="Дополнительная информация для участников встречи..."
                className={styles.textarea}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className={styles.infoBanner}>
              <ClockGreenIcon />
              Бронирование на {formattedDate}, {startTime} - {endTime} (
              {durationMinutes < 60 ? `${durationMinutes} мин` : `${durationMinutes / 60} час`}
              )
            </div>

            <div className={styles.footer}>
              <button className={styles.btnCancel} onClick={handleClose} disabled={isLoading}>
                Отмена
              </button>
              <button className={styles.btnSubmit} onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Обработка..." : "Забронировать"}
              </button>
            </div>
          </>
        )}

        {viewState === "error" && (
          <div className={styles.stateContainer}>
            <ErrorSmallIcon />
            <h3 className={styles.stateTitle}>Не удалось забронировать</h3>
            <p className={styles.stateDesc}>{errorMessage}</p>
            <button
              className={styles.btnSubmit}
              style={{ width: "100%" }}
              onClick={() => {
                setViewState("form");
                setErrorMessage("");
              }}
            >
              Выбрать другое время
            </button>
          </div>
        )}
      </div>
    </div>
  );
};