import { Bebas_Neue, Nunito } from 'next/font/google';
import './globals.css';
import { AuthProvider }  from '@/context/AuthContext';
import { CartProvider }  from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';

const display = Bebas_Neue({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-display',
});

const body = Nunito({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-body',
});

export const metadata = {
  title: 'Zona Botín | Botines de Fútbol',
  description: 'Tu tienda de botines de fútbol online. Encontrá las mejores marcas al mejor precio.',
  keywords: 'botines, fútbol, Nike, Adidas, Puma, calzado deportivo, Argentina',
  openGraph: {
    title: 'Zona Botín',
    description: 'Tu tienda de botines de fútbol online.',
    siteName: 'Zona Botín',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable}`}>
      <body className="font-body bg-verde-50 min-h-screen">
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
