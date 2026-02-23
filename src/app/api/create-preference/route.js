import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { items, payer, orderId } = body;

    // Validate required fields
    if (!items || !items.length) {
      return NextResponse.json({ error: 'No hay artículos en el carrito' }, { status: 400 });
    }
    if (!payer?.email) {
      return NextResponse.json({ error: 'Datos del comprador incompletos' }, { status: 400 });
    }
    if (!process.env.MP_ACCESS_TOKEN) {
      return NextResponse.json({ error: 'Token de MercadoPago no configurado' }, { status: 500 });
    }

    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
    const preference = new Preference(client);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const preferenceData = {
      items: items.map(item => ({
        title:       item.title || 'Producto',
        quantity:    Number(item.quantity) || 1,
        unit_price:  Number(item.unit_price) || 0,
        currency_id: item.currency_id || 'ARS',
      })),
      payer,
      back_urls: {
        success: `${baseUrl}/checkout/success?order=${orderId}`,
        failure: `${baseUrl}/checkout/failure?order=${orderId}`,
        pending: `${baseUrl}/checkout/pending?order=${orderId}`,
      },
      auto_return:        'approved',
      external_reference: orderId,
      notification_url:   `${baseUrl}/api/webhook`,
      statement_descriptor: 'ZONA BOTIN',
    };

    const result = await preference.create({ body: preferenceData });

    return NextResponse.json({
      id:         result.id,
      init_point: result.init_point,
    });
  } catch (err) {
    console.error('MercadoPago error:', err);
    return NextResponse.json({ error: err.message || 'Error interno del servidor' }, { status: 500 });
  }
}
