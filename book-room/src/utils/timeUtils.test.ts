import { describe, it, expect } from 'vitest';
import { calculateEndTime } from './timeUtils';

describe('timeUtils - calculateEndTime', () => {
  it('должна корректно прибавлять 60 минут (1 час)', () => {
    const result = calculateEndTime('12:00', 60);
    expect(result).toBe('13:00');
  });

  it('должна корректно обрабатывать переход через час (добавление 45 минут)', () => {
    const result = calculateEndTime('14:30', 45);
    expect(result).toBe('15:15');
  });

  it('должна корректно обрабатывать переход через полночь', () => {
    const result = calculateEndTime('23:30', 60);
    expect(result).toBe('00:30');
  });

  it('должна корректно работать с нулями', () => {
    const result = calculateEndTime('09:05', 15);
    expect(result).toBe('09:20');
  });
});