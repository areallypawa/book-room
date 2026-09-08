import { useMemo } from "react";
import { Dropdown, type DropdownOption } from "../ui/Dropdown/Dropdown";

export interface BookingSlot {
  startsAt: string;
  endsAt: string;
}

interface TimeSelectorProps {
  startTime: string;
  onStartTimeChange: (time: string) => void;
  isTimeDropdownOpen: boolean;
  onToggleTimeDropdown: (isOpen: boolean) => void;
  durationMinutes: number;
  onDurationChange: (duration: number) => void;
  isDurationDropdownOpen: boolean;
  onToggleDurationDropdown: (isOpen: boolean) => void;
  mode: "timeOnly" | "durationOnly";
  disabled?: boolean;
  selectedDate?: Date;
  existingBookings?: BookingSlot[];
}

const durationOptions: DropdownOption[] = [
  { label: "15 минут", value: 15 },
  { label: "30 минут", value: 30 },
  { label: "45 минут", value: 45 },
  { label: "1 час", value: 60 },
  { label: "1 час 15 минут", value: 75 },
  { label: "1 час 30 минут", value: 90 },
  { label: "1 час 45 минут", value: 105 },
  { label: "2 часа", value: 120 },
];

export const TimeSelector = ({
  startTime,
  onStartTimeChange,
  isTimeDropdownOpen,
  onToggleTimeDropdown,
  durationMinutes,
  onDurationChange,
  isDurationDropdownOpen,
  onToggleDurationDropdown,
  mode,
  disabled = false, 
  selectedDate = new Date(),
  existingBookings = [],
}: TimeSelectorProps) => {

  const availableTimeOptions = useMemo(() => {
    const options: DropdownOption[] = [];
    const now = new Date();
    
    const isToday =
      selectedDate.getDate() === now.getDate() &&
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getFullYear() === now.getFullYear();

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const bookedIntervals = existingBookings.map((b) => {
      const startMatch = b.startsAt.match(/T(\d{2}):(\d{2})/);
      const endMatch = b.endsAt.match(/T(\d{2}):(\d{2})/);

      const startHours = startMatch ? parseInt(startMatch[1], 10) : new Date(b.startsAt).getHours();
      const startMins = startMatch ? parseInt(startMatch[2], 10) : new Date(b.startsAt).getMinutes();
      
      const endHours = endMatch ? parseInt(endMatch[1], 10) : new Date(b.endsAt).getHours();
      const endMins = endMatch ? parseInt(endMatch[2], 10) : new Date(b.endsAt).getMinutes();

      return {
        startMins: startHours * 60 + startMins,
        endMins: endHours * 60 + endMins,
      };
    });

    for (let h = 9; h <= 19; h++) {
      for (let m = 0; m < 60; m += 15) {
        if (h === 19 && m > 45) continue;

        const timeMins = h * 60 + m;
        const proposedEndMins = timeMins + durationMinutes;

        if (isToday && timeMins <= currentMinutes) {
          continue;
        }

        const isOverlapping = bookedIntervals.some(
          (interval) => timeMins < interval.endMins && proposedEndMins > interval.startMins
        );

        if (isOverlapping) {
          continue;
        }

        const label = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        options.push({ label, value: label });
      }
    }

    return options;
  }, [selectedDate, existingBookings, durationMinutes]);

  if (mode === "timeOnly") {
    return (
      <Dropdown
        options={availableTimeOptions}
        value={startTime}
        onChange={onStartTimeChange}
        placeholder={availableTimeOptions.length ? "Выберите время" : "Нет мест"}
        isOpen={isTimeDropdownOpen}
        onToggle={(open) => {
          if (!disabled) onToggleTimeDropdown(open);
        }}
        onClose={() => onToggleTimeDropdown(false)}
      />
    );
  }

  return (
    <Dropdown
      options={durationOptions}
      value={durationMinutes}
      onChange={onDurationChange}
      placeholder="Выберите длительность"
      isOpen={isDurationDropdownOpen}
      onToggle={(open) => {
        if (!disabled) onToggleDurationDropdown(open);
      }}
      onClose={() => onToggleDurationDropdown(false)}
    />
  );
};