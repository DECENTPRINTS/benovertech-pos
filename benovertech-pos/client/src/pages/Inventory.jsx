/**
 * Inventory Page
 * Manage products and stock levels - Connected to Backend
 */
import { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { Search, Plus, Edit2, Trash2, AlertTriangle, Loader } from 'lucide-react';
import * as api from '../api/client';

export default function Inventory() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getProducts();
      setProducts(data.data || data);
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      setDeleteLoading(id);
      await api.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
      alert('Product deleted successfully');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...new Set(products.map(p => p.category))];
  const lowStockCount = products.filter(p => p.stock <= 2).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:ml-64">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">Inventory</h1>
            <p className="text-gray-600 mt-1">Manage products and stock</p>
          </div>
          <Button variant="accent" size="md">
            + Add Product
          </Button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockCount > 0 && (
        <div className="md:ml-64 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3">
          <AlertTriangle className="text-amber-600 flex-shrink-0" size={20} />
          <div>
            <p className="font-semibold text-amber-900">{lowStockCount} items running low on stock</p>
            <p className="text-sm text-amber-800">Consider restocking soon</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="md:ml-64 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-800 font-medium">Error: {error}</p>
          <Button variant="secondary" size="sm" onClick={fetchProducts} className="mt-2">
            Try Again
          </Button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="md:ml-64 p-8 text-center">
          <Loader className="animate-spin mx-auto mb-2 text-gray-400" size={32} />
          <p className="text-gray-600">Loading products...</p>
        </div>
      )}

      {/* Filters and Search */}
      {!loading && (
        <>
          <Card className="p-6 md:ml-64">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name or barcode..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-sm"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200 focus:border-orange-500 outline-none text-sm"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </Card>

          {/* Products Table */}
          <Card className="md:ml-64 overflow-hidden pb-24 md:pb-0">
            {filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No products found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Product</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Category</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Stock</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Cost</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Price</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Margin</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredProducts.map((product) => {
                      const margin = ((product.sellingPrice - product.costPrice) / product.sellingPrice * 100).toFixed(1);
                      const isLowStock = product.stock <= 2;
                      return (
                        <tr key={product.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-black">{product.name}</p>
                              <p className="text-xs text-gray-600">{product.barcode}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">{product.category}</td>
                          <td className="px-6 py-4">
                            <span className={`
                              px-3 py-1 rounded-lg text-sm font-semibold
                              ${isLowStock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}
                            `}>
                              {product.stock} units
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">₦{product.costPrice.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">₦{product.sellingPrice.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-lg">
                              {margin}%
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end space-x-2">
                              <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition">
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(product.id)}
                                disabled={deleteLoading === product.id}
                                className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition disabled:opacity-50"
                              >
                                {deleteLoading === product.id ? (
                                  <Loader size={16} className="animate-spin" />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:ml-64">
            <Card className="p-6">
              <p className="text-gray-600 text-sm font-medium">Total Products</p>
              <p className="text-3xl font-bold text-black mt-2">{products.length}</p>
            </Card>
            <Card className="p-6">
              <p className="text-gray-600 text-sm font-medium">Total Stock Value</p>
              <p className="text-3xl font-bold text-black mt-2">
                ₦{products.reduce((sum, p) => sum + (p.costPrice * p.stock), 0).toLocaleString()}
              </p>
            </Card>
            <Card className="p-6">
              <p className="text-gray-600 text-sm font-medium">Low Stock Items</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{lowStockCount}</p>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

export default function Inventory() {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Sample products (will connect to API later)
  const allProducts = [
    { id: 1, name: 'iPhone 15 Pro', category: 'Smartphones', sku: 'IP15P', stock: 5, costPrice: 280000, sellingPrice: 350000, barcode: '8806000000000' },
    { id: 2, name: 'Samsung S24 Ultra', category: 'Smartphones', sku: 'SMS24U', stock: 3, costPrice: 240000, sellingPrice: 290000, barcode: '8806000000001' },
    { id: 3, name: 'iPad Pro', category: 'Tablets', sku: 'IPADPRO', stock: 2, costPrice: 450000, sellingPrice: 550000, barcode: '8806000000002' },
    { id: 4, name: 'MacBook Air M3', category: 'Laptops', sku: 'MBM3', stock: 1, costPrice: 650000, sellingPrice: 850000, barcode: '8806000000003' },
    { id: 5, name: 'Galaxy Tab S9 Ultra', category: 'Tablets', sku: 'GTABS9U', stock: 0, costPrice: 450000, sellingPrice: 520000, barcode: '8806000000004' },
    { id: 6, name: 'AirPods Pro', category: 'Accessories', sku: 'APP', stock: 10, costPrice: 45000, sellingPrice: 65000, barcode: '8806000000005' },
  ];

  const filteredProducts = allProducts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode.includes(search)
  );

  const categories = ['All', ...new Set(allProducts.map(p => p.category))];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const displayedProducts = selectedCategory === 'All'
    ? filteredProducts
    : filteredProducts.filter(p => p.category === selectedCategory);

  const lowStockCount = allProducts.filter(p => p.stock <= 2).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:ml-64">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">Inventory</h1>
            <p className="text-gray-600 mt-1">Manage products and stock</p>
          </div>
          <Button variant="accent" size="md" onClick={() => setShowAddModal(true)}>
            + Add Product
          </Button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockCount > 0 && (
        <div className="md:ml-64 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3">
          <AlertTriangle className="text-amber-600 flex-shrink-0" size={20} />
          <div>
            <p className="font-semibold text-amber-900">{lowStockCount} items running low on stock</p>
            <p className="text-sm text-amber-800">Consider restocking soon</p>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <Card className="p-6 md:ml-64">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, SKU, or barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-sm"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:border-orange-500 outline-none text-sm"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Products Table */}
      <Card className="md:ml-64 overflow-hidden pb-24 md:pb-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Product</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Stock</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Cost Price</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Selling Price</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Margin</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayedProducts.map((product) => {
                const margin = ((product.sellingPrice - product.costPrice) / product.sellingPrice * 100).toFixed(1);
                const isLowStock = product.stock <= 2;
                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-black">{product.name}</p>
                        <p className="text-xs text-gray-600">SKU: {product.sku}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{product.category}</td>
                    <td className="px-6 py-4">
                      <span className={`
                        px-3 py-1 rounded-lg text-sm font-semibold
                        ${isLowStock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}
                      `}>
                        {product.stock} units
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">₦{product.costPrice.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">₦{product.sellingPrice.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-lg">
                        {margin}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition">
                          <Edit2 size={16} />
                        </button>
                        <button className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:ml-64">
        <Card className="p-6">
          <p className="text-gray-600 text-sm font-medium">Total Products</p>
          <p className="text-3xl font-bold text-black mt-2">{allProducts.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 text-sm font-medium">Total Stock Value</p>
          <p className="text-3xl font-bold text-black mt-2">
            ₦{allProducts.reduce((sum, p) => sum + (p.costPrice * p.stock), 0).toLocaleString()}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 text-sm font-medium">Low Stock Items</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{lowStockCount}</p>
        </Card>
      </div>
    </div>
  );
}
