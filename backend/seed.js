const { pool, initDatabase } = require('./db');

async function seed() {
  try {
    await initDatabase();

    // Categories
    const cat1 = await pool.query("INSERT INTO categories (name) VALUES ('Minuman') RETURNING id");
    const cat2 = await pool.query("INSERT INTO categories (name) VALUES ('Makanan') RETURNING id");

    // Products
    await pool.query("INSERT INTO products (name, price, stock, category_id) VALUES ('Kopi Hitam', 15000, 50, $1)", [cat1.rows[0].id]);
    await pool.query("INSERT INTO products (name, price, stock, category_id) VALUES ('Roti Bakar', 20000, 20, $1)", [cat2.rows[0].id]);
    await pool.query("INSERT INTO products (name, price, stock, category_id) VALUES ('Nasi Goreng', 25000, 15, $1)", [cat2.rows[0].id]);

    console.log("Seeding complete!");
    await pool.end();
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
