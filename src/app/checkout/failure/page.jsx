'use client';
import Link from 'next/link';

export default function FailurePage() {
  return (
    <div className="min-h-screen bg-verde-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-in">
          <span className="text-5xl">❌</span>
        </div>
        <h1 className="font-display text-5xl text-red-600 mb-3">PAGO FALLIDO</h1>
        <p className="text-gray-600 mb-6 font-semibold">Hubo un problema con tu pago</p>
        <p className="text-gray-500 text-sm mb-8">Por favor intentá de nuevo. Si el problema persiste, contactanos.</p>
        <div className="flex gap-4 justify-center">
          <Link href="/cart" className="bg-verde-500 hover:bg-verde-600 text-white font-bold px-6 py-3 rounded-2xl transition-colors shadow-md">
            Intentar de nuevo
          </Link>
          <Link href="/" className="border-2 border-verde-300 text-verde-700 font-bold px-6 py-3 rounded-2xl hover:bg-verde-50 transition-colors">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
