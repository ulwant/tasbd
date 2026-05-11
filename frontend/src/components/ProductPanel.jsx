import React from 'react';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiPackage, FiLayers, FiArchive } from 'react-icons/fi';

export default function ProductPanel({
  products,
  categories,
  loading,
  searchTerm,
  activeCategory,
  onSearchChange,
  onCategoryChange,
  onProductClick,
  onEditProduct,
  onDeleteProduct,
  onAddProduct,
  onManageCategory,
  onShowTrash,
  formatRupiah,
  isAdmin = false
}) {
  const getCategoryClass = (catName) => {
    if (!catName) return '';
    const lower = catName.toLowerCase();
    if (lower.includes('minuman')) return 'minuman';
    if (lower.includes('makanan')) return '';
    return 'lainnya';
  };

  return (
    <div className="panel panel-left">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 className="panel-title" style={{ marginBottom: 0 }}>
          <FiPackage className="panel-title-icon" />
          Katalog Produk
        </h2>
        {isAdmin && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-ghost"
            onClick={onManageCategory}
            id="btn-manage-category"
            style={{ padding: '8px 14px', fontSize: '0.8rem' }}
          >
            <FiLayers size={14} />
            Kelola Kategori
          </button>
          <button
            className="btn btn-ghost"
            onClick={onShowTrash}
            id="btn-trash"
            style={{ padding: '8px 14px', fontSize: '0.8rem', color: '#f85149', borderColor: '#f85149' }}
          >
            <FiArchive size={14} />
            Sampah
          </button>
          <button
            className="btn btn-accent"
            onClick={onAddProduct}
            id="btn-add-product"
            style={{ padding: '8px 14px', fontSize: '0.8rem' }}
          >
            <FiPlus size={14} />
            Tambah Produk
          </button>
        </div>
        )}
      </div>

      {/* Search */}
      <div className="search-bar">
        <FiSearch className="search-bar-icon" />
        <input
          type="text"
          placeholder="Cari produk..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          id="input-search-product"
        />
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        <button
          className={`category-chip ${activeCategory === null ? 'active' : ''}`}
          onClick={() => onCategoryChange(null)}
          id="btn-category-all"
        >
          Semua
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`category-chip ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => onCategoryChange(cat.id === activeCategory ? null : cat.id)}
            id={`btn-category-${cat.id}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product List */}
      <div className="product-grid">
        {loading ? (
          <>
            <div className="loading-skeleton" />
            <div className="loading-skeleton" />
            <div className="loading-skeleton" />
          </>
        ) : products.length === 0 ? (
          <div className="empty-products">
            <div className="empty-products-icon">📦</div>
            <p style={{ fontWeight: 500 }}>Belum ada produk</p>
            <p style={{ fontSize: '0.8rem', marginTop: 4 }}>
              {isAdmin ? 'Klik "Tambah Produk" untuk menambahkan' : 'Belum ada produk tersedia'}
            </p>
          </div>
        ) : (
          products.map((product, index) => (
            <div
              key={product.id}
              className="product-card"
              onClick={() => onProductClick(product)}
              style={{ animationDelay: `${index * 0.05}s` }}
              id={`product-card-${product.id}`}
            >
              <div className="product-card-header">
                <div className="product-card-name">{product.name}</div>
                {isAdmin && (
                <div className="product-card-actions">
                  <button
                    className="product-card-btn edit"
                    onClick={(e) => { e.stopPropagation(); onEditProduct(product); }}
                    title="Edit produk"
                    id={`btn-edit-${product.id}`}
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    className="product-card-btn"
                    onClick={(e) => { e.stopPropagation(); onDeleteProduct(product.id); }}
                    title="Hapus produk"
                    id={`btn-delete-${product.id}`}
                  >
                    <FiTrash2 />
                  </button>
                </div>
                )}
              </div>
              <div className="product-card-price">
                {formatRupiah(product.price)}
                {product.discount_type && product.discount_type !== 'none' && (
                  <span style={{ 
                    display: 'block', 
                    fontSize: '0.75rem', 
                    color: '#3fb950',
                    marginTop: '4px'
                  }}>
                    {product.discount_type === 'percent' 
                      ? `Diskon ${product.discount_value}%` 
                      : `Diskon ${formatRupiah(product.discount_value)}`}
                  </span>
                )}
              </div>
              <div className={`product-card-stock ${product.stock <= 5 ? 'low' : ''}`}>
                Stok: {product.stock}
                {product.stock <= 5 && product.stock > 0 && ' ⚠️'}
                {product.stock === 0 && ' (Habis)'}
              </div>
              {product.category_name && (
                <span className={`product-card-category ${getCategoryClass(product.category_name)}`}>
                  {product.category_name}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
