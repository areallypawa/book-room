import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/axios";
import { BookingCard } from "../../components/BookingCard/BookingCard";
import styles from "./BookingsPage.module.css";
import { 
  ErrorBigIcon, 
  EmptyIcon, 
  ModalRoomIcon, 
  ModalDateIcon 
} from "../../components/ui/icons";

const fetchOffices = async () => {
  const { data } = await api.get("/offices");
  return Array.isArray(data) ? data : data.items || [];
};

const fetchBookings = async (
  scope: "upcoming" | "past",
  officeId: string | null
) => {
  const params: any = { scope };
  if (officeId) params.officeId = officeId;
  const { data } = await api.get("/bookings", { params });
  return Array.isArray(data) ? data : data.items || [];
};

const formatModalDate = (startIso: string, endIso: string) => {
  const s = new Date(startIso);
  const e = new Date(endIso);
  const weekdays = [
    "Воскресенье",
    "Понедельник",
    "Вторник",
    "Среда",
    "Четверг",
    "Пятница",
    "Суббота",
  ];
  const months = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ];
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${weekdays[s.getDay()]}, ${s.getDate()} ${
    months[s.getMonth()]
  }, ${pad(s.getHours())}:${pad(s.getMinutes())} - ${pad(e.getHours())}:${pad(
    e.getMinutes()
  )}`;
};

// --- Компоненты Скелетонов ---
const SkeletonCard = () => (
  <div className={styles.skelCard}>
    {/* Левый блок с датой */}
    <div className={styles.skelDateBlock}>
      <div className={styles.skelDateTop} />
      <div className={styles.skelDateBottom} />
    </div>

    {/* Центральный блок с текстом */}
    <div className={styles.skelInfoBlock}>
      <div className={styles.skelLineLong} />
      <div className={styles.skelLineShortContainer}>
        <div className={styles.skelLineShort1} />
        <div className={styles.skelDot} />
        <div className={styles.skelLineShort2} />
        <div className={styles.skelDot} />
        <div className={styles.skelLineShort3} />
      </div>
    </div>

    {/* Правая кнопка */}
    <div className={styles.skelButton} />
  </div>
);

const FullPageSkeleton = () => (
  <div className={styles.container}>
    {/* Шапка */}
    <header className={styles.header}>
      <div className={styles.skelPageTitle} />
      <div className={styles.filters}>
        <div className={styles.skelFilterBtn} />
        <div className={styles.skelFilterBtn} />
      </div>
    </header>

    {/* Табы переключения */}
    <div className={styles.tabs}>
      <div className={styles.skelTab} />
      <div className={styles.skelTab} />
    </div>

    {/* Список карточек-скелетонов */}
    <div className={styles.list}>
      <SkeletonCard />
      <SkeletonCard />
    </div>
  </div>
);

// --- Основной Компонент ---
export const BookingsPage = () => {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [selectedOfficeId, setSelectedOfficeId] = useState<string | null>(null);
  const [isOfficeDropdownOpen, setIsOfficeDropdownOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<any>(null);
  const queryClient = useQueryClient();

  // Запрашиваем офисы
  const { data: offices = [], isLoading: isOfficesLoading } = useQuery({
    queryKey: ["offices"],
    queryFn: fetchOffices,
  });

  // Запрашиваем ВООБЩЕ ВСЕ бронирования для текущего таба (без фильтра по офису)
  const { 
    data: allBookings = [], 
    isLoading: isBookingsLoading,
    isError: isBookingsError, 
    refetch: refetchBookings  
  } = useQuery({
    queryKey: ["bookings", activeTab],
    queryFn: () => fetchBookings(activeTab, null),
  });

  // Считаем количество бронирований для каждого офиса
  const getBookingCountForOffice = (officeId: string) => {
    return allBookings.filter((booking: any) => {
      // Бэкенд может возвращать officeId внутри объекта room или на верхнем уровне
      const bookingOfficeId = booking.room?.officeId || booking.officeId;
      return bookingOfficeId === officeId;
    }).length;
  };

  // Фильтруем список для отображения, если выбран конкретный офис
  const displayedBookings = selectedOfficeId
    ? allBookings.filter((booking: any) => {
        const bookingOfficeId = booking.room?.officeId || booking.officeId;
        return bookingOfficeId === selectedOfficeId;
      })
    : allBookings;

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/bookings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      setBookingToCancel(null); // Закрываем модалку после успешной отмены
    },
  });

  const selectedOffice = offices.find((o: any) => o.id === selectedOfficeId);

  if (isOfficesLoading) {
    return <FullPageSkeleton />;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Мои бронирования</h1>
        <div className={styles.filters}>
          <div className={styles.dropdownContainer}>
            <button
              className={styles.filterButton}
              onClick={() => setIsOfficeDropdownOpen(!isOfficeDropdownOpen)}
            >
              {selectedOffice ? selectedOffice.name : "Все офисы"}
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  transform: isOfficeDropdownOpen ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s",
                }}
              >
                <path
                  d="M4 6L8 10L12 6"
                  stroke="#475569"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {/* Выпадающее меню с подсчетом записей */}
            {isOfficeDropdownOpen && (
              <div className={styles.dropdownMenu}>
                <div
                  className={`${styles.dropdownItem} ${
                    !selectedOfficeId ? styles.dropdownItemActive : ""
                  }`}
                  onClick={() => {
                    setSelectedOfficeId(null);
                    setIsOfficeDropdownOpen(false);
                  }}
                >
                  Все офисы ({allBookings.length})
                </div>

                {offices.map((office: any) => {
                  const count = getBookingCountForOffice(office.id);

                  return (
                    <div
                      key={office.id}
                      className={`${styles.dropdownItem} ${
                        selectedOfficeId === office.id
                          ? styles.dropdownItemActive
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedOfficeId(office.id);
                        setIsOfficeDropdownOpen(false);
                      }}
                    >
                      {office.name}
                      {office.city && (
                        <span className={styles.cityText}>
                          {count > 0
                            ? ` (${office.city}, ${count})`
                            : ` (${office.city})`}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button className={styles.filterButton}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_20_32378)">
                <path
                  d="M5.33333 1.33301V3.99989M10.6667 1.33301V3.99989M2 6.66677H14M3.33333 2.66645H12.6667C13.403 2.66645 14 3.26345 14 3.99989V13.334C14 14.0704 13.403 14.6674 12.6667 14.6674H3.33333C2.59695 14.6674 2 14.0704 2 13.334V3.99989C2 3.26345 2.59695 2.66645 3.33333 2.66645Z"
                  stroke="#475569"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_20_32378">
                  <rect width="16" height="16" fill="white" />
                </clipPath>
              </defs>
            </svg>
            За все время
          </button>
        </div>
      </header>

      <div className={styles.tabs}>
        <div
          className={`${styles.tab} ${
            activeTab === "upcoming" ? styles.tabActive : ""
          }`}
          onClick={() => setActiveTab("upcoming")}
        >
          Предстоящие{" "}
          {!isBookingsLoading &&
            activeTab === "upcoming" &&
            `(${displayedBookings.length})`}
        </div>
        <div
          className={`${styles.tab} ${
            activeTab === "past" ? styles.tabActive : ""
          }`}
          onClick={() => setActiveTab("past")}
        >
          Прошедшие{" "}
          {!isBookingsLoading &&
            activeTab === "past" &&
            `(${displayedBookings.length})`}
        </div>
      </div>

      <div className={styles.list}>
        {isBookingsLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : isBookingsError ? (
          
          /* --- СОСТОЯНИЕ ОШИБКИ --- */
          <div className={styles.emptyStateContainer}>
            <div style={{ marginBottom: "24px", display: "flex", justifyContent: "center" }}>
              <ErrorBigIcon />
            </div>
            <h3 className={styles.emptyTitle}>Не удалось загрузить данные</h3>
            <p className={styles.emptySubtitle}>
              Произошла ошибка при загрузке ваших бронирований
            </p>
            <button 
              className={styles.emptyButton}
              onClick={() => refetchBookings()} // Запускает запрос заново
            >
              Попробовать снова
            </button>
          </div>
          
        ) : displayedBookings.length === 0 ? (
          
          /* --- ПУСТОЕ СОСТОЯНИЕ --- */
          <div className={styles.emptyStateContainer}>
            <div className={styles.emptyIconWrapper}>
              <EmptyIcon />
            </div>
            <h3 className={styles.emptyTitle}>Нет бронирований</h3>
            <p className={styles.emptySubtitle}>
              У вас пока нет {activeTab === "upcoming" ? "предстоящих" : "прошедших"} бронирований.<br />
              Перейдите в раздел переговорных, чтобы забронировать комнату.
            </p>
            <button 
              className={styles.emptyButton}
              onClick={() => {
                window.location.href = "/"; 
              }}
            >
              Перейти к переговорным
            </button>
          </div>
          
        ) : (
          
          /* --- СПИСОК КАРТОЧЕК --- */
          displayedBookings.map((booking: any) => (
            <BookingCard 
              key={booking.id}
              booking={booking}
              showCancel={activeTab === "upcoming"}
              onCancel={() => setBookingToCancel(booking)}
              isCanceling={cancelMutation.isPending && cancelMutation.variables === booking.id}
            />
          ))
          
        )}
      </div>

      {bookingToCancel && (
        <div className={styles.modalOverlay} onClick={() => setBookingToCancel(null)}>
          {/* stopPropagation предотвращает закрытие при клике внутри самой белой плашки */}
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Отменить бронирование?</h2>
            <p className={styles.modalDesc}>
              Это действие нельзя будет отменить. Освободившееся время станет доступно другим сотрудникам.
            </p>

            <div className={styles.modalBookingCard}>
              <h4 className={styles.modalBookingTitle}>{bookingToCancel.title}</h4>
              <div className={styles.modalBookingInfoRow}>
                <ModalRoomIcon />
                <span>Комната "{bookingToCancel.room?.name || "Неизвестно"}", {bookingToCancel.room?.floor ? `${bookingToCancel.room.floor} этаж` : ""}</span>
              </div>
              <div className={styles.modalBookingInfoRow}>
                <ModalDateIcon />
                <span>{formatModalDate(bookingToCancel.startsAt, bookingToCancel.endsAt)}</span>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button 
                className={styles.btnCancelKeep} 
                onClick={() => setBookingToCancel(null)}
              >
                Нет, оставить
              </button>
              <button 
                className={styles.btnConfirmDelete} 
                onClick={() => cancelMutation.mutate(bookingToCancel.id)}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? "Отмена..." : "Да, отменить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
