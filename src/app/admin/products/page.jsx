'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, orderBy, query, serverTimestamp } from 'firebase/firestore';
import Navbar from '@/components/Navbar';

const MARCAS = ['Nike', 'Adidas', 'Puma', 'New Balance', 'Mizuno', 'Umbro', 'Otra'];
const TALLES_DEFAULT = ['35','36','37','38','39','40','41','42','43','44','45','46'];

const EMPTY_FORM = {
  titulo: '', descripcion: '', marca: '', precio: '', precioOriginal: '',
  descuento: '', cantidad: '', talles: [], categoria: '',
};

async function uploadToCloudinary(file) {
  const cloudName    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) throw new Error('Cloudinary no está configurado en .env.local');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'zona-botin/products');

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Error al subir imagen a Cloudinary');
  const data = await res.json();
  return { url: data.secure_url, publicId: data.public_id };
}

export default function AdminProductsPage() {
  const { user, isAdmin, loading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const [products, setProducts]           = useState([]);
  const [showForm, setShowForm]           = useState(false);
  const [editing, setEditing]             = useState(null);
  const [form, setForm]                   = useState(EMPTY_FORM);
  const [images, setImages]               = useState([]);
  const [newImages, setNewImages]         = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [uploading, setUploading]         = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving]               = useState(false);
  const [search, setSearch]               = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      addToast({ message: 'Acceso no autorizado', type: 'error' });
      router.push('/');
    }
  }, [user, isAdmin, loading]);

  useEffect(() => {
    if (isAdmin) fetchProducts();
  }, [isAdmin]);

  const fetchProducts = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')));
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {
      addToast({ message: 'Error al cargar productos', type: 'error' });
    }
  };

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const toggleTalle = (t) => {
    setForm(prev => ({
      ...prev,
      talles: prev.talles.includes(t) ? prev.talles.filter(x => x !== t) : [...prev.talles, t],
    }));
  };

  const handleImageFiles = (files) => {
    const arr = Array.from(files);
    if (!arr.length) return;
    for (const f of arr) {
      if (!f.type.startsWith('image/')) { addToast({ message: `${f.name} no es una imagen válida`, type: 'warning' }); return; }
      if (f.size > 5 * 1024 * 1024)    { addToast({ message: `${f.name} supera los 5MB`, type: 'warning' }); return; }
    }
    setNewImages(prev => [...prev, ...arr]);
    arr.forEach(f => {
      const reader = new FileReader();
      reader.onload = (e) => setNewImagePreviews(prev => [...prev, e.target.result]);
      reader.readAsDataURL(f);
    });
  };

  const handleDrop = (e) => { e.preventDefault(); handleImageFiles(e.dataTransfer.files); };

  const removeNewImage      = (idx) => { setNewImages(p => p.filter((_, i) => i !== idx)); setNewImagePreviews(p => p.filter((_, i) => i !== idx)); };
  const removeExistingImage = (idx) => setImages(p => p.filter((_, i) => i !== idx));

  const uploadImages = async () => {
    if (!newImages.length) return [];
    setUploading(true);
    const uploaded = [];
    for (let i = 0; i < newImages.length; i++) {
      try {
        const result = await uploadToCloudinary(newImages[i]);
        uploaded.push(result);
        setUploadProgress(Math.round(((i + 1) / newImages.length) * 100));
      } catch (err) {
        addToast({ message: `Error imagen ${i + 1}: ${err.message}`, type: 'error' });
      }
    }
    setUploading(false);
    setUploadProgress(0);
    return uploaded;
  };

  const validate = () => {
    if (!form.titulo.trim())                                              { addToast({ message: 'El título es obligatorio', type: 'warning' }); return false; }
    if (!form.precio || isNaN(form.precio) || Number(form.precio) <= 0)  { addToast({ message: 'Ingresá un precio válido mayor a 0', type: 'warning' }); return false; }
    if (form.cantidad === '' || isNaN(form.cantidad) || Number(form.cantidad) < 0) { addToast({ message: 'Ingresá una cantidad válida', type: 'warning' }); return false; }
    if (!form.marca)                                                      { addToast({ message: 'Seleccioná una marca', type: 'warning' }); return false; }
    if (images.length === 0 && newImages.length === 0)                   { addToast({ message: 'Agregá al menos una imagen', type: 'warning' }); return false; }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const uploadedNew = await uploadImages();
      const allImages   = [...images, ...uploadedNew];

      const productData = {
        titulo:            form.titulo.trim(),
        descripcion:       form.descripcion.trim(),
        marca:             form.marca,
        precio:            Number(form.precio),
        precioOriginal:    form.precioOriginal ? Number(form.precioOriginal) : null,
        descuento:         form.descuento ? Number(form.descuento) : 0,
        cantidad:          Number(form.cantidad),
        talles:            form.talles,
        categoria:         form.categoria,
        imagenes:          allImages.map(i => i.url),
        imagenesPublicIds: allImages.map(i => i.publicId || null),
        updatedAt:         serverTimestamp(),
      };

      if (editing) {
        await updateDoc(doc(db, 'products', editing.id), productData);
        addToast({ message: 'Producto actualizado correctamente', type: 'success' });
      } else {
        await addDoc(collection(db, 'products'), { ...productData, createdAt: serverTimestamp() });
        addToast({ message: '¡Producto creado correctamente!', type: 'success' });
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      console.error(err);
      addToast({ message: `Error al guardar: ${err.message}`, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditing(product);
    setForm({
      titulo:         product.titulo || '',
      descripcion:    product.descripcion || '',
      marca:          product.marca || '',
      precio:         product.precio || '',
      precioOriginal: product.precioOriginal || '',
      descuento:      product.descuento || '',
      cantidad:       product.cantidad || '',
      talles:         product.talles || [],
      categoria:      product.categoria || '',
    });
    const existing = (product.imagenes || []).map((url, i) => ({ url, publicId: product.imagenesPublicIds?.[i] || null }));
    setImages(existing);
    setNewImages([]);
    setNewImagePreviews([]);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (product) => {
    try {
      await deleteDoc(doc(db, 'products', product.id));
      addToast({ message: 'Producto eliminado', type: 'success' });
      setDeleteConfirm(null);
      fetchProducts();
    } catch {
      addToast({ message: 'Error al eliminar el producto', type: 'error' });
    }
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setImages([]);
    setNewImages([]);
    setNewImagePreviews([]);
    setEditing(null);
    setShowForm(false);
  };

  const filtered = products.filter(p =>
    !search || p.titulo?.toLowerCase().includes(search.toLowerCase()) || p.marca?.toLowerCase().includes(search.toLowerCase())
  );

  const inputClass = "w-full px-4 py-3 bg-white border-2 border-verde-200 rounded-xl focus:border-verde-500 transition-colors text-gray-800 text-sm font-medium placeholder:text-gray-300";
  const labelClass = "block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide";

  if (loading || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-verde-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-10">

        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <Link href="/admin" className="text-xs text-verde-500 hover:underline">← Panel Admin</Link>
            <h1 className="font-display text-4xl text-verde-800 mt-1">GESTIÓN DE PRODUCTOS</h1>
          </div>
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="bg-verde-500 hover:bg-verde-600 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-md">
              + Nuevo producto
            </button>
          )}
        </div>

        {/* Formulario */}
        {showForm && (
          <div className="bg-white rounded-3xl border border-verde-100 shadow-md p-6 mb-8 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-xl text-gray-800">{editing ? `✏️ Editar: ${editing.titulo}` : '➕ Nuevo Producto'}</h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Título *</label>
                  <input type="text" className={inputClass} value={form.titulo} onChange={set('titulo')} placeholder="Nike Mercurial Vapor 15 Pro" />
                </div>
                <div>
                  <label className={labelClass}>Descripción</label>
                  <textarea className={`${inputClass} resize-none`} rows={4} value={form.descripcion} onChange={set('descripcion')} placeholder="Descripción detallada..." />
                </div>
                <div>
                  <label className={labelClass}>Marca *</label>
                  <select className={inputClass} value={form.marca} onChange={set('marca')}>
                    <option value="">Seleccioná una marca</option>
                    {MARCAS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Categoría</label>
                  <input type="text" className={inputClass} value={form.categoria} onChange={set('categoria')} placeholder="Fútbol 11, Futsal, Running..." />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>Precio * ($)</label>
                    <input type="number" min="0" className={inputClass} value={form.precio} onChange={set('precio')} placeholder="15000" />
                  </div>
                  <div>
                    <label className={labelClass}>Precio original ($)</label>
                    <input type="number" min="0" className={inputClass} value={form.precioOriginal} onChange={set('precioOriginal')} placeholder="18000" />
                  </div>
                  <div>
                    <label className={labelClass}>Cantidad *</label>
                    <input type="number" min="0" className={inputClass} value={form.cantidad} onChange={set('cantidad')} placeholder="10" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Talles disponibles</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {TALLES_DEFAULT.map(t => (
                      <button key={t} type="button" onClick={() => toggleTalle(t)}
                        className={`px-3 py-1.5 rounded-xl border-2 font-bold text-sm transition-all ${
                          form.talles.includes(t) ? 'border-verde-500 bg-verde-500 text-white' : 'border-verde-200 text-verde-700 hover:border-verde-400'
                        }`}>{t}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClass}>Imágenes del producto *</label>
                <div
                  onDrop={handleDrop} onDragOver={e => e.preventDefault()} onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-verde-300 rounded-2xl p-6 text-center cursor-pointer hover:border-verde-500 hover:bg-verde-50 transition-all mb-4"
                >
                  <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleImageFiles(e.target.files)} />
                  <span className="text-4xl block mb-2">📸</span>
                  <p className="text-sm text-gray-500 font-semibold">Hacé clic o arrastrá imágenes aquí</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP · Máx 5MB</p>
                  <p className="text-xs text-verde-500 font-semibold mt-1">Guardado en Cloudinary ☁️</p>
                </div>

                {uploading && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Subiendo a Cloudinary...</span><span>{uploadProgress}%</span>
                    </div>
                    <div className="h-2 bg-verde-100 rounded-full overflow-hidden">
                      <div className="h-full bg-verde-500 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}

                {images.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Imágenes actuales</p>
                    <div className="grid grid-cols-3 gap-2">
                      {images.map((img, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-verde-200">
                          <img src={img.url} alt="" className="w-full h-full object-cover" />
                          <button onClick={() => removeExistingImage(idx)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {newImagePreviews.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Nuevas imágenes</p>
                    <div className="grid grid-cols-3 gap-2">
                      {newImagePreviews.map((src, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-verde-300">
                          <img src={src} alt="" className="w-full h-full object-cover" />
                          <button onClick={() => removeNewImage(idx)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">×</button>
                          <div className="absolute bottom-1 left-1 bg-verde-500 text-white text-[10px] px-1.5 py-0.5 rounded-lg">Nueva</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {images.length === 0 && newImagePreviews.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">Sin imágenes todavía</p>
                )}
              </div>
            </div>

            <div className="flex gap-4 mt-6 pt-6 border-t border-verde-100">
              <button onClick={resetForm} className="flex-1 py-3 border-2 border-verde-200 text-verde-700 font-bold rounded-2xl hover:bg-verde-50 transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={saving || uploading} className="flex-1 py-3 bg-verde-500 hover:bg-verde-600 disabled:bg-verde-300 text-white font-bold rounded-2xl transition-colors shadow-lg">
                {saving ? 'Guardando...' : uploading ? 'Subiendo imágenes...' : editing ? '✅ Actualizar producto' : '✅ Crear producto'}
              </button>
            </div>
          </div>
        )}

        {/* Lista */}
        <div className="bg-white rounded-3xl border border-verde-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-verde-100 flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-verde-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar productos..." className="w-full pl-9 pr-4 py-2.5 border-2 border-verde-200 rounded-xl text-sm focus:border-verde-400 transition-colors" />
            </div>
            <span className="text-xs text-gray-400 font-semibold">{filtered.length} productos</span>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-6xl">⚽</span>
              <p className="text-gray-400 font-semibold mt-4">Sin productos todavía</p>
              <button onClick={() => setShowForm(true)} className="mt-4 text-verde-600 font-bold hover:underline text-sm">+ Agregar el primero</button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map(product => (
                <div key={product.id} className="flex items-center gap-4 px-6 py-4 hover:bg-verde-50 transition-colors">
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-verde-50 border border-verde-100">
                    {product.imagenes?.[0]
                      ? <img src={product.imagenes[0]} alt={product.titulo} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl">⚽</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm truncate">{product.titulo}</p>
                    <p className="text-xs text-verde-600 font-semibold">{product.marca}</p>
                    <p className="text-xs text-gray-400">Stock: {product.cantidad} · {product.imagenes?.length || 0} fotos</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-display text-xl text-verde-700">${product.precio?.toLocaleString('es-AR')}</p>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => handleEdit(product)} className="text-xs bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors">Editar</button>
                      <button onClick={() => setDeleteConfirm(product)} className="text-xs bg-red-100 text-red-600 font-bold px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors">Eliminar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 animate-bounce-in text-center" onClick={e => e.stopPropagation()}>
            <span className="text-5xl block mb-4">🗑️</span>
            <h3 className="font-bold text-xl text-gray-800 mb-2">Eliminar producto</h3>
            <p className="text-gray-500 text-sm mb-6">¿Eliminar <strong>{deleteConfirm.titulo}</strong>? Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-colors">Cancelar</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-colors">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}