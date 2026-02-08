import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Search, Edit2, Trash2, X, User as UserIcon, Shield, Key } from 'lucide-react';
import clsx from 'clsx';
import type { User } from '../types';

const Users = () => {
  const { users, addUser, updateUser, deleteUser, user: currentUser } = useStore();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    role: 'cashier' as 'admin' | 'cashier',
    pin: '',
  });

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      updateUser(editingUser.id, formData);
    } else {
      // Check if PIN already exists
      if (users.some(u => u.pin === formData.pin)) {
        alert('PIN sudah digunakan user lain!');
        return;
      }
      addUser(formData);
    }
    
    setShowModal(false);
    setEditingUser(null);
    setFormData({ name: '', role: 'cashier', pin: '' });
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      role: user.role,
      pin: user.pin,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (currentUser?.id === id) {
      alert('Tidak bisa menghapus akun sendiri!');
      return;
    }
    if (confirm('Apakah Anda yakin ingin menghapus user ini?')) {
      deleteUser(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen User</h1>
        <button
          onClick={() => {
            setEditingUser(null);
            setFormData({ name: '', role: 'cashier', pin: '' });
            setShowModal(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} />
          Tambah User
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari user..."
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
                <th className="px-6 py-4">Nama</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">PIN</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                        <UserIcon size={20} />
                      </div>
                      <span className="font-medium text-gray-800">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      "px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 w-fit",
                      user.role === 'admin' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                    )}>
                      {user.role === 'admin' ? <Shield size={14} /> : <UserIcon size={14} />}
                      {user.role === 'admin' ? 'Administrator' : 'Kasir'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-600">
                    {'•'.repeat(user.pin.length)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={currentUser?.id === user.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">
                {editingUser ? 'Edit User' : 'Tambah User Baru'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                    placeholder="Contoh: Budi Santoso"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role / Jabatan</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'cashier' })}
                    className={clsx(
                      "flex items-center justify-center gap-2 py-2 rounded-lg border transition-all",
                      formData.role === 'cashier'
                        ? "bg-blue-50 border-blue-200 text-blue-700 font-medium"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <UserIcon size={18} />
                    Kasir
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'admin' })}
                    className={clsx(
                      "flex items-center justify-center gap-2 py-2 rounded-lg border transition-all",
                      formData.role === 'admin'
                        ? "bg-purple-50 border-purple-200 text-purple-700 font-medium"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <Shield size={18} />
                    Admin
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PIN Akses</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    required
                    type="number"
                    value={formData.pin}
                    onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                    placeholder="PIN untuk login (Angka)"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Gunakan kombinasi angka unik.</p>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-indigo-700 text-white py-2.5 rounded-xl font-bold transition-colors shadow-lg shadow-primary/30"
                >
                  {editingUser ? 'Simpan Perubahan' : 'Tambah User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
