import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import { RoomCard } from "../RoomCard/RoomCard"; 
import type { Room } from "../../types/index";

interface SmartRoomCardProps {
  room: Room & { available?: boolean };
  selectedDate: Date;
  timeValue: string;
  duration: number;
}

export const SmartRoomCard = ({ room, selectedDate, timeValue, duration }: SmartRoomCardProps) => {
  const isAvailable = room.available !== false;

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["room-bookings-card", room.id, selectedDate.toISOString().split("T")[0]],
    queryFn: async () => {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data } = await api.get(`/rooms/${room.id}/bookings`, {
        params: { from: startOfDay.toISOString(), to: endOfDay.toISOString() },
      });
      return Array.isArray(data) ? data : data.items || [];
    },
    enabled: !isAvailable, 
  });

  const getStatusText = () => {
    if (isAvailable) return "Свободна весь день";
    if (isLoading) return "Проверка расписания...";

    const [sh, sm] = timeValue.split(":").map(Number);
    const filterStartMinutes = (sh || 0) * 60 + (sm || 0);
    const filterEndMinutes = filterStartMinutes + duration;

    const overlapping = bookings.find((b: any) => {
      const bStart = new Date(b.startsAt);
      const bEnd = new Date(b.endsAt);
      
      const bStartM = bStart.getHours() * 60 + bStart.getMinutes();
      const bEndM = bEnd.getHours() * 60 + bEnd.getMinutes();
      
      return Math.max(filterStartMinutes, bStartM) < Math.min(filterEndMinutes, bEndM);
    });

    if (!overlapping) return "Занята на выбранное время";

    const endDate = new Date(overlapping.endsAt);
    const hours = String(endDate.getHours()).padStart(2, "0");
    const minutes = String(endDate.getMinutes()).padStart(2, "0");

    return `Занята до ${hours}:${minutes}`;
  };

  return (
    <RoomCard 
      room={room} 
      selectedDate={selectedDate} 
      statusText={getStatusText()} 
      initialTime={timeValue}    
      initialDuration={duration}  
    />
  );
};