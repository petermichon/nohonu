export function processImageTo4to3(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const targetRatio = 4 / 3;
      const currentRatio = img.width / img.height;

      let cropX: number, cropY: number, cropWidth: number, cropHeight: number;

      if (currentRatio > targetRatio) {
        // Image is wider than 4:3, crop sides
        cropHeight = img.height;
        cropWidth = Math.round(img.height * targetRatio);
        cropX = Math.round((img.width - cropWidth) / 2);
        cropY = 0;
      } else if (currentRatio < targetRatio) {
        // Image is taller than 4:3, crop from top
        cropWidth = img.width;
        cropHeight = Math.round(img.width / targetRatio);
        cropX = 0;
        cropY = 0;
      } else {
        // Already 4:3, no cropping needed
        cropX = 0;
        cropY = 0;
        cropWidth = img.width;
        cropHeight = img.height;
      }

      // Create canvas for cropping
      const canvas = document.createElement('canvas');
      canvas.width = cropWidth;
      canvas.height = cropHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Draw cropped image
      ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to process image'));
            return;
          }
          const processedFile = new File([blob], file.name, { type: 'image/jpeg' });
          resolve(processedFile);
        },
        'image/jpeg',
        0.85
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}
