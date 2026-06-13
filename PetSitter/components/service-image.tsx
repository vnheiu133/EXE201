"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { DEFAULT_SERVICE_IMAGE, normalizeImageUrl } from "@/lib/image-url";

type ServiceImageProps = {
  src: unknown;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

export function ServiceImage({ src, alt, className, sizes, priority }: ServiceImageProps) {
  const normalizedSrc = normalizeImageUrl(src);
  const [currentSrc, setCurrentSrc] = useState(normalizedSrc);

  useEffect(() => {
    setCurrentSrc(normalizedSrc);
  }, [normalizedSrc]);

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => {
        if (currentSrc !== DEFAULT_SERVICE_IMAGE) {
          setCurrentSrc(DEFAULT_SERVICE_IMAGE);
        }
      }}
    />
  );
}
