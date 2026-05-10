const pool = require('./db');

async function seed() {
  try {
    // Categories
    const [cat1] = await pool.query("INSERT INTO categories (name) VALUES ('Minuman')");
    const [cat2] = await pool.query("INSERT INTO categories (name) VALUES ('Makanan')");

    // Products
    await pool.query("INSERT INTO products (name, price, stock, category_id) VALUES ('Kopi Hitam', 15000, 50, ?)", [cat1.insertId]);
    await pool.query("INSERT INTO products (name, price, stock, category_id) VALUES ('Roti Bakar', 20000, 20, ?)", [cat2.insertId]);
    await pool.query("INSERT INTO products (name, price, stock, category_id) VALUES ('Nasi Goreng', 25000, 15, ?)", [cat2.insertId]);

    console.log("Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
