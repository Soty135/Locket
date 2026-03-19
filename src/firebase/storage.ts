import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const storage: FirebaseStorage = getStorage(app);

export type ImageType = 'device' | 'id_front' | 'id_back' | 'selfie';

export interface UploadedImage {
  type: ImageType;
  url: string;
  path: string;
  uploadedAt: Date;
}

export async function uploadImage(
  file: File,
  txnId: string,
  imageType: ImageType,
  index?: number
): Promise<UploadedImage> {
  const extension = file.name.split('.').pop() || 'jpg';
  const fileName = index !== undefined 
    ? `${imageType}_${index}.${extension}`
    : `${imageType}.${extension}`;
  
  const storagePath = `loans/${txnId}/${fileName}`;
  const storageRef = ref(storage, storagePath);
  
  const compressedFile = await compressImage(file);
  
  const snapshot = await uploadBytes(storageRef, compressedFile);
  const url = await getDownloadURL(snapshot.ref);
  
  return {
    type: imageType,
    url,
    path: storagePath,
    uploadedAt: new Date(),
  };
}

export async function deleteImage(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

export async function uploadMultipleImages(
  files: File[],
  txnId: string,
  imageType: ImageType
): Promise<UploadedImage[]> {
  const uploads = files.map((file, index) => uploadImage(file, txnId, imageType, index));
  return Promise.all(uploads);
}

async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        let width = img.width;
        let height = img.height;
        
        const maxWidth = 1200;
        const maxHeight = 1200;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            resolve(blob || file);
          },
          'image/jpeg',
          0.8
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
