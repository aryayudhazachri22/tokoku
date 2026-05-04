# 🛍️ TokoKu — Website Toko Online + Midtrans

Website e-commerce sederhana dengan integrasi **Midtrans Snap** sebagai payment gateway.

## 📁 Struktur Project

```
tokoku/
├── server.js          ← Backend Express + Midtrans
├── package.json
├── .env               ← API Keys (JANGAN di-commit ke Git!)
└── public/
    └── index.html     ← Frontend website
```

## 🚀 Cara Menjalankan

### 1. Install dependencies
```bash
npm install
```

### 2. Jalankan server
```bash
node server.js
```

### 3. Buka browser
```
http://localhost:3000
```

## 💳 Kartu Uji Sandbox Midtrans

| Field      | Value                    |
|------------|--------------------------|
| Nomor      | `4811 1111 1111 1114`    |
| Expired    | Bulan & tahun depan      |
| CVV        | `123`                    |
| OTP / 3DS  | `112233`                 |

Kartu lainnya: https://docs.midtrans.com/docs/testing-payment

## 🔌 API Endpoints

| Method | Endpoint                    | Fungsi                     |
|--------|-----------------------------|----------------------------|
| POST   | `/api/create-transaction`   | Buat transaksi, dapat snap_token |
| POST   | `/api/notification`         | Webhook dari Midtrans      |
| GET    | `/api/status/:orderId`      | Cek status order           |

## 🌐 Webhook Midtrans (Production)

Atur di Midtrans Dashboard → Settings → Configuration → Payment Notification URL:
```
https://domain-kamu.com/api/notification
```

Untuk testing lokal, gunakan [ngrok](https://ngrok.com):
```bash
ngrok http 3000
# Salin URL ngrok → pasang ke dashboard Midtrans
```

## ⚙️ Ke Production

1. Ganti di `.env`:
   ```
   IS_PRODUCTION=true
   MIDTRANS_CLIENT_KEY=Mid-client-xxxx   ← key production
   MIDTRANS_SERVER_KEY=Mid-server-xxxx   ← key production
   ```

2. Ganti URL Snap.js di `public/index.html`:
   ```html
   <!-- Sandbox -->
   <script src="https://app.sandbox.midtrans.com/snap/snap.js" ...>
   
   <!-- Production (ganti ke ini) -->
   <script src="https://app.midtrans.com/snap/snap.js" ...>
   ```

## 🔒 Keamanan

- ✅ Server Key **hanya** ada di backend
- ✅ Client Key aman di frontend (bersifat publik)
- ✅ Validasi notifikasi via Midtrans SDK
- ⚠️ Jangan commit `.env` ke Git — tambahkan ke `.gitignore`
