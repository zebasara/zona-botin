'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

const PROVINCIAS = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes',
  'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones',
  'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe',
  'Santiago del Estero', 'Tierra del Fuego', 'Tucumán',
];

export default function RegisterPage() {
  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', password: '', confirmPassword: '',
    telefono: '', dni: '', direccion: '', ciudad: '', provincia: '', codigoPostal: '',
  });
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [step, setStep]         = useState(1);
  const { register }            = useAuth();
  const { addToast }            = useToast();
  const router                  = useRouter();

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const validateStep1 = () => {
    if (!form.nombre.trim()) { addToast({ message: 'Ingresá tu nombre', type: 'warning' }); return false; }
    if (!form.apellido.trim()) { addToast({ message: 'Ingresá tu apellido', type: 'warning' }); return false; }
    if (!form.email.trim()) { addToast({ message: 'Ingresá tu email', type: 'warning' }); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { addToast({ message: 'El email no es válido', type: 'warning' }); return false; }
    if (!form.password) { addToast({ message: 'Ingresá una contraseña', type: 'warning' }); return false; }
    if (form.password.length < 6) { addToast({ message: 'La contraseña debe tener al menos 6 caracteres', type: 'warning' }); return false; }
    if (form.password !== form.confirmPassword) { addToast({ message: 'Las contraseñas no coinciden', type: 'warning' }); return false; }
    return true;
  };

  const validateStep2 = () => {
    if (!form.telefono.trim()) { addToast({ message: 'Ingresá tu teléfono', type: 'warning' }); return false; }
    if (!form.dni.trim()) { addToast({ message: 'Ingresá tu DNI', type: 'warning' }); return false; }
    if (!form.direccion.trim()) { addToast({ message: 'Ingresá tu dirección', type: 'warning' }); return false; }
    if (!form.ciudad.trim()) { addToast({ message: 'Ingresá tu ciudad', type: 'warning' }); return false; }
    if (!form.provincia) { addToast({ message: 'Seleccioná tu provincia', type: 'warning' }); return false; }
    if (!form.codigoPostal.trim()) { addToast({ message: 'Ingresá tu código postal', type: 'warning' }); return false; }
    return true;
  };

  const handleStep1 = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setLoading(true);
    try {
      await register(form);
      addToast({ message: '¡Cuenta creada con éxito! Bienvenido a Zona Botín 🎉', type: 'success', duration: 5000 });
      router.push('/');
    } catch (err) {
      const msg = {
        'auth/email-already-in-use': 'Ya existe una cuenta con ese email',
        'auth/weak-password':        'La contraseña es muy débil',
        'auth/invalid-email':        'El email no es válido',
      }[err.code] || 'Error al registrarse. Intentá de nuevo';
      addToast({ message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-white border-2 border-verde-200 rounded-2xl focus:border-verde-500 transition-colors text-gray-800 font-medium placeholder:text-gray-300 text-sm";
  const labelClass = "block text-sm font-bold text-gray-700 mb-1";

  return (
    <div className="min-h-screen bg-gradient-to-br from-verde-50 via-white to-verde-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <Link href="/" className="flex items-center gap-2 mb-6 group">
          <div className="w-8 h-8 bg-verde-500 rounded-xl flex items-center justify-center">
            <span className="text-white">⚽</span>
          </div>
          <span className="font-display text-2xl text-verde-700">ZONA BOTÍN</span>
        </Link>

        <div className="bg-white rounded-3xl shadow-xl border border-verde-100 overflow-hidden">
          {/* Progress header */}
          <div className="bg-gradient-to-r from-verde-600 to-verde-700 p-6 text-white">
            <h1 className="font-display text-3xl mb-1">CREAR CUENTA</h1>
            <p className="text-verde-200 text-sm">Paso {step} de 2: {step === 1 ? 'Datos de acceso' : 'Datos de envío'}</p>
            <div className="flex gap-2 mt-3">
              {[1, 2].map(s => (
                <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${s <= step ? 'bg-white' : 'bg-verde-500/40'}`} />
              ))}
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} noValidate>
              {step === 1 ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Nombre *</label>
                      <input type="text" className={inputClass} placeholder="Juan" value={form.nombre} onChange={set('nombre')} autoComplete="given-name" />
                    </div>
                    <div>
                      <label className={labelClass}>Apellido *</label>
                      <input type="text" className={inputClass} placeholder="García" value={form.apellido} onChange={set('apellido')} autoComplete="family-name" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Email *</label>
                    <input type="email" className={inputClass} placeholder="tu@email.com" value={form.email} onChange={set('email')} autoComplete="email" />
                  </div>
                  <div>
                    <label className={labelClass}>Contraseña *</label>
                    <div className="relative">
                      <input type={showPass ? 'text' : 'password'} className={`${inputClass} pr-16`} placeholder="Mín. 6 caracteres" value={form.password} onChange={set('password')} autoComplete="new-password" />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-verde-600 font-semibold">{showPass ? 'Ocultar' : 'Ver'}</button>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Confirmar contraseña *</label>
                    <input type={showPass ? 'text' : 'password'} className={inputClass} placeholder="Repetí tu contraseña" value={form.confirmPassword} onChange={set('confirmPassword')} autoComplete="new-password" />
                  </div>
                  <button type="button" onClick={handleStep1} className="w-full bg-verde-500 hover:bg-verde-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg text-lg mt-2">
                    Continuar →
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Teléfono *</label>
                      <input type="tel" className={inputClass} placeholder="11 1234-5678" value={form.telefono} onChange={set('telefono')} autoComplete="tel" />
                    </div>
                    <div>
                      <label className={labelClass}>DNI *</label>
                      <input type="text" className={inputClass} placeholder="12.345.678" value={form.dni} onChange={set('dni')} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Dirección (calle y número) *</label>
                    <input type="text" className={inputClass} placeholder="Av. Corrientes 1234" value={form.direccion} onChange={set('direccion')} autoComplete="street-address" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Ciudad *</label>
                      <input type="text" className={inputClass} placeholder="Buenos Aires" value={form.ciudad} onChange={set('ciudad')} autoComplete="address-level2" />
                    </div>
                    <div>
                      <label className={labelClass}>Código Postal *</label>
                      <input type="text" className={inputClass} placeholder="1425" value={form.codigoPostal} onChange={set('codigoPostal')} autoComplete="postal-code" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Provincia *</label>
                    <select className={inputClass} value={form.provincia} onChange={set('provincia')}>
                      <option value="">Seleccioná tu provincia</option>
                      {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 border-2 border-verde-200 text-verde-700 font-bold rounded-2xl hover:bg-verde-50 transition-colors">
                      ← Volver
                    </button>
                    <button type="submit" disabled={loading} className="flex-1 bg-verde-500 hover:bg-verde-600 disabled:bg-verde-300 text-white font-bold py-4 rounded-2xl transition-all shadow-lg">
                      {loading ? 'Creando cuenta...' : 'Crear cuenta 🎉'}
                    </button>
                  </div>
                </div>
              )}
            </form>

            <p className="text-center text-gray-500 mt-4 text-sm">
              ¿Ya tenés cuenta?{' '}
              <Link href="/login" className="text-verde-600 font-bold hover:underline">Iniciar sesión</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
