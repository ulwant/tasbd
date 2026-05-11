import React from 'react';
import { FiShoppingBag, FiTrash2, FiMinus, FiPlus, FiCreditCard, FiX } from 'react-icons/fi';

export default function CartPanel({
  cart,
  totalBelanja,
  paymentAmount,
  kembalian,
  onQtyChange,
  onRemoveItem,
  onClearCart,
  onPaymentAmountChange,
  onPayment,
  formatRupiah
}) {
  const paymentNum = Number(paymentAmount) || 0;
  const isPaymentValid = paymentNum >= totalBelanja && cart.length > 0;

  return (
    <div className="panel panel-right" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 className="panel-title" style={{ marginBottom: 0 }}>
          <FiShoppingBag className="panel-title-icon" />
          Keranjang Belanja
        </h2>
        {cart.length > 0 && (
          <button
            className="btn btn-ghost"
            onClick={onClearCart}
            id="btn-clear-cart"
            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
          >
            <FiX size={12} />
            Kosongkan
          </button>
        )}
      </div>

      {/* Cart Items */}
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: 12 }}>
        {cart.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <div className="cart-empty-text">Keranjang Kosong</div>
            <div className="cart-empty-sub">Klik produk untuk menambahkan ke keranjang</div>
          </div>
        ) : (
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.product_id} className="cart-item" id={`cart-item-${item.product_id}`}>
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.product_name}</div>
                  <div className="cart-item-price">
                    {item.original_price && item.original_price !== item.price ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ textDecoration: 'line-through', fontSize: '0.85em', color: '#8b949e' }}>
                          {formatRupiah(item.original_price)}
                        </span>
                        <span style={{ color: '#3fb950' }}>{formatRupiah(item.price)} / pcs</span>
                      </span>
                    ) : (
                      <>{formatRupiah(item.price)} / pcs</>
                    )}
                  </div>
                </div>
                <div className="cart-item-controls">
                  <button
                    className="cart-item-qty-btn"
                    onClick={() => onQtyChange(item.product_id, -1)}
                    id={`btn-qty-minus-${item.product_id}`}
                  >
                    <FiMinus size={14} />
                  </button>
                  <span className="cart-item-qty">{item.quantity}</span>
                  <button
                    className="cart-item-qty-btn"
                    onClick={() => onQtyChange(item.product_id, 1)}
                    id={`btn-qty-plus-${item.product_id}`}
                  >
                    <FiPlus size={14} />
                  </button>
                </div>
                <div className="cart-item-subtotal">
                  {formatRupiah(item.price * item.quantity)}
                </div>
                <button
                  className="cart-item-remove"
                  onClick={() => onRemoveItem(item.product_id)}
                  title="Hapus item"
                  id={`btn-remove-${item.product_id}`}
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Section */}
      {cart.length > 0 && (
        <div className="payment-section">
          <div className="payment-summary">
            <div className="payment-row">
              <span className="payment-row-label">Item ({cart.reduce((s, i) => s + i.quantity, 0)} pcs)</span>
              <span className="payment-row-value">{formatRupiah(totalBelanja)}</span>
            </div>
            <div className="payment-row total">
              <span className="payment-row-label">TOTAL</span>
              <span className="payment-row-value">{formatRupiah(totalBelanja)}</span>
            </div>
          </div>

          <div className="payment-input-group">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Uang Bayar (Rp)</label>
              <input
                type="number"
                className="form-input"
                placeholder="Masukkan jumlah uang..."
                value={paymentAmount}
                onChange={(e) => onPaymentAmountChange(e.target.value)}
                id="input-payment-amount"
                min="0"
              />
            </div>
            <div className="form-group" style={{ minWidth: 120 }}>
              <label className="form-label">Kembalian</label>
              <div className={`payment-row change`}>
                <span className={`payment-row-value ${paymentNum > 0 && paymentNum < totalBelanja ? 'negative' : ''}`}
                  style={{ padding: '8px 0', fontSize: '1.1rem' }}>
                  {paymentNum > 0 ? (
                    kembalian >= 0 ? formatRupiah(kembalian) : '-' + formatRupiah(Math.abs(kembalian))
                  ) : 'Rp 0'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick cash buttons */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            {[totalBelanja, ...[5000, 10000, 20000, 50000, 100000].filter(v => v >= totalBelanja)].filter((v, i, a) => a.indexOf(v) === i && v > 0).slice(0, 5).map(val => (
              <button
                key={val}
                className="btn btn-ghost"
                style={{ padding: '4px 10px', fontSize: '0.7rem' }}
                onClick={() => onPaymentAmountChange(String(val))}
              >
                {formatRupiah(val)}
              </button>
            ))}
          </div>

          <div className="payment-buttons">
            <button
              className="btn btn-success btn-block btn-lg"
              disabled={!isPaymentValid}
              onClick={onPayment}
              id="btn-pay"
            >
              <FiCreditCard size={18} />
              Simpan Transaksi & Cetak Struk
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
