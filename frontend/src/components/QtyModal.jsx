import React, { useState } from 'react';
import { FiX, FiMinus, FiPlus, FiShoppingCart } from 'react-icons/fi';

export default function QtyModal({ product, onConfirm, onClose, formatRupiah }) {
  const [qty, setQty] = useState(1);

  const maxQty = product.stock;

  const increment = () => {
    if (qty < maxQty) setQty(qty + 1);
  };

  const decrement = () => {
    if (qty > 1) setQty(qty - 1);
  };

  const handleConfirm = () => {
    if (qty > 0 && qty <= maxQty) {
      onConfirm(product, qty);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal qty-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Jumlah Barang</h3>
          <button className="modal-close" onClick={onClose} id="btn-close-qty">
            <FiX />
          </button>
        </div>
        <div className="modal-body" style={{ textAlign: 'center' }}>
          <div className="qty-product-name">{product.name}</div>
          <div className="qty-product-price">{formatRupiah(product.price)} / pcs</div>
          <div style={{ fontSize: '0.75rem', color: '#6e7681', marginBottom: 12 }}>
            Stok tersedia: {product.stock}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 20 }}>
            <button
              className="cart-item-qty-btn"
              onClick={decrement}
              disabled={qty <= 1}
              style={{ width: 40, height: 40, fontSize: '1.2rem' }}
              id="btn-qty-dec"
            >
              <FiMinus />
            </button>
            <div className="qty-display">{qty}</div>
            <button
              className="cart-item-qty-btn"
              onClick={increment}
              disabled={qty >= maxQty}
              style={{ width: 40, height: 40, fontSize: '1.2rem' }}
              id="btn-qty-inc"
            >
              <FiPlus />
            </button>
          </div>

          <div style={{
            background: 'rgba(240, 180, 41, 0.08)',
            border: '1px solid rgba(240, 180, 41, 0.2)',
            borderRadius: 8,
            padding: '10px 16px',
            marginBottom: 8
          }}>
            <div style={{ fontSize: '0.75rem', color: '#8b949e', marginBottom: 2 }}>Subtotal</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f0b429' }}>
              {formatRupiah(product.price * qty)}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Batal</button>
          <button className="btn btn-accent" onClick={handleConfirm} id="btn-confirm-qty">
            <FiShoppingCart size={16} />
            Tambah ke Keranjang
          </button>
        </div>
      </div>
    </div>
  );
}
