import { useState, useMemo, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, ShoppingBag, Printer, X, CheckCircle, Tag, LogOut } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { formatRupiah } from '../utils/format';
import { Receipt } from '../components/Receipt';
import ShiftModal from '../components/ShiftModal';
import PromoListModal from '../components/PromoListModal';
import type { Transaction, Promo } from '../types';
import clsx from 'clsx';

const POS = () => {
  const { products, cart, addToCart, removeFromCart, updateCartQty, clearCart, processTransaction, activeShift } = useStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [discount, setDiscount] = useState(0);
  const [selectedPromo, setSelectedPromo] = useState<Promo | null>(null);
  const [showPromoModal, setShowPromoModal] = useState(false);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [shiftModalType, setShiftModalType] = useState<'start' | 'end' | null>(null);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  
  const receiptRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Struk-${lastTransaction?.id || 'Transaksi'}`,
  });

  // Derive categories from products
  const categories = useMemo(() => {
    const cats = ['Semua', ...new Set(products.map((p) => p.category))];
    return cats;
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [cart]);

  // Handle Promo Application
  const applyPromo = (promo: Promo) => {
    setSelectedPromo(promo);
    setShowPromoModal(false);
  };

  const removePromo = () => {
    setSelectedPromo(null);
  };

  // Calculate Discount Amount based on Promo or Manual Input
  const calculatedDiscount = useMemo(() => {
    if (selectedPromo) {
      if (selectedPromo.type === 'percentage') {
        return Math.round((cartTotal * selectedPromo.value) / 100);
      } else {
        return selectedPromo.value;
      }
    }
    return discount;
  }, [selectedPromo, discount, cartTotal]);

  const finalTotal = Math.max(0, cartTotal - calculatedDiscount);

  const handleCheckout = (method: 'cash' | 'qris') => {
    if (!activeShift) {
      alert('Harap "Buka Kasir" (input modal awal) terlebih dahulu sebelum melakukan transaksi!');
      setShiftModalType('start');
      return;
    }

    if (cart.length === 0) return;
    
    if (confirm(`Konfirmasi pembayaran ${method === 'cash' ? 'Tunai' : 'QRIS'} sebesar ${formatRupiah(finalTotal)}?`)) {
      processTransaction(method, calculatedDiscount);
      // Get the latest transaction from the store (it was just added to the beginning)
      const latest = useStore.getState().transactions[0];
      setLastTransaction(latest);
      setShowSuccessModal(true);
      setDiscount(0);
      setSelectedPromo(null);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[calc(100vh-8rem)]">
      {/* Product Section */}
      <div className="flex-1 flex flex-col gap-6 w-full">
        {/* Search & Categories */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cari produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:outline-none shadow-sm"
              />
            </div>
            
            {activeShift ? (
              <button
                onClick={() => setShiftModalType('end')}
                className="bg-red-50 text-red-600 px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-red-100 transition-colors whitespace-nowrap"
              >
                <LogOut size={20} />
                <span>Tutup Kasir</span>
              </button>
            ) : (
              <button
                onClick={() => setShiftModalType('start')}
                className="bg-green-50 text-green-600 px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-green-100 transition-colors whitespace-nowrap"
              >
                <Banknote size={20} />
                <span>Buka Kasir</span>
              </button>
            )}
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={clsx(
                  'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0',
                  selectedCategory === cat
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 overflow-y-auto pr-2 pb-4 lg:pb-20">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              disabled={product.stock <= 0}
              className={clsx(
                "bg-white p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-left flex flex-col h-full",
                product.stock <= 0 && "opacity-60 cursor-not-allowed"
              )}
            >
              <div className="h-24 sm:h-32 bg-gray-100 rounded-lg mb-3 sm:mb-4 flex items-center justify-center text-3xl sm:text-4xl">
                {product.category === 'Minuman' ? '🥤' : product.category === 'Makanan' ? '🍲' : '🍟'}
              </div>
              <h3 className="font-semibold text-gray-800 line-clamp-2 mb-1 text-sm sm:text-base">{product.name}</h3>
              <div className="mt-auto flex justify-between items-end w-full">
                <div>
                  <p className="text-primary font-bold text-sm sm:text-base">{formatRupiah(product.price)}</p>
                  <p className={clsx("text-xs mt-1", product.stock < 5 ? "text-red-500 font-bold" : "text-gray-400")}>
                    Stok: {product.stock}
                  </p>
                </div>
                <div className="bg-primary/10 p-1.5 sm:p-2 rounded-lg text-primary">
                  <Plus size={16} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-full lg:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col h-[500px] lg:h-full mb-6 lg:mb-0">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Keranjang</h2>
            <button 
              onClick={clearCart}
              className="text-red-500 text-xs hover:bg-red-50 px-2 py-1 rounded"
            >
              Hapus Semua
            </button>
          </div>
          <p className="text-sm text-gray-400">{cart.length} Item dipilih</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
              <ShoppingBag size={48} className="text-gray-200" />
              <p>Keranjang kosong</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 p-3 rounded-xl border border-gray-50 hover:border-gray-100 transition-colors">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800 line-clamp-1">{item.name}</h4>
                  <p className="text-primary text-sm font-semibold">{formatRupiah(item.price)}</p>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                    <button
                      onClick={() => updateCartQty(item.id, item.qty - 1)}
                      className="p-1 hover:bg-white rounded-md transition-colors text-gray-600"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                    <button
                      onClick={() => updateCartQty(item.id, item.qty + 1)}
                      className="p-1 hover:bg-white rounded-md transition-colors text-gray-600"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-400 hover:text-red-600 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-gray-50 rounded-b-2xl border-t border-gray-100">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center text-gray-500">
              <span>Subtotal</span>
              <span>{formatRupiah(cartTotal)}</span>
            </div>
            
            <div className="flex justify-between items-center text-gray-500 gap-4">
              <span>Diskon (Rp)</span>
              
              {!selectedPromo ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPromoModal(true)}
                    className="flex items-center gap-2 text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-dashed border-primary/30"
                  >
                    <Tag size={16} />
                    Pilih Promo
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                  <Tag size={14} />
                  <span className="text-sm font-bold">{selectedPromo.code}</span>
                  <button onClick={removePromo} className="text-red-500 hover:bg-red-50 rounded-full p-0.5">
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            {selectedPromo && (
              <div className="text-right text-xs text-green-600 font-medium -mt-2">
                {selectedPromo.name} ({selectedPromo.type === 'percentage' ? `${selectedPromo.value}%` : formatRupiah(selectedPromo.value)})
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="font-bold text-gray-800">Total</span>
              <span className="text-2xl font-bold text-primary">{formatRupiah(finalTotal)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleCheckout('cash')}
              disabled={cart.length === 0}
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-green-500/30"
            >
              <Banknote size={20} />
              Tunai
            </button>
            <button
              onClick={() => handleCheckout('qris')}
              disabled={cart.length === 0}
              className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-blue-500/30"
            >
              <CreditCard size={20} />
              QRIS
            </button>
          </div>
        </div>
      </div>

      {/* Hidden Receipt for Printing */}
      <div style={{ display: 'none' }}>
        {lastTransaction && <Receipt key={lastTransaction.id} ref={receiptRef} transaction={lastTransaction} />}
      </div>

      {/* Success Modal */}
      {showSuccessModal && lastTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
              <CheckCircle size={48} />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Transaksi Berhasil!</h2>
            <p className="text-gray-500 mb-8">
              Pembayaran sebesar <span className="font-bold text-gray-800">{formatRupiah(lastTransaction.total)}</span> telah diterima.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  if (handlePrint) {
                    handlePrint();
                  }
                }}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
              >
                <Printer size={20} />
                Cetak Struk
              </button>
              
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-4 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Tutup / Transaksi Baru
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shift Modal (Start/End) */}
      {shiftModalType && (
        <ShiftModal type={shiftModalType} onClose={() => setShiftModalType(null)} />
      )}

      {/* Promo List Modal */}
      {showPromoModal && (
        <PromoListModal 
          onClose={() => setShowPromoModal(false)} 
          onSelect={applyPromo}
          currentTotal={cartTotal}
        />
      )}
    </div>
  );
};

export default POS;
