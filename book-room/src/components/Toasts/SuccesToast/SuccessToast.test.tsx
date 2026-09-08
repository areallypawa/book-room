import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SuccessToast } from './SuccessToast';

describe('SuccessToast Component', () => {
  it('рендерит переданные пропсы (имя комнаты, время и кастомный заголовок)', () => {
    const mockOnClose = vi.fn();
    
    render(
      <SuccessToast 
        roomName="Эверест" 
        dateTimeText="10:00 - 11:00" 
        title="Бронирование отменено"
        onClose={mockOnClose}
      />
    );

    // Проверяем, что заголовок отобразился
    expect(screen.getByText('Бронирование отменено')).toBeInTheDocument();
    
    // Проверяем, что название комнаты и время отобразились
    expect(screen.getByText('Комната Эверест, 10:00 - 11:00')).toBeInTheDocument();
  });

  it('использует дефолтный заголовок, если title не передан', () => {
    render(
      <SuccessToast 
        roomName="Эверест" 
        dateTimeText="10:00 - 11:00" 
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Бронирование создано')).toBeInTheDocument();
  });
});