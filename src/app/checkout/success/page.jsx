'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
  const params = useSearchParams();
  const orderId = params.get('order');

  return (
    <div className="min-h-screen bg-verde-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-verde-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-in">
          <span className="text-5xl">✅</span>
        </div>
        <h1 className="font-display text-5xl text-verde-700 mb-3">¡GRACIAS!</h1>
        <p className="text-gray-600 mb-2 font-semibold">Tu pago fue procesado exitosamente</p>
        {orderId && <p className="text-xs text-gray-400 mb-6">Pedido: #{orderId.slice(0, 8).toUpperCase()}</p>}
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Te enviaremos un email con los detalles de tu compra. En breve nos ponemos en contacto para coordinar el envío.
        </p>
        <Link href="/" className="bg-verde-500 hover:bg-verde-600 text-white font-bold px-8 py-4 rounded-2xl transition-colors shadow-lg inline-block">
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return <Suspense fallback={null}><SuccessContent /></Suspense>;
}
