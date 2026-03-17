import { useQuery } from '@tanstack/react-query';
import plantService from '../infrastructure/plant.service';

export function usePlants(userId: string, enabled = true) {
  return useQuery({
    queryKey: ['plants', userId],
    queryFn: async () => {
      const result = await plantService.getAll(userId);
      if (result instanceof Error) {
        throw result;
      }

      // Ordenar: primero las que necesitan agua urgente
      const sortOrder = { overdue: 0, today: 1, upcoming: 2, ok: 3 };
      return result.sort((a, b) => {
        const aStatus = a.statusInfo?.status ?? 'ok';
        const bStatus = b.statusInfo?.status ?? 'ok';
        return sortOrder[aStatus] - sortOrder[bStatus];
      });
    },
    enabled: enabled && Boolean(userId),
  });
}

export function usePlant(id: string, enabled = true) {
  return useQuery({
    queryKey: ['plants', 'detail', id],
    queryFn: async () => {
      const result = await plantService.getById(id);
      if (result instanceof Error) {
        throw result;
      }
      return result;
    },
    enabled: enabled && Boolean(id),
  });
}
