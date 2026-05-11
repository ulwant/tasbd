import React from 'react';
import { FiClock, FiFileText, FiLogOut, FiUsers, FiPercent } from 'react-icons/fi';

export default function Navbar({
  totalBelanja,
  paymentAmount,
  kembalian,
  formatRupiah,
  onShowReport,
  onShowHistory,
  onShowUsers,
  onShowDiscounts,
  onLogout,
  user
}) {
  const isAdmin = user?.role === 'admin';

  return (
    <nav className="navbar" id="navbar-main">
      <div className="navbar-brand">
        <div className="navbar-brand-icon">K</div>
        <div className="navbar-brand-text">
          Kasir<span>Nuril</span>
        </div>
      </div>

      <div style={{ marginLeft: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        {isAdmin && (
          <>
        <button 
          className="btn" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: '#238636', 
            border: '1px solid #2ea043', 
            color: '#ffffff',
            padding: '6px 12px',
            fontSize: '0.85rem'
          }}
          onClick={onShowDiscounts}
        >
          <FiPercent /> Kelola Diskon
        </button>

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
          onClick={onShowHistory}
        >
          <FiClock /> History Transaksi
        </button>

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
          onClick={onShowUsers}
        >
          <FiUsers /> Akun
        </button>
          </>
        )}

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
          <div className="navbar-stat-label">Akun</div>
          <div className="navbar-stat-value blue">{user?.username || '-'}</div>
          <div style={{ fontSize: '0.68rem', color: isAdmin ? '#f0b429' : '#3fb950', textTransform: 'uppercase', fontWeight: 700 }}>
            {isAdmin ? 'Admin' : 'Kasir'}
          </div>
        </div>
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
      </div>
    </nav>
  );
}
