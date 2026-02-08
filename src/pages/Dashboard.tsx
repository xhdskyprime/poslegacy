import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { formatRupiah } from '../utils/format';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, ShoppingBag, AlertCircle, Package } from 'lucide-react';
import { isSameDay, subDays, format } from 'date-fns';
import { id } from 'date-fns/locale';

const Dashboard = () => {
  const { transactions, products } = useStore();

  const stats = useMemo(() => {
    const today = new Date();
    const todaysTransactions = transactions.filter((t) => 
      isSameDay(new Date(t.date), today)
    );

    const todayRevenue = todaysTransactions.reduce((sum, t) => sum + t.total, 0);
    const lowStockCount = products.filter((p) => p.stock < 10).length;

    return {
      todayRevenue,
      todayCount: todaysTransactions.length,
      lowStockCount,
      totalProducts: products.length,
    };
  }, [transactions, products]);

  const chartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayTransactions = transactions.filter((t) => 
        isSameDay(new Date(t.date), date)
      );
      const revenue = dayTransactions.reduce((sum, t) => sum + t.total, 0);
      data.push({
        name: format(date, 'EEE', { locale: id }),
        revenue,
      });
    }
    return data;
  }, [transactions]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-green-50 p-3 rounded-xl">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Hari Ini</span>
          </div>
          <p className="text-gray-500 text-sm mb-1">Pendapatan</p>
          <h3 className="text-2xl font-bold text-gray-800">{formatRupiah(stats.todayRevenue)}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-blue-50 p-3 rounded-xl">
              <ShoppingBag className="text-blue-600" size={24} />
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Hari Ini</span>
          </div>
          <p className="text-gray-500 text-sm mb-1">Transaksi</p>
          <h3 className="text-2xl font-bold text-gray-800">{stats.todayCount}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-orange-50 p-3 rounded-xl">
              <AlertCircle className="text-orange-600" size={24} />
            </div>
            {stats.lowStockCount > 0 && (
              <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Perhatian</span>
            )}
          </div>
          <p className="text-gray-500 text-sm mb-1">Stok Menipis</p>
          <h3 className="text-2xl font-bold text-gray-800">{stats.lowStockCount} Item</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-purple-50 p-3 rounded-xl">
              <Package className="text-purple-600" size={24} />
            </div>
          </div>
          <p className="text-gray-500 text-sm mb-1">Total Produk</p>
          <h3 className="text-2xl font-bold text-gray-800">{stats.totalProducts} Item</h3>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Pendapatan 7 Hari Terakhir</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12 }} 
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <Tooltip 
                  formatter={(value: any) => [formatRupiah(Number(value)), 'Pendapatan']}
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Stok Perlu Restock</h3>
          <div className="space-y-4">
            {products
              .filter(p => p.stock < 10)
              .slice(0, 5)
              .map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                  <div>
                    <h4 className="font-medium text-gray-800 line-clamp-1">{p.name}</h4>
                    <p className="text-xs text-red-500 font-semibold">Sisa: {p.stock}</p>
                  </div>
                  <button className="text-xs bg-white px-2 py-1 rounded border border-red-100 text-red-600 font-medium">
                    Order
                  </button>
                </div>
              ))}
            {products.filter(p => p.stock < 10).length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <p>Semua stok aman</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
