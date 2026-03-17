import React from 'react';
import { ScrollView, StyleSheet, View, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RootLayout } from '@components/layout/RootLayout';
import { Header } from '@components/layout/Header';
import { Text } from '@components/core/Text';
import { Button } from '@components/core/Button';
import { Card } from '@components/core/Card';
import { useTheme, spacing } from '@theme/index';
import { LoadingState } from '@components/layout/LoadingState';
import { ErrorState } from '@components/layout/ErrorState';
import { usePlant } from '../../application/plant.queries';
import { useMarkAsWatered, usePlantDelete } from '../../application/plant.mutations';
import { useAuth } from '@modules/authentication/application/auth.queries';
import { useAppStorage } from '@modules/core/infrastructure/app.storage';
import { WateringStatusBadge } from '../components/WateringStatusBadge';
import { getLastWateredRelative } from '../../domain/watering.utils';

export function PlantDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const theme = useTheme();
  const { user } = useAuth();
  const { open: openModal } = useAppStorage(s => s.modal);

  const plantId = route.params?.plantId;

  const { data: plant, isLoading, isError, refetch } = usePlant(plantId);
  const markAsWateredMutation = useMarkAsWatered();
  const deleteMutation = usePlantDelete();

  const handleMarkAsWatered = async () => {
    if (!plant || !user) return;

    await markAsWateredMutation.mutateAsync({
      plantId: plant.id,
      userId: user.uid,
    });
  };

  const handleEdit = () => {
    navigation.navigate('AddEditPlant' as never, { plantId } as never);
  };

  const handleDelete = () => {
    if (!plant) return;

    openModal({
      entityName: plant.name,
      entityType: 'planta',
      onConfirm: async () => {
        await deleteMutation.mutateAsync(plant.id);
        navigation.goBack();
      },
    });
  };

  const handleViewHistory = () => {
    navigation.navigate('WateringHistory' as never, { plantId } as never);
  };

  if (isLoading) {
    return (
      <RootLayout>
        <Header title="Detalle" onBackPress={() => navigation.goBack()} />
        <LoadingState />
      </RootLayout>
    );
  }

  if (isError || !plant) {
    return (
      <RootLayout>
        <Header title="Detalle" onBackPress={() => navigation.goBack()} />
        <ErrorState message="Error al cargar la planta" onRetry={refetch} />
      </RootLayout>
    );
  }

  const canWaterToday =
    plant.statusInfo?.status === 'overdue' ||
    plant.statusInfo?.status === 'today';

  return (
    <RootLayout>
      <Header
        title="Detalle"
        onBackPress={() => navigation.goBack()}
        rightActions={[
          {
            icon: '✏️',
            onPress: handleEdit,
          },
          {
            icon: '🗑️',
            onPress: handleDelete,
          },
        ]}
      />

      <ScrollView style={styles.container}>
        {/* Hero Section */}
        {plant.photoUrl ? (
          <Image
            source={{ uri: plant.photoUrl }}
            style={[styles.heroImage, { backgroundColor: theme.colors.surface }]}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.heroPlaceholder,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text variant="h1" style={styles.heroIcon}>
              {plant.plantTypeIcon}
            </Text>
          </View>
        )}

        <View style={styles.content}>
          <Text variant="h2" color="text">
            {plant.name}
          </Text>
          <Text variant="body" color="textSecondary" style={styles.subtitle}>
            {plant.plantTypeName} • Cada {plant.effectiveWateringFrequencyDays}{' '}
            días
          </Text>

          {plant.statusInfo && (
            <WateringStatusBadge
              status={plant.statusInfo.status}
              label={plant.statusInfo.label}
            />
          )}

          {/* Watering Section */}
          <Card variant="outlined" size="lg" style={styles.wateringCard}>
            <Text variant="body" color="textSecondary">
              Último riego: {getLastWateredRelative(plant.lastWateredAt)}
            </Text>

            <Text variant="h5" color="text" style={styles.nextWatering}>
              {plant.statusInfo?.label ?? 'Regar pronto'}
            </Text>

            <Button
              variant="primary"
              size="lg"
              onPress={handleMarkAsWatered}
              loading={markAsWateredMutation.isPending}
              disabled={!canWaterToday || markAsWateredMutation.isPending}
              style={styles.waterButton}
            >
              💧 Marcar como regada
            </Button>

            {!canWaterToday && (
              <Text variant="caption" color="textSecondary" style={styles.hint}>
                Esta planta fue regada recientemente
              </Text>
            )}
          </Card>

          {/* Recent History Preview */}
          <View style={styles.historySection}>
            <Text variant="h5" color="text">
              Historial de riego
            </Text>
            {/* TODO: Mostrar últimos 3-5 riegos cuando OpenCode complete el historial */}
            <Button
              variant="outlined"
              size="md"
              onPress={handleViewHistory}
              style={styles.historyButton}
            >
              Ver historial completo →
            </Button>
          </View>
        </View>
      </ScrollView>
    </RootLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroImage: {
    width: '100%',
    height: 250,
  },
  heroPlaceholder: {
    width: '100%',
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroIcon: {
    fontSize: 80,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  subtitle: {
    marginTop: -spacing.sm,
  },
  wateringCard: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  nextWatering: {
    marginTop: spacing.xs,
  },
  waterButton: {
    marginTop: spacing.sm,
  },
  hint: {
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  historySection: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  historyButton: {
    alignSelf: 'flex-start',
  },
});
