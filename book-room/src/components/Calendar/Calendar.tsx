import { useState, useEffect, useRef } from "react";
import styles from "./Calendar.module.css";
import { CalendarIcon } from "../ui/icons";

interface CalendarProps {
  selectedDate: Date;
  isOpen: boolean;
  onSelectDate: (date: Date) => void;
  align?: "left" | "right" | "center";
  onToggle: () => void;
  onClose: () => void;
}

export const Calendar = ({
  isOpen,
  selectedDate,
  onSelectDate,
  align = "left",
  onToggle,
  onClose,
}: CalendarProps) => {
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(
    new Date(selectedDate)
  );
  const calendarRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(isOpen);

  // Синхронизируем месяц с выбранной датой каждый раз при открытии календаря
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setCurrentMonthDate(new Date(selectedDate));
    }
  }, [isOpen, selectedDate]);

  useEffect(() => {
    if (!isOpen) return; 

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (calendarRef.current && calendarRef.current.contains(target)) return;
      onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

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

  const monthNames = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
  ];

  const renderCalendarDays = () => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 30);

    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className={`${styles.dayCell} ${styles.dayMuted}`}></div>
      );
    }

    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d);
      date.setHours(0, 0, 0, 0);

      const isSelected = selectedDate.toDateString() === date.toDateString();
      const isDisabled = date < today || date > maxDate;

      days.push(
        <div
          key={d}
          className={`${styles.dayCell} ${isSelected ? styles.daySelected : ""} ${isDisabled ? styles.dayDisabled : ""}`}
          onClick={() => {
            if (!isDisabled) {
              onSelectDate(date);
            }
          }}
        >
          {d}
        </div>
      );
    }
    return days;
  };

  const handlePrevMonth = () => { setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1)); };
  const handleNextMonth = () => { setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1)); };

  const positioningStyle =
    align === "right"
      ? { right: 0, left: "auto" }
      : align === "center"
      ? { left: "50%", transform: "translateX(-50%)" }
      : { left: 0, right: "auto" };

  return (
    <div className={styles.dropdownContainer} ref={calendarRef}>
      <button
        type="button"
        className={styles.dropdownButton}
        onMouseDown={(e) => e.stopPropagation()} 
        onClick={onToggle}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <CalendarIcon />
          {formatDateLabel(selectedDate)}
        </span>
      </button>

      {shouldRender && (
        <div 
          className={`${styles.calendarPopup} ${isOpen ? 'animate-pop-in' : 'animate-pop-out'}`}
          style={positioningStyle}
          onAnimationEnd={() => {
            if (!isOpen) setShouldRender(false);
          }}
        >
          <div className={styles.calendarHeader}>
            <button type="button" className={styles.calendarNavBtn} onClick={handlePrevMonth}>&lt;</button>
            <span>{monthNames[currentMonthDate.getMonth()]} {currentMonthDate.getFullYear()}</span>
            <button type="button" className={styles.calendarNavBtn} onClick={handleNextMonth}>&gt;</button>
          </div>
          <div className={styles.weekdaysGrid}>
            <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
          </div>
          <div className={styles.daysGrid}>{renderCalendarDays()}</div>
        </div>
      )}
    </div>
  );
};