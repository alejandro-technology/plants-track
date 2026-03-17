import type { PlantRepository } from '../domain/plant.repository';
import type { PlantEntity, PlantPayload } from '../domain/plant.model';
import { calculateNextWateringDate, getWateringStatusInfo } from '../domain/watering.utils';

const mockPlants: PlantEntity[] = [
  {
    id: '1',
    userId: 'mock-user',
    name: 'Mi Pothos',
    plantTypeId: 'pothos',
    plantTypeName: 'Pothos',
    plantTypeIcon: '🍃',
    customWateringFrequencyDays: null,
    effectiveWateringFrequencyDays: 7,
    photoUrl: null,
    lastWateredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Hace 5 días
    nextWateringAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // En 2 días
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    statusInfo: getWateringStatusInfo(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)),
  },
  {
    id: '2',
    userId: 'mock-user',
    name: 'Cactus del Desierto',
    plantTypeId: 'cactus',
    plantTypeName: 'Cactus',
    plantTypeIcon: '🌵',
    customWateringFrequencyDays: null,
    effectiveWateringFrequencyDays: 14,
    photoUrl: null,
    lastWateredAt: null,
    nextWateringAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Ayer (overdue)
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    statusInfo: getWateringStatusInfo(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
  },
];

class PlantMockService implements PlantRepository {
  private plants: PlantEntity[] = [...mockPlants];

  async getAll(userId: string): Promise<PlantEntity[] | Error> {
    return this.plants.filter(p => p.userId === userId);
  }

  async getById(id: string): Promise<PlantEntity | Error> {
    const plant = this.plants.find(p => p.id === id);
    if (!plant) {
      return new Error('Planta no encontrada');
    }
    return plant;
  }

  async create(payload: PlantPayload): Promise<PlantEntity | Error> {
    const now = new Date();
    const nextWateringAt = calculateNextWateringDate(
      null,
      now,
      payload.customWateringFrequencyDays ?? 7,
    );

    const newPlant: PlantEntity = {
      id: Math.random().toString(36).substr(2, 9),
      userId: payload.userId,
      name: payload.name,
      plantTypeId: payload.plantTypeId,
      plantTypeName: 'Mock Plant Type',
      plantTypeIcon: '🌿',
      customWateringFrequencyDays: payload.customWateringFrequencyDays ?? null,
      effectiveWateringFrequencyDays: payload.customWateringFrequencyDays ?? 7,
      photoUrl: payload.photoUrl ?? null,
      lastWateredAt: null,
      nextWateringAt,
      createdAt: now,
      statusInfo: getWateringStatusInfo(nextWateringAt),
    };

    this.plants.push(newPlant);
    return newPlant;
  }

  async update(
    id: string,
    payload: Partial<PlantPayload>,
  ): Promise<PlantEntity | Error> {
    const index = this.plants.findIndex(p => p.id === id);
    if (index === -1) {
      return new Error('Planta no encontrada');
    }

    const updatedPlant = { ...this.plants[index], ...payload };
    this.plants[index] = updatedPlant;
    return updatedPlant;
  }

  async delete(id: string): Promise<void | Error> {
    const index = this.plants.findIndex(p => p.id === id);
    if (index === -1) {
      return new Error('Planta no encontrada');
    }
    this.plants.splice(index, 1);
  }

  async markAsWatered(
    plantId: string,
    _userId: string,
  ): Promise<PlantEntity | Error> {
    const index = this.plants.findIndex(p => p.id === plantId);
    if (index === -1) {
      return new Error('Planta no encontrada');
    }

    const plant = this.plants[index];
    const now = new Date();
    const nextWateringAt = calculateNextWateringDate(
      now,
      now,
      plant.effectiveWateringFrequencyDays,
    );

    const updatedPlant: PlantEntity = {
      ...plant,
      lastWateredAt: now,
      nextWateringAt,
      statusInfo: getWateringStatusInfo(nextWateringAt),
    };

    this.plants[index] = updatedPlant;
    return updatedPlant;
  }
}

export default new PlantMockService();
