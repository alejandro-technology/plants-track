import { manageAxiosError } from '@modules/network/domain/network.error';
import axiosService from '@modules/network/infrastructure/axios.service';
import type { PlantRepository } from '../domain/plant.repository';
import type { PlantEntity, PlantPayload } from '../domain/plant.model';

class PlantHttpService implements PlantRepository {
  async getAll(userId: string): Promise<PlantEntity[] | Error> {
    try {
      const response = await axiosService.get<PlantEntity[]>(`/plants`, {
        params: { userId },
      });
      return response.data;
    } catch (error) {
      return manageAxiosError(error);
    }
  }

  async getById(id: string): Promise<PlantEntity | Error> {
    try {
      const response = await axiosService.get<PlantEntity>(`/plants/${id}`);
      return response.data;
    } catch (error) {
      return manageAxiosError(error);
    }
  }

  async create(payload: PlantPayload): Promise<PlantEntity | Error> {
    try {
      const response = await axiosService.post<PlantEntity>('/plants', payload);
      return response.data;
    } catch (error) {
      return manageAxiosError(error);
    }
  }

  async update(
    id: string,
    payload: Partial<PlantPayload>,
  ): Promise<PlantEntity | Error> {
    try {
      const response = await axiosService.patch<PlantEntity>(
        `/plants/${id}`,
        payload,
      );
      return response.data;
    } catch (error) {
      return manageAxiosError(error);
    }
  }

  async delete(id: string): Promise<void | Error> {
    try {
      await axiosService.delete(`/plants/${id}`);
    } catch (error) {
      return manageAxiosError(error);
    }
  }

  async markAsWatered(
    plantId: string,
    userId: string,
  ): Promise<PlantEntity | Error> {
    try {
      const response = await axiosService.post<PlantEntity>(
        `/plants/${plantId}/water`,
        { userId },
      );
      return response.data;
    } catch (error) {
      return manageAxiosError(error);
    }
  }
}

export default new PlantHttpService();
