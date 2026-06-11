import { useState } from 'react';

export default function LazyImage({ src, alt, className, ...props }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      src={src}
      alt={alt}
      className={`${className || ''} ${loaded ? 'loaded' : 'loading'}`.trim()}
      loading="lazy"
      decoding="async"
      onLoad={() => setLoaded(true)}
      {...props}
    />
  );
}
