import React, { useState, useEffect } from 'react';
import { getTransactions } from '../api';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { FiDownload, FiX } from 'react-icons/fi';

export default function SalesReportModal({ onClose, formatRupiah }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [date]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getTransactions({ date });
      setTransactions(data);
    } catch (err) {
      toast.error('Gagal memuat data transaksi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = transactions.reduce((sum, tx) => sum + Number(tx.total_amount), 0);

  const handleExport = () => {
    if (transactions.length === 0) {
      toast.error('Tidak ada data untuk diexport');
      return;
    }

    // Format data for excel
    const excelData = transactions.map((tx, index) => ({
      No: index + 1,
      'No. Invoice': tx.invoice_number,
      Waktu: new Date(tx.created_at).toLocaleString('id-ID'),
      'Total Belanja': Number(tx.total_amount),
      'Uang Bayar': Number(tx.payment_amount),
      Kembalian: Number(tx.change_amount)
    }));

    // Add total row
    excelData.push({
      No: '',
      'No. Invoice': '',
      Waktu: 'TOTAL PENDAPATAN',
      'Total Belanja': totalRevenue,
      'Uang Bayar': '',
      Kembalian: ''
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Penjualan');

    // Auto fit columns
    const wscols = [
      { wch: 5 }, // No
      { wch: 20 }, // Invoice
      { wch: 20 }, // Waktu
      { wch: 15 }, // Total
      { wch: 15 }, // Bayar
      { wch: 15 }  // Kembalian
    ];
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook, `Rekap_Penjualan_${date}.xlsx`);
    toast.success('Berhasil export ke Excel!');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '800px', width: '90%' }}>
        <div className="modal-header">
          <h2>Rekap Penjualan Harian</h2>
          <button className="icon-btn" onClick={onClose}><FiX size={20} /></button>
        </div>

        <div style={{ margin: '20px 0', display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div className="input-group" style={{ marginBottom: 0, flex: 1 }}>
            <label>Pilih Tanggal</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="form-input"
            />
          </div>
          <button 
            className="btn btn-primary" 
            onClick={handleExport}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-end', height: '42px' }}
          >
            <FiDownload /> Export Excel
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#8b949e' }}>Memuat data...</div>
        ) : (
          <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table className="cart-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Invoice</th>
                  <th>Waktu</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#8b949e' }}>
                      Tidak ada transaksi pada tanggal ini
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx, idx) => (
                    <tr key={tx.id}>
                      <td>{idx + 1}</td>
                      <td>{tx.invoice_number}</td>
                      <td>{new Date(tx.created_at).toLocaleTimeString('id-ID')}</td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                        {formatRupiah(tx.total_amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {transactions.length > 0 && (
                <tfoot>
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem', color: '#3fb950' }}>TOTAL PENDAPATAN :</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem', color: '#3fb950' }}>
                      {formatRupiah(totalRevenue)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
