import React from 'react';
import type { Transaction } from '../types';
import { formatRupiah, formatDate } from '../utils/format';

interface ReceiptProps {
  transaction: Transaction;
}

export const Receipt = React.forwardRef<HTMLDivElement, ReceiptProps>(({ transaction }, ref) => {
  return (
    <div ref={ref} className="p-4 bg-white text-black font-mono text-sm max-w-[80mm] mx-auto print:max-w-full">
      <div className="text-center mb-4 border-b border-black pb-4 border-dashed">
        <h1 className="text-xl font-bold mb-1">POS KASIR GEN Z</h1>
        <p className="text-xs">Jl. Teknologi No. 1, Jakarta</p>
        <p className="text-xs">Telp: 0812-3456-7890</p>
      </div>

      <div className="mb-4 text-xs">
        <div className="flex justify-between">
          <span>No:</span>
          <span>#{transaction.id.slice(0, 8)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tgl:</span>
          <span>{formatDate(transaction.date)}</span>
        </div>
        <div className="flex justify-between">
          <span>Kasir:</span>
          <span>{transaction.cashierName}</span>
        </div>
      </div>

      <div className="mb-4 border-b border-black pb-4 border-dashed">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-black border-dashed">
              <th className="py-1 w-1/2">Item</th>
              <th className="py-1 text-right">Qty</th>
              <th className="py-1 text-right">Hrg</th>
            </tr>
          </thead>
          <tbody>
            {transaction.items.map((item, index) => (
              <tr key={index}>
                <td className="py-1 align-top">
                  <div className="line-clamp-2">{item.name}</div>
                </td>
                <td className="py-1 text-right align-top">x{item.qty}</td>
                <td className="py-1 text-right align-top">
                  {formatRupiah(item.price * item.qty).replace('Rp', '')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-1 mb-6 text-right">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatRupiah(transaction.subtotal)}</span>
        </div>
        {transaction.discount > 0 && (
          <div className="flex justify-between text-black">
            <span>Diskon:</span>
            <span>-{formatRupiah(transaction.discount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-lg border-t border-black border-dashed pt-2 mt-2">
          <span>Total:</span>
          <span>{formatRupiah(transaction.total)}</span>
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span>Metode:</span>
          <span className="uppercase">{transaction.paymentMethod}</span>
        </div>
      </div>

      <div className="text-center text-xs border-t border-black border-dashed pt-4">
        <p>Terima kasih atas kunjungan Anda!</p>
        <p>Barang yang dibeli tidak dapat ditukar.</p>
        <p className="mt-2 text-[10px] text-gray-500">Powered by POS Gen Z</p>
      </div>
    </div>
  );
});

Receipt.displayName = 'Receipt';
