import React, { useState, useEffect } from 'react';
import { FiX, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import { getTrashProducts, permanentDeleteProduct, restoreProduct } from '../api';

export default function TrashModal({ onClose, onRestored, formatRupiah }) {
  const [deletedProducts, setDeletedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrash = async () => {
    try {
      setLoading(true);
      setDeletedProducts(await getTrashProducts());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (id) => {
    try {
      await restoreProduct(id);
      await fetchTrash();
      onRestored();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePermanentDelete = async (id) => {
    if (!window.confirm('Hapus permanen? Data tidak bisa dikembalikan!')) return;
    try {
      await permanentDeleteProduct(id);
      await fetchTrash();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600, width: '90%' }}>
        <div className="modal-header">
          <h3 className="modal-title">🗑️ Sampah Produk</h3>
          <button className="modal-close" onClick={onClose}><FiX /></button>
        </div>
        <div className="modal-body">
          {loading ? (
            <p style={{ color: '#6B7280', textAlign: 'center', padding: '2rem' }}>Memuat...</p>
          ) : deletedProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🗑️</div>
              <p>Sampah kosong</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {deletedProducts.map(product => (
                <div key={product.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)',
                  borderRadius: '8px', border: '1px solid #30363d'
                }}>
                  <div>
                    <div style={{ fontWeight: 500, color: '#e6edf3' }}>{product.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#8b949e', marginTop: '2px' }}>
                      {formatRupiah(product.price)} · Stok: {product.stock}
                      {product.category_name && ` · ${product.category_name}`}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>
                      Dihapus: {new Date(product.deleted_at).toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleRestore(product.id)}
                      title="Pulihkan"
                      style={{
                        background: 'rgba(63, 185, 80, 0.15)', border: '1px solid #3fb950',
                        borderRadius: '6px', padding: '6px 10px', color: '#3fb950',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                        fontSize: '0.8rem'
                      }}
                    >
                      <FiRefreshCw size={13} /> Pulihkan
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(product.id)}
                      title="Hapus permanen"
                      style={{
                        background: 'rgba(248, 81, 73, 0.15)', border: '1px solid #f85149',
                        borderRadius: '6px', padding: '6px 10px', color: '#f85149',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                        fontSize: '0.8rem'
                      }}
                    >
                      <FiTrash2 size={13} /> Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Tutup</button>
        </div>
      </div>
    </div>
  );
}
