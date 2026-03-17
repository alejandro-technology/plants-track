import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RootLayout } from '@components/layout/RootLayout';
import { Header } from '@components/layout/Header';
import { useTheme, spacing } from '@theme/index';
import { PlantForm } from '../components/PlantForm';
import { useAuth } from '@modules/authentication/application/auth.queries';

export function AddEditPlantScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const theme = useTheme();
  const { user } = useAuth();

  const plantId = route.params?.plantId;
  const isEditing = !!plantId;

  return (
    <RootLayout>
      <Header
        title={isEditing ? 'Editar planta' : 'Agregar planta'}
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <PlantForm plantId={plantId} userId={user?.uid ?? ''} />
      </ScrollView>
    </RootLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
});
