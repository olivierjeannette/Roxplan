/**
 * Mapping des icones SVG pour les elements fitness.
 * Chaque icon reference correspond a un fichier dans /public/icons/elements/
 */

const ICON_BASE_PATH = '/icons/elements';

export function getIconPath(iconRef: string): string {
  return `${ICON_BASE_PATH}/${iconRef}.svg`;
}

/**
 * Precharge une image SVG et retourne un HTMLImageElement
 * Utilise pour le rendu dans Konva
 */
export function loadIconImage(iconRef: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = getIconPath(iconRef);
  });
}

/**
 * Cache d'images pour eviter les rechargements
 */
const imageCache = new Map<string, HTMLImageElement>();

export async function getCachedIcon(iconRef: string): Promise<HTMLImageElement> {
  if (imageCache.has(iconRef)) {
    return imageCache.get(iconRef)!;
  }
  const img = await loadIconImage(iconRef);
  imageCache.set(iconRef, img);
  return img;
}

export function clearIconCache(): void {
  imageCache.clear();
}
