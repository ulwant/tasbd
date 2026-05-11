const pool = require('./db');

async function seed() {
  try {
    // Categories
    const [cat1Result] = await pool.query("INSERT INTO categories (name) VALUES ('Minuman')");
    const [cat2Result] = await pool.query("INSERT INTO categories (name) VALUES ('Makanan')");
    const [cat3Result] = await pool.query("INSERT INTO categories (name) VALUES ('Elektronik')");

    const cat1Id = cat1Result.insertId;
    const cat2Id = cat2Result.insertId;
    const cat3Id = cat3Result.insertId;

    // Products
    await pool.query("INSERT INTO products (name, price, stock, category_id) VALUES (?, ?, ?, ?)", ['Kopi Hitam', 15000, 50, cat1Id]);
    await pool.query("INSERT INTO products (name, price, stock, category_id) VALUES (?, ?, ?, ?)", ['Roti Bakar', 20000, 20, cat2Id]);
    await pool.query("INSERT INTO products (name, price, stock, category_id) VALUES (?, ?, ?, ?)", ['Nasi Goreng', 25000, 15, cat2Id]);
    
    // Add Headphone Bluetooth with 15% discount
    await pool.query(
      "INSERT INTO products (name, price, stock, category_id, discount_type, discount_value) VALUES (?, ?, ?, ?, ?, ?)", 
      ['Headphone Bluetooth', 350000, 10, cat3Id, 'percent', 15]
    );

    console.log("✅ Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
}

seed();
