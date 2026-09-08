import { useState, useEffect } from "react";
import styles from "./BookingModal.module.css";
import { Calendar } from "../Calendar/Calendar";
import { api } from "../../api/axios";
import { ClockGreenIcon, ErrorSmallIcon } from "../ui/icons";
import { TimeSelector } from "../TimeSelector/TimeSelector";
import { RecurringOptions } from "../RecurringOptions/RecurringOptions";

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

  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([initialDate.getDay()]);
  const [recurrenceInterval, setRecurrenceInterval] = useState<string>("week");
  const [customDaysCount, setCustomDaysCount] = useState<number>(7);

  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isDurationDropdownOpen, setIsDurationDropdownOpen] = useState(false);
  const [isIntervalDropdownOpen, setIsIntervalDropdownOpen] = useState(false);

  const [isClosing, setIsClosing] = useState(false);
  
  // СТЕЙТ ДЛЯ ЗАГРУЖЕННЫХ БРОНЕЙ
  const [dayBookings, setDayBookings] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setViewState("form");
      setErrorMessage("");
      setHasError(false);
      setIsCalendarOpen(false);
      setIsLoading(false);
      setDate(initialDate);
      setIsRecurring(false);
      setSelectedDays([initialDate.getDay()]);
      setRecurrenceInterval("week");
      setCustomDaysCount(7);
      setIsTimeDropdownOpen(false);
      setIsDurationDropdownOpen(false);
      setIsIntervalDropdownOpen(false);
    }
  }, [isOpen, initialDate]);

  useEffect(() => {
    if (initialTime) {
      setStartTime(initialTime);
    }
  }, [initialTime]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchDayBookings = async () => {
      try {
        const { data } = await api.get("/bookings");
        
        const pad = (n: number) => String(n).padStart(2, '0');
        const selectedDateStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

        const filtered = data.filter((b: any) => {
          const isSameRoom = b.room?.id === roomId || b.roomId === roomId;
          if (!isSameRoom) return false;

          return b.startsAt.startsWith(selectedDateStr);
        });

        setDayBookings(filtered);
      } catch (error) {
        console.error("Не удалось загрузить расписание на день", error);
      }
    };

    fetchDayBookings();
  }, [isOpen, date, roomId]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  if (!isOpen) return null;

  const toggleDay = (dayValue: number) => {
    if (selectedDays.includes(dayValue)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== dayValue));
      }
    } else {
      setSelectedDays([...selectedDays, dayValue]);
    }
  };

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

    const datesToBook: Date[] = [];
    const baseDate = new Date(date);
    
     
    if (!startTime || !startTime.includes(":")) {
      setErrorMessage("Пожалуйста, выберите доступное время начала.");
      setViewState("error");
      return;
    }

    const [hours, minutes] = startTime.split(":").map(Number);
    baseDate.setHours(hours, minutes, 0, 0);

    if (!isRecurring) {
      datesToBook.push(baseDate);
    } else {
      const weeksToRepeat = 4; 
      const stepDays = recurrenceInterval === "week" ? 7 : recurrenceInterval === "month" ? 30 : customDaysCount;

      for (let i = 0; i < weeksToRepeat * 7; i += stepDays) {
        const currentDate = new Date(baseDate);
        currentDate.setDate(baseDate.getDate() + i);

        const dayOfWeek = currentDate.getDay();
        if (selectedDays.includes(dayOfWeek)) {
          if (currentDate >= new Date(new Date().setHours(0,0,0,0))) {
            datesToBook.push(new Date(currentDate));
          }
        }
      }
      
      if (datesToBook.length === 0) {
        datesToBook.push(baseDate);
      }
    }

    setIsLoading(true);

    try {
      let lastCreatedBooking = null;

      for (const d of datesToBook) {
        const startDate = new Date(d);
        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + durationMinutes);

        const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
        const endMinutes = endDate.getHours() * 60 + endDate.getMinutes();

        if (startMinutes < workStart || endMinutes > workEnd) {
          throw new Error("OUTSIDE_WORKING_HOURS");
        }

        const { data: booking } = await api.post("/bookings", {
          roomId,
          title: title.trim(),
          comment,
          startsAt: formatToMSKISO(startDate),
          endsAt: formatToMSKISO(endDate),
        });

        lastCreatedBooking = booking;
      }

      if (!lastCreatedBooking) throw new Error("No bookings created");

      const createdStart = new Date(lastCreatedBooking.startsAt);
      const createdEnd = new Date(lastCreatedBooking.endsAt);

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

      const successText = isRecurring 
        ? `${dateText} и др., ${startText} - ${endText}` 
        : `${dateText}, ${startText} - ${endText}`;

      onSuccess(successText);
      handleClose();
    } catch (error: any) {
      const errorCode = error.response?.data?.error?.code || error.message;
      const serverMessage = error.response?.data?.error?.message;

      if (
        error.response?.status === 409 ||
        errorCode === "BOOKING_CONFLICT" ||
        errorCode === "CONFLICT"
      ) {
        setErrorMessage("Один из интервалов пересекается с существующей бронью. Выберите другое время.");
      } else if (errorCode === "OUTSIDE_WORKING_HOURS") {
        setErrorMessage("Бронирование должно полностью находиться в рабочих часах с 09:00 до 20:00");
      } else {
        setErrorMessage(serverMessage || "Не удалось создать бронирование. Возможно, некоторые слоты уже заняты.");
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

            {/* СТРОКА 1: Дата и Время начала */}
            <div className={styles.row}>
              <div className={styles.formGroup} style={{ position: "relative" }}>
                <label className={styles.label}>Дата</label>
                <input
                  type="text"
                  className={styles.input}
                  readOnly
                  value={formattedDate}
                  onClick={() => {
                    setIsCalendarOpen(!isCalendarOpen);
                    setIsTimeDropdownOpen(false);
                    setIsDurationDropdownOpen(false);
                    setIsIntervalDropdownOpen(false);
                  }}
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
                <TimeSelector
                  startTime={startTime}
                  onStartTimeChange={(time) => {
                    setStartTime(time);
                    setViewState("form");
                  }}
                  isTimeDropdownOpen={isTimeDropdownOpen}
                  onToggleTimeDropdown={(open) => {
                    setIsTimeDropdownOpen(open);
                    if (open) {
                      setIsCalendarOpen(false);
                      setIsDurationDropdownOpen(false);
                      setIsIntervalDropdownOpen(false);
                    }
                  }}
                  durationMinutes={durationMinutes}
                  onDurationChange={() => {}}
                  isDurationDropdownOpen={false}
                  onToggleDurationDropdown={() => {}}
                  mode="timeOnly"
                  disabled={isLoading}
                  selectedDate={date}
                  existingBookings={dayBookings}
                />
              </div>
            </div>

            {/* СТРОКА 2: Продолжительность и Чекбокс повторяющейся встречи */}
            <div className={styles.row} style={{ alignItems: "center" }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Продолжительность</label>
                <TimeSelector
                  startTime={startTime}
                  onStartTimeChange={() => {}}
                  isTimeDropdownOpen={false}
                  onToggleTimeDropdown={() => {}}
                  durationMinutes={durationMinutes}
                  onDurationChange={(dur) => {
                    setDurationMinutes(dur);
                    setViewState("form");
                  }}
                  isDurationDropdownOpen={isDurationDropdownOpen}
                  onToggleDurationDropdown={(open) => {
                    setIsDurationDropdownOpen(open);
                    if (open) {
                      setIsCalendarOpen(false);
                      setIsTimeDropdownOpen(false);
                      setIsIntervalDropdownOpen(false);
                    }
                  }}
                  mode="durationOnly"
                  disabled={isLoading}
                />
              </div>

              <div className={styles.formGroup} style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "24px" }}>
                <input 
                  type="checkbox" 
                  id="recurringCheckbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  style={{ width: "18px", height: "18px", accentColor: "#0D9488", cursor: "pointer" }}
                />
                <label htmlFor="recurringCheckbox" style={{ fontSize: "14px", fontWeight: 500, color: "#374151", cursor: "pointer" }}>
                  Повторять встречу
                </label>
              </div>
            </div>

            {/* СТРОКА 3: Блок повторения */}
            {isRecurring && (
              <RecurringOptions
                selectedDays={selectedDays}
                onToggleDay={toggleDay}
                recurrenceInterval={recurrenceInterval}
                onIntervalChange={setRecurrenceInterval}
                isIntervalDropdownOpen={isIntervalDropdownOpen}
                onToggleIntervalDropdown={(open) => {
                  setIsIntervalDropdownOpen(open);
                  if (open) {
                    setIsCalendarOpen(false);
                    setIsTimeDropdownOpen(false);
                    setIsDurationDropdownOpen(false);
                  }
                }}
                customDaysCount={customDaysCount}
                onCustomDaysChange={setCustomDaysCount}
              />
            )}

            {/* СТРОКА 4: Комментарий */}
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