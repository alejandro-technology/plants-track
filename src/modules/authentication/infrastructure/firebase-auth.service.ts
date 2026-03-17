import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { manageFirebaseError } from '@modules/firebase/domain/firebase.error';
import { COLLECTIONS } from '@config/collections.routes';
import type { AuthRepository } from '../domain/auth.repository';
import type {
  SignUpPayload,
  SignUpResponse,
  SignInPayload,
  SignInResponse,
} from '../domain/auth.model';

class FirebaseAuthService implements AuthRepository {
  async signup(data: SignUpPayload): Promise<SignUpResponse | Error> {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(
        data.email,
        data.password,
      );

      // Guardar datos del usuario en Firestore
      await firestore()
        .collection(COLLECTIONS.USERS)
        .doc(userCredential.user.uid)
        .set({
          name: data.name,
          email: data.email,
          createdAt: firestore.Timestamp.now(),
        });

      return {
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email!,
          name: data.name,
        },
      };
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async signin(data: SignInPayload): Promise<SignInResponse | Error> {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(
        data.email,
        data.password,
      );

      // Obtener datos del usuario desde Firestore
      const userDoc = await firestore()
        .collection(COLLECTIONS.USERS)
        .doc(userCredential.user.uid)
        .get();

      const userData = userDoc.data();

      return {
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email!,
          name: userData?.name,
        },
      };
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async signout(): Promise<void | Error> {
    try {
      await auth().signOut();
      return;
    } catch (error) {
      return manageFirebaseError(error);
    }
  }

  async getCurrentUser(): Promise<
    { uid: string; email: string; name?: string } | Error
  > {
    try {
      const user = auth().currentUser;
      if (!user) {
        return new Error('No hay usuario autenticado');
      }

      // Obtener datos del usuario desde Firestore
      const userDoc = await firestore()
        .collection(COLLECTIONS.USERS)
        .doc(user.uid)
        .get();

      const userData = userDoc.data();

      return {
        uid: user.uid,
        email: user.email!,
        name: userData?.name,
      };
    } catch (error) {
      return manageFirebaseError(error);
    }
  }
}

function createFirebaseAuthService(): AuthRepository {
  return new FirebaseAuthService();
}

export default createFirebaseAuthService();
