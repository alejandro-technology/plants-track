import { z } from 'zod';

export const plantFormSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres'),
  plantTypeId: z.string().min(1, 'Debes seleccionar un tipo de planta'),
  customWateringFrequencyDays: z
    .number()
    .int()
    .min(1, 'Mínimo 1 día')
    .max(365, 'Máximo 365 días')
    .nullable()
    .optional(),
  photoUrl: z.string().url().nullable().optional(),
});

export type PlantFormSchema = z.infer<typeof plantFormSchema>;
