'use client';
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';

const MARCAS = ['Todas', 'Nike', 'Adidas', 'Puma', 'New Balance', 'Mizuno', 'Umbro'];

export default function HomePage() {
  const [products, setProducts]  = useState([]);
  const [loading, setLoading]    = useState(true);
  const [search, setSearch]      = useState('');
  const [marcaFilter, setMarca]  = useState('Todas');
  const [sortBy, setSort]        = useState('newest');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')));
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Error cargando productos:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = products
    .filter(p => {
      const matchSearch = !search || p.titulo?.toLowerCase().includes(search.toLowerCase()) || p.marca?.toLowerCase().includes(search.toLowerCase());
      const matchMarca  = marcaFilter === 'Todas' || p.marca === marcaFilter;
      return matchSearch && matchMarca;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc')  return (a.precio || 0) - (b.precio || 0);
      if (sortBy === 'price-desc') return (b.precio || 0) - (a.precio || 0);
      return 0;
    });

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative hero-grain overflow-hidden bg-gradient-to-br from-verde-600 via-verde-700 to-verde-900 py-20 md:py-32">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-verde-500/30 rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-verde-400/20 rounded-full -translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-verde-500/10 rounded-full" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-verde-300 font-semibold uppercase tracking-[0.3em] text-sm mb-4">⚽ Tu tienda de referencia</p>
          <h1 className="font-display text-6xl sm:text-8xl md:text-9xl text-white leading-none mb-6">
            ZONA<br />
            <span className="text-verde-300">BOTÍN</span>
          </h1>
          <p className="text-verde-100 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            Los mejores botines de fútbol al mejor precio. Nike, Adidas, Puma y más marcas te esperan.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#productos"
              className="bg-white text-verde-700 font-bold px-8 py-4 rounded-2xl hover:bg-verde-50 transition-all shadow-xl hover:shadow-2xl active:scale-95"
            >
              Ver productos 👟
            </a>
            <a
              href="#nosotros"
              className="border-2 border-verde-300 text-white font-bold px-8 py-4 rounded-2xl hover:bg-verde-700/50 transition-all"
            >
              Conocenos
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { num: '500+', label: 'Modelos' },
              { num: '10K+', label: 'Clientes' },
              { num: '100%', label: 'Seguro' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="font-display text-3xl text-white">{s.num}</p>
                <p className="text-verde-300 text-xs uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands marquee */}
      <div className="bg-verde-600 py-3 overflow-hidden border-y border-verde-500">
        <div className="flex gap-8 animate-[marquee_20s_linear_infinite]" style={{ width: 'max-content' }}>
          {[...Array(3)].flatMap(() => ['⚽ NIKE', '⚽ ADIDAS', '⚽ PUMA', '⚽ NEW BALANCE', '⚽ MIZUNO', '⚽ UMBRO']).map((b, i) => (
            <span key={i} className="text-verde-200 font-display text-xl tracking-widest whitespace-nowrap">{b}</span>
          ))}
        </div>
      </div>

      {/* Products Section */}
      <section id="productos" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-verde-500 font-semibold uppercase tracking-widest text-sm mb-2">Catálogo</p>
          <h2 className="font-display text-5xl text-verde-800">NUESTROS PRODUCTOS</h2>
          <div className="w-16 h-1.5 bg-verde-500 rounded-full mx-auto mt-4" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-verde-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-verde-200 rounded-xl focus:border-verde-400 transition-colors text-sm font-medium"
            />
          </div>

          {/* Marca filter */}
          <div className="flex gap-2 flex-wrap">
            {MARCAS.map(m => (
              <button
                key={m}
                onClick={() => setMarca(m)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  marcaFilter === m
                    ? 'bg-verde-500 text-white shadow-md'
                    : 'bg-white text-verde-700 border-2 border-verde-200 hover:border-verde-400'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSort(e.target.value)}
            className="px-4 py-2.5 bg-white border-2 border-verde-200 rounded-xl focus:border-verde-400 transition-colors text-sm font-medium text-verde-700 ml-auto"
          >
            <option value="newest">Más recientes</option>
            <option value="price-asc">Menor precio</option>
            <option value="price-desc">Mayor precio</option>
          </select>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-gray-500 mb-6">
            {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'} encontrados
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-verde-100" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-verde-100 rounded-lg" />
                  <div className="h-4 bg-verde-50 rounded-lg w-2/3" />
                  <div className="h-8 bg-verde-100 rounded-lg w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-8xl">⚽</span>
            <p className="text-gray-400 font-semibold mt-4 text-lg">No se encontraron productos</p>
            <button onClick={() => { setSearch(''); setMarca('Todas'); }} className="mt-4 text-verde-600 font-bold hover:underline">
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Why us */}
      <section id="nosotros" className="bg-verde-700 py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-display text-5xl text-white mb-12">¿POR QUÉ ELEGIRNOS?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🚀', title: 'Envío Rápido', desc: 'Despachamos en 24/48hs a todo el país con seguimiento en tiempo real.' },
              { icon: '💳', title: 'Pago Seguro', desc: 'Pagá con tarjeta, transferencia o efectivo a través de Mercado Pago.' },
              { icon: '⭐', title: 'Calidad Garantizada', desc: '100% calidad Premium y con garantía. Si no estás conforme, te devolvemos el dinero.' },
            ].map(item => (
              <div key={item.title} className="bg-verde-800/50 backdrop-blur rounded-3xl p-8 border border-verde-600 hover:border-verde-400 transition-colors">
                <span className="text-5xl block mb-4">{item.icon}</span>
                <h3 className="font-display text-2xl text-white mb-3">{item.title}</h3>
                <p className="text-verde-300 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-verde-900 text-verde-300 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-verde-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">⚽</span>
              </div>
              <span className="font-display text-3xl text-white">ZONA BOTÍN</span>
            </div>
            <p className="text-verde-500 text-sm">© {new Date().getFullYear()} Zona Botín. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}
