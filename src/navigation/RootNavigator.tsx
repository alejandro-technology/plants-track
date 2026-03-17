import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// Stacks
import ProductsNavigator from './stacks/ProductsStackNavigator';
import ExamplesNavigator from './stacks/ExampleStackNavigator';
import UsersNavigator from './stacks/UsersStackNavigator';
import AuthenticationNavigator from './stacks/AuthenticationStackNavigator';
// Routes
import { RootRoutes, type RootStackParamList } from './routes/root.routes';
// Auth
import { useAuth } from '@modules/authentication/application/auth.queries';
import { useTheme } from '@theme/index';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, loading } = useAuth();
  const theme = useTheme();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 250,
      }}
    >
      {!user ? (
        // Auth Stack - Cuando no hay sesión
        <Stack.Screen
          name={RootRoutes.Authentication}
          component={AuthenticationNavigator}
        />
      ) : (
        // App Stacks - Cuando hay sesión
        <>
          <Stack.Screen
            name={RootRoutes.Examples}
            component={ExamplesNavigator}
          />
          <Stack.Screen
            name={RootRoutes.Products}
            component={ProductsNavigator}
          />
          <Stack.Screen name={RootRoutes.Users} component={UsersNavigator} />
        </>
      )}
    </Stack.Navigator>
  );
}
