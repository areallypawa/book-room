import { describe, it, expect } from 'vitest';
import { generateBookingDates, getAvailableTimeSlots } from './bookingUtils';

describe('bookingUtils - Бизнес-логика бронирования', () => {

  describe('generateBookingDates', () => {
    it('должен возвращать одну дату, если повторение выключено', () => {
      const baseDate = new Date('2026-09-08T10:00:00');
      const dates = generateBookingDates(baseDate, false, [2], 'week', 7);
      
      expect(dates).toHaveLength(1);
      expect(dates[0].toISOString()).toBe(baseDate.toISOString());
    });

    it('должен генерировать даты каждую неделю', () => {
      // 8 сентября 2026 - это вторник (день недели 2)
      const baseDate = new Date('2026-09-08T00:00:00');
      
      const dates = generateBookingDates(baseDate, true, [2], 'week', 7, 2); // 2 недели
      
      expect(dates).toHaveLength(2);
      expect(dates[0].getDate()).toBe(8);
      expect(dates[1].getDate()).toBe(15); // Через неделю
    });
  });

  describe('getAvailableTimeSlots', () => {
    it('должен отсекать слоты, которые пересекаются с существующими бронями', () => {
      const selectedDate = new Date('2026-09-10T00:00:00');
      // Фиксируем "текущее время" как раннее утро, чтобы отсечение прошедшего времени не мешало
      const mockNow = new Date('2026-09-10T08:00:00'); 
      
      const existingBookings = [
        {
          startsAt: '2026-09-10T10:00:00+03:00',
          endsAt: '2026-09-10T11:00:00+03:00'
        }
      ];

      // Пытаемся найти места для встречи на 60 минут
      const slots = getAvailableTimeSlots(selectedDate, existingBookings, 60, mockNow);
      
      // 10:00 должно быть занято
      expect(slots).not.toContain('10:00');
      expect(slots).not.toContain('10:15');
      expect(slots).not.toContain('10:30');
      expect(slots).not.toContain('10:45');
      
      // 09:00 и 11:00 должны быть свободны
      expect(slots).toContain('09:00');
      expect(slots).toContain('11:00');
    });

    it('должен отсекать слоты, которые уже прошли сегодня', () => {
      const selectedDate = new Date('2026-09-10T00:00:00');
      // Имитируем, что сейчас 14:00
      const mockNow = new Date('2026-09-10T14:00:00'); 
      
      const slots = getAvailableTimeSlots(selectedDate, [], 30, mockNow);
      
      // Время до 14:00 должно отсутствовать
      expect(slots).not.toContain('09:00');
      expect(slots).not.toContain('13:45');
      expect(slots).not.toContain('14:00'); 
      
      // А будущее время доступно
      expect(slots).toContain('14:15');
    });
  });
});