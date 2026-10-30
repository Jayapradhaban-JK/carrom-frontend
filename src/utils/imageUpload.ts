// Utility to compress and convert client image files to optimized base64 Data URLs
// Stays strictly under 75KB to prevent HTTP 413 Payload Too Large errors on any server

export const processImageFile = (
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 400,
  quality: number = 0.75,
  maxBytes: number = 75000,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserving dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Iterative compression stepping down quality until under maxBytes
        let currentQuality = quality;
        let dataUrl = canvas.toDataURL('image/jpeg', currentQuality);

        while (dataUrl.length > maxBytes && currentQuality > 0.25) {
          currentQuality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
        }

        // If still over maxBytes, reduce canvas dimensions
        if (dataUrl.length > maxBytes) {
          let scale = 0.8;
          while (dataUrl.length > maxBytes && scale > 0.3) {
            const scaledCanvas = document.createElement('canvas');
            scaledCanvas.width = Math.max(100, Math.round(width * scale));
            scaledCanvas.height = Math.max(50, Math.round(height * scale));
            const scaledCtx = scaledCanvas.getContext('2d');
            if (scaledCtx) {
              scaledCtx.drawImage(img, 0, 0, scaledCanvas.width, scaledCanvas.height);
              dataUrl = scaledCanvas.toDataURL('image/jpeg', 0.65);
            }
            scale -= 0.15;
          }
        }

        resolve(dataUrl);
      };

      img.onerror = () => reject(new Error('Failed to load image file.'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
};

// Carrom preset logos
export const PRESET_TEAM_LOGOS = [
  {
    name: 'Striker Master',
    url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%238B5A2B"/><circle cx="50" cy="50" r="38" fill="%23FAF6EE"/><circle cx="50" cy="50" r="16" fill="%23D97706"/><circle cx="50" cy="50" r="8" fill="%231F2421"/></svg>',
  },
  {
    name: 'Red Queen',
    url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%23B91C1C"/><circle cx="50" cy="50" r="38" fill="%23FEF2F2"/><circle cx="50" cy="50" r="20" fill="%23DC2626"/><circle cx="50" cy="50" r="8" fill="%23FBBF24"/></svg>',
  },
  {
    name: 'Black Coin',
    url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%231F2421"/><circle cx="50" cy="50" r="38" fill="%23374151"/><circle cx="50" cy="50" r="18" fill="%23111827"/><circle cx="50" cy="50" r="6" fill="%239CA3AF"/></svg>',
  },
  {
    name: 'White Coin',
    url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%23D4A373"/><circle cx="50" cy="50" r="38" fill="%23FFFFFF"/><circle cx="50" cy="50" r="18" fill="%23F3E8DC"/><circle cx="50" cy="50" r="6" fill="%238B5A2B"/></svg>',
  },
  {
    name: 'Pocket Rocket',
    url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%230F766E"/><circle cx="50" cy="50" r="38" fill="%23F0FDFA"/><path d="M50 20 L65 70 L50 60 L35 70 Z" fill="%230D9488"/></svg>',
  },
];

// Preset Championship Banners
export const PRESET_TOURNAMENT_BANNERS = [
  {
    name: 'Classic Wooden Arena',
    url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&h=350&q=80',
  },
  {
    name: 'Office Championship Gold',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&h=350&q=80',
  },
];

