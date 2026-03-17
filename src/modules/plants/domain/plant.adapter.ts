import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import type { PlantEntity, PlantFormData, PlantPayload } from './plant.model';
import { calculateNextWateringDate, getWateringStatusInfo } from './watering.utils';

/**
 * Convierte un documento de Firestore a PlantEntity
 */
export function plantEntityAdapter(
  doc: FirebaseFirestoreTypes.DocumentData,
  plantTypeWateringDays: number,
): PlantEntity {
  const effectiveWateringFrequencyDays =
    doc.customWateringFrequencyDays ?? plantTypeWateringDays;

  const lastWateredAt = doc.lastWateredAt?.toDate() ?? null;
  const createdAt = doc.createdAt?.toDate() ?? new Date();

  const nextWateringAt = calculateNextWateringDate(
    lastWateredAt,
    createdAt,
    effectiveWateringFrequencyDays,
  );

  const statusInfo = getWateringStatusInfo(nextWateringAt);

  return {
    id: doc.id,
    userId: doc.userId,
    name: doc.name,
    plantTypeId: doc.plantTypeId,
    plantTypeName: doc.plantTypeName,
    plantTypeIcon: doc.plantTypeIcon,
    customWateringFrequencyDays: doc.customWateringFrequencyDays ?? null,
    effectiveWateringFrequencyDays,
    photoUrl: doc.photoUrl ?? null,
    lastWateredAt,
    nextWateringAt,
    createdAt,
    statusInfo,
  };
}

/**
 * Convierte PlantFormData a PlantPayload para crear/actualizar
 */
export function plantFormToPayloadAdapter(
  formData: PlantFormData,
  userId: string,
): PlantPayload {
  return {
    name: formData.name,
    plantTypeId: formData.plantTypeId,
    customWateringFrequencyDays: formData.customWateringFrequencyDays ?? null,
    photoUrl: formData.photoUrl ?? null,
    userId,
  };
}
