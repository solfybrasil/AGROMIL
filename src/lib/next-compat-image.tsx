import React from 'react';

export default function Image({ src, alt, className, width, height, ...props }: any) {
  return (
    <img
      src={typeof src === 'string' ? src : src?.src || src}
      alt={alt || ''}
      className={className}
      width={width}
      height={height}
      {...props}
    />
  );
}
