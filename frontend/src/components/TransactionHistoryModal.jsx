import React, { useEffect, useState } from 'react';
import { FiRefreshCw, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getTransaction, getTransactions } from '../api';

export default function TransactionHistoryModal({ onClose, formatRupiah }) {
  const [transactions, setTransactions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setTransactions(await getTransactions());
    } catch (err) {
      toast.error('Gagal memuat history: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (id) => {
    try {
      setSelected(await getTransaction(id));
    } catch (err) {
      toast.error('Gagal memuat detail transaksi: ' + err.message);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 900, width: '92%' }}>
        <div className="modal-header">
          <h3 className="modal-title">History Transaksi</h3>
          <button className="modal-close" onClick={onClose}><FiX /></button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ color: '#8b949e', fontSize: '0.85rem' }}>
              Semua transaksi beserta kasir, tanggal, dan jam.
            </span>
            <button className="btn btn-ghost" onClick={fetchTransactions}>
              <FiRefreshCw /> Refresh
            </button>
          </div>

          {loading ? (
            <p style={{ color: '#8b949e', textAlign: 'center', padding: 24 }}>Memuat...</p>
          ) : transactions.length === 0 ? (
            <p style={{ color: '#8b949e', textAlign: 'center', padding: 24 }}>Belum ada transaksi</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Kasir</th>
                    <th>Tanggal & Jam</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id}>
                      <td>{tx.invoice_number}</td>
                      <td>{tx.cashier_name || '-'}</td>
                      <td>{new Date(tx.created_at).toLocaleString('id-ID')}</td>
                      <td>{formatRupiah(tx.total_amount)}</td>
                      <td>
                        <button className="btn btn-ghost" onClick={() => fetchDetail(tx.id)}>
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selected && (
            <div className="history-detail">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <strong>Detail {selected.invoice_number}</strong>
                <button className="modal-close" onClick={() => setSelected(null)}><FiX /></button>
              </div>
              <div style={{ color: '#8b949e', fontSize: '0.85rem', marginBottom: 10 }}>
                Kasir: {selected.cashier_name || '-'} · {new Date(selected.created_at).toLocaleString('id-ID')}
              </div>
              {selected.items?.map(item => (
                <div key={item.id} className="history-item-row">
                  <span>{item.product_name} x {item.quantity}</span>
                  <span>{formatRupiah(item.subtotal)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
