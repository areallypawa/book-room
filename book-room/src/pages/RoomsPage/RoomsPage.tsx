import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import type { Room, Office } from "../../types/index";
import styles from "./RoomsPage.module.css";
import { Calendar } from "../../components/Calendar/Calendar";
import { SmartRoomCard } from "../../components/SmartRoomCard/SmartRoomCard";
import { Dropdown } from "../../components/ui/Dropdown/Dropdown";
import {
  ClockIcon,
  CapacityIcon,
  DotSeparatorIcon,
  EmptyIcon,
  ErrorBigIcon,
} from "../../components/ui/icons";

const fetchOffices = async (): Promise<Office[]> => {
  const { data } = await api.get("/offices");
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
};

const fetchRooms = async (
  officeId: string,
  date: Date,
  time: string,
  duration: number,
  capacity: number
): Promise<Room[]> => {
  const [hoursStr, minutesStr] = time.split(":");
  const hours = parseInt(hoursStr || "0", 10);
  const minutes = parseInt(minutesStr || "0", 10);

  const fromDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hours,
    minutes
  );

  const fromStr = fromDate.toISOString();
  const toDate = new Date(fromDate.getTime() + duration * 60 * 1000);
  const toStr = toDate.toISOString();

  const { data } = await api.get("/rooms", {
    params: {
      officeId,
      minCapacity: capacity,
      from: fromStr,
      to: toStr,
    },
  });

  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
};

export const RoomsPage = () => {
  const [selectedOfficeId, setSelectedOfficeId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [capacity, setCapacity] = useState(4);
  const [duration, setDuration] = useState(60);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeValue, setTimeValue] = useState("12:00");

  const capacityOptions = [2, 4, 6, 8, 10, 12];
  const formattedCapacityOptions = capacityOptions.map((opt) => ({
    label: `${opt} чел.`,
    value: opt,
  }));

  const durationOptions = [
    { label: "15 мин", value: 15 },
    { label: "30 мин", value: 30 },
    { label: "45 мин", value: 45 },
    { label: "1 час", value: 60 },
    { label: "1 ч 15 мин", value: 75 },
    { label: "1 ч 30 мин", value: 90 },
    { label: "2 часа", value: 120 },
  ];

  const {
    data: offices,
    isLoading: isOfficesLoading,
    isError: isOfficesError,
    refetch: refetchOffices,
  } = useQuery({
    queryKey: ["offices"],
    queryFn: fetchOffices,
  });

  useEffect(() => {
    if (offices && offices.length > 0 && !selectedOfficeId) {
      setSelectedOfficeId(offices[0].id);
    }
  }, [offices, selectedOfficeId]);

  // Превращаем список офисов в формат опций для Dropdown
  const formattedOfficeOptions =
    offices?.map((office) => ({
      label: office.city || office.name,
      value: office.id,
    })) || [];

  const formattedDate = selectedDate.toISOString().split("T")[0];
  const isTimeComplete = timeValue.length >= 4;

  const {
    data: rooms,
    isLoading: isRoomsLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      "rooms",
      selectedOfficeId,
      formattedDate,
      timeValue,
      duration,
      capacity,
    ],
    queryFn: () =>
      fetchRooms(
        selectedOfficeId!,
        selectedDate,
        timeValue,
        duration,
        capacity
      ),
    enabled: !!selectedOfficeId && isTimeComplete,
  });

  const currentOffice = offices?.find((o) => o.id === selectedOfficeId) as any;
  const currentTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 4) val = val.slice(0, 4);

    if (val.length >= 2) {
      let hours = parseInt(val.slice(0, 2), 10);
      if (hours > 23) hours = 23;
      const formattedHours = String(hours).padStart(2, "0");

      let minutes = val.slice(2);
      if (minutes.length >= 2) {
        let minNum = parseInt(minutes, 10);
        if (minNum > 59) minNum = 59;
        minutes = String(minNum).padStart(2, "0");
      }

      val = formattedHours + (minutes ? ":" + minutes : "");
    }

    setTimeValue(val);
  };

  if (isOfficesError) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.errorContainer} style={{ minHeight: "60vh" }}>
          <ErrorBigIcon />
          <h3 className={styles.errorTitle}>Не удалось загрузить офисы</h3>
          <p className={styles.errorSubtitle}>
            Сервер долго не отвечает или недоступен. Проверьте соединение.
          </p>
          <button
            className={styles.retryButton}
            onClick={() => refetchOffices()}
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.officeHeader}>
        <div style={{ width: "280px", marginBottom: "8px" }}>
          {isOfficesLoading ? (
            <span
              style={{ fontSize: "18px", fontWeight: 700, color: "#94a3b8" }}
            >
              Загрузка офисов...
            </span>
          ) : (
            <Dropdown
              options={formattedOfficeOptions}
              value={selectedOfficeId}
              onChange={(val) => setSelectedOfficeId(val)}
              isOpen={activeFilter === "office"}
              onToggle={() =>
                setActiveFilter(activeFilter === "office" ? null : "office")
              }
              onClose={() => setActiveFilter(null)}
              placeholder="Выберите офис"
              className={styles.officeDropdown}
            />
          )}
        </div>

        <p className={styles.officeSubtitle}>
          {isOfficesLoading
            ? "Адрес не выбран"
            : currentOffice?.address
            ? currentOffice.address.replace(/^[^,]+,\s*/, "")
            : "Адрес не выбран"}{" "}
          <DotSeparatorIcon />
          Местное время:{" "}
          {isOfficesLoading
            ? "--"
            : `${currentTime} ${currentOffice?.timezone ? "MSK" : ""}`}
        </p>
      </div>

      <div className={styles.filtersSection}>
        <div className={styles.filtersRow}>
          {/* ФИЛЬТР ДАТЫ */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Дата</label>
            <Calendar
              isOpen={activeFilter === "calendar"}
              selectedDate={selectedDate}
              onSelectDate={(newDate) => {
                setSelectedDate(newDate);
                setActiveFilter(null);
              }}
              onToggle={() =>
                setActiveFilter(activeFilter === "calendar" ? null : "calendar")
              }
              onClose={() => setActiveFilter(null)}
            />
          </div>

          {/* ВРЕМЯ НАЧАЛА */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Время начала</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", top: "12px", left: "16px" }}>
                <ClockIcon />
              </span>
              <input
                type="text"
                className={styles.filterInput}
                style={{ paddingLeft: "36px" }}
                value={timeValue}
                onChange={handleTimeChange}
                placeholder="--:--"
                maxLength={5}
              />
            </div>
          </div>

          {/* ФИЛЬТР ДЛИТЕЛЬНОСТИ */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Длительность</label>
            <Dropdown
              options={durationOptions}
              value={duration}
              onChange={(val) => setDuration(val)}
              isOpen={activeFilter === "duration"}
              onToggle={() =>
                setActiveFilter(activeFilter === "duration" ? null : "duration")
              }
              onClose={() => setActiveFilter(null)}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Вместимость</label>
            <Dropdown
              options={formattedCapacityOptions}
              value={capacity}
              onChange={(val) => setCapacity(val)}
              icon={<CapacityIcon />}
              prefix="Мин."
              isOpen={activeFilter === "capacity"}
              onToggle={() =>
                setActiveFilter(activeFilter === "capacity" ? null : "capacity")
              }
              onClose={() => setActiveFilter(null)}
            />
          </div>
        </div>
      </div>

      <div className={styles.mainInfo}>
        <h2 className={styles.sectionTitle}>
          {isOfficesLoading || isRoomsLoading
            ? "Загрузка переговорных..."
            : "Доступные переговорные в этом офисе"}
        </h2>

        {isOfficesLoading || isRoomsLoading ? (
          <div className={styles.grid}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeletonCard">
                <div className="skeletonLineShort" />
                <div className="skeletonLineLong" />
                <div className="skeletonBlock" />
                <div className="skeletonButton" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className={styles.errorContainer}>
            <h3 className={styles.errorTitle}>Не удалось загрузить данные</h3>
            <p className={styles.errorSubtitle}>
              Произошла ошибка при загрузке списка переговорных
            </p>
            <button className={styles.retryButton} onClick={() => refetch()}>
              Попробовать снова
            </button>
          </div>
        ) : (
          (() => {
            const filteredRooms =
              rooms?.filter((room) => room.capacity >= capacity) || [];

            if (filteredRooms.length === 0) {
              return (
                <div className={styles.emptyContainer}>
                  <EmptyIcon />
                  <h3 className={styles.emptyTitle}>
                    Нет доступных переговорных
                  </h3>
                  <p className={styles.emptySubtitle}>
                    Попробуйте изменить параметры фильтрации или выбрать другой
                    офис
                  </p>
                  <button
                    className={styles.resetButton}
                    onClick={() => {
                      setCapacity(4);
                      setDuration(60);
                    }}
                  >
                    Сбросить фильтры
                  </button>
                </div>
              );
            }

            return (
              <div className={styles.grid}>
                {filteredRooms.map((room) => (
                  <SmartRoomCard
                    key={room.id}
                    room={room}
                    selectedDate={selectedDate}
                    timeValue={timeValue}
                    duration={duration}
                  />
                ))}
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
};
