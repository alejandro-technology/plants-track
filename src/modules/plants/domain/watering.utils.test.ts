import { addDays, subDays } from 'date-fns';
import {
  calculateNextWateringDate,
  getWateringStatus,
  getWateringStatusInfo,
} from './watering.utils';

describe('watering.utils', () => {
  describe('calculateNextWateringDate', () => {
    it('debe usar fecha de creación cuando nunca se ha regado', () => {
      const createdAt = new Date('2026-01-01');
      const frequencyDays = 7;

      const result = calculateNextWateringDate(null, createdAt, frequencyDays);

      expect(result).toEqual(new Date('2026-01-08'));
    });

    it('debe usar lastWateredAt cuando la planta ya fue regada', () => {
      const createdAt = new Date('2026-01-01');
      const lastWateredAt = new Date('2026-01-15');
      const frequencyDays = 7;

      const result = calculateNextWateringDate(
        lastWateredAt,
        createdAt,
        frequencyDays,
      );

      expect(result).toEqual(new Date('2026-01-22'));
    });

    it('debe calcular correctamente con diferentes frecuencias', () => {
      const createdAt = new Date('2026-01-01');
      const frequencyDays = 14;

      const result = calculateNextWateringDate(null, createdAt, frequencyDays);

      expect(result).toEqual(new Date('2026-01-15'));
    });
  });

  describe('getWateringStatus', () => {
    const today = new Date();

    it('debe retornar "overdue" si nextWateringAt es ayer', () => {
      const yesterday = subDays(today, 1);

      const status = getWateringStatus(yesterday);

      expect(status).toBe('overdue');
    });

    it('debe retornar "overdue" si nextWateringAt es hace 5 días', () => {
      const fiveDaysAgo = subDays(today, 5);

      const status = getWateringStatus(fiveDaysAgo);

      expect(status).toBe('overdue');
    });

    it('debe retornar "today" si nextWateringAt es hoy', () => {
      const status = getWateringStatus(today);

      expect(status).toBe('today');
    });

    it('debe retornar "upcoming" si nextWateringAt es mañana', () => {
      const tomorrow = addDays(today, 1);

      const status = getWateringStatus(tomorrow);

      expect(status).toBe('upcoming');
    });

    it('debe retornar "upcoming" si nextWateringAt es en 2 días', () => {
      const twoDaysLater = addDays(today, 2);

      const status = getWateringStatus(twoDaysLater);

      expect(status).toBe('upcoming');
    });

    it('debe retornar "ok" si nextWateringAt es en 3 días', () => {
      const threeDaysLater = addDays(today, 3);

      const status = getWateringStatus(threeDaysLater);

      expect(status).toBe('ok');
    });

    it('debe retornar "ok" si nextWateringAt es en 10 días', () => {
      const tenDaysLater = addDays(today, 10);

      const status = getWateringStatus(tenDaysLater);

      expect(status).toBe('ok');
    });
  });

  describe('getWateringStatusInfo', () => {
    const today = new Date();

    it('debe retornar label correcto para estado overdue (1 día)', () => {
      const yesterday = subDays(today, 1);

      const info = getWateringStatusInfo(yesterday);

      expect(info.status).toBe('overdue');
      expect(info.label).toBe('Regar hace 1 día');
      expect(info.daysUntil).toBe(-1);
    });

    it('debe retornar label correcto para estado overdue (múltiples días)', () => {
      const fiveDaysAgo = subDays(today, 5);

      const info = getWateringStatusInfo(fiveDaysAgo);

      expect(info.status).toBe('overdue');
      expect(info.label).toBe('Regar hace 5 días');
      expect(info.daysUntil).toBe(-5);
    });

    it('debe retornar label correcto para estado today', () => {
      const info = getWateringStatusInfo(today);

      expect(info.status).toBe('today');
      expect(info.label).toBe('Regar hoy');
      expect(info.daysUntil).toBe(0);
    });

    it('debe retornar label correcto para estado upcoming (mañana)', () => {
      const tomorrow = addDays(today, 1);

      const info = getWateringStatusInfo(tomorrow);

      expect(info.status).toBe('upcoming');
      expect(info.label).toBe('Regar mañana');
      expect(info.daysUntil).toBe(1);
    });

    it('debe retornar label correcto para estado upcoming (2 días)', () => {
      const twoDaysLater = addDays(today, 2);

      const info = getWateringStatusInfo(twoDaysLater);

      expect(info.status).toBe('upcoming');
      expect(info.label).toBe('Regar en 2 días');
      expect(info.daysUntil).toBe(2);
    });

    it('debe retornar label correcto para estado ok', () => {
      const fiveDaysLater = addDays(today, 5);

      const info = getWateringStatusInfo(fiveDaysLater);

      expect(info.status).toBe('ok');
      expect(info.label).toBe('Regar en 5 días');
      expect(info.daysUntil).toBe(5);
    });
  });
});
