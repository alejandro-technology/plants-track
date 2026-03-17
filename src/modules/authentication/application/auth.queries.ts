import { useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { COLLECTIONS } from '@config/collections.routes';
import type { UserEntity } from '../domain/auth.model';

/**
 * Hook para manejar el estado de autenticación
 * Escucha cambios en el estado de auth de Firebase
 */
export function useAuth() {
  const [user, setUser] = useState<UserEntity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async firebaseUser => {
      if (firebaseUser) {
        try {
          // Obtener datos adicionales del usuario desde Firestore
          const userDoc = await firestore()
            .collection(COLLECTIONS.USERS)
            .doc(firebaseUser.uid)
            .get();

          const userData = userDoc.data();

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            name: userData?.name,
          });
        } catch (error) {
          console.error('Error al obtener datos del usuario:', error);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
          });
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading, isAuthenticated: !!user };
}

/**
 * Hook para obtener el usuario actual de forma imperativa
 * Útil cuando no necesitas escuchar cambios
 */
export async function getCurrentUser(): Promise<UserEntity | null> {
  const firebaseUser = auth().currentUser;

  if (!firebaseUser) {
    return null;
  }

  try {
    const userDoc = await firestore()
      .collection(COLLECTIONS.USERS)
      .doc(firebaseUser.uid)
      .get();

    const userData = userDoc.data();

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      name: userData?.name,
    };
  } catch (error) {
    console.error('Error al obtener usuario actual:', error);
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
    };
  }
}
