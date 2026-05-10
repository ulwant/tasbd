# Database ERD (Entity-Relationship Diagram)

## KasirNuril POS System Database Schema

```
┌─────────────────────────────────────────────────────────────────┐
│                          USERS                                  │
├─────────────────────────────────────────────────────────────────┤
│ PK │ id              │ INT AUTO_INCREMENT PRIMARY KEY            │
│    │ username        │ VARCHAR(100) NOT NULL UNIQUE              │
│    │ email           │ VARCHAR(100) NOT NULL UNIQUE              │
│    │ password        │ VARCHAR(255) NOT NULL (bcrypt hashed)     │
│    │ role            │ ENUM('admin', 'cashier') DEFAULT 'cashier'│
│    │ created_at      │ TIMESTAMP DEFAULT CURRENT_TIMESTAMP       │
└─────────────────────────────────────────────────────────────────┘
           ▲
           │ (1:N) - User Transactions (implied)
           │
           │
┌─────────────────────────────────────────────────────────────────┐
│                      CATEGORIES                                  │
├─────────────────────────────────────────────────────────────────┤
│ PK │ id              │ INT AUTO_INCREMENT PRIMARY KEY            │
│    │ name            │ VARCHAR(100) NOT NULL                     │
│    │ created_at      │ TIMESTAMP DEFAULT CURRENT_TIMESTAMP       │
└─────────────────────────────────────────────────────────────────┘
           ▲
           │ (1:N) FK: category_id
           │
           │
┌─────────────────────────────────────────────────────────────────┐
│                       PRODUCTS                                   │
├─────────────────────────────────────────────────────────────────┤
│ PK │ id              │ INT AUTO_INCREMENT PRIMARY KEY            │
│    │ name            │ VARCHAR(255) NOT NULL                     │
│    │ price           │ DECIMAL(12,2) NOT NULL                    │
│    │ stock           │ INT NOT NULL DEFAULT 0                    │
│ FK │ category_id     │ INT (ON DELETE SET NULL)                  │
│    │ created_at      │ TIMESTAMP DEFAULT CURRENT_TIMESTAMP       │
│    │ updated_at      │ TIMESTAMP DEFAULT CURRENT_TIMESTAMP       │
│    │ deleted_at      │ TIMESTAMP NULL (Soft Delete)              │
└─────────────────────────────────────────────────────────────────┘
           ▲
           │ (1:N) FK: product_id
           │
           │
┌─────────────────────────────────────────────────────────────────┐
│                    TRANSACTIONS                                  │
├─────────────────────────────────────────────────────────────────┤
│ PK │ id              │ INT AUTO_INCREMENT PRIMARY KEY            │
│    │ invoice_number  │ VARCHAR(50) NOT NULL                      │
│    │ total_amount    │ DECIMAL(12,2) NOT NULL                    │
│    │ payment_amount  │ DECIMAL(12,2) NOT NULL                    │
│    │ change_amount   │ DECIMAL(12,2) NOT NULL                    │
│    │ created_at      │ TIMESTAMP DEFAULT CURRENT_TIMESTAMP       │
└─────────────────────────────────────────────────────────────────┘
           ▲
           │ (1:N) FK: transaction_id
           │
           │
┌─────────────────────────────────────────────────────────────────┐
│                  TRANSACTION_ITEMS                               │
├─────────────────────────────────────────────────────────────────┤
│ PK │ id              │ INT AUTO_INCREMENT PRIMARY KEY            │
│ FK │ transaction_id  │ INT (ON DELETE CASCADE)                   │
│ FK │ product_id      │ INT                                       │
│    │ product_name    │ VARCHAR(255) NOT NULL                     │
│    │ price           │ DECIMAL(12,2) NOT NULL                    │
│    │ quantity        │ INT NOT NULL                              │
│    │ subtotal        │ DECIMAL(12,2) NOT NULL                    │
└─────────────────────────────────────────────────────────────────┘

Legend:
  PK   = Primary Key
  FK   = Foreign Key
  (1:N) = One-to-Many Relationship
```

## Key Relationships

1. **Users ↔ Transactions**: Each user (cashier/admin) can create multiple transactions (implicit via auth system)
2. **Categories ↔ Products**: One category can have many products (FK: category_id → categories.id)
3. **Products ↔ Transaction_Items**: One product can appear in multiple transaction line items
4. **Transactions ↔ Transaction_Items**: One transaction contains many transaction line items (FK: transaction_id → transactions.id with CASCADE delete)

## Constraints

- **FOREIGN KEY (category_id)** in products table: `ON DELETE SET NULL` — Deleting a category does not delete products; their category_id is set to NULL
- **FOREIGN KEY (transaction_id)** in transaction_items table: `ON DELETE CASCADE` — Deleting a transaction automatically deletes all its line items
- **UNIQUE constraints**: username and email in users table are unique to prevent duplicate accounts
- **Soft Delete**: Products table includes `deleted_at` timestamp for soft delete functionality

## Features Enabled by This Schema

✅ **Authentication**: Users table supports login/register with roles (admin/cashier)  
✅ **CRUD Operations**: All tables support Create, Read, Update, Delete operations  
✅ **Soft Delete**: Products can be soft-deleted (deleted_at) and restored  
✅ **Hard Delete**: Products and other records can be permanently deleted  
✅ **Query Joins**: Products can be joined with categories; transactions can be joined with transaction_items for sales reports  
✅ **Search & Filtering**: Products support search by name and filtering by category  
✅ **Transaction History**: All transactions and their items are logged with timestamps  
