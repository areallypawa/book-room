import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export const useWebSockets = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Здесь берем хост из текущего окна, но хардкодим порт бэкенда (3000)
    const hostname = window.location.hostname;
    const wsUrl = `ws://${hostname}:3000/api/v1/ws`; 
    
    let socket: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    const connect = () => {
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log("WebSocket подключен");
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log("Получено WS сообщение:", message);

          // Обработка событий в зависимости от типа
          switch (message.type) {
            case "booking.created":
            case "booking.cancelled":
              // Если бронь создана или отменена, обновляем расписание комнат и список броней пользователя
              queryClient.invalidateQueries({ queryKey: ["room-bookings"] });
              queryClient.invalidateQueries({ queryKey: ["room-bookings-card"] });
              queryClient.invalidateQueries({ queryKey: ["bookings"] });
              break;

            case "room.availability_changed":
              // Если изменилась доступность, обновляем список комнат на главной
              queryClient.invalidateQueries({ queryKey: ["rooms"] });
              break;
              
            case "data.reset":
               // При сбросе данных обновляем вообще всё
               queryClient.invalidateQueries();
               break;

            default:
              queryClient.invalidateQueries({ queryKey: ["rooms"] });
              queryClient.invalidateQueries({ queryKey: ["room-bookings"] });
          }
        } catch (error) {
          console.error("Ошибка при обработке WS сообщения:", error);
        }
      };

      socket.onerror = (error) => {
        console.error("Ошибка WebSocket:", error);
      };

      socket.onclose = () => {
        console.log("WebSocket отключен. Пробуем переподключиться через 3 сек...");
        reconnectTimeout = setTimeout(connect, 3000);
      };
    };

    connect();

    // Очистка при размонтировании
    return () => {
      clearTimeout(reconnectTimeout);
      if (socket) {
        socket.close();
      }
    };
  }, [queryClient]);
};