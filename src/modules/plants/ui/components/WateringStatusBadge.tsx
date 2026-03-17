import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@components/core/Text';
import { useTheme, spacing } from '@theme/index';
import type { WateringStatus } from '../../domain/watering-status.types';

interface WateringStatusBadgeProps {
  status: WateringStatus;
  label: string;
}

export function WateringStatusBadge({
  status,
  label,
}: WateringStatusBadgeProps) {
  const theme = useTheme();

  const getStatusColor = () => {
    switch (status) {
      case 'overdue':
        return theme.colors.error;
      case 'today':
        return theme.colors.warning;
      case 'upcoming':
        return '#8BC34A'; // Verde claro
      case 'ok':
        return theme.colors.success;
      default:
        return theme.colors.textSecondary;
    }
  };

  const backgroundColor = getStatusColor();

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text variant="overline" style={styles.text}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
