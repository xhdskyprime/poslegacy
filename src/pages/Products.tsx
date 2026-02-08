import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Edit, Trash2, X, Search, Package, Tag, Layers } from 'lucide-react';
import { formatRupiah } from '../utils/format';
import type { Product, Category } from '../types';
import clsx from 'clsx';

const Products = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct, addCategory, updateCategory, deleteCategory } = useStore();
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  
  // Product State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [productFormData, setProductFormData] = useState<Partial<Product>>({
    name: '',
    category: '',
    price: 0,
    cost: 0,
    stock: 0,
  });

  // Category State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryName, setCategoryName] = useState('');

  // Filtered Data
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // Product Handlers
  const handleOpenProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductFormData(product);
    } else {
      setEditingProduct(null);
      setProductFormData({
        name: '',
        category: categories[0]?.name || '',
        price: 0,
        cost: 0,
        stock: 0,
      });
    }
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct(editingProduct.id, productFormData);
    } else {
      addProduct(productFormData as Omit<Product, 'id'>);
    }
    setIsProductModalOpen(false);
  };

  const handleProductDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus produk ini?')) {
      deleteProduct(id);
    }
  };

  // Category Handlers
  const handleOpenCategoryModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
    } else {
      setEditingCategory(null);
      setCategoryName('');
    }
    setIsCategoryModalOpen(true);
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      updateCategory(editingCategory.id, categoryName);
    } else {
      addCategory(categoryName);
    }
    setIsCategoryModalOpen(false);
  };

  const handleCategoryDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus kategori ini?')) {
      deleteCategory(id);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Produk & Kategori</h1>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('products')}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
              activeTab === 'products' 
                ? "bg-white text-primary shadow-sm" 
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Package size={18} />
            Daftar Produk
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
              activeTab === 'categories' 
                ? "bg-white text-primary shadow-sm" 
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Layers size={18} />
            Kategori
          </button>
        </div>
      </div>

      {activeTab === 'products' ? (
        <>
          <div className="flex justify-end mb-6">
            <button
              onClick={() => handleOpenProductModal()}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
            >
              <Plus size={20} />
              Tambah Produk
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                  <tr>
                    <th className="px-6 py-4">Nama Produk</th>
                    <th className="px-6 py-4">Kategori</th>
                    <th className="px-6 py-4">Harga Jual</th>
                    <th className="px-6 py-4">Modal</th>
                    <th className="px-6 py-4">Stok</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-800">{product.name}</td>
                      <td className="px-6 py-4">
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-primary font-semibold">{formatRupiah(product.price)}</td>
                      <td className="px-6 py-4 text-gray-500">{formatRupiah(product.cost)}</td>
                      <td className="px-6 py-4">
                        <span className={clsx(
                          "font-semibold",
                          product.stock < 10 ? "text-red-500" : "text-green-600"
                        )}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenProductModal(product)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleProductDelete(product.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
            
            {filteredProducts.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                Tidak ada produk ditemukan
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-end mb-6">
            <button
              onClick={() => handleOpenCategoryModal()}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
            >
              <Plus size={20} />
              Tambah Kategori
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Cari kategori..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Nama Kategori</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-primary rounded-lg">
                          <Tag size={18} />
                        </div>
                        <span className="font-medium text-gray-800">{category.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenCategoryModal(category)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleCategoryDelete(category.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredCategories.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                Tidak ada kategori ditemukan
              </div>
            )}
          </div>
        </>
      )}

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">
                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h2>
              <button onClick={() => setIsProductModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleProductSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
                <input
                  type="text"
                  required
                  value={productFormData.name}
                  onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary focus:outline-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select
                    value={productFormData.category}
                    onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary focus:outline-none bg-white"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={productFormData.stock}
                    onChange={(e) => setProductFormData({ ...productFormData, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga Jual</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={productFormData.price}
                    onChange={(e) => setProductFormData({ ...productFormData, price: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modal</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={productFormData.cost}
                    onChange={(e) => setProductFormData({ ...productFormData, cost: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30 mt-4"
              >
                {editingProduct ? 'Simpan Perubahan' : 'Tambah Produk'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">
                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
              </h2>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCategorySubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori</label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary focus:outline-none"
                  placeholder="Contoh: Makanan, Minuman"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30 mt-4"
              >
                {editingCategory ? 'Simpan Perubahan' : 'Tambah Kategori'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
