import { useState, Fragment, useRef } from 'react';
import { flushSync } from 'react-dom';
import { useStore } from '../store/useStore';
import { formatDate, formatRupiah } from '../utils/format';
import { Search, ChevronDown, ChevronUp, Printer, XCircle, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { useReactToPrint } from 'react-to-print';
import { Receipt } from '../components/Receipt';
import type { Transaction } from '../types';

const History = () => {
  const { transactions, users, voidTransaction } = useStore();
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [printingTransaction, setPrintingTransaction] = useState<Transaction | null>(null);
  
  // Void Modal State
  const [voidModalOpen, setVoidModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [adminPin, setAdminPin] = useState('');
  const [voidReason, setVoidReason] = useState('');
  const [voidError, setVoidError] = useState('');

  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    onAfterPrint: () => setPrintingTransaction(null),
  });

  const filteredTransactions = transactions.filter((t) =>
    t.id.toLowerCase().includes(search.toLowerCase()) ||
    t.cashierName.toLowerCase().includes(search.toLowerCase())
  );

  const handlePrintClick = (trx: Transaction) => {
    flushSync(() => {
      setPrintingTransaction(trx);
    });
    handlePrint();
  };

  const handleVoidClick = (trx: Transaction) => {
    setSelectedTransaction(trx);
    setVoidModalOpen(true);
    setAdminPin('');
    setVoidReason('');
    setVoidError('');
  };

  const submitVoid = () => {
    if (!selectedTransaction) return;

    // Verify Admin PIN
    const adminUser = users.find(u => u.pin === adminPin && u.role === 'admin');
    
    if (!adminUser) {
      setVoidError('PIN Admin tidak valid');
      return;
    }

    if (!voidReason.trim()) {
      setVoidError('Alasan pembatalan wajib diisi');
      return;
    }

    voidTransaction(selectedTransaction.id, voidReason, adminUser.name);
    setVoidModalOpen(false);
    setSelectedTransaction(null);
  };

  return (
    <div>
      <div style={{ display: 'none' }}>
        {printingTransaction && (
          <Receipt key={printingTransaction.id} ref={componentRef} transaction={printingTransaction} />
        )}
      </div>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Riwayat Transaksi</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari ID transaksi atau kasir..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4">ID Transaksi</th>
                <th className="px-6 py-4">Waktu</th>
                <th className="px-6 py-4">Kasir</th>
                <th className="px-6 py-4">Metode</th>
                <th className="px-6 py-4 text-right">Total</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
                <th className="px-6 py-4 text-center">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.map((trx) => (
                <Fragment key={trx.id}>
                  <tr 
                    className={clsx(
                      "hover:bg-gray-50 transition-colors cursor-pointer",
                      expandedId === trx.id ? "bg-gray-50" : "",
                      trx.status === 'void' ? "bg-red-50" : ""
                    )}
                    onClick={() => setExpandedId(expandedId === trx.id ? null : trx.id)}
                  >
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">#{trx.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 text-gray-800">{formatDate(trx.date)}</td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                        {trx.cashierName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "px-3 py-1 rounded-full text-sm font-medium capitalize",
                        trx.paymentMethod === 'cash' ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"
                      )}>
                        {trx.paymentMethod === 'qris' ? 'QRIS' : 'Tunai'}
                      </span>
                    </td>
                    <td className={clsx("px-6 py-4 text-right font-bold", trx.status === 'void' ? "text-gray-400 line-through" : "text-gray-800")}>
                      {formatRupiah(trx.total)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {trx.status === 'void' ? (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">VOID</span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">VALID</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center flex justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrintClick(trx);
                        }}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Cetak Struk"
                      >
                        <Printer size={18} />
                      </button>
                      
                      {trx.status !== 'void' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVoidClick(trx);
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Void Transaksi"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-400">
                      {expandedId === trx.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </td>
                  </tr>
                  
                  {expandedId === trx.id && (
                    <tr className="bg-gray-50/50">
                      <td colSpan={8} className="px-6 py-4">
                        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                          <h4 className="font-semibold text-gray-800 mb-3 text-sm">Rincian Barang</h4>
                          <div className="space-y-2">
                            {trx.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm text-gray-600 border-b border-dashed border-gray-100 pb-2 last:border-0 last:pb-0">
                                <span className="flex-1">{item.name}</span>
                                <span className="w-20 text-center">{item.qty} x</span>
                                <span className="w-32 text-right font-medium">{formatRupiah(item.price * item.qty)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between text-sm font-medium">
                            <span className="text-gray-600">Subtotal</span>
                            <span>{formatRupiah(trx.subtotal)}</span>
                          </div>
                          {trx.discount > 0 && (
                            <div className="flex justify-between text-sm font-medium text-green-600">
                              <span>Diskon</span>
                              <span>-{formatRupiah(trx.discount)}</span>
                            </div>
                          )}

                          {trx.status === 'void' && (
                            <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
                              <h5 className="text-red-800 font-bold flex items-center gap-2 mb-1 text-sm">
                                <AlertTriangle size={14} />
                                Informasi Pembatalan (Void)
                              </h5>
                              <p className="text-xs text-red-700"><strong>Dibatalkan oleh:</strong> {trx.voidBy}</p>
                              <p className="text-xs text-red-700"><strong>Waktu:</strong> {formatDate(trx.voidAt || '')}</p>
                              <p className="text-xs text-red-700"><strong>Alasan:</strong> {trx.voidReason}</p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            Belum ada riwayat transaksi
          </div>
        )}
      </div>

      {/* Void Modal */}
      {voidModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <XCircle className="text-red-500" />
              Batalkan Transaksi
            </h2>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">ID Transaksi:</p>
                <p className="font-mono font-bold text-gray-800">#{selectedTransaction?.id.slice(0, 8)}</p>
                <p className="text-sm text-gray-600 mt-1">Total:</p>
                <p className="font-bold text-gray-800">{selectedTransaction && formatRupiah(selectedTransaction.total)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PIN Admin (Otorisasi)
                </label>
                <input
                  type="password"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                  placeholder="Masukkan PIN Admin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alasan Pembatalan
                </label>
                <textarea
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                  placeholder="Contoh: Salah input barang, Pelanggan cancel"
                  rows={3}
                />
              </div>

              {voidError && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                  {voidError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setVoidModalOpen(false)}
                  className="flex-1 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={submitVoid}
                  className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                >
                  Konfirmasi Void
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
