import type { WateringStatusInfo } from './watering-status.types';

export interface PlantEntity {
  id: string;
  userId: string;
  name: string;
  plantTypeId: string;
  plantTypeName: string; // Desnormalizado para evitar joins
  plantTypeIcon: string; // Desnormalizado
  customWateringFrequencyDays: number | null;
  effectiveWateringFrequencyDays: number; // Calculado
  photoUrl: string | null;
  lastWateredAt: Date | null;
  nextWateringAt: Date;
  createdAt: Date;
  // Información de estado calculada (no se guarda en DB)
  statusInfo?: WateringStatusInfo;
}

export interface PlantFormData {
  name: string;
  plantTypeId: string;
  customWateringFrequencyDays: number | null;
  photoUrl: string | null;
}

export interface PlantPayload {
  name: string;
  plantTypeId: string;
  customWateringFrequencyDays: number | null;
  photoUrl: string | null;
  userId: string;
}
