import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (type === 'payment' && data?.id) {
      const mpToken = process.env.MP_ACCESS_TOKEN;

      if (!mpToken || mpToken === 'TEST_PENDIENTE') {
        return NextResponse.json({ received: true, note: 'MP token not configured' });
      }

      // Obtener info del pago desde MercadoPago
      const payRes = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
        headers: { Authorization: `Bearer ${mpToken}` },
      });

      if (!payRes.ok) {
        console.error('Error fetching payment from MP');
        return NextResponse.json({ received: true });
      }

      const payInfo = await payRes.json();
      const orderId = payInfo.external_reference;
      const status  = payInfo.status;

      if (orderId && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
        // Actualizar orden en Firestore via REST API
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents/orders/${orderId}?updateMask.fieldPaths=status&updateMask.fieldPaths=paymentId`;

        await fetch(firestoreUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fields: {
              status:    { stringValue: status },
              paymentId: { stringValue: String(data.id) },
            },
          }),
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ received: true });
  }
}