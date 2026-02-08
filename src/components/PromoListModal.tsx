import { useStore } from '../store/useStore';
import { X, Tag, Percent, DollarSign } from 'lucide-react';
import { formatRupiah } from '../utils/format';
import type { Promo } from '../types';

interface PromoListModalProps {
  onClose: () => void;
  onSelect: (promo: Promo) => void;
  currentTotal: number;
}

const PromoListModal = ({ onClose, onSelect, currentTotal }: PromoListModalProps) => {
  const { promos = [] } = useStore();
  
  // Filter active promos
  const availablePromos = (promos || []).filter(p => p.active);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Tag size={20} className="text-primary" />
            Pilih Promo
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {availablePromos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Tidak ada promo yang tersedia saat ini.
            </div>
          ) : (
            availablePromos.map((promo) => {
              const isEligible = !promo.minPurchase || currentTotal >= promo.minPurchase;
              
              return (
                <button
                  key={promo.id}
                  onClick={() => isEligible && onSelect(promo)}
                  disabled={!isEligible}
                  className={`w-full text-left p-4 rounded-xl border transition-all relative overflow-hidden group ${
                    isEligible 
                      ? 'border-gray-200 hover:border-primary hover:bg-indigo-50 cursor-pointer' 
                      : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-gray-800 group-hover:text-primary transition-colors">
                      {promo.name}
                    </span>
                    <span className="bg-gray-900 text-white text-xs px-2 py-1 rounded font-mono">
                      {promo.code}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    {promo.type === 'percentage' ? (
                      <div className="flex items-center gap-1 text-orange-500 font-bold">
                        <Percent size={14} />
                        {promo.value}%
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-green-600 font-bold">
                        <DollarSign size={14} />
                        Potongan {formatRupiah(promo.value)}
                      </div>
                    )}
                  </div>

                  {promo.minPurchase && (
                    <div className="text-xs text-gray-400">
                      Min. Belanja: {formatRupiah(promo.minPurchase)}
                    </div>
                  )}

                  {!isEligible && (
                    <div className="absolute inset-0 bg-white/50 flex items-center justify-center backdrop-blur-[1px]">
                      <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                        Belum Memenuhi Syarat
                      </span>
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default PromoListModal;
