'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login, isAdmin }      = useAuth();
  const { addToast }            = useToast();
  const router                  = useRouter();

  const validate = () => {
    if (!email.trim()) {
      addToast({ message: 'Por favor ingresá tu email', type: 'warning' });
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      addToast({ message: 'El email no es válido', type: 'warning' });
      return false;
    }
    if (!password) {
      addToast({ message: 'Por favor ingresá tu contraseña', type: 'warning' });
      return false;
    }
    if (password.length < 6) {
      addToast({ message: 'La contraseña debe tener al menos 6 caracteres', type: 'warning' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const cred = await login(email.trim(), password);
      addToast({ message: `¡Bienvenido de vuelta! 👋`, type: 'success' });
      const isAdminUser = cred.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      router.push(isAdminUser ? '/admin' : '/');
    } catch (err) {
      const msg = {
        'auth/user-not-found':   'No existe una cuenta con ese email',
        'auth/wrong-password':   'Contraseña incorrecta',
        'auth/invalid-credential': 'Email o contraseña incorrectos',
        'auth/too-many-requests':  'Demasiados intentos. Intentá más tarde',
        'auth/user-disabled':    'Tu cuenta fue desactivada',
      }[err.code] || 'Error al iniciar sesión. Intentá de nuevo';
      addToast({ message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-verde-50 via-white to-verde-100 flex">
      {/* Left decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-verde-600 to-verde-900 items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-verde-500/30 rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-verde-400/20 rounded-full -translate-x-1/3 translate-y-1/3" />
        <div className="relative text-center text-white p-12">
          <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur">
            <span className="text-5xl">⚽</span>
          </div>
          <h2 className="font-display text-6xl mb-4">ZONA BOTÍN</h2>
          <p className="text-verde-200 text-lg">Los mejores botines te esperan</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-8 group lg:hidden">
            <div className="w-8 h-8 bg-verde-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">⚽</span>
            </div>
            <span className="font-display text-2xl text-verde-700">ZONA BOTÍN</span>
          </Link>

          <h1 className="font-display text-4xl text-verde-800 mb-2">INICIAR SESIÓN</h1>
          <p className="text-gray-500 mb-8">Ingresá a tu cuenta para comprar</p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-3.5 bg-white border-2 border-verde-200 rounded-2xl focus:border-verde-500 transition-colors text-gray-800 font-medium placeholder:text-gray-300"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 bg-white border-2 border-verde-200 rounded-2xl focus:border-verde-500 transition-colors text-gray-800 font-medium placeholder:text-gray-300 pr-12"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-verde-600 transition-colors text-sm font-semibold"
                >
                  {showPass ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-verde-500 hover:bg-verde-600 disabled:bg-verde-300 text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95 text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Ingresando...
                </span>
              ) : 'Ingresar →'}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-6 text-sm">
            ¿No tenés cuenta?{' '}
            <Link href="/register" className="text-verde-600 font-bold hover:underline">
              Registrate gratis
            </Link>
          </p>

          <Link href="/" className="block text-center text-gray-400 hover:text-verde-600 transition-colors text-sm mt-4">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
