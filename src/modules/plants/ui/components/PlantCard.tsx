import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { Card } from '@components/core/Card';
import { Text } from '@components/core/Text';
import { AnimatedPressable } from '@components/core/AnimatedPressable';
import { useTheme, spacing } from '@theme/index';
import { WateringStatusBadge } from './WateringStatusBadge';
import type { PlantEntity } from '../../domain/plant.model';

interface PlantCardProps {
  plant: PlantEntity;
  onPress: () => void;
}

export function PlantCard({ plant, onPress }: PlantCardProps) {
  const theme = useTheme();

  return (
    <AnimatedPressable onPress={onPress}>
      <Card variant="elevated" size="md" style={styles.card}>
        {plant.photoUrl ? (
          <Image
            source={{ uri: plant.photoUrl }}
            style={[styles.image, { backgroundColor: theme.colors.surface }]}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.placeholder,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text variant="h1">{plant.plantTypeIcon}</Text>
          </View>
        )}

        <View style={styles.content}>
          <Text variant="h5" color="text" numberOfLines={1}>
            {plant.name}
          </Text>
          <Text variant="bodySmall" color="textSecondary">
            {plant.plantTypeName} • Cada {plant.effectiveWateringFrequencyDays}{' '}
            días
          </Text>

          {plant.statusInfo && (
            <View style={styles.badgeContainer}>
              <WateringStatusBadge
                status={plant.statusInfo.status}
                label={plant.statusInfo.label}
              />
            </View>
          )}
        </View>
      </Card>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 140,
  },
  placeholder: {
    width: '100%',
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  badgeContainer: {
    marginTop: spacing.xs,
  },
});
