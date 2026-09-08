import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/axios";
import { BookingCard } from "../../components/BookingCard/BookingCard";
import { DateRangePicker } from "../../components/DateRangePicker/DateRangePicker";
import { SuccessToast } from "../../components/Toasts/SuccesToast/SuccessToast";
import { ErrorToast } from "../../components/Toasts/ErrorToast/ErrorToast";
import {
  Dropdown,
  type DropdownOption,
} from "../../components/ui/Dropdown/Dropdown";
import styles from "./BookingsPage.module.css";
import {
  ErrorBigIcon,
  EmptyBookingIcon,
  ModalRoomIcon,
  ModalDateIcon,
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

const SkeletonCard = () => (
  <div className={styles.skelCard}>
    <div className={styles.skelDateBlock}>
      <div className={styles.skelDateTop} />
      <div className={styles.skelDateBottom} />
    </div>
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
    <div className={styles.skelButton} />
  </div>
);

const FullPageSkeleton = () => (
  <div className={styles.container}>
    <header className={styles.header}>
      <div className={styles.skelPageTitle} />
      <div className={styles.filters}>
        <div className={styles.skelFilterBtn} />
        <div className={styles.skelFilterBtn} />
      </div>
    </header>
    <div className={styles.tabs}>
      <div className={styles.skelTab} />
      <div className={styles.skelTab} />
    </div>
    <div className={styles.list}>
      <SkeletonCard />
      <SkeletonCard />
    </div>
  </div>
);

export const BookingsPage = () => {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [selectedOfficeId, setSelectedOfficeId] = useState<string | null>(null);
  const [isOfficeDropdownOpen, setIsOfficeDropdownOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<any>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  // Стейты для тоста успешной отмены
  const [showCancelToast, setShowCancelToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [canceledBookingInfo, setCanceledBookingInfo] = useState<any>(null);

  // Стейты для выбранного диапазона дат в пикере
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const queryClient = useQueryClient();

  const { data: offices = [], isLoading: isOfficesLoading } = useQuery({
    queryKey: ["offices"],
    queryFn: fetchOffices,
  });

  const {
    data: allBookings = [],
    isLoading: isBookingsLoading,
    isError: isBookingsError,
    refetch: refetchBookings,
  } = useQuery({
    queryKey: ["bookings", activeTab],
    queryFn: () => fetchBookings(activeTab, null),
  });

  const getBookingCountForOffice = (officeId: string) => {
    return allBookings.filter((booking: any) => {
      const bookingOfficeId = booking.room?.officeId || booking.officeId;
      return bookingOfficeId === officeId;
    }).length;
  };

  const bookingDates = allBookings.map((b: any) => b.startsAt.split("T")[0]);

  const filteredByDateBookings = allBookings.filter((booking: any) => {
    if (!startDate) return true;

    const bookingDate = new Date(booking.startsAt).setHours(0, 0, 0, 0);
    const start = new Date(startDate).setHours(0, 0, 0, 0);

    if (!endDate) {
      const endOfDay = new Date(startDate).setHours(23, 59, 59, 999);
      return bookingDate >= start && bookingDate <= endOfDay;
    }

    const end = new Date(endDate).setHours(23, 59, 59, 999);
    return bookingDate >= start && bookingDate <= end;
  });

  const displayedBookings = selectedOfficeId
    ? filteredByDateBookings.filter((booking: any) => {
        const bookingOfficeId = booking.room?.officeId || booking.officeId;
        return bookingOfficeId === selectedOfficeId;
      })
    : filteredByDateBookings;

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/bookings/${id}`),
    networkMode: "always",

    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ["bookings"] });

      const exactQueryKey = ["bookings", activeTab];
      const previousBookings = queryClient.getQueryData(exactQueryKey);

      queryClient.setQueryData(exactQueryKey, (old: any) => {
        if (!old) return [];
        return old.filter((booking: any) => booking.id !== deletedId);
      });

      const targetBooking = allBookings.find((b: any) => b.id === deletedId);
      setBookingToCancel(null);

      return { previousBookings, targetBooking, exactQueryKey };
    },

    onError: (_err, _deletedId, context) => {
      if (context?.previousBookings && context?.exactQueryKey) {
        queryClient.setQueryData(
          context.exactQueryKey,
          context.previousBookings
        );
      }

      setShowErrorToast(true);
    },

    onSuccess: (_data, _deletedId, context) => {
      if (context?.targetBooking) {
        setCanceledBookingInfo(context.targetBooking);
        setShowCancelToast(true);
      }
    },

    onSettled: (_data, error) => {
      if (!error) {
        queryClient.invalidateQueries({ queryKey: ["bookings"] });
      }
    },
  });

  // Подготавливаем опции для нашего компонента Dropdown
  const officeOptions: DropdownOption[] = [
    { label: `Все офисы (${allBookings.length})`, value: "all" },
    ...offices.map((office: any) => {
      const count = getBookingCountForOffice(office.id);
      const citySuffix = office.city
        ? ` (${office.city}${count > 0 ? `, ${count}` : ""})`
        : "";
      return {
        label: `${office.name}${citySuffix}`,
        value: office.id,
      };
    }),
  ];

  if (isOfficesLoading) {
    return <FullPageSkeleton />;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Мои бронирования</h1>
        <div className={styles.filters}>
          <Dropdown
            options={officeOptions}
            value={selectedOfficeId ?? "all"}
            onChange={(val) => setSelectedOfficeId(val === "all" ? null : val)}
            placeholder="Все офисы"
            isOpen={isOfficeDropdownOpen}
            onToggle={(open) => {
              setIsOfficeDropdownOpen(open);
              if (open) setIsCalendarOpen(false); // Закрываем календарь дат при открытии офисов
            }}
            onClose={() => setIsOfficeDropdownOpen(false)}
          />

          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={(start, end) => {
              setStartDate(start);
              setEndDate(end);
            }}
            bookingDates={bookingDates}
            isOpen={isCalendarOpen}
            onToggle={(open) => {
              setIsCalendarOpen(open);
              if (open) setIsOfficeDropdownOpen(false); // Закрываем офисы при открытии календаря
            }}
            onClose={() => setIsCalendarOpen(false)}
          />
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
          <div className={styles.emptyStateContainer}>
            <div
              style={{
                marginBottom: "24px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <ErrorBigIcon />
            </div>
            <h3 className={styles.emptyTitle}>Не удалось загрузить данные</h3>
            <p className={styles.emptySubtitle}>
              Произошла ошибка при загрузке ваших бронирований
            </p>
            <button
              className={styles.emptyButton}
              onClick={() => refetchBookings()}
            >
              Попробовать снова
            </button>
          </div>
        ) : displayedBookings.length === 0 ? (
          <div className={styles.emptyStateContainer}>
            <div className={styles.emptyIconWrapper}>
              <EmptyBookingIcon />
            </div>
            <h3 className={styles.emptyTitle}>Нет бронирований</h3>
            <p className={styles.emptySubtitle}>
              За выбранный период нет{" "}
              {activeTab === "upcoming" ? "предстоящих" : "прошедших"}{" "}
              бронирований.
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
          displayedBookings.map((booking: any) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              showCancel={activeTab === "upcoming"}
              onCancel={() => setBookingToCancel(booking)}
              isCanceling={
                cancelMutation.isPending &&
                cancelMutation.variables === booking.id
              }
            />
          ))
        )}
      </div>

      {bookingToCancel && (
        <div
          className={styles.modalOverlay}
          onClick={() => setBookingToCancel(null)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={styles.modalTitle}>Отменить бронирование?</h2>
            <p className={styles.modalDesc}>
              Это действие нельзя будет отменить. Освободившееся время станет
              доступно другим сотрудникам.
            </p>

            <div className={styles.modalBookingCard}>
              <h4 className={styles.modalBookingTitle}>
                {bookingToCancel.title}
              </h4>
              <div className={styles.modalBookingInfoRow}>
                <ModalRoomIcon />
                <span>
                  Комната &quot;{bookingToCancel.room?.name || "Неизвестно"}
                  &quot;,{" "}
                  {bookingToCancel.room?.floor
                    ? `${bookingToCancel.room.floor} этаж`
                    : ""}
                </span>
              </div>
              <div className={styles.modalBookingInfoRow}>
                <ModalDateIcon />
                <span>
                  {formatModalDate(
                    bookingToCancel.startsAt,
                    bookingToCancel.endsAt
                  )}
                </span>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.btnCancelKeep}
                onClick={() => setBookingToCancel(null)}
              >
                Нет, оставить
              </button>
              <button
                type="button"
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

      {showCancelToast && canceledBookingInfo && (
        <SuccessToast
          roomName={canceledBookingInfo.room?.name || "Переговорная"}
          dateTimeText="Время успешно освобождено"
          title="Бронирование отменено"
          onClose={() => setShowCancelToast(false)}
        />
      )}

      {showErrorToast && (
        <ErrorToast
          title="Не удалось отменить"
          message="Проверьте подключение к сети и попробуйте снова."
          onClose={() => setShowErrorToast(false)}
        />
      )}
    </div>
  );
};
