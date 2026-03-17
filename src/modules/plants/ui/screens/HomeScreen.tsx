import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import { RootLayout } from '@components/layout/RootLayout';
import { Text } from '@components/core/Text';
import { Button } from '@components/core/Button';
import { useTheme, spacing } from '@theme/index';
import { LoadingState } from '@components/layout/LoadingState';
import { ErrorState } from '@components/layout/ErrorState';
import { EmptyState } from '@components/layout/EmptyState';
import { usePlants } from '../../application/plant.queries';
import { useAuth } from '@modules/authentication/application/auth.queries';
import { PlantCard } from '../components/PlantCard';
import type { PlantEntity } from '../../domain/plant.model';

export function HomeScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const { user } = useAuth();

  const {
    data: plants,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = usePlants(user?.uid ?? '', !!user);

  const handleAddPlant = () => {
    navigation.navigate('AddEditPlant' as never);
  };

  const handlePlantPress = (plant: PlantEntity) => {
    navigation.navigate('PlantDetail' as never, { plantId: plant.id } as never);
  };

  if (isLoading) {
    return (
      <RootLayout>
        <LoadingState />
      </RootLayout>
    );
  }

  if (isError) {
    return (
      <RootLayout>
        <ErrorState
          message="Error al cargar tus plantas"
          onRetry={refetch}
        />
      </RootLayout>
    );
  }

  const plantsCount = plants?.length ?? 0;

  return (
    <RootLayout>
      <View style={styles.header}>
        <View>
          <Text variant="h3" color="text">
            Mis Plantas
          </Text>
          <Text variant="bodySmall" color="textSecondary">
            {plantsCount} {plantsCount === 1 ? 'planta' : 'plantas'}
          </Text>
        </View>
      </View>

      {plantsCount === 0 ? (
        <EmptyState
          title="Aún no tienes plantas"
          message="Agrega tu primera planta para comenzar a cuidarla"
          action={
            <Button variant="primary" size="lg" onPress={handleAddPlant}>
              Agregar planta
            </Button>
          }
        />
      ) : (
        <View style={styles.listContainer}>
          <FlashList
            data={plants}
            renderItem={({ item }) => (
              <PlantCard plant={item} onPress={() => handlePlantPress(item)} />
            )}
            keyExtractor={item => item.id}
            estimatedItemSize={120}
            contentContainerStyle={styles.listContent}
            onRefresh={refetch}
            refreshing={isRefetching}
          />

          {/* FAB para agregar planta */}
          <View style={[styles.fab, { backgroundColor: theme.colors.primary }]}>
            <Button
              variant="primary"
              size="md"
              onPress={handleAddPlant}
              style={styles.fabButton}
            >
              + Agregar
            </Button>
          </View>
        </View>
      )}
    </RootLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: spacing.lg,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    borderRadius: 28,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabButton: {
    paddingHorizontal: spacing.lg,
  },
});
