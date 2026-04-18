/**
 * Sales (POS) Page
 * Receipt/checkout page for processing sales transactions - Connected to Backend
 */
import { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import ReceiptPreview from '../components/ReceiptPreview';
import BarcodeScannerModal from '../components/BarcodeScannerModal';
import { Search, Plus, Minus, X, CheckCircle, AlertCircle, Loader, Barcode } from 'lucide-react';
import * as api from '../api/client';

export default function Sales() {
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product) => {
    if (product.stock <= 0) {
      alert('This product is out of stock');
      return;
    }

    const existing = cartItems.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity < product.stock) {
        setCartItems(cartItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ));
      } else {
        alert(`Cannot exceed available stock (${product.stock})`);
      }
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  const handleBarcodeScanned = (product) => {
    // Add product to cart
    addToCart(product);
    // Close modal
    setShowBarcodeScanner(false);
    // Clear search
    setSearch('');
    // Optional: Show brief feedback
    console.log(`Added: ${product.name}`);
  };

  const removeFromCart = (productId) => {
    setCartItems(cartItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    const product = products.find(p => p.id === productId);
    if (quantity > product.stock) {
      alert(`Cannot exceed available stock (${product.stock})`);
      return;
    }
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(cartItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
  const totalCost = cartItems.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
  const totalProfit = totalAmount - totalCost;
  const profitMargin = totalAmount > 0 ? ((totalProfit / totalAmount) * 100).toFixed(2) : 0;

  const handleCompleteSale = async () => {
    if (cartItems.length === 0) {
      alert('Cart is empty');
      return;
    }

    try {
      setSubmitting(true);

      const saleData = {
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        customerName: customerName || 'Walk-in Customer',
        customerPhone: customerPhone || '',
        paymentMethod: paymentMethod,
      };

      const response = await api.createSale(saleData);

      // Create receipt data from cart items
      const receiptData = {
        id: response.data?.id || `RCP-${Date.now()}`,
        items: cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.sellingPrice,
        })),
        customerName: customerName || 'Walk-in Customer',
        customerPhone: customerPhone,
        paymentMethod: paymentMethod,
      };

      setCompletedSale(receiptData);
      setShowReceipt(true);
      setShowSuccess(true);

      // Auto-close success and clear cart after delay
      setTimeout(() => {
        setShowSuccess(false);
        setCartItems([]);
        setCustomerName('');
        setCustomerPhone('');
        setPaymentMethod('cash');
        // Refresh products to get updated stock
        fetchProducts();
      }, 3000);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:ml-64">
        <h1 className="text-3xl font-bold text-black">Point of Sale</h1>
        <p className="text-gray-600 mt-1">Process new transactions</p>
      </div>

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

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:ml-64 pb-24 md:pb-6">
          {/* Products Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search and Barcode Scanner */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search products by name or barcode..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
                />
              </div>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setShowBarcodeScanner(true)}
                className="flex items-center whitespace-nowrap"
              >
                <Barcode size={18} className="mr-2" />
                <span className="hidden sm:inline">Scan</span>
              </Button>
            </div>

            {/* Products Grid */}
            <Card className="p-6">
              {filteredProducts.length === 0 ? (
                <p className="text-center text-gray-500">No products found</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-semibold text-black">{product.name}</p>
                          <p className="text-sm text-gray-600">₦{product.sellingPrice.toLocaleString()}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-lg font-semibold ${
                          product.stock > 0
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {product.stock} in stock
                        </span>
                      </div>
                      <Button
                        variant="accent"
                        size="sm"
                        className="w-full"
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                      >
                        <Plus size={16} className="inline mr-1" /> Add
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Receipt Section */}
          <div className="space-y-4">
            {/* Success Message */}
            {showSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start space-x-3">
                <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                <div>
                  <p className="font-semibold text-green-800">Sale Complete!</p>
                  <p className="text-sm text-green-700">Receipt saved successfully</p>
                </div>
              </div>
            )}

            {/* Cart */}
            <Card className="p-6 sticky top-6">
              <h2 className="text-lg font-bold text-black mb-4">Receipt</h2>

              {/* Cart Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cartItems.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">Cart is empty</p>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-sm text-black">{item.name}</p>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-600">₦{item.sellingPrice.toLocaleString()}</p>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <p className="font-semibold text-sm text-black">
                          ₦{(item.sellingPrice * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Divider */}
              {cartItems.length > 0 && <div className="border-t border-gray-200 my-4" />}

              {/* Totals */}
              {cartItems.length > 0 && (
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">₦{totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Profit:</span>
                    <span className="font-semibold text-green-600">₦{totalProfit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Margin:</span>
                    <span className="font-semibold text-orange-600">{profitMargin}%</span>
                  </div>
                </div>
              )}

              {/* Customer Info */}
              <div className="space-y-3 mb-4 py-4 border-t border-gray-200 pt-4">
                <input
                  type="text"
                  placeholder="Customer name (optional)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-orange-500 outline-none"
                />
                <input
                  type="tel"
                  placeholder="Phone number (optional)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-orange-500 outline-none"
                />
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-orange-500 outline-none"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  variant="accent"
                  className="w-full font-semibold"
                  disabled={cartItems.length === 0 || submitting}
                  onClick={handleCompleteSale}
                >
                  {submitting ? (
                    <>
                      <Loader size={16} className="inline mr-1 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>✓ Complete Sale</>
                  )}
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    setCartItems([]);
                    setCustomerName('');
                    setCustomerPhone('');
                  }}
                  disabled={submitting}
                >
                  Clear
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Receipt Preview Modal */}
      <ReceiptPreview
        sale={completedSale}
        business={{
          name: 'BENOVERTECH',
          address: 'Lagos, Nigeria',
          phone: '+234 (0) 800-000-0000',
        }}
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
      />

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onProductSelected={handleBarcodeScanned}
        products={products}
      />
    </div>
  );
}
