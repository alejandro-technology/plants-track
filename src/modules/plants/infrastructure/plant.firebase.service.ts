import firestore from '@react-native-firebase/firestore';
import { manageFirebaseError } from '@modules/firebase/domain/firebase.error';
import { COLLECTIONS } from '@config/collections.routes';
import type { PlantRepository } from '../domain/plant.repository';
import type { PlantEntity, PlantPayload } from '../domain/plant.model';
import { plantEntityAdapter } from '../domain/plant.adapter';
import { calculateNextWateringDate } from '../domain/watering.utils';

class PlantFirebaseService implements PlantRepository {
  private firestore = firestore();

  async getAll(userId: string): Promise<PlantEntity[] | Error> {
    try {
      const snapshot = await this.firestore
        .collection(COLLECTIONS.PLANTS)
        .where('userId', '==', userId)
        .get();

      const plants: PlantEntity[] = [];

      for (const doc of snapshot.docs) {
        const data = { id: doc.id, ...doc.data() };

        // Obtener tipo de planta para calcular frecuencia efectiva
        const plantTypeDoc = await this.firestore
          .collection(COLLECTIONS.PLANT_TYPES)
          .doc(data.plantTypeId)
          .get();

        if (plantTypeDoc.exists) {
          const plantTypeData = plantTypeDoc.data()!;
          const plant = plantEntityAdapter(
            data,
            plantTypeData.wateringFrequencyDays,
          );
          plants.push(plant);
        }
      }

      return plants;
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async getById(id: string): Promise<PlantEntity | Error> {
    try {
      const docRef = this.firestore.collection(COLLECTIONS.PLANTS).doc(id);
      const snapshot = await docRef.get();

      if (!snapshot.exists) {
        return new Error('Planta no encontrada');
      }

      const data = { id: snapshot.id, ...snapshot.data()! };

      // Obtener tipo de planta
      const plantTypeDoc = await this.firestore
        .collection(COLLECTIONS.PLANT_TYPES)
        .doc(data.plantTypeId)
        .get();

      if (!plantTypeDoc.exists) {
        return new Error('Tipo de planta no encontrado');
      }

      const plantTypeData = plantTypeDoc.data()!;

      return plantEntityAdapter(data, plantTypeData.wateringFrequencyDays);
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async create(payload: PlantPayload): Promise<PlantEntity | Error> {
    try {
      // Obtener tipo de planta para info desnormalizada y frecuencia
      const plantTypeDoc = await this.firestore
        .collection(COLLECTIONS.PLANT_TYPES)
        .doc(payload.plantTypeId)
        .get();

      if (!plantTypeDoc.exists) {
        return new Error('Tipo de planta no encontrado');
      }

      const plantTypeData = plantTypeDoc.data()!;
      const effectiveFrequency =
        payload.customWateringFrequencyDays ??
        plantTypeData.wateringFrequencyDays;

      const now = new Date();
      const nextWateringAt = calculateNextWateringDate(
        null,
        now,
        effectiveFrequency,
      );

      const plantData = {
        ...payload,
        plantTypeName: plantTypeData.name,
        plantTypeIcon: plantTypeData.icon,
        lastWateredAt: null,
        nextWateringAt: firestore.Timestamp.fromDate(nextWateringAt),
        createdAt: firestore.Timestamp.fromDate(now),
      };

      const docRef = await this.firestore
        .collection(COLLECTIONS.PLANTS)
        .add(plantData);

      const createdDoc = await docRef.get();
      const data = { id: createdDoc.id, ...createdDoc.data()! };

      return plantEntityAdapter(data, plantTypeData.wateringFrequencyDays);
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async update(
    id: string,
    payload: Partial<PlantPayload>,
  ): Promise<PlantEntity | Error> {
    try {
      const docRef = this.firestore.collection(COLLECTIONS.PLANTS).doc(id);
      const currentDoc = await docRef.get();

      if (!currentDoc.exists) {
        return new Error('Planta no encontrada');
      }

      const updateData: Record<string, unknown> = { ...payload };

      // Si cambió el tipo de planta, actualizar info desnormalizada
      if (payload.plantTypeId) {
        const plantTypeDoc = await this.firestore
          .collection(COLLECTIONS.PLANT_TYPES)
          .doc(payload.plantTypeId)
          .get();

        if (!plantTypeDoc.exists) {
          return new Error('Tipo de planta no encontrado');
        }

        const plantTypeData = plantTypeDoc.data()!;
        updateData.plantTypeName = plantTypeData.name;
        updateData.plantTypeIcon = plantTypeData.icon;
      }

      // Si cambió la frecuencia, recalcular nextWateringAt
      if (payload.customWateringFrequencyDays !== undefined) {
        const currentData = currentDoc.data()!;
        const plantTypeDoc = await this.firestore
          .collection(COLLECTIONS.PLANT_TYPES)
          .doc(currentData.plantTypeId)
          .get();

        const plantTypeData = plantTypeDoc.data()!;
        const effectiveFrequency =
          payload.customWateringFrequencyDays ??
          plantTypeData.wateringFrequencyDays;

        const lastWateredAt = currentData.lastWateredAt?.toDate() ?? null;
        const createdAt = currentData.createdAt?.toDate() ?? new Date();

        const nextWateringAt = calculateNextWateringDate(
          lastWateredAt,
          createdAt,
          effectiveFrequency,
        );

        updateData.nextWateringAt =
          firestore.Timestamp.fromDate(nextWateringAt);
      }

      await docRef.update(updateData);

      const updatedDoc = await docRef.get();
      const data = { id: updatedDoc.id, ...updatedDoc.data()! };

      const plantTypeDoc = await this.firestore
        .collection(COLLECTIONS.PLANT_TYPES)
        .doc(data.plantTypeId)
        .get();

      const plantTypeData = plantTypeDoc.data()!;

      return plantEntityAdapter(data, plantTypeData.wateringFrequencyDays);
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async delete(id: string): Promise<void | Error> {
    try {
      await this.firestore.collection(COLLECTIONS.PLANTS).doc(id).delete();
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async markAsWatered(
    plantId: string,
    userId: string,
  ): Promise<PlantEntity | Error> {
    try {
      const docRef = this.firestore.collection(COLLECTIONS.PLANTS).doc(plantId);
      const currentDoc = await docRef.get();

      if (!currentDoc.exists) {
        return new Error('Planta no encontrada');
      }

      const currentData = currentDoc.data()!;

      // Obtener tipo de planta
      const plantTypeDoc = await this.firestore
        .collection(COLLECTIONS.PLANT_TYPES)
        .doc(currentData.plantTypeId)
        .get();

      if (!plantTypeDoc.exists) {
        return new Error('Tipo de planta no encontrado');
      }

      const plantTypeData = plantTypeDoc.data()!;
      const effectiveFrequency =
        currentData.customWateringFrequencyDays ??
        plantTypeData.wateringFrequencyDays;

      const now = new Date();
      const nextWateringAt = calculateNextWateringDate(
        now,
        now,
        effectiveFrequency,
      );

      // Actualizar planta
      await docRef.update({
        lastWateredAt: firestore.Timestamp.fromDate(now),
        nextWateringAt: firestore.Timestamp.fromDate(nextWateringAt),
      });

      // Crear registro en historial de riego
      await this.firestore.collection(COLLECTIONS.WATERING_HISTORY).add({
        plantId,
        userId,
        wateredAt: firestore.Timestamp.fromDate(now),
        notes: null,
      });

      const updatedDoc = await docRef.get();
      const data = { id: updatedDoc.id, ...updatedDoc.data()! };

      return plantEntityAdapter(data, plantTypeData.wateringFrequencyDays);
    } catch (error) {
      return manageFirebaseError(error);
    }
  }
}

export default new PlantFirebaseService();
