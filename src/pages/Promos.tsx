import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Edit, Trash2, X, Tag } from 'lucide-react';
import { formatRupiah } from '../utils/format';
import type { Promo } from '../types';
import clsx from 'clsx';

const Promos = () => {
  const { promos, addPromo, updatePromo, deletePromo } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState('');
  const [minPurchase, setMinPurchase] = useState('');
  const [active, setActive] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const promoData = {
      name,
      code,
      type,
      value: Number(value),
      minPurchase: minPurchase ? Number(minPurchase) : undefined,
      active,
    };

    if (editingPromo) {
      updatePromo(editingPromo.id, promoData);
    } else {
      addPromo(promoData);
    }
    closeModal();
  };

  const openModal = (promo?: Promo) => {
    if (promo) {
      setEditingPromo(promo);
      setName(promo.name);
      setCode(promo.code);
      setType(promo.type);
      setValue(promo.value.toString());
      setMinPurchase(promo.minPurchase?.toString() || '');
      setActive(promo.active);
    } else {
      setEditingPromo(null);
      setName('');
      setCode('');
      setType('percentage');
      setValue('');
      setMinPurchase('');
      setActive(true);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPromo(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus promo ini?')) {
      deletePromo(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Promo</h1>
          <p className="text-gray-500">Kelola kode promo dan diskon</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-primary hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
        >
          <Plus size={20} />
          Tambah Promo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promos.map((promo) => (
          <div key={promo.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-indigo-50 p-3 rounded-lg text-primary">
                  <Tag size={24} />
                </div>
                <div className={clsx(
                  "px-3 py-1 rounded-full text-xs font-semibold",
                  promo.active ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                )}>
                  {promo.active ? 'Aktif' : 'Non-aktif'}
                </div>
              </div>
              
              <h3 className="font-bold text-lg text-gray-800 mb-1">{promo.name}</h3>
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-mono font-bold tracking-wider">
                  {promo.code}
                </span>
                <span className="text-sm text-gray-500">
                  {promo.type === 'percentage' ? `${promo.value}%` : formatRupiah(promo.value)}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-500 mb-6">
                <div className="flex justify-between">
                  <span>Min. Belanja:</span>
                  <span className="font-medium text-gray-700">
                    {promo.minPurchase ? formatRupiah(promo.minPurchase) : '-'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-50">
                <button
                  onClick={() => openModal(promo)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(promo.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors text-sm font-medium"
                >
                  <Trash2 size={16} />
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">
                {editingPromo ? 'Edit Promo' : 'Tambah Promo Baru'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Promo</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                  placeholder="Contoh: Diskon Kemerdekaan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kode Promo</label>
                <input
                  required
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none uppercase"
                  placeholder="MERDEKA45"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Diskon</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none bg-white"
                  >
                    <option value="percentage">Persentase (%)</option>
                    <option value="fixed">Nominal (Rp)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nilai</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                    placeholder={type === 'percentage' ? '10' : '5000'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimal Belanja (Opsional)</label>
                <input
                  type="number"
                  min="0"
                  value={minPurchase}
                  onChange={(e) => setMinPurchase(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                  placeholder="0"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded text-primary focus:ring-primary"
                />
                <label htmlFor="active" className="text-sm text-gray-700">Promo Aktif</label>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Promos;
