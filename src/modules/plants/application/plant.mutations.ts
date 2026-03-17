import { useMutation, useQueryClient } from '@tanstack/react-query';
import plantService from '../infrastructure/plant.service';
import { useAppStorage } from '@modules/core/infrastructure/app.storage';
import type { PlantFormData } from '../domain/plant.model';
import { plantFormToPayloadAdapter } from '../domain/plant.adapter';

export function usePlantCreate(userId: string) {
  const queryClient = useQueryClient();
  const { show } = useAppStorage(s => s.toast);

  return useMutation({
    mutationFn: async (data: PlantFormData) => {
      const payload = plantFormToPayloadAdapter(data, userId);
      const result = await plantService.create(payload);

      if (result instanceof Error) {
        throw result;
      }

      return result;
    },
    onSuccess: () => {
      show({
        message: '¡Planta agregada exitosamente!',
        type: 'success',
        position: 'bottom',
      });
      queryClient.invalidateQueries({ queryKey: ['plants'] });
    },
  });
}

export function usePlantUpdate(userId: string) {
  const queryClient = useQueryClient();
  const { show } = useAppStorage(s => s.toast);

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: PlantFormData;
    }) => {
      const payload = plantFormToPayloadAdapter(data, userId);
      const result = await plantService.update(id, payload);

      if (result instanceof Error) {
        throw result;
      }

      return result;
    },
    onSuccess: (_, variables) => {
      show({
        message: 'Planta actualizada exitosamente',
        type: 'success',
        position: 'bottom',
      });
      queryClient.invalidateQueries({ queryKey: ['plants'] });
      queryClient.invalidateQueries({
        queryKey: ['plants', 'detail', variables.id],
      });
    },
  });
}

export function usePlantDelete() {
  const queryClient = useQueryClient();
  const { show } = useAppStorage(s => s.toast);

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await plantService.delete(id);

      if (result instanceof Error) {
        throw result;
      }
    },
    onSuccess: () => {
      show({
        message: 'Planta eliminada exitosamente',
        type: 'success',
        position: 'bottom',
      });
      queryClient.invalidateQueries({ queryKey: ['plants'] });
    },
  });
}

export function useMarkAsWatered() {
  const queryClient = useQueryClient();
  const { show } = useAppStorage(s => s.toast);

  return useMutation({
    mutationFn: async ({
      plantId,
      userId,
    }: {
      plantId: string;
      userId: string;
    }) => {
      const result = await plantService.markAsWatered(plantId, userId);

      if (result instanceof Error) {
        throw result;
      }

      return result;
    },
    onSuccess: data => {
      const daysUntil = data.statusInfo?.daysUntil ?? 0;
      const message =
        daysUntil === 1
          ? '¡Planta regada! Próximo riego mañana'
          : `¡Planta regada! Próximo riego en ${daysUntil} días`;

      show({
        message,
        type: 'success',
        position: 'bottom',
      });

      queryClient.invalidateQueries({ queryKey: ['plants'] });
      queryClient.invalidateQueries({
        queryKey: ['plants', 'detail', data.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['watering_history', data.id],
      });
    },
  });
}
