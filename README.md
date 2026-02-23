# ⚽ Zona Botín - Tienda de Botines de Fútbol

Landing page completa para venta de botines con Firebase + MercadoPago.

## 🚀 Stack Tecnológico
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Base de datos**: Firebase Firestore
- **Almacenamiento**: Firebase Storage (imágenes)
- **Autenticación**: Firebase Auth
- **Pagos**: Mercado Pago (Checkout Pro)
- **Deploy**: Vercel

---

## ⚙️ Configuración paso a paso

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar Firebase

1. Ir a https://console.firebase.google.com
2. Crear un nuevo proyecto
3. Activar **Authentication** → Email/Password
4. Crear base de datos **Firestore** (modo producción)
5. Activar **Storage**
6. Ir a Configuración → Agregar app web → copiar las credenciales

### 3. Configurar el archivo .env.local

Editar `.env.local` con tus credenciales reales:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=tu-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc123

# MercadoPago
MP_ACCESS_TOKEN=APP_USR-xxxx-xxxx-xxxx

# URL del sitio (sin barra al final)
NEXT_PUBLIC_BASE_URL=https://tu-dominio.vercel.app

# Email del admin
NEXT_PUBLIC_ADMIN_EMAIL=tu@email.com
```

### 4. Subir reglas de Firestore y Storage

En Firebase Console → Firestore → Reglas, pegar el contenido de `firestore.rules`.

En Firebase Console → Storage → Reglas, pegar el contenido de `storage.rules`.

### 5. Configurar MercadoPago

1. Ir a https://www.mercadopago.com.ar/developers
2. Crear una aplicación
3. Copiar el **Access Token** de producción
4. Pegarlo en `MP_ACCESS_TOKEN` del .env.local
5. En producción, configurar la **URL de webhook** a: `https://tu-dominio.vercel.app/api/webhook`

### 6. Crear cuenta de administrador

1. Registrarse en el sitio con el email configurado en `NEXT_PUBLIC_ADMIN_EMAIL`
2. El sistema detecta automáticamente que es el admin
3. Acceder al panel en `/admin`

---

## 🗂️ Estructura del proyecto

```
src/
├── app/
│   ├── page.js              # Landing + catálogo de productos
│   ├── login/               # Inicio de sesión
│   ├── register/            # Registro de usuarios (2 pasos)
│   ├── cart/                # Checkout con formulario de envío
│   ├── checkout/
│   │   ├── success/         # Pago exitoso
│   │   ├── failure/         # Pago fallido
│   │   └── pending/         # Pago pendiente
│   ├── admin/
│   │   ├── page.jsx         # Dashboard admin
│   │   ├── products/        # CRUD de productos
│   │   └── orders/          # Gestión de pedidos
│   └── api/
│       ├── create-preference/ # Crea preferencia de MercadoPago
│       └── webhook/           # Recibe notificaciones de MP
├── components/
│   ├── Navbar.jsx           # Navegación + notificaciones admin
│   ├── CartDrawer.jsx       # Carrito lateral
│   ├── ProductCard.jsx      # Tarjeta de producto + modal
│   └── ImageGallery.jsx     # Galería de imágenes + lightbox
├── context/
│   ├── AuthContext.jsx      # Estado de autenticación
│   ├── CartContext.jsx      # Estado del carrito
│   └── ToastContext.jsx     # Sistema de notificaciones
└── lib/
    └── firebase.js          # Configuración de Firebase
```

---

## 🎯 Funcionalidades

### Para usuarios
- ✅ Registro en 2 pasos con todos los datos de envío
- ✅ Inicio de sesión
- ✅ Catálogo de productos con filtros y búsqueda
- ✅ Galería de imágenes con lightbox
- ✅ Carrito lateral con cantidad y talles
- ✅ Checkout pre-rellenado con datos del perfil
- ✅ Pago con Mercado Pago (tarjeta, efectivo, transferencia)
- ✅ Páginas de confirmación de pago

### Para administrador
- ✅ Panel con estadísticas en tiempo real
- ✅ CRUD completo de productos (crear, editar, eliminar)
- ✅ Carga de múltiples imágenes con drag & drop
- ✅ Gestión de talles por producto
- ✅ Notificaciones en tiempo real de nuevas ventas (dropdown en navbar)
- ✅ Gestión de pedidos con estados (Pendiente, Pagado, Enviado, Entregado, Cancelado)
- ✅ Detalle completo del comprador y dirección de envío
- ✅ Filtros por estado de pedido

---

## 🚀 Deploy en Vercel

1. Conectar el repositorio a Vercel
2. Agregar todas las variables de entorno en el dashboard de Vercel
3. Cambiar `NEXT_PUBLIC_BASE_URL` al dominio real de Vercel
4. Deploy automático

---

## 📝 Colecciones de Firestore

### `products`
```json
{
  "titulo": "Nike Mercurial",
  "descripcion": "...",
  "marca": "Nike",
  "precio": 15000,
  "precioOriginal": 18000,
  "descuento": 16,
  "cantidad": 10,
  "talles": ["38", "39", "40"],
  "categoria": "Fútbol 11",
  "imagenes": ["url1", "url2"],
  "imagenPaths": ["path1", "path2"],
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### `orders`
```json
{
  "buyerUid": "uid",
  "buyerName": "Juan García",
  "email": "juan@email.com",
  "phone": "11 1234-5678",
  "dni": "12345678",
  "address": "Av. Corrientes 1234",
  "city": "Buenos Aires",
  "province": "CABA",
  "postalCode": "1425",
  "items": [...],
  "total": 30000,
  "status": "pending",
  "readByAdmin": false,
  "paymentId": "mp-payment-id",
  "createdAt": "timestamp"
}
```

### `users`
```json
{
  "uid": "...",
  "email": "...",
  "nombre": "Juan",
  "apellido": "García",
  "telefono": "...",
  "dni": "...",
  "direccion": "...",
  "ciudad": "...",
  "provincia": "...",
  "codigoPostal": "...",
  "role": "user",
  "createdAt": "timestamp"
}
```
