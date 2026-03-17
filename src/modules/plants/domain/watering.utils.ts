import {
  differenceInDays,
  startOfDay,
  addDays,
  formatDistanceToNow,
} from 'date-fns';
import { es } from 'date-fns/locale';
import type { WateringStatus, WateringStatusInfo } from './watering-status.types';

/**
 * Calcula la próxima fecha de riego basándose en la última vez que se regó
 * y la frecuencia de riego en días.
 *
 * @param lastWateredAt - Última fecha de riego (null si nunca se ha regado)
 * @param createdAt - Fecha de creación de la planta
 * @param frequencyDays - Frecuencia de riego en días
 * @returns Próxima fecha de riego
 */
export function calculateNextWateringDate(
  lastWateredAt: Date | null,
  createdAt: Date,
  frequencyDays: number,
): Date {
  const baseDate = lastWateredAt ?? createdAt;
  return addDays(baseDate, frequencyDays);
}

/**
 * Determina el estado de riego de una planta basándose en la próxima
 * fecha de riego.
 *
 * @param nextWateringAt - Próxima fecha de riego
 * @returns Estado de riego ('overdue' | 'today' | 'upcoming' | 'ok')
 */
export function getWateringStatus(nextWateringAt: Date): WateringStatus {
  const today = startOfDay(new Date());
  const nextDate = startOfDay(nextWateringAt);
  const diffDays = differenceInDays(nextDate, today);

  if (diffDays < 0) return 'overdue'; // Atrasada
  if (diffDays === 0) return 'today'; // Regar hoy
  if (diffDays <= 2) return 'upcoming'; // Próximamente (1-2 días)
  return 'ok'; // No necesita agua pronto
}

/**
 * Obtiene información completa del estado de riego incluyendo el label
 * para mostrar en la UI.
 *
 * @param nextWateringAt - Próxima fecha de riego
 * @returns Objeto con status, label y días hasta el próximo riego
 */
export function getWateringStatusInfo(nextWateringAt: Date): WateringStatusInfo {
  const status = getWateringStatus(nextWateringAt);
  const today = startOfDay(new Date());
  const nextDate = startOfDay(nextWateringAt);
  const daysUntil = differenceInDays(nextDate, today);
  const absDays = Math.abs(daysUntil);

  let label: string;

  switch (status) {
    case 'overdue':
      label = absDays === 1 ? 'Regar hace 1 día' : `Regar hace ${absDays} días`;
      break;
    case 'today':
      label = 'Regar hoy';
      break;
    case 'upcoming':
      label = daysUntil === 1 ? 'Regar mañana' : `Regar en ${daysUntil} días`;
      break;
    case 'ok':
      label = daysUntil === 1 ? 'Regar en 1 día' : `Regar en ${daysUntil} días`;
      break;
  }

  return {
    status,
    label,
    daysUntil,
  };
}

/**
 * Obtiene un texto relativo indicando cuándo fue la última vez que se regó.
 *
 * @param lastWateredAt - Última fecha de riego (null si nunca se ha regado)
 * @returns Texto relativo (ej: "hace 3 días")
 */
export function getLastWateredRelative(lastWateredAt: Date | null): string {
  if (!lastWateredAt) return 'Nunca regada';

  return formatDistanceToNow(lastWateredAt, {
    addSuffix: true,
    locale: es,
  });
}
