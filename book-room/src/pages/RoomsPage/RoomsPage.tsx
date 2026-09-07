import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import type { Room, Office } from "../../types/index";
import styles from "./RoomsPage.module.css";
import { Calendar } from "../../components/Calendar/Calendar";
import { SmartRoomCard } from "../../components/SmartRoomCard/SmartRoomCard";
import {
  ChevronDownIcon,
  CheckIcon,
  CalendarIcon,
  ClockIcon,
  CapacityIcon,
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
  const [officeOpen, setOfficeOpen] = useState(false);

  const [capacityOpen, setCapacityOpen] = useState(false);
  const [capacity, setCapacity] = useState(4);
  const [durationOpen, setDurationOpen] = useState(false);
  const [duration, setDuration] = useState(60);

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [timeValue, setTimeValue] = useState("12:00");

  const capacityOptions = [2, 4, 6, 8, 10, 12];
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

  const formatDateLabel = (date: Date) => {
    const day = date.getDate();
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
    const monthName = months[date.getMonth()];
    const capitalizedMonth =
      monthName.charAt(0).toUpperCase() + monthName.slice(1);
    const weekdays = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
    const weekdayName = weekdays[date.getDay()];
    return `${day} ${capitalizedMonth}, ${weekdayName}`;
  };

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
          <svg
            className={styles.errorIcon}
            width="120"
            height="120"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="120" height="120" rx="60" fill="#CCFBF1" />
            <path
              d="M60 55.9998H60.02M60 64.0005H60.02M60 47.9992H60.02M67.9992 55.9998H68.0192M67.9992 64.0005H68.0192M67.9992 47.9992H68.0192M52.0008 55.9998H52.0208M52.0008 64.0005H52.0208M52.0008 47.9992H52.0208M54.0006 80.0017V74.0013C54.0006 73.4708 54.2113 72.962 54.5863 72.5869C54.9614 72.2118 55.47 72.0011 56.0004 72.0011H63.9996C64.53 72.0011 65.0386 72.2118 65.4137 72.5869C65.7887 72.962 65.9994 73.4708 65.9994 74.0013V80.0017M48.0012 39.9985H71.9988C74.2077 39.9985 75.9984 41.7895 75.9984 43.9989V76.0014C75.9984 78.2107 74.2077 80.0017 71.9988 80.0017H48.0012C45.7923 80.0017 44.0016 78.2107 44.0016 76.0014V43.9989C44.0016 41.7895 45.7923 39.9985 48.0012 39.9985Z"
              stroke="#0D9488"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
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
        <div
          className={styles.dropdownContainer}
          style={{ marginBottom: "8px" }}
        >
          <button
            type="button"
            className={styles.dropdownButton}
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: isOfficesLoading ? "#94a3b8" : "#0F172A",
              padding: 0,
              border: "none",
              background: "transparent",
              display: "flex",
              alignItems: "start",
              gap: "12px",
              cursor: isOfficesLoading ? "default" : "pointer",
              justifyContent: "flex-start",
            }}
            onClick={() => {
              if (isOfficesLoading) return;
              setOfficeOpen(!officeOpen);
              setCalendarOpen(false);
              setDurationOpen(false);
              setCapacityOpen(false);
            }}
          >
            <span>
              {isOfficesLoading
                ? "Выберите офис"
                : currentOffice?.city || currentOffice?.name || "Выберите офис"}
            </span>
            <span
              style={{
                transform: officeOpen ? "rotate(180deg)" : "none",
                transition: "transform 0.2s",
                display: "flex",
                alignItems: "center",
                paddingTop: "3px",
              }}
            >
              <ChevronDownIcon
                stroke={isOfficesLoading ? "#94a3b8" : "#0F172A"}
              />
            </span>
          </button>

          {officeOpen && !isOfficesLoading && (
            <div
              className={styles.dropdownMenu}
              style={{ top: "100%", left: 0, zIndex: 10, width: "20%" }}
            >
              {offices?.map((office) => (
                <div
                  key={office.id}
                  className={`${styles.dropdownItem} ${
                    selectedOfficeId === office.id
                      ? styles.dropdownItemActive
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedOfficeId(office.id);
                    setOfficeOpen(false);
                  }}
                >
                  {office.name}
                  {selectedOfficeId === office.id && (
                    <span style={{ marginLeft: "auto" }}>
                      <CheckIcon />
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <p className={styles.officeSubtitle}>
          {isOfficesLoading
            ? "Адрес не выбран"
            : currentOffice?.address
            ? currentOffice.address.replace(/^[^,]+,\s*/, "")
            : "Адрес не выбран"}{" "}
          <svg
            style={{ margin: "0 6px 0 6px" }}
            width="4"
            height="7"
            viewBox="0 0 4 4"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="2" cy="1" r="2" fill="#94A3B8" />
          </svg>
          Местное время:{" "}
          {isOfficesLoading
            ? "--"
            : `${currentTime} ${currentOffice?.timezone ? "MSK" : ""}`}
        </p>
      </div>

      <div className={styles.filtersSection}>
        <div className={styles.filtersRow}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Дата</label>
            <div className={styles.dropdownContainer}>
              <button
                className={styles.dropdownButton}
                onClick={() => {
                  setCalendarOpen(!calendarOpen);
                  setDurationOpen(false);
                  setCapacityOpen(false);
                }}
              >
                <span
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <CalendarIcon />
                  {formatDateLabel(selectedDate)}
                </span>
              </button>

              {calendarOpen && (
                <Calendar
                  selectedDate={selectedDate}
                  onSelectDate={(newDate) => {
                    setSelectedDate(newDate);
                    setCalendarOpen(false);
                  }}
                />
              )}
            </div>
          </div>

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

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Длительность</label>
            <div className={styles.dropdownContainer}>
              <button
                className={styles.dropdownButton}
                onClick={() => {
                  setDurationOpen(!durationOpen);
                  setCalendarOpen(false);
                  setCapacityOpen(false);
                }}
              >
                <span>
                  {durationOptions.find((o) => o.value === duration)?.label}
                </span>
                <span
                  style={{
                    transform: durationOpen ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s",
                  }}
                >
                  <ChevronDownIcon/>
                </span>
              </button>
              {durationOpen && (
                <div className={styles.dropdownMenu}>
                  {durationOptions.map((opt) => (
                    <div
                      key={opt.value}
                      className={`${styles.dropdownItem} ${
                        duration === opt.value ? styles.dropdownItemActive : ""
                      }`}
                      onClick={() => {
                        setDuration(opt.value);
                        setDurationOpen(false);
                      }}
                    >
                      {opt.label}{" "}
                      {duration === opt.value && (
                        <span>
                          <CheckIcon/>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Вместимость</label>
            <div className={styles.dropdownContainer}>
              <button
                className={styles.dropdownButton}
                onClick={() => {
                  setCapacityOpen(!capacityOpen);
                  setCalendarOpen(false);
                  setDurationOpen(false);
                }}
              >
                <span
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <CapacityIcon/>
                  Мин. {capacity} чел.
                </span>
                <span
                  style={{
                    transform: capacityOpen ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s",
                  }}
                >
                  <ChevronDownIcon/>
                </span>
              </button>
              {capacityOpen && (
                <div className={styles.dropdownMenu}>
                  {capacityOptions.map((opt) => (
                    <div
                      key={opt}
                      className={`${styles.dropdownItem} ${
                        capacity === opt ? styles.dropdownItemActive : ""
                      }`}
                      onClick={() => {
                        setCapacity(opt);
                        setCapacityOpen(false);
                      }}
                    >
                      {opt} чел.{" "}
                      {capacity === opt && (
                        <span>
                          <CheckIcon/>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainInfo}>
        <h2 className={styles.sectionTitle}>
          {isOfficesLoading || isRoomsLoading
            ? "Загрузка переговорных..."
            : "Доступные переговорные в этом офисе"}
        </h2>

        {/* Одновременные скелетоны при загрузке */}
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
            <svg
              className={styles.errorIcon}
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="120" height="120" rx="60" fill="#FEE2E2" />
              <path
                d="M60 52.9982V62.3315M60 71.6649H60.0233M82.7043 73.9987L64.0376 41.3321C63.6306 40.6139 63.0403 40.0165 62.3271 39.6009C61.6138 39.1853 60.8031 38.9663 59.9776 38.9663C59.1521 38.9663 58.3414 39.1853 57.6281 39.6009C56.9149 40.165 56.3246 40.6139 55.9176 41.3321L37.2509 73.9987C36.8395 74.7112 36.6238 75.5198 36.6256 76.3426C36.6274 77.1653 36.8467 77.973 37.2613 78.6837C37.6759 79.3943 38.2709 79.9828 38.9862 80.3893C39.7015 80.7959 40.5116 81.0061 41.3343 80.9987H78.6676C79.4864 80.9979 80.2905 80.7817 80.9993 80.3717C81.708 79.9618 82.2964 79.3726 82.7055 78.6633C83.1145 77.954 83.3297 77.1496 83.3295 76.3309C83.3293 75.5121 83.1136 74.7078 82.7043 73.9987Z"
                stroke="#B91C1C"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>

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
                  <svg
                    className={styles.emptyIcon}
                    viewBox="0 0 120 120"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="120" height="120" rx="60" fill="#E2E8F0" />
                    <path
                      d="M63.5 51.8333L51.8333 63.5M51.8333 51.8333L63.5 63.5M81.0005 81.0005L70.9671 70.9671M76.3333 57.6667C76.3333 67.976 67.976 76.3333 57.6667 76.3333C47.3574 76.3333 39 67.976 39 57.6667C39 47.3574 47.3574 39 57.6667 39C67.976 39 76.3333 47.3574 76.3333 57.6667Z"
                      stroke="#94A3B8"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>

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
