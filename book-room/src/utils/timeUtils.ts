export const calculateEndTime = (start: string, durationMins: number): string => {
    const [hours, minutes] = start.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + durationMins;
    
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMins = totalMinutes % 60;
    
    return `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;
  };