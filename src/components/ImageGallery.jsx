'use client';
import { useState } from 'react';

export default function ImageGallery({ images = [], title = '' }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!images.length) {
    return (
      <div className="aspect-square bg-verde-100 rounded-2xl flex items-center justify-center">
        <span className="text-6xl">⚽</span>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {/* Main image */}
        <div
          className="aspect-square rounded-2xl overflow-hidden bg-white border border-verde-100 cursor-zoom-in shadow-md group"
          onClick={() => setLightbox(true)}
        >
          <img
            src={images[active]}
            alt={`${title} - imagen ${active + 1}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                  active === i ? 'border-verde-500 shadow-md scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <div className="relative max-w-3xl max-h-full w-full" onClick={e => e.stopPropagation()}>
            <img
              src={images[active]}
              alt={title}
              className="w-full max-h-[85vh] object-contain rounded-xl"
            />
            <button
              onClick={() => setLightbox(false)}
              className="absolute top-3 right-3 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full text-white font-bold transition-colors flex items-center justify-center text-xl"
            >
              ×
            </button>
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActive(a => (a - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full text-white font-bold transition-colors flex items-center justify-center"
                >‹</button>
                <button
                  onClick={() => setActive(a => (a + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full text-white font-bold transition-colors flex items-center justify-center"
                >›</button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
