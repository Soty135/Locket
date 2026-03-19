import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn } from 'lucide-react';

interface ImageGalleryProps {
  images: Array<{ url: string; label?: string }>;
  title?: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      
      if (e.key === 'Escape') {
        setSelectedIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setSelectedIndex((prev) => 
          prev !== null ? (prev === 0 ? images.length - 1 : prev - 1) : null
        );
      } else if (e.key === 'ArrowRight') {
        setSelectedIndex((prev) => 
          prev !== null ? (prev === images.length - 1 ? 0 : prev + 1) : null
        );
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, images.length]);

  if (images.length === 0) return null;

  return (
    <>
      <div className="space-y-2">
        {title && (
          <h4 className="font-medium text-gray-900">{title}</h4>
        )}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100 hover:ring-2 hover:ring-blue-500 transition-all"
            >
              <img
                src={image.url}
                alt={image.label || `Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {selectedIndex !== null && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedIndex(null)}
        >
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1);
            }}
            className="absolute left-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1);
            }}
            className="absolute right-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <div 
            className="max-w-4xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[selectedIndex].url}
              alt={images[selectedIndex].label || `Image ${selectedIndex + 1}`}
              className="w-full h-full object-contain max-h-[80vh]"
            />
            {images[selectedIndex].label && (
              <p className="text-center text-white mt-4 text-lg">
                {images[selectedIndex].label}
              </p>
            )}
            <p className="text-center text-white/60 mt-2 text-sm">
              {selectedIndex + 1} / {images.length}
            </p>
          </div>

          <a
            href={images[selectedIndex].url}
            download
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </a>
        </div>
      )}
    </>
  );
}

interface ImageGridProps {
  devicePhotos: string[];
  idFront?: string;
  idBack?: string;
  selfie?: string;
}

export function ImageGrid({ devicePhotos, idFront, idBack, selfie }: ImageGridProps) {
  const deviceImages = devicePhotos.map((url, i) => ({ url, label: `Device ${i + 1}` }));
  const idImages = [
    idFront && { url: idFront, label: 'ID Front' },
    idBack && { url: idBack, label: 'ID Back' },
  ].filter(Boolean) as Array<{ url: string; label: string }>;
  const selfieImage = selfie ? [{ url: selfie, label: 'Customer Selfie' }] : [];

  const allImages = [...deviceImages, ...idImages, ...selfieImage];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ZoomIn className="w-5 h-5 text-gray-400" />
        <span className="text-sm text-gray-500">{allImages.length} images uploaded</span>
      </div>

      {deviceImages.length > 0 && (
        <ImageGallery images={deviceImages} title="Device Photos" />
      )}

      {idImages.length > 0 && (
        <ImageGallery images={idImages} title="ID Verification" />
      )}

      {selfieImage.length > 0 && (
        <ImageGallery images={selfieImage} title="Customer Selfie" />
      )}
    </div>
  );
}
