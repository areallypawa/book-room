import styles from "./ExportIcsButton.module.css";

interface BookingData {
  id: string;
  title: string;
  comment?: string;
  startsAt: string;
  endsAt: string;
  roomName?: string;
}

interface ExportIcsButtonProps {
  bookings: BookingData[]; 
  fileName?: string;       
}

const formatIcsDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
};

export const ExportIcsButton = ({ bookings, fileName = "bookings.ics" }: ExportIcsButtonProps) => {
  const downloadIcs = () => {
    if (!bookings.length) return;

    const events = bookings.map(booking => [
      "BEGIN:VEVENT",
      `UID:${booking.id}`,
      `DTSTAMP:${formatIcsDate(new Date().toISOString())}`,
      `DTSTART:${formatIcsDate(booking.startsAt)}`,
      `DTEND:${formatIcsDate(booking.endsAt)}`,
      `SUMMARY:${booking.title}`,
      `DESCRIPTION:${booking.comment || "Бронирование переговорной"}`,
      `LOCATION:Переговорная ${booking.roomName || "Неизвестно"}`,
      "END:VEVENT"
    ].join("\r\n"));

    const calendar = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//BookRoom//Calendar//EN",
      ...events,
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([calendar], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button type="button" className={styles.exportButton} onClick={downloadIcs}>
      Экспорт в .ics
    </button>
  );
};