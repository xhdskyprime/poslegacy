import { useState, useMemo, useRef } from 'react';
import { useStore } from '../store/useStore';
import { formatRupiah, formatDate } from '../utils/format';
import { Calendar, TrendingUp, CreditCard, Banknote, AlertOctagon, FileText } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { isSameDay, parseISO, subDays, format } from 'date-fns';
import { id } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Reports = () => {
  const { transactions, logActivity } = useStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Laporan-Penjualan-${selectedDate}`,
    onAfterPrint: () => logActivity('Print Report', `Mencetak laporan harian tanggal ${selectedDate}`),
  });

  const reportData = useMemo(() => {
    const date = parseISO(selectedDate);
    
    // Filter transactions for the selected date
    const dayTransactions = transactions.filter(t => 
      isSameDay(parseISO(t.date), date)
    );

    const validTransactions = dayTransactions.filter(t => t.status !== 'void');
    const voidTransactions = dayTransactions.filter(t => t.status === 'void');

    const totalRevenue = validTransactions.reduce((sum, t) => sum + t.total, 0);
    const totalDiscount = validTransactions.reduce((sum, t) => sum + t.discount, 0);
    const grossSales = validTransactions.reduce((sum, t) => sum + t.subtotal, 0);
    
    const cashTransactions = validTransactions.filter(t => t.paymentMethod === 'cash');
    const qrisTransactions = validTransactions.filter(t => t.paymentMethod === 'qris');
    
    const cashTotal = cashTransactions.reduce((sum, t) => sum + t.total, 0);
    const qrisTotal = qrisTransactions.reduce((sum, t) => sum + t.total, 0);

    // Charts Data Calculation
    // 1. Weekly Stats (Ending on selected date)
    const weeklyStats = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(date, i);
      const dayTrx = transactions.filter(t => 
        isSameDay(parseISO(t.date), d) && t.status !== 'void'
      );
      const revenue = dayTrx.reduce((sum, t) => sum + t.total, 0);
      weeklyStats.push({
        name: format(d, 'EEE', { locale: id }),
        fullDate: format(d, 'dd MMM'),
        revenue,
      });
    }

    // 2. Top Products (For the selected date)
    const productMap = new Map<string, { name: string; qty: number; revenue: number }>();
    validTransactions.forEach(t => {
      t.items.forEach(item => {
        const existing = productMap.get(item.id);
        if (existing) {
          existing.qty += item.qty;
          existing.revenue += item.price * item.qty;
        } else {
          productMap.set(item.id, {
            name: item.name,
            qty: item.qty,
            revenue: item.price * item.qty
          });
        }
      });
    });

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    return {
      totalTransactions: dayTransactions.length,
      validCount: validTransactions.length,
      voidCount: voidTransactions.length,
      totalRevenue,
      totalDiscount,
      grossSales,
      cashTotal,
      qrisTotal,
      cashCount: cashTransactions.length,
      qrisCount: qrisTransactions.length,
      voidTotal: voidTransactions.reduce((sum, t) => sum + t.total, 0),
      weeklyStats,
      topProducts,
    };
  }, [transactions, selectedDate]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Laporan Penjualan</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <button
            onClick={() => handlePrint()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-sm hover:shadow-md"
          >
            <FileText size={18} />
            Download PDF / Cetak
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-xl">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <span className="text-xs font-medium bg-green-50 text-green-700 px-2 py-1 rounded-full">Net Sales</span>
          </div>
          <p className="text-gray-500 text-sm">Total Pendapatan</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{formatRupiah(reportData.totalRevenue)}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Banknote className="text-blue-600" size={24} />
            </div>
            <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-full">Cash</span>
          </div>
          <p className="text-gray-500 text-sm">Pembayaran Tunai</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{formatRupiah(reportData.cashTotal)}</h3>
          <p className="text-xs text-gray-400 mt-2">{reportData.cashCount} Transaksi</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-xl">
              <CreditCard className="text-purple-600" size={24} />
            </div>
            <span className="text-xs font-medium bg-purple-50 text-purple-700 px-2 py-1 rounded-full">QRIS</span>
          </div>
          <p className="text-gray-500 text-sm">Pembayaran QRIS</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{formatRupiah(reportData.qrisTotal)}</h3>
          <p className="text-xs text-gray-400 mt-2">{reportData.qrisCount} Transaksi</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-red-50 rounded-xl">
              <AlertOctagon className="text-red-600" size={24} />
            </div>
            <span className="text-xs font-medium bg-red-50 text-red-700 px-2 py-1 rounded-full">Void</span>
          </div>
          <p className="text-gray-500 text-sm">Transaksi Dibatalkan</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{reportData.voidCount}</h3>
          <p className="text-xs text-gray-400 mt-2">Total: {formatRupiah(reportData.voidTotal)}</p>
        </div>
      </div>

      {/* Printable Report View (PDF Style) */}
      <div className="hidden">
        <div ref={printRef} className="bg-white text-gray-800 font-sans p-8 max-w-[210mm] mx-auto min-h-[297mm] relative">
          <style type="text/css" media="print">
            {`
              @page { size: A4; margin: 0; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              @media print {
                .print-container { padding: 20mm; }
              }
            `}
          </style>
          
          <div className="print-container h-full">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-primary pb-6 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-primary mb-2">Laporan Penjualan Harian</h1>
                <p className="text-gray-500 font-medium">POS Gen Z Store</p>
              </div>
              <div className="text-right">
                <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-lg font-bold text-lg mb-2">
                  {formatDate(parseISO(selectedDate).toISOString())}
                </div>
                <p className="text-sm text-gray-400">Generated on {new Date().toLocaleTimeString('id-ID')}</p>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                <p className="text-green-600 text-sm font-semibold mb-1 uppercase tracking-wider">Total Pendapatan</p>
                <h3 className="text-3xl font-bold text-green-700">{formatRupiah(reportData.totalRevenue)}</h3>
              </div>
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <p className="text-blue-600 text-sm font-semibold mb-1 uppercase tracking-wider">Total Transaksi</p>
                <h3 className="text-3xl font-bold text-blue-700">{reportData.validCount}</h3>
              </div>
              <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                <p className="text-purple-600 text-sm font-semibold mb-1 uppercase tracking-wider">Rata-rata / Trx</p>
                <h3 className="text-3xl font-bold text-purple-700">
                  {reportData.validCount > 0 
                    ? formatRupiah(reportData.totalRevenue / reportData.validCount) 
                    : 'Rp 0'}
                </h3>
              </div>
            </div>

            {/* Charts in Print View */}
            <div className="grid grid-cols-2 gap-8 mb-8 break-inside-avoid">
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h3 className="text-sm font-bold text-gray-800 mb-4 text-center">Tren Penjualan (7 Hari)</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.weeklyStats}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val/1000}k`} />
                      <Bar dataKey="revenue" fill="#4f46e5" radius={[2, 2, 0, 0]} isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h3 className="text-sm font-bold text-gray-800 mb-4 text-center">Produk Terlaris (Top 5)</h3>
                {reportData.topProducts.length > 0 ? (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={reportData.topProducts}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={60}
                          paddingAngle={5}
                          dataKey="qty"
                          isAnimationActive={false}
                        >
                          {reportData.topProducts.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend 
                          layout="vertical" 
                          verticalAlign="middle" 
                          align="right"
                          wrapperStyle={{ fontSize: '10px' }}
                          formatter={(_, entry: any) => entry.payload.name}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-gray-400 text-xs">
                    No Data
                  </div>
                )}
              </div>
            </div>

            {/* Financial Details Table */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-primary rounded-full"></div>
                Rincian Keuangan
              </h3>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full">
                  <tbody className="divide-y divide-gray-100">
                    <tr className="bg-gray-50">
                      <td className="py-4 px-6 font-medium text-gray-600">Penjualan Kotor (Gross Sales)</td>
                      <td className="py-4 px-6 text-right font-bold text-gray-800">{formatRupiah(reportData.grossSales)}</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6 font-medium text-red-500">Total Diskon</td>
                      <td className="py-4 px-6 text-right font-bold text-red-500">-{formatRupiah(reportData.totalDiscount)}</td>
                    </tr>
                    <tr className="bg-primary/5">
                      <td className="py-4 px-6 font-bold text-primary text-lg">Total Pendapatan Bersih</td>
                      <td className="py-4 px-6 text-right font-bold text-primary text-lg">{formatRupiah(reportData.totalRevenue)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Methods & Void Stats */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                  Metode Pembayaran
                </h3>
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="py-3 px-4 text-gray-600">Tunai (Cash)</td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-bold block">{formatRupiah(reportData.cashTotal)}</span>
                          <span className="text-xs text-gray-400">{reportData.cashCount} Transaksi</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-gray-600">QRIS</td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-bold block">{formatRupiah(reportData.qrisTotal)}</span>
                          <span className="text-xs text-gray-400">{reportData.qrisCount} Transaksi</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-red-500 rounded-full"></div>
                  Pembatalan (Void)
                </h3>
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="py-3 px-4 text-gray-600">Total Void</td>
                        <td className="py-3 px-4 text-right font-bold text-red-500">{reportData.voidCount} Transaksi</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-gray-600">Nilai Void</td>
                        <td className="py-3 px-4 text-right font-bold text-red-500">{formatRupiah(reportData.voidTotal)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-8 text-center text-gray-400 text-sm border-t border-gray-100 mx-8 mb-8">
              <p>Dokumen ini dibuat secara otomatis oleh sistem POS Gen Z.</p>
              <p>Harap simpan dokumen ini sebagai bukti laporan keuangan yang sah.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Detailed Table for Screen View */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Detail Ringkasan</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-600">Total Penjualan Kotor</span>
              <span className="font-bold">{formatRupiah(reportData.grossSales)}</span>
            </div>
            <div className="flex justify-between p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-600">Total Diskon Diberikan</span>
              <span className="font-bold text-red-500">-{formatRupiah(reportData.totalDiscount)}</span>
            </div>
            <div className="flex justify-between p-4 bg-primary/5 rounded-xl border border-primary/10">
              <span className="font-bold text-primary">Total Pendapatan Bersih</span>
              <span className="font-bold text-primary text-xl">{formatRupiah(reportData.totalRevenue)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
