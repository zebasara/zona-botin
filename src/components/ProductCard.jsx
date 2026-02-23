'use client';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import ImageGallery from './ImageGallery';

export default function ProductCard({ product }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [qty, setQty] = useState(1);
  const [talle, setTalle] = useState('');
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const talles = product.talles || [];
  const disponible = (product.cantidad || 0) > 0;

  const handleAdd = () => {
    if (!talle) {
      addToast({ message: 'Por favor seleccioná un talle', type: 'warning' });
      return;
    }
    if (qty < 1) {
      addToast({ message: 'La cantidad debe ser al menos 1', type: 'warning' });
      return;
    }
    if (qty > product.cantidad) {
      addToast({ message: `Solo hay ${product.cantidad} unidades disponibles`, type: 'warning' });
      return;
    }
    addToCart(product, qty, talle);
    addToast({ message: `✅ ${product.titulo} agregado al carrito`, type: 'success' });
    setModalOpen(false);
    setQty(1);
    setTalle('');
  };

  const openModal = () => {
    setTalle('');
    setQty(1);
    setModalOpen(true);
  };

  return (
    <>
      <article className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-verde-100 transition-all duration-300 hover:-translate-y-1 flex flex-col">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-verde-50 cursor-pointer" onClick={() => setDetailOpen(true)}>
          {product.imagenes?.[0] ? (
            <img
              src={product.imagenes[0]}
              alt={product.titulo}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">⚽</div>
          )}
          {!disponible && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-500 text-white font-bold px-4 py-2 rounded-xl text-sm">SIN STOCK</span>
            </div>
          )}
          {product.imagenes?.length > 1 && (
            <span className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">
              +{product.imagenes.length - 1} fotos
            </span>
          )}
          {product.descuento > 0 && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
              -{product.descuento}%
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-2 flex-1 cursor-pointer hover:text-verde-600 transition-colors" onClick={() => setDetailOpen(true)}>
            {product.titulo}
          </h3>
          {product.marca && (
            <p className="text-xs text-verde-600 font-semibold uppercase tracking-wide mb-2">{product.marca}</p>
          )}
          <p className="text-xs text-gray-400 mb-3">Stock: {product.cantidad || 0} unidades</p>

          <div className="flex items-end justify-between mt-auto">
            <div>
              {product.precioOriginal > product.precio && (
                <p className="text-xs text-gray-400 line-through">${product.precioOriginal?.toLocaleString('es-AR')}</p>
              )}
              <p className="font-display text-2xl text-verde-700">${product.precio?.toLocaleString('es-AR')}</p>
            </div>
            <button
              onClick={openModal}
              disabled={!disponible}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                disponible
                  ? 'bg-verde-500 hover:bg-verde-600 text-white shadow-md hover:shadow-lg active:scale-95'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {disponible ? '+ Agregar' : 'Sin stock'}
            </button>
          </div>
        </div>
      </article>

      {/* Add to cart modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-bounce-in" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-verde-50 border border-verde-100">
                  {product.imagenes?.[0] ? (
                    <img src={product.imagenes[0]} alt={product.titulo} className="w-full h-full object-cover" />
                  ) : <div className="w-full h-full flex items-center justify-center text-3xl">⚽</div>}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 leading-tight">{product.titulo}</h3>
                  {product.marca && <p className="text-sm text-verde-600 font-semibold">{product.marca}</p>}
                  <p className="font-display text-2xl text-verde-700">${product.precio?.toLocaleString('es-AR')}</p>
                </div>
              </div>

              {/* Talles */}
              {talles.length > 0 && (
                <div className="mb-5">
                  <p className="font-bold text-sm text-gray-700 mb-2">Talle <span className="text-red-500">*</span></p>
                  <div className="flex flex-wrap gap-2">
                    {talles.map(t => (
                      <button
                        key={t}
                        onClick={() => setTalle(t)}
                        className={`px-4 py-2 rounded-xl border-2 font-bold text-sm transition-all ${
                          talle === t
                            ? 'border-verde-500 bg-verde-500 text-white'
                            : 'border-verde-200 text-verde-700 hover:border-verde-400'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <p className="font-bold text-sm text-gray-700 mb-2">Cantidad</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 bg-verde-100 hover:bg-verde-200 rounded-xl text-verde-700 font-bold text-xl transition-colors flex items-center justify-center">-</button>
                  <span className="w-12 text-center font-bold text-lg">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.cantidad, q + 1))} className="w-10 h-10 bg-verde-100 hover:bg-verde-200 rounded-xl text-verde-700 font-bold text-xl transition-colors flex items-center justify-center">+</button>
                  <span className="text-xs text-gray-400 ml-2">Máx: {product.cantidad}</span>
                </div>
              </div>

              {/* Subtotal */}
              <div className="bg-verde-50 rounded-2xl px-4 py-3 flex justify-between items-center mb-5">
                <span className="text-gray-600 font-semibold">Subtotal:</span>
                <span className="font-display text-2xl text-verde-700">${(product.precio * qty).toLocaleString('es-AR')}</span>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setModalOpen(false)} className="flex-1 py-3 border-2 border-verde-200 text-verde-700 font-bold rounded-2xl hover:bg-verde-50 transition-colors">
                  Cancelar
                </button>
                <button onClick={handleAdd} className="flex-1 py-3 bg-verde-500 hover:bg-verde-600 text-white font-bold rounded-2xl transition-colors shadow-lg">
                  Agregar al carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {detailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setDetailOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-bounce-in" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="font-bold text-xl text-gray-800 flex-1 pr-4">{product.titulo}</h2>
                <button onClick={() => setDetailOpen(false)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors text-xl flex-shrink-0">×</button>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <ImageGallery images={product.imagenes || []} title={product.titulo} />
                <div>
                  {product.marca && <p className="text-verde-600 font-bold uppercase tracking-widest text-xs mb-2">{product.marca}</p>}
                  <p className="font-display text-4xl text-verde-700 mb-3">${product.precio?.toLocaleString('es-AR')}</p>
                  <div className="bg-verde-50 rounded-xl px-3 py-2 mb-4">
                    <p className="text-sm text-gray-600">Stock disponible: <span className="font-bold text-verde-700">{product.cantidad} unidades</span></p>
                  </div>
                  {product.descripcion && (
                    <div className="mb-4">
                      <p className="font-bold text-sm text-gray-700 mb-1">Descripción</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{product.descripcion}</p>
                    </div>
                  )}
                  {talles.length > 0 && (
                    <div className="mb-4">
                      <p className="font-bold text-sm text-gray-700 mb-2">Talles disponibles</p>
                      <div className="flex flex-wrap gap-2">
                        {talles.map(t => (
                          <span key={t} className="px-3 py-1.5 bg-verde-100 text-verde-700 rounded-xl text-sm font-semibold">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => { setDetailOpen(false); openModal(); }}
                    disabled={!disponible}
                    className={`w-full py-3 rounded-2xl font-bold text-sm transition-all mt-2 ${
                      disponible
                        ? 'bg-verde-500 hover:bg-verde-600 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {disponible ? '🛒 Agregar al carrito' : 'Sin stock'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
