import { useState } from "react";
import styles from "./Calendar.module.css"; 

interface CalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  align?: "left" | "right" | "center";
}

export const Calendar = ({ selectedDate, onSelectDate, align = "left" }: CalendarProps) => {
  // Локальный стейт только для листания месяцев. Родительской странице он не нужен.
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date(selectedDate));

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
    maxDate.setDate(today.getDate() + 30); // Ограничение на 30 дней вперед

    // Пустые ячейки
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className={`${styles.dayCell} ${styles.dayMuted}`}></div>
      );
    }

    // Дни месяца
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d);
      date.setHours(0, 0, 0, 0);

      const isSelected = selectedDate.toDateString() === date.toDateString();
      const isDisabled = date < today || date > maxDate;

      days.push(
        <div
          key={d}
          className={`${styles.dayCell} ${isSelected ? styles.daySelected : ""} ${
            isDisabled ? styles.dayDisabled : ""
          }`}
          onClick={() => {
            if (!isDisabled) {
              onSelectDate(date); // Передаем выбранную дату наверх
            }
          }}
        >
          {d}
        </div>
      );
    }
    return days;
  };

  // безопасный способ переключения месяцев (предотвращает баги 31-го числа)
  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));
  };

  const positioningStyle = 
  align === "right" ? { right: 0, left: 'auto' } : 
  align === "center" ? { left: '50%', transform: 'translateX(-50%)' } :
  { left: 0, right: 'auto' };
  
  return (
    <div className={styles.calendarPopup}
    style={positioningStyle}
    >
      <div className={styles.calendarHeader}>
        <button className={styles.calendarNavBtn} onClick={handlePrevMonth}>
          &lt;
        </button>
        <span>
          {monthNames[currentMonthDate.getMonth()]} {currentMonthDate.getFullYear()}
        </span>
        <button className={styles.calendarNavBtn} onClick={handleNextMonth}>
          &gt;
        </button>
      </div>
      <div className={styles.weekdaysGrid}>
        <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div>
        <div>Пт</div><div>Сб</div><div>Вс</div>
      </div>
      <div className={styles.daysGrid}>{renderCalendarDays()}</div>
    </div>
  );
};