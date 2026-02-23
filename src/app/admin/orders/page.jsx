'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import { Suspense } from 'react';

const STATUS_OPTIONS = [
  { value: 'pending',   label: 'Pendiente',  color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'approved',  label: 'Pagado',      color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'shipped',   label: 'Enviado',     color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'delivered', label: 'Entregado',   color: 'bg-verde-100 text-verde-700 border-verde-200' },
  { value: 'cancelled', label: 'Cancelado',   color: 'bg-red-100 text-red-700 border-red-200' },
];

function getStatusInfo(status) {
  return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
}

function OrdersContent() {
  const { user, isAdmin, loading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const params = useSearchParams();
  const highlightId = params.get('id');

  const [orders, setOrders]     = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [filter, setFilter]     = useState('all');
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      addToast({ message: 'Acceso no autorizado', type: 'error' });
      router.push('/');
    }
  }, [user, isAdmin, loading]);

  useEffect(() => {
    if (isAdmin) fetchOrders();
  }, [isAdmin]);

  useEffect(() => {
    if (highlightId && orders.length > 0) {
      const found = orders.find(o => o.id === highlightId);
      if (found) setSelected(found);
    }
  }, [highlightId, orders]);

  const fetchOrders = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      addToast({ message: 'Error al cargar pedidos', type: 'error' });
    } finally {
      setLoadingOrders(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selected?.id === orderId) setSelected(prev => ({ ...prev, status: newStatus }));
      addToast({ message: `Estado actualizado a: ${getStatusInfo(newStatus).label}`, type: 'success' });
    } catch (err) {
      addToast({ message: 'Error al actualizar el estado', type: 'error' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filtered = orders.filter(o => {
    const matchFilter = filter === 'all' || o.status === filter;
    const matchSearch = !search || o.buyerName?.toLowerCase().includes(search.toLowerCase()) || o.email?.toLowerCase().includes(search.toLowerCase()) || o.id?.includes(search);
    return matchFilter && matchSearch;
  });

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-verde-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <Link href="/admin" className="text-xs text-verde-500 hover:underline">← Panel Admin</Link>
            <h1 className="font-display text-4xl text-verde-800 mt-1">GESTIÓN DE PEDIDOS</h1>
          </div>
          <div className="bg-white rounded-2xl border border-verde-100 px-4 py-2 text-sm font-semibold text-gray-600">
            {filtered.length} pedidos encontrados
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-verde-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre, email..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-verde-200 rounded-xl text-sm focus:border-verde-400 transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[{ value: 'all', label: 'Todos' }, ...STATUS_OPTIONS].map(s => (
              <button
                key={s.value}
                onClick={() => setFilter(s.value)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 ${
                  filter === s.value
                    ? 'bg-verde-500 text-white border-verde-500'
                    : 'bg-white border-verde-200 text-verde-700 hover:border-verde-400'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Orders list */}
          <div className="lg:col-span-2 space-y-3">
            {loadingOrders ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-verde-100 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded-lg w-1/3 mb-2" />
                  <div className="h-3 bg-gray-50 rounded-lg w-2/3" />
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-verde-100">
                <span className="text-6xl">📦</span>
                <p className="text-gray-400 font-semibold mt-4">Sin pedidos en esta categoría</p>
              </div>
            ) : (
              filtered.map(order => {
                const statusInfo = getStatusInfo(order.status);
                const isSelected = selected?.id === order.id;
                return (
                  <div
                    key={order.id}
                    onClick={() => setSelected(isSelected ? null : order)}
                    className={`bg-white rounded-2xl border-2 p-5 cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'border-verde-400 shadow-md' : 'border-verde-100 hover:border-verde-300'
                    } ${!order.readByAdmin ? 'border-l-4 border-l-verde-400' : ''}`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-gray-800">{order.buyerName}</p>
                          {!order.readByAdmin && (
                            <span className="w-2 h-2 bg-verde-500 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mb-1">#{order.id.slice(0, 8).toUpperCase()} · {formatDate(order.createdAt)}</p>
                        <p className="text-xs text-gray-500">📍 {order.address}, {order.city}, {order.province} {order.postalCode}</p>
                        <p className="text-xs text-gray-500">📞 {order.phone} · DNI: {order.dni}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {order.items?.map((item, idx) => (
                            <span key={idx} className="text-xs bg-verde-50 text-verde-700 px-2 py-0.5 rounded-lg font-medium border border-verde-100">
                              {item.product?.titulo?.substring(0, 20)}... T{item.talle} ×{item.qty}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-display text-2xl text-verde-700">${order.total?.toLocaleString('es-AR')}</p>
                        <span className={`text-xs px-2.5 py-1 rounded-xl font-bold border inline-block mt-1 ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Detail panel */}
          <div className="lg:sticky lg:top-24 h-fit">
            {selected ? (
              <div className="bg-white rounded-3xl border border-verde-100 shadow-sm overflow-hidden animate-fade-in">
                <div className="bg-verde-600 text-white px-5 py-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">Detalle del pedido</h3>
                      <p className="text-verde-200 text-xs">#{selected.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <button onClick={() => setSelected(null)} className="text-verde-200 hover:text-white text-xl">×</button>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Buyer info */}
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Comprador</p>
                    <p className="font-bold text-gray-800">{selected.buyerName}</p>
                    <p className="text-sm text-gray-500">✉️ {selected.email}</p>
                    <p className="text-sm text-gray-500">📞 {selected.phone}</p>
                    <p className="text-sm text-gray-500">🪪 DNI: {selected.dni}</p>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Dirección de envío</p>
                    <p className="text-sm text-gray-700 font-semibold">{selected.address}</p>
                    <p className="text-sm text-gray-500">{selected.city}, {selected.province}</p>
                    <p className="text-sm text-gray-500">CP: {selected.postalCode}</p>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Productos</p>
                    <div className="space-y-2">
                      {selected.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700 flex-1 pr-2 truncate">{item.product?.titulo} (T{item.talle})</span>
                          <span className="text-gray-400 flex-shrink-0">×{item.qty}</span>
                          <span className="font-bold text-verde-700 ml-3 flex-shrink-0">${(item.product?.precio * item.qty)?.toLocaleString('es-AR')}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t border-gray-100 pt-3 mt-3">
                      <span>Total</span>
                      <span className="text-verde-700">${selected.total?.toLocaleString('es-AR')}</span>
                    </div>
                  </div>

                  {selected.nota && (
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Nota</p>
                      <p className="text-sm text-gray-600 italic bg-gray-50 rounded-xl p-3">{selected.nota}</p>
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Cambiar estado</p>
                    <div className="grid grid-cols-2 gap-2">
                      {STATUS_OPTIONS.map(s => (
                        <button
                          key={s.value}
                          disabled={updatingStatus || selected.status === s.value}
                          onClick={() => updateStatus(selected.id, s.value)}
                          className={`py-2 rounded-xl text-xs font-bold border-2 transition-all disabled:opacity-50 ${
                            selected.status === s.value ? s.color + ' border-current' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 text-center">{formatDate(selected.createdAt)}</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-verde-100 p-8 text-center">
                <span className="text-5xl block mb-3">👆</span>
                <p className="text-gray-400 text-sm font-semibold">Seleccioná un pedido para ver el detalle</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  return <Suspense fallback={null}><OrdersContent /></Suspense>;
}
