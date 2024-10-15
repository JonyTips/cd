import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyD0iaNXBvwWAWQb0GScNaB1BOlpqD9d9Rk",
  authDomain: "registros-cd.firebaseapp.com",
  projectId: "registros-cd",
  storageBucket: "registros-cd.appspot.com",
  messagingSenderId: "788358419284",
  appId: "1:788358419284:web:a95a9607899e05446b6ec1",
  measurementId: "G-BLLLVYJYK8"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const retryOperation = async (operation: () => Promise<any>, retries = MAX_RETRIES): Promise<any> => {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0 && (error.code === 'auth/network-request-failed' || error.code === 'unavailable')) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return retryOperation(operation, retries - 1);
    }
    throw error;
  }
};

// Función para crear usuarios por defecto
export const createDefaultUsers = async () => {
  const defaultUsers = [
    { email: 'jony@petfy.cl', password: '123456', role: 'admin' },
    { email: 'schoihet@gmail.com', password: '123456', role: 'user' }
  ];

  for (const user of defaultUsers) {
    try {
      // Primero, intentamos iniciar sesión
      await retryOperation(() => signInWithEmailAndPassword(auth, user.email, user.password));
      console.log(`Usuario ya existe: ${user.email}`);
    } catch (error) {
      // Si el inicio de sesión falla, intentamos crear el usuario
      if (error.code === 'auth/user-not-found') {
        try {
          const userCredential = await retryOperation(() => createUserWithEmailAndPassword(auth, user.email, user.password));
          await retryOperation(() => setDoc(doc(firestore, 'users', userCredential.user.uid), {
            email: user.email,
            role: user.role
          }));
          console.log(`Usuario creado: ${user.email}`);
        } catch (createError) {
          console.error(`Error al crear usuario ${user.email}:`, createError);
        }
      } else {
        console.error(`Error al verificar usuario ${user.email}:`, error);
      }
    }
  }
};

export const getUserRole = async (uid: string): Promise<string | null> => {
  try {
    const userDoc = await retryOperation(() => getDoc(doc(firestore, 'users', uid)));
    if (userDoc.exists()) {
      return userDoc.data().role;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
};

export default app;