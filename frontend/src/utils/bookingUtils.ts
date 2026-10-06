export interface BookingInterval {
    startsAt: string;
    endsAt: string;
  }
  
  /**
   * Генерирует массив дат для бронирования с учетом периодичности
   */
  export const generateBookingDates = (
    baseDate: Date,
    isRecurring: boolean,
    selectedDays: number[],
    recurrenceInterval: string,
    customDaysCount: number,
    weeksToRepeat: number = 4
  ): Date[] => {
    const datesToBook: Date[] = [];
    
    if (!isRecurring) {
      datesToBook.push(new Date(baseDate));
      return datesToBook;
    }
  
    const stepDays = recurrenceInterval === "week" ? 7 : recurrenceInterval === "month" ? 30 : customDaysCount;
    
    // Устанавливаем начало сегодняшнего дня, чтобы не создать брони в прошлом
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    for (let i = 0; i < weeksToRepeat * 7; i += stepDays) {
      const currentDate = new Date(baseDate);
      currentDate.setDate(baseDate.getDate() + i);
  
      const dayOfWeek = currentDate.getDay();
      if (selectedDays.includes(dayOfWeek)) {
        if (currentDate >= today) {
          datesToBook.push(new Date(currentDate));
        }
      }
    }
    
    if (datesToBook.length === 0) {
      datesToBook.push(new Date(baseDate));
    }
  
    return datesToBook;
  };
  
  /**
   * Вычисляет список доступных слотов времени на день
   */
  export const getAvailableTimeSlots = (
    selectedDate: Date,
    existingBookings: BookingInterval[],
    durationMinutes: number,
    now: Date = new Date() // Прокидываем текущее время для удобства тестирования
  ): string[] => {
    const options: string[] = [];
    
    const isToday =
      selectedDate.getDate() === now.getDate() &&
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getFullYear() === now.getFullYear();
  
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
    // Конвертируем чужие брони в минуты от начала дня
    const bookedIntervals = existingBookings.map((b) => {
      const startMatch = b.startsAt.match(/T(\d{2}):(\d{2})/);
      const endMatch = b.endsAt.match(/T(\d{2}):(\d{2})/);
  
      const startHours = startMatch ? parseInt(startMatch[1], 10) : new Date(b.startsAt).getHours();
      const startMins = startMatch ? parseInt(startMatch[2], 10) : new Date(b.startsAt).getMinutes();
      
      const endHours = endMatch ? parseInt(endMatch[1], 10) : new Date(b.endsAt).getHours();
      const endMins = endMatch ? parseInt(endMatch[2], 10) : new Date(b.endsAt).getMinutes();
  
      return {
        startMins: startHours * 60 + startMins,
        endMins: endHours * 60 + endMins,
      };
    });
  
    for (let h = 9; h <= 19; h++) {
      for (let m = 0; m < 60; m += 15) {
        if (h === 19 && m > 45) continue; // Рабочий день до 20:00
  
        const timeMins = h * 60 + m;
        const proposedEndMins = timeMins + durationMinutes;
  
        // Отсекаем прошедшее время
        if (isToday && timeMins <= currentMinutes) {
          continue;
        }
  
        const isOverlapping = bookedIntervals.some(
          (interval) => timeMins < interval.endMins && proposedEndMins > interval.startMins
        );
  
        if (!isOverlapping) {
          options.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
        }
      }
    }
  
    return options;
  };