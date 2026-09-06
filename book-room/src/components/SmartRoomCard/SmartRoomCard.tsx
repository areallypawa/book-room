import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import { RoomCard } from "../RoomCard/RoomCard"; // Проверь путь!
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
    enabled: !isAvailable, // Запрос идет только если комната занята
  });

  const getStatusText = () => {
    // 1. Если свободна - сразу отдаем зеленый статус
    if (isAvailable) return "Свободна весь день";
    
    // 2. Если данные еще грузятся, показываем статус загрузки
    if (isLoading) return "Проверка расписания...";

    // 3. Вычисляем пересечение
    const [sh, sm] = timeValue.split(":").map(Number);
    const filterStartMinutes = (sh || 0) * 60 + (sm || 0);
    const filterEndMinutes = filterStartMinutes + duration;

    const overlapping = bookings.find((b: any) => {
      const bStart = new Date(b.startsAt);
      const bEnd = new Date(b.endsAt);
      
      // ИСПОЛЬЗУЕМ UTC ЧАСЫ, так как фильтр мы тоже отправляем в Z-формате!
      const bStartM = bStart.getUTCHours() * 60 + bStart.getUTCMinutes();
      const bEndM = bEnd.getUTCHours() * 60 + bEnd.getUTCMinutes();
      
      return Math.max(filterStartMinutes, bStartM) < Math.min(filterEndMinutes, bEndM);
    });

    // Если вдруг не нашли пересечение (на всякий случай)
    if (!overlapping) return "Занята на выбранное время";

    // 4. Формируем красивое время окончания тоже через UTC
    const endDate = new Date(overlapping.endsAt);
    const hours = String(endDate.getUTCHours()).padStart(2, "0");
    const minutes = String(endDate.getUTCMinutes()).padStart(2, "0");

    return `Занята до ${hours}:${minutes}`;
  };

  return (
    <RoomCard 
      room={room} 
      selectedDate={selectedDate} 
      statusText={getStatusText()} 
    />
  );
};