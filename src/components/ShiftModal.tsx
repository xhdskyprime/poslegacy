import { useState } from 'react';
import { useStore } from '../store/useStore';
import { formatRupiah } from '../utils/format';
import { X, DollarSign, Calculator } from 'lucide-react';

interface ShiftModalProps {
  type: 'start' | 'end';
  onClose?: () => void;
}

const ShiftModal = ({ type, onClose }: ShiftModalProps) => {
  const { activeShift, startShift, endShift, transactions } = useStore();
  const [cashAmount, setCashAmount] = useState('');
  const [qrisAmount, setQrisAmount] = useState('');

  // Calculate expected cash for closing shift
  const { expectedCash, expectedQris } = type === 'end' && activeShift ? (() => {
    const shiftTransactions = transactions.filter(
      (t) => t.cashierId === activeShift.cashierId && 
             new Date(t.date) >= new Date(activeShift.startTime)
    );
    
    const cashTrx = shiftTransactions.filter(t => t.paymentMethod === 'cash');
    const qrisTrx = shiftTransactions.filter(t => t.paymentMethod === 'qris');
    
    const totalCashTransaction = cashTrx.reduce((sum, t) => sum + t.total, 0);
    const totalQrisTransaction = qrisTrx.reduce((sum, t) => sum + t.total, 0);
    
    return {
      expectedCash: activeShift.startCash + totalCashTransaction,
      expectedQris: totalQrisTransaction
    };
  })() : { expectedCash: 0, expectedQris: 0 };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cash = Number(cashAmount);
    const qris = Number(qrisAmount);
    
    if (type === 'start') {
      startShift(cash);
    } else {
      endShift(cash, qris);
    }
    
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">
            {type === 'start' ? 'Buka Kasir (Start Shift)' : 'Tutup Kasir (Settlement)'}
          </h2>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={20} />
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <DollarSign size={40} />
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-500 mb-2">
              {type === 'start' 
                ? 'Masukkan jumlah uang modal awal di laci kasir.' 
                : 'Hitung total uang tunai yang ada di laci saat ini.'}
            </p>
          </div>

          {type === 'end' && activeShift && (
            <div className="bg-gray-50 p-4 rounded-xl space-y-4 text-sm">
              <div className="space-y-2 pb-3 border-b border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-500">Modal Awal:</span>
                  <span className="font-medium">{formatRupiah(activeShift.startCash)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Estimasi Tunai (Sistem):</span>
                  <span className="font-bold text-gray-800">{formatRupiah(expectedCash || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Estimasi QRIS (Sistem):</span>
                  <span className="font-bold text-gray-800">{formatRupiah(expectedQris || 0)}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                 <span className="font-bold text-gray-700">Total Settlement:</span>
                 <span className="font-bold text-xl text-primary">
                    {formatRupiah(Number(cashAmount) + Number(qrisAmount))}
                 </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {type === 'start' ? 'Modal Awal (Rp)' : 'Total Uang Tunai di Laci (Rp)'}
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Calculator size={20} />
              </div>
              <input
                required
                type="number"
                min="0"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:outline-none text-lg font-bold"
                placeholder="0"
                autoFocus
              />
            </div>
            {type === 'end' && (
               <div className="flex justify-between text-xs mt-1 px-1">
                 <span className="text-gray-400">Selisih Tunai:</span>
                 <span className={Number(cashAmount) - (expectedCash || 0) < 0 ? "text-red-500 font-bold" : "text-green-500 font-bold"}>
                    {formatRupiah(Number(cashAmount) - (expectedCash || 0))}
                 </span>
               </div>
            )}
          </div>

          {type === 'end' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Transaksi QRIS (Cek EDC/HP)
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Calculator size={20} />
                </div>
                <input
                  required
                  type="number"
                  min="0"
                  value={qrisAmount}
                  onChange={(e) => setQrisAmount(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:outline-none"
                  placeholder="0"
                />
              </div>
               <div className="flex justify-between text-xs mt-1 px-1">
                 <span className="text-gray-400">Selisih QRIS:</span>
                 <span className={Number(qrisAmount) - (expectedQris || 0) < 0 ? "text-red-500 font-bold" : "text-green-500 font-bold"}>
                    {formatRupiah(Number(qrisAmount) - (expectedQris || 0))}
                 </span>
               </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!cashAmount}
            className="w-full py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {type === 'start' ? 'Buka Kasir' : 'Tutup & Simpan Laporan'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ShiftModal;
