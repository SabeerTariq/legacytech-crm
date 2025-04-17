
export const removeBackgroundFromImage = async (imageUrl: string): Promise<string | null> => {
  try {
    // Create an image element
    const img = new Image();
    img.src = imageUrl;
    
    // Wait for image to load
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    // Create a canvas to manipulate the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.error('Could not get canvas context');
      return null;
    }

    // Set canvas dimensions to image dimensions
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw the image
    ctx.drawImage(img, 0, 0);

    // Get the image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Detect and remove background (assuming blue background)
    for (let i = 0; i < data.length; i += 4) {
      const red = data[i];
      const green = data[i + 1];
      const blue = data[i + 2];

      // Check if pixel is close to blue background (you may need to adjust these thresholds)
      if (blue > 200 && red < 100 && green < 100) {
        // Make the pixel transparent
        data[i + 3] = 0;
      }
    }

    // Put the modified image data back
    ctx.putImageData(imageData, 0, 0);

    // Convert to transparent PNG
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error removing background:', error);
    return null;
  }
};
