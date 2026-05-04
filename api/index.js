const express = require('express');
const midtransClient = require('midtrans-client');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── MIDTRANS SNAP CLIENT ──
const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: 'SB-Mid-server-WXo6rZyzGRJP9ga6U3HauDD4',
  clientKey: 'SB-Mid-client-A0pgB3xD3qluqxrj'
});

// ── CREATE TRANSACTION ──
app.post('/api/create-transaction', async (req, res) => {
  try {
    const { customer, items } = req.body;

    const grossAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderId = 'TOKOKU-' + Date.now() + '-' + uuidv4().slice(0, 6).toUpperCase();

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount
      },
      customer_details: {
        first_name: customer.name,
        email: customer.email,
        phone: customer.phone
      },
      item_details: items.map(item => ({
        id: String(item.id),
        price: item.price,
        quantity: item.quantity,
        name: item.name.substring(0, 50)
      })),
      callbacks: {
        finish: 'http://localhost:3000/success'
      }
    };

    const transaction = await snap.createTransaction(parameter);

    res.json({
      success: true,
      snap_token: transaction.token,
      redirect_url: transaction.redirect_url,
      order_id: orderId,
      gross_amount: grossAmount
    });

  } catch (error) {
    console.error('Midtrans error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Gagal membuat transaksi'
    });
  }
});

// ── NOTIFICATION HANDLER (Midtrans Webhook) ──
app.post('/api/notification', async (req, res) => {
  try {
    const statusResponse = await snap.transaction.notification(req.body);
    const { order_id, transaction_status, fraud_status } = statusResponse;

    console.log(`📦 Order ${order_id}: ${transaction_status} | fraud: ${fraud_status}`);

    if (transaction_status === 'capture' && fraud_status === 'accept') {
      console.log(`✅ Payment SUCCESS for ${order_id}`);
    } else if (transaction_status === 'settlement') {
      console.log(`✅ Payment SETTLED for ${order_id}`);
    } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
      console.log(`❌ Payment FAILED for ${order_id}`);
    } else if (transaction_status === 'pending') {
      console.log(`⏳ Payment PENDING for ${order_id}`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Notification error:', error);
    res.status(500).json({ success: false });
  }
});

// ── CHECK STATUS ──
app.get('/api/status/:orderId', async (req, res) => {
  try {
    const status = await snap.transaction.status(req.params.orderId);
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── SUCCESS PAGE ──
app.get('/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`🚀 Running at http://localhost:${PORT}`));
}

module.exports = app;
