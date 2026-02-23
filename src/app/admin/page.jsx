'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, getCountFromServer } from 'firebase/firestore';
import Navbar from '@/components/Navbar';

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, pendingOrders: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      addToast({ message: 'Acceso no autorizado', type: 'error' });
      router.push('/');
    }
  }, [user, isAdmin, loading]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchStats();
  }, [isAdmin]);

  const fetchStats = async () => {
    try {
      const [prodSnap, ordersSnap] = await Promise.all([
        getCountFromServer(collection(db, 'products')),
        getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(10))),
      ]);

      const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const revenue = orders.filter(o => o.status === 'approved').reduce((s, o) => s + (o.total || 0), 0);
      const pending = orders.filter(o => o.status === 'pending').length;

      setStats({
        products:     prodSnap.data().count,
        orders:       orders.length,
        revenue,
        pendingOrders: pending,
      });
      setRecentOrders(orders);
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  if (loading || !isAdmin) return null;

  const statCards = [
    { label: 'Productos', value: stats.products, icon: '👟', color: 'bg-blue-50 border-blue-200', textColor: 'text-blue-700', link: '/admin/products' },
    { label: 'Pedidos recientes', value: stats.orders, icon: '📦', color: 'bg-purple-50 border-purple-200', textColor: 'text-purple-700', link: '/admin/orders' },
    { label: 'Pedidos pendientes', value: stats.pendingOrders, icon: '⏳', color: 'bg-yellow-50 border-yellow-200', textColor: 'text-yellow-700', link: '/admin/orders' },
    { label: 'Ingresos (aprobados)', value: `$${stats.revenue.toLocaleString('es-AR')}`, icon: '💰', color: 'bg-verde-50 border-verde-200', textColor: 'text-verde-700', link: '/admin/orders' },
  ];

  return (
    <div className="min-h-screen bg-verde-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-5xl text-verde-800">PANEL ADMIN</h1>
            <p className="text-gray-500 mt-1">Gestión de Zona Botín</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/products" className="bg-verde-500 hover:bg-verde-600 text-white font-bold px-5 py-2.5 rounded-xl transition-colors shadow-md text-sm">
              + Nuevo producto
            </Link>
            <Link href="/admin/orders" className="border-2 border-verde-300 text-verde-700 font-bold px-5 py-2.5 rounded-xl hover:bg-verde-100 transition-colors text-sm">
              Ver pedidos
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(card => (
            <Link key={card.label} href={card.link} className={`${card.color} border-2 rounded-3xl p-5 hover:shadow-md transition-shadow`}>
              {statsLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-8 w-8 bg-gray-200 rounded-xl" />
                  <div className="h-6 bg-gray-200 rounded-lg" />
                  <div className="h-4 bg-gray-100 rounded-lg w-2/3" />
                </div>
              ) : (
                <>
                  <span className="text-3xl block mb-2">{card.icon}</span>
                  <p className={`font-display text-3xl ${card.textColor}`}>{card.value}</p>
                  <p className="text-gray-500 text-xs font-semibold mt-1">{card.label}</p>
                </>
              )}
            </Link>
          ))}
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-3xl border border-verde-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-verde-100 flex justify-between items-center">
            <h2 className="font-bold text-gray-800">Pedidos recientes</h2>
            <Link href="/admin/orders" className="text-sm text-verde-600 font-semibold hover:underline">Ver todos →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders.length === 0 ? (
              <p className="text-center text-gray-400 py-10">Sin pedidos aún</p>
            ) : (
              recentOrders.map(order => (
                <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-verde-50 transition-colors">
                  <div>
                    <p className="font-bold text-sm text-gray-800">{order.buyerName}</p>
                    <p className="text-xs text-gray-400">📍 {order.city}, {order.province}</p>
                    <p className="text-xs text-gray-400">📞 {order.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-verde-700">${order.total?.toLocaleString('es-AR')}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold inline-block mt-1 ${
                      order.status === 'approved' ? 'bg-green-100 text-green-700' :
                      order.status === 'pending'  ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {order.status === 'approved' ? 'Pagado' : order.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
