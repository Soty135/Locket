const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dsuztkkmi';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'pawn-shop';

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  created_at: string;
}

export type ImageType = 'id_front' | 'id_back' | 'selfie' | 'device';

export async function uploadImage(
  file: File,
  txnId: string,
  imageType: ImageType,
  index?: number
): Promise<{ url: string; publicId: string }> {
  const fileName = index !== undefined
    ? `${txnId}/${imageType}_${index}`
    : `${txnId}/${imageType}`;

  const compressedFile = await compressImage(file);

  const formData = new FormData();
  formData.append('file', compressedFile);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('public_id', fileName);
  formData.append('folder', 'pawn-shop');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  const data: CloudinaryUploadResponse = await response.json();

  return {
    url: data.secure_url,
    publicId: data.public_id,
  };
}

export async function uploadMultipleImages(
  files: File[],
  txnId: string,
  imageType: ImageType
): Promise<Array<{ url: string; publicId: string }>> {
  const uploads = files.map((file, index) =>
    uploadImage(file, txnId, imageType, index)
  );
  return Promise.all(uploads);
}

export async function deleteImage(publicId: string): Promise<void> {
  const timestamp = Math.round(Date.now() / 1000);
  const signature = await generateSignature(publicId, timestamp);

  const formData = new FormData();
  formData.append('public_id', publicId);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  formData.append('api_key', import.meta.env.VITE_CLOUDINARY_API_KEY || '');

  await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`,
    {
      method: 'POST',
      body: formData,
    }
  );
}

async function generateSignature(publicId: string, timestamp: number): Promise<string> {
  const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;
  if (!apiSecret) {
    console.warn('Cloudinary API secret not set. Using empty signature.');
    return '';
  }

  const paramsString = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(paramsString);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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

export function getImageUrl(publicId: string): string {
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`;
}
