'use client';
import Link from 'next/link';

export default function PendingPage() {
  return (
    <div className="min-h-screen bg-verde-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-in">
          <span className="text-5xl">⏳</span>
        </div>
        <h1 className="font-display text-5xl text-yellow-600 mb-3">PAGO PENDIENTE</h1>
        <p className="text-gray-600 mb-6 font-semibold">Tu pago está siendo procesado</p>
        <p className="text-gray-500 text-sm mb-8">En cuanto se confirme el pago, te avisaremos por email y procederemos con el envío.</p>
        <Link href="/" className="bg-verde-500 hover:bg-verde-600 text-white font-bold px-8 py-4 rounded-2xl transition-colors shadow-lg inline-block">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
