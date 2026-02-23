'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import CartDrawer from './CartDrawer';

export default function Navbar() {
  const { user, userData, isAdmin, logout } = useAuth();
  const { count, setCartOpen } = useCart();
  const { addToast } = useToast();
  const router = useRouter();

  const [menuOpen, setMenuOpen]     = useState(false);
  const [notifOpen, setNotifOpen]   = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);
  const prevOrderIds = useRef(new Set());

  // Admin: listen to new orders
  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(20));
    const unsub = onSnapshot(q, (snap) => {
      const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const newOrders = orders.filter(o => !prevOrderIds.current.has(o.id) && o.status === 'pending');
      if (prevOrderIds.current.size > 0 && newOrders.length > 0) {
        newOrders.forEach(o => {
          addToast({ message: `🛒 Nueva venta de ${o.buyerName} — $${o.total?.toLocaleString('es-AR')}`, type: 'success', duration: 8000 });
        });
      }
      newOrders.forEach(o => prevOrderIds.current.add(o.id));
      orders.forEach(o => prevOrderIds.current.add(o.id));
      setNotifications(orders);
      setUnreadCount(orders.filter(o => !o.readByAdmin).length);
    });
    return unsub;
  }, [isAdmin, addToast]);

  // Close notif on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    addToast({ message: 'Sesión cerrada correctamente', type: 'info' });
    router.push('/');
    setMenuOpen(false);
  };

  const markAsRead = async (orderId) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { readByAdmin: true });
    } catch {}
  };

  const openNotif = () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen) {
      notifications.filter(n => !n.readByAdmin).forEach(n => markAsRead(n.id));
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 glass border-b border-verde-200 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-verde-500 rounded-xl flex items-center justify-center shadow-md group-hover:bg-verde-600 transition-colors">
                <span className="text-white text-xl">⚽</span>
              </div>
              <span className="font-display text-2xl text-verde-700 tracking-wider">ZONA BOTÍN</span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-verde-700 hover:text-verde-500 font-semibold transition-colors text-sm">
                Inicio
              </Link>
              <Link href="/#productos" className="text-verde-700 hover:text-verde-500 font-semibold transition-colors text-sm">
                Productos
              </Link>
              {user && (
                <Link href="/#nosotros" className="text-verde-700 hover:text-verde-500 font-semibold transition-colors text-sm">
                  Nosotros
                </Link>
              )}
              {isAdmin && (
                <Link href="/admin" className="text-white bg-verde-600 hover:bg-verde-700 px-4 py-1.5 rounded-lg font-semibold transition-colors text-sm">
                  Panel Admin
                </Link>
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Cart */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 text-verde-700 hover:text-verde-500 hover:bg-verde-100 rounded-xl transition-all"
                aria-label="Carrito"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-verde-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce-in">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </button>

              {/* Admin Notifications */}
              {isAdmin && (
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={openNotif}
                    className="relative p-2 text-verde-700 hover:text-verde-500 hover:bg-verde-100 rounded-xl transition-all"
                    aria-label="Notificaciones"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-verde-100 animate-fade-in overflow-hidden">
                      <div className="px-4 py-3 bg-verde-600 text-white">
                        <h3 className="font-bold text-sm">🛒 Notificaciones de Ventas</h3>
                        <p className="text-verde-200 text-xs">{notifications.length} pedidos recientes</p>
                      </div>
                      <div className="max-h-[440px] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="text-center text-gray-400 py-8 text-sm">Sin pedidos aún</p>
                        ) : (
                          notifications.map(order => (
                            <div
                              key={order.id}
                              className={`p-4 border-b border-gray-100 hover:bg-verde-50 transition-colors ${!order.readByAdmin ? 'bg-verde-50 border-l-4 border-l-verde-400' : ''}`}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <p className="font-bold text-sm text-gray-800">{order.buyerName}</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                  order.status === 'approved' ? 'bg-green-100 text-green-700' :
                                  order.status === 'pending'  ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {order.status === 'approved' ? 'Pagado' : order.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mb-1">📍 {order.address}, {order.city}, {order.province} ({order.postalCode})</p>
                              <p className="text-xs text-gray-500 mb-1">📞 {order.phone} · DNI: {order.dni}</p>
                              <div className="text-xs text-gray-600 mb-2">
                                {order.items?.map((item, idx) => (
                                  <span key={idx} className="inline-block bg-gray-100 rounded px-1.5 py-0.5 mr-1 mb-1">
                                    {item.product?.titulo} T{item.talle} x{item.qty}
                                  </span>
                                ))}
                              </div>
                              <div className="flex justify-between items-center">
                                <p className="font-bold text-verde-600 text-sm">${order.total?.toLocaleString('es-AR')}</p>
                                <Link
                                  href={`/admin/orders?id=${order.id}`}
                                  className="text-xs text-verde-600 hover:underline"
                                  onClick={() => setNotifOpen(false)}
                                >
                                  Ver detalle →
                                </Link>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-3 border-t border-gray-100 text-center">
                        <Link href="/admin/orders" onClick={() => setNotifOpen(false)} className="text-sm text-verde-600 font-semibold hover:underline">
                          Ver todos los pedidos →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-verde-100 hover:bg-verde-200 rounded-xl transition-all"
                  >
                    <div className="w-7 h-7 bg-verde-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                      {(userData?.nombre || user.email)?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-verde-700 font-semibold text-sm hidden sm:block">
                      {userData?.nombre || 'Usuario'}
                    </span>
                    <svg className={`w-4 h-4 text-verde-600 transition-transform ${menuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-verde-100 animate-fade-in overflow-hidden">
                      {isAdmin && (
                        <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-verde-700 hover:bg-verde-50 font-semibold border-b border-gray-100">
                          🛠️ Panel Admin
                        </Link>
                      )}
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-semibold">
                        🚪 Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="hidden sm:block text-verde-700 hover:text-verde-500 font-semibold text-sm transition-colors">
                    Iniciar sesión
                  </Link>
                  <Link href="/register" className="bg-verde-500 hover:bg-verde-600 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors shadow-md">
                    Registrarse
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 text-verde-700 hover:bg-verde-100 rounded-xl transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                </svg>
              </button>
            </div>
          </div>
        </nav>
      </header>

      <CartDrawer />
    </>
  );
}
