import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { MercadoPagoConfig, Payment } from 'mercadopago';

function getAdminDb() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId:    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail:  process.env.FIREBASE_CLIENT_EMAIL,
        privateKey:   process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return getFirestore();
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (type === 'payment' && data?.id) {
      const client   = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
      const payment  = new Payment(client);
      const payInfo  = await payment.get({ id: data.id });

      const orderId = payInfo.external_reference;
      const status  = payInfo.status; // approved | pending | rejected

      if (orderId) {
        const db = getAdminDb();
        await db.collection('orders').doc(orderId).update({
          status,
          paymentId: String(data.id),
          updatedAt: new Date(),
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
