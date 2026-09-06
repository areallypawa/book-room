import { useState, useEffect } from "react";
import styles from "./BookingModal.module.css";
import { Calendar } from "../Calendar/Calendar";
import { api } from "../../api/axios";

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

  // Если модалка открылась заново — сбрасываем состояние ошибки.
  useEffect(() => {
    if (isOpen) {
      setViewState("form");
      setErrorMessage("");
      setHasError(false);
      setIsCalendarOpen(false);
      setIsLoading(false);
      setDate(initialDate);
    }
  }, [isOpen, initialDate]);

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

  // Расчёт времени окончания.
  const calculateEndTime = (start: string, durationMins: number) => {
    const [hours, minutes] = start.split(":").map(Number);

    const totalMinutes = hours * 60 + minutes + durationMins;

    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMins = totalMinutes % 60;

    return `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(
      2,
      "0"
    )}`;
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
        
        // Возвращаем формат YYYY-MM-DDTHH:mm:ss+03:00, чтобы бэкенд точно понял часовой пояс
        return `${year}-${month}-${day}T${h}:${m}:${s}+03:00`;
      };
    
    // Рабочие часы: 09:00 - 20:00.
    const workStart = 9 * 60;
    const workEnd = 20 * 60;

    const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
    const endMinutes = endDate.getHours() * 60 + endDate.getMinutes();

    if (startMinutes < workStart || endMinutes > workEnd) {
      setErrorMessage(
        "Бронирование должно полностью находиться в рабочих часах с 09:00 до 20:00"
      );
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
      onClose();
    } catch (error) {
      const apiError = error as ApiError;

      const errorCode = apiError.response?.data?.error?.code;
      const serverMessage = apiError.response?.data?.error?.message;

      console.error("Ошибка бронирования:", {
        status: apiError.response?.status,
        code: errorCode,
        message: serverMessage,
      });

      // Время уже занято.
      if (
        apiError.response?.status === 409 ||
        errorCode === "BOOKING_CONFLICT" ||
        errorCode === "CONFLICT"
      ) {
        setErrorMessage(
          "Выбранный интервал был забронирован другим сотрудником. Расписание обновлено."
        );
      }
      // Вышли за рабочие часы.
      else if (errorCode === "OUTSIDE_WORKING_HOURS") {
        setErrorMessage(
          serverMessage ||
            "Бронирование должно полностью находиться в рабочих часах с 09:00 до 20:00"
        );
      }
      // Любая другая ошибка сервера.
      else {
        setErrorMessage(
          serverMessage ||
            "Не удалось создать бронирование. Попробуйте ещё раз."
        );
      }

      setViewState("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        {viewState === "form" && (
          <>
            <div className={styles.header}>
              <h2 className={styles.title}>Новое бронирование</h2>

              <p className={styles.subtitle}>
                Переговорная:{" "}
                <span className={styles.roomName}>{roomName}</span>{" "}
                (Офис Москва, {floor} этаж)
              </p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Тема встречи *
              </label>

              <input
                type="text"
                placeholder="Укажите тему встречи"
                className={`${styles.input} ${
                  hasError ? styles.inputError : ""
                }`}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setHasError(false);
                }}
                disabled={isLoading}
              />

              {hasError && (
                <span className={styles.errorText}>
                  Обязательное поле
                </span>
              )}
            </div>

            <div className={styles.row}>
              {/* Дата */}
              <div
                className={styles.formGroup}
                style={{ position: "relative" }}
              >
                <label className={styles.label}>Дата</label>

                <input
                  type="text"
                  className={styles.input}
                  readOnly
                  value={formattedDate}
                  onClick={() =>
                    setIsCalendarOpen(!isCalendarOpen)
                  }
                  style={{ cursor: "pointer" }}
                />

                {isCalendarOpen && (
                  <Calendar
                    align="left"
                    selectedDate={date}
                    onSelectDate={(newDate) => {
                      setDate(new Date(newDate));
                      setIsCalendarOpen(false);
                    }}
                  />
                )}
              </div>

              {/* Время начала */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Время начала
                </label>

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

            {/* Продолжительность */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Продолжительность
              </label>

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

            {/* Комментарий */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Комментарий
              </label>

              <textarea
                placeholder="Дополнительная информация для участников встречи..."
                className={styles.textarea}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Инфо-баннер */}
            <div className={styles.infoBanner}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.99967 14.6663C11.6816 14.6663 14.6663 11.6816 14.6663 7.99967C14.6663 4.31778 11.6816 1.33301 7.99967 1.33301C4.31778 1.33301 1.33301 4.31778 1.33301 7.99967C1.33301 11.6816 4.31778 14.6663 7.99967 14.6663Z"
                  stroke="#065F46"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <path
                  d="M8 4V8L10.6667 9.33333"
                  stroke="#065F46"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              Бронирование на {formattedDate},{" "}
              {startTime} - {endTime} (
              {durationMinutes < 60
                ? `${durationMinutes} мин`
                : `${durationMinutes / 60} час`}
              )
            </div>

            {/* Кнопки */}
            <div className={styles.footer}>
              <button
                className={styles.btnCancel}
                onClick={onClose}
                disabled={isLoading}
              >
                Отмена
              </button>

              <button
                className={styles.btnSubmit}
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? "Обработка..." : "Забронировать"}
              </button>
            </div>
          </>
        )}

        {/* Экран ошибки */}
        {viewState === "error" && (
          <div className={styles.stateContainer}>
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                width="64"
                height="64"
                rx="32"
                fill="#FEE2E2"
              />

              <path
                d="M32.0001 27.9992V33.3325M32.0001 38.6659H32.0134M44.974 39.9995L34.3073 21.3328C34.0747 20.9224 33.7374 20.5811 33.3299 20.3436C32.9223 20.1061 32.459 19.981 31.9873 19.981C31.5156 19.981 31.0523 20.1061 30.6447 20.3436C30.2372 20.5811 29.8999 20.9224 29.6673 21.3328L19.0006 39.9995C18.7655 40.4066 18.6424 40.8687 18.6433 41.3388C18.6444 41.809 18.7697 42.2705 19.0066 42.6766C19.2435 43.0827 19.5835 43.4189 19.9922 43.6513C20.401 43.8836 20.8638 44.0037 21.334 43.9995H42.6673C43.1352 43.999 43.5947 43.8754 43.9997 43.6412C44.4047 43.407 44.7409 43.0703 44.9747 42.665C45.2084 42.2597 45.3314 41.8 45.3312 41.3321C45.3311 40.8643 45.2079 40.4047 44.974 39.9995Z"
                stroke="#B91C1C"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>

            <h3 className={styles.stateTitle}>
              Не удалось забронировать
            </h3>

            <p className={styles.stateDesc}>
              {errorMessage}
            </p>

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
