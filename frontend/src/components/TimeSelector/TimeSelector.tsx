import { useMemo } from "react";
import { Dropdown, type DropdownOption } from "../ui/Dropdown/Dropdown";
import { getAvailableTimeSlots, type BookingInterval } from "../../utils/bookingUtils";

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
    const availableSlots = getAvailableTimeSlots(selectedDate, existingBookings, durationMinutes);
    return availableSlots.map(time => ({ label: time, value: time }));
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