import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Alert,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
  Asset,
} from 'react-native-image-picker';
import { AnimatedPressable } from '@components/core/AnimatedPressable';
import { Text } from '@components/core/Text';
import { useTheme, spacing } from '@theme/index';

export interface PlantPhotoPickerProps {
  value: string | null;
  onChange: (uri: string | null) => void;
  disabled?: boolean;
}

export function PlantPhotoPicker(props: PlantPhotoPickerProps) {
  const { value, onChange, disabled = false } = props;
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const handleImageResponse = (response: ImagePickerResponse) => {
    if (response.didCancel) {
      return;
    }

    if (response.errorCode) {
      Alert.alert(
        'Error',
        response.errorMessage || 'Error al seleccionar imagen',
      );
      return;
    }

    const asset: Asset | undefined = response.assets?.[0];
    if (asset?.uri) {
      onChange(asset.uri);
    }
  };

  const handleTakePhoto = async () => {
    setIsLoading(true);
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 800,
        includeBase64: false,
      });
      handleImageResponse(result);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFromGallery = async () => {
    setIsLoading(true);
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 800,
        includeBase64: false,
      });
      handleImageResponse(result);
    } finally {
      setIsLoading(false);
    }
  };

  const showActionSheet = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            'Cancelar',
            'Tomar foto',
            'Seleccionar de galería',
            ...(value ? ['Eliminar foto'] : []),
          ],
          cancelButtonIndex: 0,
          destructiveButtonIndex: value ? 3 : undefined,
        },
        buttonIndex => {
          if (buttonIndex === 1) {
            handleTakePhoto();
          } else if (buttonIndex === 2) {
            handleSelectFromGallery();
          } else if (buttonIndex === 3 && value) {
            onChange(null);
          }
        },
      );
    } else {
      Alert.alert('Seleccionar foto', 'Elige una opción', [
        { text: 'Tomar foto', onPress: handleTakePhoto },
        { text: 'Seleccionar de galería', onPress: handleSelectFromGallery },
        ...(value
          ? [
              {
                text: 'Eliminar foto',
                onPress: () => onChange(null),
                style: 'destructive' as const,
              },
            ]
          : []),
        { text: 'Cancelar', style: 'cancel' as const },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <AnimatedPressable
        onPress={showActionSheet}
        disabled={disabled || isLoading}
        style={[
          styles.photoContainer,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        {value ? (
          <Image
            source={{ uri: value }}
            style={styles.photo}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholder}>
            <Text variant="h3" style={{ fontSize: 48 }}>
              🌱
            </Text>
            <Text
              variant="body"
              color="textSecondary"
              style={{ marginTop: spacing.sm }}
            >
              Agregar foto
            </Text>
          </View>
        )}
      </AnimatedPressable>
      {value && (
        <Text
          variant="caption"
          color="textSecondary"
          style={{ marginTop: spacing.xs, textAlign: 'center' }}
        >
          Toca para cambiar o eliminar
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  photoContainer: {
    width: 200,
    height: 200,
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
