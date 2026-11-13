'use client';

import React, { useState } from 'react';
import { Play, Layers, Image as ImageIcon } from 'lucide-react';

interface AdCreativeThumbnailProps {
  src?: string;
  adName?: string;
  mediaType?: 'IMAGE' | 'VIDEO' | 'CAROUSEL' | string;
  className?: string;
  isLight?: boolean;
}

export default function AdCreativeThumbnail({
  src,
  adName = 'Ad Creative',
  mediaType = 'IMAGE',
  className = 'h-10 w-10 rounded-lg',
  isLight = false,
}: AdCreativeThumbnailProps) {
  const [hasError, setHasError] = useState(false);

  const cleanName = adName || 'Creative';
  const typeUpper = (mediaType || 'IMAGE').toUpperCase();
  const isVideo = typeUpper.includes('VIDEO') || cleanName.toLowerCase().includes('video');
  const isCarousel = typeUpper.includes('CAROUSEL') || cleanName.toLowerCase().includes('carosole') || cleanName.toLowerCase().includes('carousel');

  // Compute resilient image source
  let resolvedSrc = src?.trim() || '';
  if (resolvedSrc && resolvedSrc.startsWith('http') && !resolvedSrc.startsWith('/api/media-proxy')) {
    resolvedSrc = `/api/media-proxy?url=${encodeURIComponent(resolvedSrc)}&title=${encodeURIComponent(cleanName)}&type=${isVideo ? 'VIDEO' : isCarousel ? 'CAROUSEL' : 'IMAGE'}`;
  } else if (!resolvedSrc) {
    resolvedSrc = `/api/media-proxy?title=${encodeURIComponent(cleanName)}&type=${isVideo ? 'VIDEO' : isCarousel ? 'CAROUSEL' : 'IMAGE'}`;
  }

  // Fallback badge if image load completely fails
  if (hasError) {
    return (
      <div
        className={`${className} shrink-0 flex flex-col items-center justify-center relative overflow-hidden border shadow-xs ${
          isVideo
            ? 'bg-gradient-to-br from-purple-600 to-pink-600 border-purple-400/40 text-white'
            : isCarousel
            ? 'bg-gradient-to-br from-blue-600 to-cyan-600 border-blue-400/40 text-white'
            : 'bg-gradient-to-br from-emerald-600 to-teal-700 border-emerald-400/40 text-white'
        }`}
        title={`${cleanName} (${isVideo ? 'Video Ad' : isCarousel ? 'Carousel' : 'Image Ad'})`}
      >
        {isVideo ? (
          <Play className="h-4 w-4 fill-white text-white opacity-95 ml-0.5" />
        ) : isCarousel ? (
          <Layers className="h-4 w-4 text-white opacity-95" />
        ) : (
          <ImageIcon className="h-4 w-4 text-white opacity-95" />
        )}
        <span className="text-[7px] font-black uppercase tracking-wider mt-0.5 opacity-90 leading-none">
          {isVideo ? 'VIDEO' : isCarousel ? 'CARO' : 'AD'}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative shrink-0 overflow-hidden ${className} border ${isLight ? 'border-slate-200 bg-slate-100' : 'border-slate-800 bg-slate-900'}`}>
      <img
        src={resolvedSrc}
        alt={cleanName}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onError={() => setHasError(true)}
        className="h-full w-full object-cover"
        loading="lazy"
      />
      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/25 pointer-events-none">
          <div className="h-4 w-4 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-xs">
            <Play className="h-2.5 w-2.5 fill-white text-white ml-0.5" />
          </div>
        </div>
      )}
      {isCarousel && (
        <div className="absolute top-1 right-1 rounded bg-black/60 p-0.5 pointer-events-none">
          <Layers className="h-2.5 w-2.5 text-white" />
        </div>
      )}
    </div>
  );
}
