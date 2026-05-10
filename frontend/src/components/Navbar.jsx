import React from 'react';
import { FiShoppingCart, FiFileText, FiLogOut } from 'react-icons/fi';

export default function Navbar({ totalBelanja, paymentAmount, kembalian, cartCount, formatRupiah, onShowReport, onLogout }) {
  return (
    <nav className="navbar" id="navbar-main">
      <div className="navbar-brand">
        <div className="navbar-brand-icon">K</div>
        <div className="navbar-brand-text">
          Kasir<span>Nuril</span>
        </div>
      </div>

      <div style={{ marginLeft: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button 
          className="btn" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'transparent', 
            border: '1px solid #30363d', 
            color: '#c9d1d9',
            padding: '6px 12px',
            fontSize: '0.85rem'
          }}
          onClick={onShowReport}
        >
          <FiFileText /> Rekap Harian
        </button>

        {onLogout && (
          <button 
            className="btn" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: 'transparent', 
              border: '1px solid #da3633', 
              color: '#da3633',
              padding: '6px 12px',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
            onClick={onLogout}
          >
            <FiLogOut /> Logout
          </button>
        )}
      </div>

      <div className="navbar-stats">
        <div className="navbar-stat">
          <div className="navbar-stat-label">Total Belanja</div>
          <div className="navbar-stat-value">{formatRupiah(totalBelanja)}</div>
        </div>
        <div className="navbar-stat">
          <div className="navbar-stat-label">Uang Bayar</div>
          <div className="navbar-stat-value blue">{formatRupiah(paymentAmount)}</div>
        </div>
        <div className="navbar-stat">
          <div className="navbar-stat-label">Kembalian</div>
          <div className="navbar-stat-value green">
            {kembalian >= 0 ? formatRupiah(kembalian) : '-' + formatRupiah(Math.abs(kembalian))}
          </div>
        </div>
        <div style={{ position: 'relative', marginLeft: 8 }}>
          <FiShoppingCart size={20} color="#8b949e" />
          {cartCount > 0 && (
            <span style={{
              position: 'absolute',
              top: -6,
              right: -8,
              background: '#f85149',
              color: '#fff',
              fontSize: '0.6rem',
              fontWeight: 700,
              width: 16,
              height: 16,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {cartCount}
            </span>
          )}
        </div>
      </div>
    </nav>
  );
}

      <div className="navbar-stats">
        <div className="navbar-stat">
          <div className="navbar-stat-label">Total Belanja</div>
          <div className="navbar-stat-value">{formatRupiah(totalBelanja)}</div>
        </div>
        <div className="navbar-stat">
          <div className="navbar-stat-label">Uang Bayar</div>
          <div className="navbar-stat-value blue">{formatRupiah(paymentAmount)}</div>
        </div>
        <div className="navbar-stat">
          <div className="navbar-stat-label">Kembalian</div>
          <div className="navbar-stat-value green">
            {kembalian >= 0 ? formatRupiah(kembalian) : '-' + formatRupiah(Math.abs(kembalian))}
          </div>
        </div>
        <div style={{ position: 'relative', marginLeft: 8 }}>
          <FiShoppingCart size={20} color="#8b949e" />
          {cartCount > 0 && (
            <span style={{
              position: 'absolute',
              top: -6,
              right: -8,
              background: '#f85149',
              color: '#fff',
              fontSize: '0.6rem',
              fontWeight: 700,
              width: 16,
              height: 16,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {cartCount}
            </span>
          )}
        </div>
      </div>
    </nav>
  );
}
