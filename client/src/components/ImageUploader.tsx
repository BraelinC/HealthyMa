import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, Image as ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
}

export function ImageUploader({ onImagesChange, maxImages = 4, className = "" }: ImageUploaderProps) {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate optimal dimensions (max 1200px width/height)
        const maxSize = 1200;
        let { width, height } = img;
        
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.8); // 80% quality for fast uploads
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      // Compress image for faster upload
      const compressedFile = await compressImage(file);
      
      // Get upload URL from backend
      const response = await fetch('/api/objects/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadURL } = await response.json();

      // Upload compressed file for much faster transfer
      const uploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: compressedFile,
        headers: {
          'Content-Type': compressedFile.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      // Return the object path that can be accessed via our server
      const url = new URL(uploadURL);
      const objectPath = url.pathname;
      const objectId = objectPath.split('/').pop()?.split('?')[0];
      
      const serverPath = `/objects/uploads/${objectId}`;
      console.log('Upload successful. Server path:', serverPath);
      return serverPath;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (selectedImages.length + files.length > maxImages) {
      toast({
        title: "Too many images",
        description: `You can only upload up to ${maxImages} images.`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const newImages: string[] = [];
    const previewImages: string[] = [];

    try {
      // Create instant previews while uploading
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: "Please select only image files.",
            variant: "destructive",
          });
          continue;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: "Please select images smaller than 10MB.",
            variant: "destructive",
          });
          continue;
        }

        // Create instant preview URL for immediate display
        const previewURL = URL.createObjectURL(file);
        previewImages.push(previewURL);
      }

      // Show previews immediately for better UX
      if (previewImages.length > 0) {
        const tempImages = [...selectedImages, ...previewImages];
        setSelectedImages(tempImages);
        onImagesChange(tempImages);
      }

      // Upload images in parallel for faster processing
      const uploadPromises = Array.from(files).map(file => {
        if (file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024) {
          return uploadImage(file);
        }
        return null;
      }).filter(Boolean);

      const uploadResults = await Promise.all(uploadPromises as Promise<string>[]);
      
      // Replace preview URLs with actual upload URLs
      const finalImages = [...selectedImages, ...uploadResults];
      setSelectedImages(finalImages);
      onImagesChange(finalImages);

      // Clean up preview URLs to prevent memory leaks
      previewImages.forEach(url => URL.revokeObjectURL(url));

      if (uploadResults.length > 0) {
        toast({
          title: "Images uploaded",
          description: `${uploadResults.length} image(s) ready to share.`,
        });
      }
    } catch (error) {
      // Clean up preview URLs on error
      previewImages.forEach(url => URL.revokeObjectURL(url));
      
      toast({
        title: "Upload failed",
        description: "Failed to upload one or more images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`${className}`}>
      {/* Upload Button */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={openFileSelector}
          disabled={uploading || selectedImages.length >= maxImages}
          className="text-gray-400 hover:text-white p-2"
        >
          <Camera className="w-5 h-5" />
        </Button>
        {selectedImages.length > 0 && (
          <span className="text-sm text-gray-400">
            {uploading ? 'Uploading...' : `${selectedImages.length}/${maxImages} images`}
          </span>
        )}
        {uploading && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
        )}
      </div>

      {/* Image Preview Grid */}
      {selectedImages.length > 0 && (
        <div className="mt-3">
          <div className="flex flex-wrap gap-2">
            {selectedImages.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={imageUrl}
                  alt={`Upload ${index + 1}`}
                  className="w-16 h-16 object-cover rounded-lg bg-gray-700"
                  onError={(e) => {
                    // Fallback for broken images
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                  }}
                />
                <div className="hidden fallback-icon absolute inset-0 flex items-center justify-center bg-gray-700 rounded-lg">
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {uploading && (
        <div className="text-center py-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-sm text-gray-400 mt-1">Uploading images...</p>
        </div>
      )}

      {/* Hidden file input for gallery selection */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />
    </div>
  );
}