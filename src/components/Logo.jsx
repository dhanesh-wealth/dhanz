import { getImage } from '../utils/getImage';
import { useColorScheme } from '../utils/useColorScheme';

export default function Logo({ data, className = '', alt }) {
  const scheme = useColorScheme();
  const filename = scheme === 'dark' ? (data.logoDark || data.logo) : data.logo;
  const src = getImage(filename, { preferWebp: false });

  return (
    <img
      src={src}
      alt={alt || `${data.site.name} logo`}
      className={className}
    />
  );
}
