import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { TextInput } from '@components/form/TextInput';
import { Select } from '@components/form/Select';
import { Button } from '@components/core/Button';
import { Text } from '@components/core/Text';
import { spacing } from '@theme/index';
import { plantFormSchema, type PlantFormSchema } from '../../domain/plant.scheme';
import { usePlantCreate, usePlantUpdate } from '../../application/plant.mutations';
import { usePlant } from '../../application/plant.queries';
import { LoadingState } from '@components/layout/LoadingState';
import { ErrorState } from '@components/layout/ErrorState';

interface PlantFormProps {
  plantId?: string;
  userId: string;
}

export function PlantForm({ plantId, userId }: PlantFormProps) {
  const navigation = useNavigation();
  const isEditing = !!plantId;

  // Queries
  const { data: plant, isLoading, isError } = usePlant(plantId ?? '', !!plantId);

  // Mutations
  const createMutation = usePlantCreate(userId);
  const updateMutation = usePlantUpdate(userId);

  // Form
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PlantFormSchema>({
    resolver: zodResolver(plantFormSchema),
    defaultValues: {
      name: '',
      plantTypeId: '',
      customWateringFrequencyDays: null,
      photoUrl: null,
    },
  });

  // Cargar datos cuando estamos editando
  useEffect(() => {
    if (plant && isEditing) {
      reset({
        name: plant.name,
        plantTypeId: plant.plantTypeId,
        customWateringFrequencyDays: plant.customWateringFrequencyDays,
        photoUrl: plant.photoUrl,
      });
    }
  }, [plant, isEditing, reset]);

  const onSubmit = async (data: PlantFormSchema) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: plantId, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      navigation.goBack();
    } catch (error) {
      console.error('Error al guardar planta:', error);
    }
  };

  if (isLoading && isEditing) {
    return <LoadingState />;
  }

  if (isError && isEditing) {
    return <ErrorState message="Error al cargar la planta" />;
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <View style={styles.container}>
      <TextInput
        control={control}
        name="name"
        label="Nombre de la planta"
        placeholder="Ej: Mi Pothos"
        error={errors.name?.message}
        autoCapitalize="words"
      />

      <Select
        control={control}
        name="plantTypeId"
        label="Tipo de planta"
        placeholder="Seleccionar tipo"
        error={errors.plantTypeId?.message}
        options={[
          { label: 'Cactus', value: 'cactus' },
          { label: 'Suculenta', value: 'suculenta' },
          { label: 'Tropical', value: 'tropical' },
          { label: 'Helecho', value: 'helecho' },
          { label: 'Orquídea', value: 'orquidea' },
          { label: 'Pothos', value: 'pothos' },
        ]}
      />

      <TextInput
        control={control}
        name="customWateringFrequencyDays"
        label="Frecuencia de riego (opcional)"
        placeholder="Días entre riegos"
        error={errors.customWateringFrequencyDays?.message}
        keyboardType="number-pad"
      />

      <Text variant="caption" color="textSecondary" style={styles.helperText}>
        Si no especificas una frecuencia, se usará la recomendada para el tipo
        de planta seleccionado.
      </Text>

      {/* TODO: Agregar PlantPhotoPicker cuando OpenCode complete la tarea de subida de fotos */}

      <View style={styles.actions}>
        <Button
          variant="outlined"
          size="md"
          onPress={() => navigation.goBack()}
          disabled={isSaving}
          style={styles.cancelButton}
        >
          Cancelar
        </Button>

        <Button
          variant="primary"
          size="lg"
          onPress={handleSubmit(onSubmit)}
          loading={isSaving}
          style={styles.saveButton}
        >
          {isEditing ? 'Guardar cambios' : 'Agregar planta'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  helperText: {
    marginTop: -spacing.sm,
  },
  actions: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  cancelButton: {
    width: '100%',
  },
  saveButton: {
    width: '100%',
  },
});
