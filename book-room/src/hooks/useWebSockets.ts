import { useEffect, useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

export type WsStatus = "connecting" | "connected" | "disconnected" | "reconnecting";

export const useWebSockets = () => {
  const queryClient = useQueryClient();
  const [wsStatus, setWsStatus] = useState<WsStatus>("connecting");
  
  // Используем ref, чтобы знать, было ли это первичное подключение или реконнект
  const wasConnectedRef = useRef(false);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const hostname = window.location.hostname;
    const wsUrl = `ws://${hostname}:3000/api/v1/ws`; 
    
    let socket: WebSocket | null = null;
    let isComponentMounted = true;

    const connect = () => {
      if (wasConnectedRef.current) {
        setWsStatus("reconnecting");
      } else {
        setWsStatus("connecting");
      }

      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        if (!isComponentMounted) return;
        
        console.log("WebSocket подключен 🟢");
        setWsStatus("connected");

        // Если это переподключение (resync), инвалидируем весь кэш,
        // чтобы React Query автоматически перезапросил актуальные данные по REST API.
        if (wasConnectedRef.current) {
          console.log("Синхронизация данных после переподключения...");
          queryClient.invalidateQueries();
        }
        wasConnectedRef.current = true;
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case "booking.created":
            case "booking.cancelled":
              queryClient.invalidateQueries({ queryKey: ["room-bookings"] });
              queryClient.invalidateQueries({ queryKey: ["room-bookings-card"] });
              queryClient.invalidateQueries({ queryKey: ["bookings"] });
              break;
            case "room.availability_changed":
              queryClient.invalidateQueries({ queryKey: ["rooms"] });
              break;
            case "data.reset":
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

      socket.onclose = () => {
        if (!isComponentMounted) return;
        
        console.log("WebSocket отключен. Пробуем переподключиться через 3 сек...");
        setWsStatus("disconnected");
        
        // Запускаем цикл переподключения
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      isComponentMounted = false;
      clearTimeout(reconnectTimeoutRef.current);
      if (socket) {
        
        socket.onclose = null; 
        socket.close();
      }
    };
  }, [queryClient]);

  return { wsStatus };
};