'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Navbar from '@/components/Navbar';

export default function CartPage() {
  const { cart, removeFromCart, updateQty, total, clearCart } = useCart();
  const { user, userData } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', telefono: '', dni: '',
    direccion: '', ciudad: '', provincia: '', codigoPostal: '', nota: '',
  });
  const [loading, setLoading] = useState(false);

  // Pre-fill user data
  useEffect(() => {
    if (userData) {
      setForm(prev => ({
        ...prev,
        nombre:       userData.nombre || '',
        apellido:     userData.apellido || '',
        email:        userData.email || '',
        telefono:     userData.telefono || '',
        dni:          userData.dni || '',
        direccion:    userData.direccion || '',
        ciudad:       userData.ciudad || '',
        provincia:    userData.provincia || '',
        codigoPostal: userData.codigoPostal || '',
      }));
    }
  }, [userData]);

  useEffect(() => {
    if (!user) {
      addToast({ message: 'Debés iniciar sesión para comprar', type: 'warning' });
      router.push('/login');
    }
  }, [user]);

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    if (cart.length === 0) { addToast({ message: 'Tu carrito está vacío', type: 'warning' }); return false; }
    if (!form.nombre.trim())      { addToast({ message: 'Ingresá tu nombre', type: 'warning' }); return false; }
    if (!form.apellido.trim())    { addToast({ message: 'Ingresá tu apellido', type: 'warning' }); return false; }
    if (!form.email.trim())       { addToast({ message: 'Ingresá tu email', type: 'warning' }); return false; }
    if (!form.telefono.trim())    { addToast({ message: 'Ingresá tu teléfono', type: 'warning' }); return false; }
    if (!form.dni.trim())         { addToast({ message: 'Ingresá tu DNI', type: 'warning' }); return false; }
    if (!form.direccion.trim())   { addToast({ message: 'Ingresá tu dirección de envío', type: 'warning' }); return false; }
    if (!form.ciudad.trim())      { addToast({ message: 'Ingresá tu ciudad', type: 'warning' }); return false; }
    if (!form.provincia)          { addToast({ message: 'Seleccioná tu provincia', type: 'warning' }); return false; }
    if (!form.codigoPostal.trim()){ addToast({ message: 'Ingresá tu código postal', type: 'warning' }); return false; }
    return true;
  };

  const handleCheckout = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // Save order in Firestore
      const orderRef = await addDoc(collection(db, 'orders'), {
        buyerUid:    user.uid,
        buyerName:   `${form.nombre} ${form.apellido}`,
        email:       form.email,
        phone:       form.telefono,
        dni:         form.dni,
        address:     form.direccion,
        city:        form.ciudad,
        province:    form.provincia,
        postalCode:  form.codigoPostal,
        nota:        form.nota,
        items:       cart.map(i => ({ product: i.product, qty: i.qty, talle: i.talle })),
        total,
        status:      'pending',
        readByAdmin: false,
        createdAt:   serverTimestamp(),
      });

      // Create MercadoPago preference
      const res = await fetch('/api/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderRef.id,
          items: cart.map(i => ({
            title: `${i.product.titulo} - Talle ${i.talle}`,
            quantity: i.qty,
            unit_price: i.product.precio,
            currency_id: 'ARS',
          })),
          payer: {
            name:    form.nombre,
            surname: form.apellido,
            email:   form.email,
            phone:   { number: form.telefono },
            identification: { type: 'DNI', number: form.dni },
            address: { street_name: form.direccion, zip_code: form.codigoPostal },
          },
        }),
      });

      if (!res.ok) throw new Error('Error al crear preferencia de pago');
      const { init_point } = await res.json();

      clearCart();
      window.location.href = init_point;
    } catch (err) {
      console.error(err);
      addToast({ message: 'Error al procesar el pago. Intentá de nuevo', type: 'error' });
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-white border-2 border-verde-200 rounded-xl focus:border-verde-500 transition-colors text-gray-800 text-sm font-medium placeholder:text-gray-300";
  const labelClass = "block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide";

  if (!user) return null;

  return (
    <div className="min-h-screen bg-verde-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="font-display text-4xl text-verde-800 mb-8">FINALIZAR COMPRA</h1>

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-8xl">🛒</span>
            <p className="text-gray-400 font-semibold mt-4 text-lg">Tu carrito está vacío</p>
            <Link href="/" className="mt-6 inline-block bg-verde-500 text-white font-bold px-8 py-3 rounded-2xl hover:bg-verde-600 transition-colors">
              Ver productos
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact */}
              <div className="bg-white rounded-3xl p-6 border border-verde-100 shadow-sm">
                <h2 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-verde-500 text-white rounded-xl flex items-center justify-center text-sm font-bold">1</span>
                  Datos de contacto
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Nombre *</label>
                    <input type="text" className={inputClass} value={form.nombre} onChange={set('nombre')} placeholder="Juan" />
                  </div>
                  <div>
                    <label className={labelClass}>Apellido *</label>
                    <input type="text" className={inputClass} value={form.apellido} onChange={set('apellido')} placeholder="García" />
                  </div>
                  <div>
                    <label className={labelClass}>Email *</label>
                    <input type="email" className={inputClass} value={form.email} onChange={set('email')} placeholder="tu@email.com" />
                  </div>
                  <div>
                    <label className={labelClass}>Teléfono *</label>
                    <input type="tel" className={inputClass} value={form.telefono} onChange={set('telefono')} placeholder="11 1234-5678" />
                  </div>
                  <div>
                    <label className={labelClass}>DNI *</label>
                    <input type="text" className={inputClass} value={form.dni} onChange={set('dni')} placeholder="12.345.678" />
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div className="bg-white rounded-3xl p-6 border border-verde-100 shadow-sm">
                <h2 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-verde-500 text-white rounded-xl flex items-center justify-center text-sm font-bold">2</span>
                  Dirección de envío
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Dirección (calle y número) *</label>
                    <input type="text" className={inputClass} value={form.direccion} onChange={set('direccion')} placeholder="Av. Corrientes 1234, Piso 3 Dpto B" />
                  </div>
                  <div>
                    <label className={labelClass}>Ciudad *</label>
                    <input type="text" className={inputClass} value={form.ciudad} onChange={set('ciudad')} placeholder="Buenos Aires" />
                  </div>
                  <div>
                    <label className={labelClass}>Código Postal *</label>
                    <input type="text" className={inputClass} value={form.codigoPostal} onChange={set('codigoPostal')} placeholder="1425" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Provincia *</label>
                    <select className={inputClass} value={form.provincia} onChange={set('provincia')}>
                      <option value="">Seleccioná tu provincia</option>
                      {['Buenos Aires','CABA','Córdoba','Santa Fe','Mendoza','Tucumán','Entre Ríos','Salta','Misiones','Chaco','Corrientes','Santiago del Estero','San Juan','Jujuy','Río Negro','Neuquén','Formosa','Chubut','San Luis','Catamarca','La Rioja','La Pampa','Santa Cruz','Tierra del Fuego'].map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Nota para el pedido (opcional)</label>
                    <textarea
                      className={`${inputClass} resize-none`}
                      rows={3}
                      value={form.nota}
                      onChange={set('nota')}
                      placeholder="Horario de entrega, instrucciones especiales..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-6 border border-verde-100 shadow-sm sticky top-24">
                <h2 className="font-bold text-lg text-gray-800 mb-4">Resumen del pedido</h2>
                <div className="space-y-3 mb-4">
                  {cart.map(item => (
                    <div key={item.key} className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-verde-50 border border-verde-100">
                        {item.product.imagenes?.[0] ? (
                          <img src={item.product.imagenes[0]} alt={item.product.titulo} className="w-full h-full object-cover" />
                        ) : <div className="w-full h-full flex items-center justify-center text-xl">⚽</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-700 line-clamp-2">{item.product.titulo}</p>
                        <p className="text-xs text-gray-400">T{item.talle} × {item.qty}</p>
                        <p className="text-sm font-bold text-verde-600">${(item.product.precio * item.qty).toLocaleString('es-AR')}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.key)} className="text-red-400 hover:text-red-600 text-xs">×</button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-verde-100 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>${total.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Envío</span>
                    <span className="text-verde-600 font-semibold">A calcular</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-800 text-lg border-t border-verde-100 pt-2 mt-2">
                    <span>Total</span>
                    <span className="font-display text-2xl text-verde-700">${total.toLocaleString('es-AR')}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full mt-6 bg-[#009ee3] hover:bg-[#008fd4] disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 48 48" fill="currentColor">
                        <path d="M24 4C13 4 4 13 4 24s9 20 20 20 20-9 20-20S35 4 24 4zm-3 27.5l-7-7 2.8-2.8 4.2 4.2 8.2-8.2 2.8 2.8-11 11z"/>
                      </svg>
                      Pagar con Mercado Pago
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-gray-400 mt-3">🔒 Pago 100% seguro y encriptado</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
