import { collection, addDoc, updateDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firestore, storage } from './firebase';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const retryOperation = async (operation: () => Promise<any>, retries = MAX_RETRIES): Promise<any> => {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0 && (error.code === 'unavailable' || error.code === 'network-request-failed')) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return retryOperation(operation, retries - 1);
    }
    throw error;
  }
};

export const crearEntrega = async (data: any) => {
  try {
    const entregaRef = await retryOperation(() => addDoc(collection(firestore, 'entregas'), {
      cliente: data.cliente,
      fechaEntrega: data.fechaEntrega,
      observaciones: data.observaciones,
      createdAt: new Date(),
      valor: 25000, // Valor base sin IVA
    }));

    const uploadFile = async (file: File, path: string) => {
      if (file) {
        const fileRef = ref(storage, `entregas/${entregaRef.id}/${path}`);
        await retryOperation(() => uploadBytes(fileRef, file));
        return await retryOperation(() => getDownloadURL(fileRef));
      }
      return null;
    };

    const [facturaUrl, fichaEntregaUrl, packingListUrl, documentoTimbradoUrl] = await Promise.all([
      uploadFile(data.factura[0], 'factura'),
      uploadFile(data.fichaEntrega[0], 'fichaEntrega'),
      uploadFile(data.packingList[0], 'packingList'),
      uploadFile(data.documentoTimbrado[0], 'documentoTimbrado'),
    ]);

    await retryOperation(() => updateDoc(entregaRef, {
      facturaUrl,
      fichaEntregaUrl,
      packingListUrl,
      documentoTimbradoUrl,
    }));

    return entregaRef.id;
  } catch (error) {
    console.error('Error al crear entrega:', error);
    throw error;
  }
};

export const getEntregas = async () => {
  try {
    const entregasRef = collection(firestore, 'entregas');
    const q = query(entregasRef, orderBy('createdAt', 'desc'));
    const snapshot = await retryOperation(() => getDocs(q));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error al obtener entregas:', error);
    throw error;
  }
};