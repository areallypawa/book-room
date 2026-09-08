import { Dropdown, type DropdownOption } from "../ui/Dropdown/Dropdown";
import styles from "./RecurringOptions.module.css";

interface RecurringOptionsProps {
  selectedDays: number[];
  onToggleDay: (dayValue: number) => void;
  recurrenceInterval: string;
  onIntervalChange: (interval: any) => void;
  isIntervalDropdownOpen: boolean;
  onToggleIntervalDropdown: (isOpen: boolean) => void;
  customDaysCount: number;
  onCustomDaysChange: (count: number) => void;
}

const daysOfWeek = [
  { label: "Пн", value: 1 },
  { label: "Вт", value: 2 },
  { label: "Ср", value: 3 },
  { label: "Чт", value: 4 },
  { label: "Пт", value: 5 },
  { label: "Сб", value: 6 },
  { label: "Вс", value: 0 },
];

const intervalOptions: DropdownOption[] = [
  { label: "Каждую неделю", value: "week" },
  { label: "Каждый месяц", value: "month" },
  { label: "Другое кол-во дней", value: "custom" },
];

export const RecurringOptions = ({
  selectedDays,
  onToggleDay,
  recurrenceInterval,
  onIntervalChange,
  isIntervalDropdownOpen,
  onToggleIntervalDropdown,
  customDaysCount,
  onCustomDaysChange,
}: RecurringOptionsProps) => {
  return (
    <div className={styles.container}>
      <div>
        <label className={styles.label}>Повторять каждые дни недели</label>
        <div className={styles.daysRow}>
          {daysOfWeek.map((day) => {
            const isSelected = selectedDays.includes(day.value);
            return (
              <button
                key={day.value}
                type="button"
                onClick={() => onToggleDay(day.value)}
                style={{
                  border: isSelected ? "1px solid #0D9488" : "1px solid #CBD5E1",
                  background: isSelected ? "#0D9488" : "#FFFFFF",
                  color: isSelected ? "#FFFFFF" : "#334155",
                }}
                className={styles.dayBtn}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.dropdownFix}>
          <label className={styles.label}>Периодичность</label>
          <Dropdown
            options={intervalOptions}
            value={recurrenceInterval}
            onChange={onIntervalChange}
            placeholder="Выберите периодичность"
            isOpen={isIntervalDropdownOpen}
            onToggle={onToggleIntervalDropdown}
            onClose={() => onToggleIntervalDropdown(false)}
          />
        </div>

        {recurrenceInterval === "custom" && (
          <div>
            <label className={styles.label}>Интервал (дней)</label>
            <input
              type="number"
              min="1"
              max="90"
              className={styles.input}
              value={customDaysCount}
              onChange={(e) => onCustomDaysChange(Number(e.target.value))}
            />
          </div>
        )}
      </div>
    </div>
  );
};