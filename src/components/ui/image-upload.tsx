
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  images, 
  onImagesChange, 
  maxImages = 10 
}) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    
    try {
      const newImages = [...images];
      
      for (let i = 0; i < files.length; i++) {
        if (newImages.length >= maxImages) break;
        
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        
        // Convert the file to a base64 string
        const base64 = await convertFileToBase64(file);
        newImages.push(base64);
      }
      
      onImagesChange(newImages);
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setUploading(false);
      // Clear the input
      e.target.value = '';
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <AspectRatio ratio={1} className="bg-muted rounded-md overflow-hidden border">
              <img 
                src={image} 
                alt={`Uploaded image ${index + 1}`} 
                className="w-full h-full object-cover"
              />
            </AspectRatio>
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        
        {images.length < maxImages && (
          <label className="cursor-pointer">
            <AspectRatio ratio={1} className="bg-muted rounded-md overflow-hidden border border-dashed border-muted-foreground/50 flex flex-col items-center justify-center">
              <div className="flex flex-col items-center justify-center p-2 text-muted-foreground">
                <UploadCloud className="h-8 w-8 mb-2" />
                <span className="text-xs text-center">
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </span>
              </div>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                disabled={uploading}
                className="hidden"
              />
            </AspectRatio>
          </label>
        )}
      </div>
      
      <div className="text-sm text-muted-foreground">
        {images.length > 0 ? (
          <span>
            {images.length} of {maxImages} images uploaded
          </span>
        ) : (
          <span className="text-destructive font-medium">
            Please upload at least one image
          </span>
        )}
      </div>
    </div>
  );
};

export { ImageUpload };
