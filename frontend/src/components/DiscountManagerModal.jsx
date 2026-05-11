import React, { useState, useEffect } from 'react';
import { FiX, FiPercent, FiDollarSign } from 'react-icons/fi';
import { getProducts, setProductDiscount } from '../api';
import toast from 'react-hot-toast';

export default function DiscountManagerModal({ isOpen, onClose, formatRupiah }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [discountType, setDiscountType] = useState('none');
  const [discountValue, setDiscountValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setDiscountType(product.discount_type || 'none');
    setDiscountValue(product.discount_value || 0);
  };

  const handleSaveDiscount = async () => {
    if (!selectedProduct) {
      toast.error('Pilih produk terlebih dahulu');
      return;
    }

    try {
      await setProductDiscount(selectedProduct.id, discountType, discountValue);
      toast.success('Diskon produk berhasil diperbarui');
      loadProducts();
      setSelectedProduct(null);
      setDiscountType('none');
      setDiscountValue(0);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDiscountDisplay = (product) => {
    if (product.discount_type === 'percent') {
      return `${product.discount_value}%`;
    } else if (product.discount_type === 'fixed') {
      return formatRupiah(product.discount_value);
    }
    return '-';
  };

  const calculateDiscountedPrice = () => {
    if (!selectedProduct || discountType === 'none') {
      return selectedProduct?.price || 0;
    }
    
    let discount = 0;
    if (discountType === 'percent') {
      discount = (selectedProduct.price * discountValue) / 100;
    } else if (discountType === 'fixed') {
      discount = discountValue;
    }
    return Math.max(0, selectedProduct.price - discount);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2>Kelola Diskon Produk</h2>
          <button className="modal-close" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
          ) : (
            <>
              {/* Product Selection */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Cari Produk
                </label>
                <input
                  type="text"
                  placeholder="Ketik nama produk..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Product List */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Pilih Produk
                </label>
                <div style={{
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  maxHeight: '250px',
                  overflowY: 'auto'
                }}>
                  {filteredProducts.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                      Tidak ada produk ditemukan
                    </div>
                  ) : (
                    filteredProducts.map(product => (
                      <div
                        key={product.id}
                        onClick={() => handleSelectProduct(product)}
                        style={{
                          padding: '12px',
                          borderBottom: '1px solid #eee',
                          cursor: 'pointer',
                          backgroundColor: selectedProduct?.id === product.id ? '#f0f0f0' : 'white',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: '600' }}>{product.name}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {formatRupiah(product.price)}
                          </div>
                        </div>
                        {product.discount_type !== 'none' && (
                          <div style={{
                            backgroundColor: '#e8f5e9',
                            color: '#2e7d32',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {getDiscountDisplay(product)}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Discount Settings */}
              {selectedProduct && (
                <div style={{
                  backgroundColor: '#f5f5f5',
                  padding: '15px',
                  borderRadius: '6px',
                  border: '1px solid #ddd'
                }}>
                  <div style={{ marginBottom: '12px' }}>
                    <strong>Produk:</strong> {selectedProduct.name}
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <strong>Harga Asli:</strong> {formatRupiah(selectedProduct.price)}
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>
                      Tipe Diskon
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="discountType"
                          value="none"
                          checked={discountType === 'none'}
                          onChange={(e) => {
                            setDiscountType(e.target.value);
                            setDiscountValue(0);
                          }}
                        />
                        Tidak Ada Diskon
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="discountType"
                          value="percent"
                          checked={discountType === 'percent'}
                          onChange={(e) => setDiscountType(e.target.value)}
                        />
                        <FiPercent size={16} /> Persentase
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="discountType"
                          value="fixed"
                          checked={discountType === 'fixed'}
                          onChange={(e) => setDiscountType(e.target.value)}
                        />
                        <FiDollarSign size={16} /> Nominal
                      </label>
                    </div>
                  </div>

                  {discountType !== 'none' && (
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>
                        Nilai Diskon {discountType === 'percent' ? '(%)' : '(Rp)'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={discountType === 'percent' ? '100' : undefined}
                        value={discountValue}
                        onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  )}

                  {discountType !== 'none' && (
                    <div style={{
                      backgroundColor: '#e3f2fd',
                      padding: '10px',
                      borderRadius: '4px',
                      marginBottom: '12px'
                    }}>
                      <div style={{ fontSize: '12px', color: '#1565c0' }}>
                        <strong>Harga Setelah Diskon:</strong> {formatRupiah(calculateDiscountedPrice())}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-footer" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button
            className="btn btn-accent"
            onClick={handleSaveDiscount}
            disabled={!selectedProduct}
          >
            Simpan Diskon
          </button>
        </div>
      </div>
    </div>
  );
}
