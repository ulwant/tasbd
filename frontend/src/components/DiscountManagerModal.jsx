import React, { useState, useEffect } from 'react';
import { FiX, FiSearch, FiPercent, FiDollarSign } from 'react-icons/fi';
import { getProducts, getDiscountedProducts, setProductDiscount } from '../api';
import toast from 'react-hot-toast';

export default function DiscountManagerModal({ onClose, onDiscountUpdated }) {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [discountType, setDiscountType] = useState('percent');
  const [discountValue, setDiscountValue] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      toast.error('Gagal memuat produk: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDiscount = async () => {
    if (!selectedProduct) {
      toast.error('Pilih produk terlebih dahulu');
      return;
    }

    const value = parseFloat(discountValue);
    if (isNaN(value) || value < 0) {
      toast.error('Nilai diskon harus >= 0');
      return;
    }

    if (discountType === 'percent' && value > 100) {
      toast.error('Diskon persentase maksimal 100%');
      return;
    }

    try {
      await setProductDiscount(selectedProduct.id, {
        discount_type: discountType,
        discount_value: value
      });
      toast.success('Diskon berhasil disimpan');
      if (onDiscountUpdated) onDiscountUpdated();
      onClose();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const calculateDiscountedPrice = () => {
    if (!selectedProduct) return 0;
    
    const originalPrice = Number(selectedProduct.price);
    const value = parseFloat(discountValue) || 0;
    
    if (discountType === 'percent') {
      return originalPrice * (1 - value / 100);
    } else if (discountType === 'fixed') {
      return Math.max(0, originalPrice - value);
    }
    
    return originalPrice;
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatRupiah = (num) => 'Rp ' + Number(num).toLocaleString('id-ID');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
        <div className="modal-header">
          <h2 className="modal-title">
            <FiPercent /> Kelola Diskon Produk
          </h2>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="modal-body">
          {/* Search */}
          <div className="search-bar" style={{ marginBottom: '16px' }}>
            <FiSearch className="search-bar-icon" />
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Product List */}
          <div style={{ 
            maxHeight: '300px', 
            overflowY: 'auto', 
            border: '1px solid #30363d', 
            borderRadius: '6px',
            marginBottom: '16px'
          }}>
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#8b949e' }}>
                Memuat produk...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#8b949e' }}>
                Tidak ada produk
              </div>
            ) : (
              filteredProducts.map(product => (
                <div
                  key={product.id}
                  onClick={() => {
                    setSelectedProduct(product);
                    setDiscountType(product.discount_type || 'percent');
                    setDiscountValue(product.discount_value?.toString() || '');
                  }}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #30363d',
                    cursor: 'pointer',
                    background: selectedProduct?.id === product.id ? '#1f6feb20' : 'transparent',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500 }}>{product.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#8b949e' }}>
                      {formatRupiah(product.price)} | Stok: {product.stock}
                    </div>
                    {product.discount_type && product.discount_type !== 'none' && (
                      <span style={{
                        fontSize: '0.75rem',
                        background: '#238636',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        marginTop: '4px',
                        display: 'inline-block'
                      }}>
                        {product.discount_type === 'percent' 
                          ? `${product.discount_value}%` 
                          : formatRupiah(product.discount_value)} OFF
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Discount Form */}
          {selectedProduct && (
            <div style={{ 
              background: '#161b22', 
              border: '1px solid #30363d', 
              borderRadius: '6px', 
              padding: '16px' 
            }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem' }}>
                Set Diskon untuk: {selectedProduct.name}
              </h3>

              <div style={{ display: 'grid', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>
                    Tipe Diskon
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className={`btn ${discountType === 'percent' ? 'btn-accent' : 'btn-ghost'}`}
                      onClick={() => setDiscountType('percent')}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <FiPercent /> Persentase
                    </button>
                    <button
                      className={`btn ${discountType === 'fixed' ? 'btn-accent' : 'btn-ghost'}`}
                      onClick={() => setDiscountType('fixed')}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <FiDollarSign /> Nominal
                    </button>
                    <button
                      className={`btn ${discountType === 'none' ? 'btn-ghost' : 'btn-ghost'}`}
                      onClick={() => setDiscountType('none')}
                      style={{ flex: 1, borderColor: '#da3633', color: '#da3633' }}
                    >
                      Tidak Ada Diskon
                    </button>
                  </div>
                </div>

                {discountType !== 'none' && (
                  <>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>
                        Nilai Diskon ({discountType === 'percent' ? '%' : 'Rp'})
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={discountType === 'percent' ? '100' : undefined}
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: '#0d1117',
                          border: '1px solid #30363d',
                          borderRadius: '6px',
                          color: '#c9d1d9',
                          fontSize: '0.9rem'
                        }}
                        placeholder={discountType === 'percent' ? 'Contoh: 20' : 'Contoh: 5000'}
                      />
                    </div>

                    <div style={{ 
                      background: '#0d1117', 
                      padding: '12px', 
                      borderRadius: '6px',
                      border: '1px solid #30363d'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: '#8b949e' }}>Harga Asli:</span>
                        <span>{formatRupiah(selectedProduct.price)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: '#da3633' }}>Diskon:</span>
                        <span>- {formatRupiah(
                          discountType === 'percent' 
                            ? (selectedProduct.price * (parseFloat(discountValue) || 0) / 100)
                            : (parseFloat(discountValue) || 0)
                        )}</span>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        paddingTop: '8px', 
                        borderTop: '1px solid #30363d',
                        fontWeight: 600,
                        color: '#3fb950'
                      }}>
                        <span>Harga Setelah Diskon:</span>
                        <span>{formatRupiah(calculateDiscountedPrice())}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>
            Batal
          </button>
          <button 
            className="btn btn-accent" 
            onClick={handleSaveDiscount}
            disabled={!selectedProduct || (discountType !== 'none' && (!discountValue || parseFloat(discountValue) < 0))}
          >
            Simpan Diskon
          </button>
        </div>
      </div>
    </div>
  );
}
