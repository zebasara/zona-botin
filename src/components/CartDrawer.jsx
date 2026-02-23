'use client';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CartDrawer() {
  const { cart, removeFromCart, updateQty, total, count, cartOpen, setCartOpen, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const handleCheckout = () => {
    if (!user) {
      addToast({ message: 'Debés iniciar sesión para comprar', type: 'warning' });
      setCartOpen(false);
      router.push('/login');
      return;
    }
    if (cart.length === 0) {
      addToast({ message: 'Tu carrito está vacío', type: 'warning' });
      return;
    }
    setCartOpen(false);
    router.push('/cart');
  };

  return (
    <>
      {/* Backdrop */}
      {cartOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => setCartOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-verde-600 text-white flex-shrink-0">
          <div>
            <h2 className="font-display text-2xl tracking-wider">MI CARRITO</h2>
            <p className="text-verde-200 text-xs">{count} {count === 1 ? 'artículo' : 'artículos'}</p>
          </div>
          <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-verde-700 rounded-xl transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <span className="text-7xl">🛒</span>
              <p className="text-gray-400 font-semibold">Tu carrito está vacío</p>
              <button onClick={() => setCartOpen(false)} className="text-verde-600 font-bold hover:underline text-sm">
                Ver productos →
              </button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.key} className="flex gap-3 bg-verde-50 rounded-2xl p-3 border border-verde-100">
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-white border border-verde-100">
                  {item.product.imagenes?.[0] ? (
                    <img src={item.product.imagenes[0]} alt={item.product.titulo} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">⚽</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-gray-800 line-clamp-1">{item.product.titulo}</p>
                  <p className="text-xs text-gray-500 mb-1">Talle: {item.talle}</p>
                  <p className="font-bold text-verde-600 text-sm">${item.product.precio?.toLocaleString('es-AR')}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => updateQty(item.key, item.qty - 1)} className="w-7 h-7 bg-white border border-verde-200 rounded-lg text-verde-700 font-bold hover:bg-verde-100 transition-colors text-sm flex items-center justify-center">-</button>
                    <span className="w-6 text-center font-bold text-sm">{item.qty}</span>
                    <button onClick={() => updateQty(item.key, item.qty + 1)} className="w-7 h-7 bg-white border border-verde-200 rounded-lg text-verde-700 font-bold hover:bg-verde-100 transition-colors text-sm flex items-center justify-center">+</button>
                    <button onClick={() => removeFromCart(item.key)} className="ml-auto text-red-400 hover:text-red-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-verde-100 bg-white flex-shrink-0 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-semibold">Total:</span>
              <span className="font-display text-2xl text-verde-700">${total.toLocaleString('es-AR')}</span>
            </div>
            <button onClick={handleCheckout} className="w-full bg-verde-500 hover:bg-verde-600 text-white font-bold py-4 rounded-2xl transition-colors text-lg shadow-lg">
              🛒 Ir a pagar
            </button>
            <button onClick={clearCart} className="w-full text-sm text-red-400 hover:text-red-600 font-semibold transition-colors">
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </>
  );
}
