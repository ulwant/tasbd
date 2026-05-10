import React, { useRef } from 'react';
import { FiX, FiPrinter } from 'react-icons/fi';

export default function ReceiptModal({ data, onClose, formatRupiah }) {
  const receiptRef = useRef(null);

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Struk - ${data.invoice_number}</title>
        <style>
          @page {
            margin: 0; /* Menghilangkan URL dan Page Number browser */
          }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            background-color: #f4f4f4;
            display: flex;
            justify-content: center;
            padding: 20px;
          }
          .receipt-container {
            font-family: 'Courier New', Courier, monospace;
            width: 80mm; /* Standar thermal printer */
            background: #fff;
            padding: 20px;
            border: 1px solid #ccc; /* Border agar rapi */
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            font-size: 12px;
            color: #111;
          }
          .header { text-align: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px dashed #999; }
          .store-name { font-size: 16px; font-weight: bold; }
          .store-sub { font-size: 10px; color: #666; }
          .invoice { font-size: 11px; margin-top: 4px; }
          .date { font-size: 10px; color: #666; }
          .items { margin: 8px 0; padding-bottom: 8px; border-bottom: 1px dashed #999; }
          .item { display: flex; justify-content: space-between; margin-bottom: 2px; }
          .item-detail { font-size: 10px; color: #666; margin-bottom: 4px; }
          .totals { margin: 8px 0; padding-bottom: 8px; border-bottom: 2px dashed #999; }
          .row { display: flex; justify-content: space-between; margin-bottom: 2px; }
          .row.total { font-weight: bold; font-size: 14px; margin-top: 4px; }
          .footer { text-align: center; font-size: 10px; color: #666; margin-top: 10px; }
          
          @media print {
            body { 
              background-color: transparent; 
              padding: 0;
              margin: 10mm auto; /* Margin atas agar tidak terlalu mepet dengan kertas asli */
            }
            .receipt-container {
              box-shadow: none;
              margin: 0 auto;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          ${printContent.innerHTML}
        </div>
        <script>window.onload = function() { window.print(); window.close(); }<\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const date = new Date(data.created_at);
  const formattedDate = date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal receipt-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">🧾 Struk Transaksi</h3>
          <button className="modal-close" onClick={onClose} id="btn-close-receipt">
            <FiX />
          </button>
        </div>
        <div className="modal-body">
          <div className="receipt" ref={receiptRef}>
            <div className="header" style={{ textAlign: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '2px dashed #ccc' }}>
              <div className="store-name" style={{ fontSize: '1.2rem', fontWeight: 700 }}>KasirNuril POS</div>
              <div className="store-sub" style={{ fontSize: '0.75rem', color: '#666' }}>Sistem Kasir Modern</div>
              <div className="invoice" style={{ fontSize: '0.8rem', marginTop: 6, color: '#444' }}>
                {data.invoice_number}
              </div>
              <div className="date" style={{ fontSize: '0.75rem', color: '#666' }}>
                {formattedDate} • {formattedTime}
              </div>
            </div>

            <div className="items" style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px dashed #ccc' }}>
              {data.items.map((item, i) => (
                <div key={i}>
                  <div className="item" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 2, fontWeight: 600 }}>
                    <span>{item.product_name}</span>
                    <span>{formatRupiah(item.price * item.quantity)}</span>
                  </div>
                  <div className="item-detail" style={{ fontSize: '0.75rem', color: '#666', marginBottom: 6 }}>
                    {item.quantity} x {formatRupiah(item.price)}
                  </div>
                </div>
              ))}
            </div>

            <div className="totals" style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '2px dashed #ccc' }}>
              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 2 }}>
                <span>Subtotal</span>
                <span>{formatRupiah(data.total_amount)}</span>
              </div>
              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 2 }}>
                <span>Bayar</span>
                <span>{formatRupiah(data.payment_amount)}</span>
              </div>
              <div className="row total" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700, marginTop: 6, paddingTop: 6, borderTop: '1px solid #ddd' }}>
                <span>Kembalian</span>
                <span>{formatRupiah(data.change_amount)}</span>
              </div>
            </div>

            <div className="footer" style={{ textAlign: 'center', fontSize: '0.75rem', color: '#666' }}>
              <p>Terima kasih telah berbelanja!</p>
              <p style={{ marginTop: 2 }}>— KasirNuril POS —</p>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Tutup</button>
          <button className="btn btn-accent" onClick={handlePrint} id="btn-print-receipt">
            <FiPrinter size={16} />
            Cetak Struk
          </button>
        </div>
      </div>
    </div>
  );
}
