import { useState, useRef, useEffect } from "react";
import styles from "./DateRangePicker.module.css";
import { CalendarIcon, ChevronDownIcon } from "../ui/icons";

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (start: Date | null, end: Date | null) => void;
  bookingDates: string[];
  isOpen: boolean;
  onToggle: (isOpen: boolean) => void;
  onClose: () => void;
}

export const DateRangePicker = ({
  startDate,
  endDate,
  onChange,
  bookingDates,
  isOpen,
  onToggle,
  onClose,
}: DateRangePickerProps) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(() => startDate ? new Date(startDate) : new Date());
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setCurrentMonth(startDate ? new Date(startDate) : new Date());
    }
  }, [isOpen, startDate]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const handleDayClick = (date: Date) => {
    if (!startDate || (startDate && endDate)) {
      onChange(date, null);
    } else if (startDate && !endDate) {
      if (date < startDate) {
        onChange(date, null);
      } else {
        onChange(startDate, date);
        onClose();
      }
    }
  };

  const renderDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];

    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(<div key={`empty-${i}`} className={`${styles.dayCell} ${styles.dayMuted}`} />);
    }

    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d);
      date.setHours(0, 0, 0, 0);

      const dateStr = date.toISOString().split("T")[0];
      const hasBooking = bookingDates.includes(dateStr);

      const time = date.getTime();
      const startTime = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
      const endTime = endDate ? new Date(endDate).setHours(0, 0, 0, 0) : null;

      const isStart = startTime && time === startTime;
      const isEnd = endTime && time === endTime;
      const isInRange = startTime && endTime && time > startTime && time < endTime;
      const isSingle = isStart && !endDate;

      let cellClass = styles.dayCell;
      if (isSingle || (isStart && isEnd)) cellClass += ` ${styles.daySingle}`;
      else if (isStart) cellClass += ` ${styles.dayStart}`;
      else if (isEnd) cellClass += ` ${styles.dayEnd}`;
      else if (isInRange) cellClass += ` ${styles.dayInRange}`;

      days.push(
        <div key={d} className={cellClass} onClick={() => handleDayClick(date)}>
          <span>{d}</span>
          {hasBooking && <div className={styles.bookingDot} />}
        </div>
      );
    }

    return days;
  };

  const formatButtonLabel = () => {
    if (!startDate && !endDate) return "За все время";
    const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
    if (startDate && !endDate) return `с ${startDate.toLocaleDateString("ru-RU", options)}`;
    if (startDate && endDate) {
      return `${startDate.toLocaleDateString("ru-RU", options)} – ${endDate.toLocaleDateString("ru-RU", options)}`;
    }
    return "За все время";
  };

  const monthNames = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
  ];

  return (
    <div className={styles.container} ref={containerRef}>
      <button 
        type="button" 
        className={styles.filterButton} 
        onMouseDown={(e) => e.stopPropagation()}
        onClick={() => onToggle(!isOpen)}
      >
        <span className={styles.triggerContent}>
          <CalendarIcon />
          {formatButtonLabel()}
        </span>
        
        <ChevronDownIcon
          style={{
            transform: isOpen ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {shouldRender && (
        <div 
          className={`${styles.popup} ${isOpen ? 'animate-pop-in' : 'animate-pop-out'}`}
          onAnimationEnd={() => {
            if (!isOpen) setShouldRender(false);
          }}
        >
          <div className={styles.header}>
            <button
              type="button"
              className={styles.navBtn}
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            >
              &lt;
            </button>
            <span>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
            <button
              type="button"
              className={styles.navBtn}
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            >
              &gt;
            </button>
          </div>
          <div className={styles.weekdaysGrid}>
            <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
          </div>
          <div className={styles.daysGrid}>{renderDays()}</div>
          <div className={styles.footer}>
            <button
              type="button"
              className={styles.resetBtn}
              onClick={() => {
                onChange(null, null);
                setCurrentMonth(new Date()); 
                onClose();
              }}
            >
              Сбросить
            </button>
            <span style={{ fontSize: "14px", color: "#94a3b8" }}>Выберите диапазон</span>
          </div>
        </div>
      )}
    </div>
  );
};