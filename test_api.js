const http = require('http');

const data = JSON.stringify({
  items: [
    { product_id: 1, product_name: 'Test', price: 10000, quantity: 1 }
  ],
  payment_amount: 20000
});

const options = {
  hostname: '127.0.0.1',
  port: 5000,
  path: '/api/transactions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log('Status:', res.statusCode, 'Body:', body);
    process.exit(0);
  });
});

req.on('error', error => {
  console.error('Request Error:', error);
  process.exit(1);
});
req.write(data);
req.end();
