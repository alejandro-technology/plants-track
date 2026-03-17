import type { PlantEntity, PlantPayload } from './plant.model';

export interface PlantRepository {
  getAll(userId: string): Promise<PlantEntity[] | Error>;
  getById(id: string): Promise<PlantEntity | Error>;
  create(payload: PlantPayload): Promise<PlantEntity | Error>;
  update(
    id: string,
    payload: Partial<PlantPayload>,
  ): Promise<PlantEntity | Error>;
  delete(id: string): Promise<void | Error>;
  markAsWatered(plantId: string, userId: string): Promise<PlantEntity | Error>;
}
