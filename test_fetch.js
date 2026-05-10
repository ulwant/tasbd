async function run() {
  try {
    const res = await fetch('http://127.0.0.1:5000/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ product_id: 1, product_name: 'Test', price: 10000, quantity: 1 }],
        payment_amount: 20000
      })
    });
    const data = await res.json();
    console.log('Status:', res.status, 'Data:', data);
  } catch (err) {
    console.error('Error fetching API:', err);
  }
}
run();
