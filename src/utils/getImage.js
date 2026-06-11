const imageModules = import.meta.glob('../assets/images/*', {
  eager: true,
  query: '?url',
  import: 'default',
});

export function getImage(filename, { preferWebp = true } = {}) {
  if (!filename) return '';

  if (preferWebp) {
    const webpName = filename.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    const webpPath = `../assets/images/${webpName}`;
    if (imageModules[webpPath]) return imageModules[webpPath];
  }

  const path = `../assets/images/${filename}`;
  if (imageModules[path]) return imageModules[path];

  const svgFallback = filename.replace(/\.(jpg|jpeg|png|webp)$/i, '.svg');
  const svgPath = `../assets/images/${svgFallback}`;
  if (imageModules[svgPath]) return imageModules[svgPath];

  return imageModules['../assets/images/placeholder.svg'] || '';
}
