import React, { useState, useEffect } from 'react';
import { FiX, FiPlus } from 'react-icons/fi';

export default function ProductFormModal({ product, categories, onSave, onClose, onAddCategory }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setPrice(product.price || '');
      setStock(product.stock || '');
      setCategoryId(product.category_id || '');
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !price) return;
    setSaving(true);
    await onSave({
      name: name.trim(),
      price: Number(price),
      stock: Number(stock) || 0,
      category_id: categoryId || null
    });
    setSaving(false);
  };

  const handleAddNewCategory = async () => {
    if (!newCategory.trim()) return;
    await onAddCategory(newCategory.trim());
    setNewCategory('');
    setShowNewCategory(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{product ? 'Edit Produk' : 'Tambah Produk Baru'}</h3>
          <button className="modal-close" onClick={onClose} id="btn-close-product-form">
            <FiX />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="product-form">
              <div className="form-group">
                <label className="form-label">Nama Produk *</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Contoh: Kopi Hitam"
                  required
                  autoFocus
                  id="input-product-name"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">Harga (Rp) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="0"
                    required
                    min="0"
                    id="input-product-price"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stok Awal</label>
                  <input
                    type="number"
                    className="form-input"
                    value={stock}
                    onChange={e => setStock(e.target.value)}
                    placeholder="0"
                    min="0"
                    id="input-product-stock"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Kategori</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select
                    className="form-select"
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    style={{ flex: 1 }}
                    id="select-product-category"
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setShowNewCategory(!showNewCategory)}
                    style={{ padding: '6px 10px' }}
                    title="Tambah kategori baru"
                  >
                    <FiPlus size={14} />
                  </button>
                </div>
              </div>

              {showNewCategory && (
                <div className="form-group fade-in">
                  <label className="form-label">Kategori Baru</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      className="form-input"
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                      placeholder="Nama kategori baru"
                      style={{ flex: 1 }}
                      id="input-new-category"
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleAddNewCategory}
                      style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                    >
                      Tambah
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn btn-accent" disabled={saving} id="btn-save-product">
              {saving ? 'Menyimpan...' : (product ? 'Update Produk' : 'Tambah Produk')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
