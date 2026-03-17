export type WateringStatus = 'overdue' | 'today' | 'upcoming' | 'ok';

export interface WateringStatusInfo {
  status: WateringStatus;
  label: string;
  daysUntil: number;
}
