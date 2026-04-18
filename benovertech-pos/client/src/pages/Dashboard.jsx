/**
 * Dashboard Page
 * Premium Apple-style dashboard with key metrics and summary cards - Connected to Backend
 */
import { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { TrendingUp, Package, ShoppingCart, DollarSign, Loader, AlertCircle } from 'lucide-react';
import * as api from '../api/client';

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [analyticsData, salesData, productsData] = await Promise.all([
        api.getAnalytics(),
        api.getSales(),
        api.getProducts(),
      ]);

      setAnalytics(analyticsData.data || analyticsData);
      setSales((salesData.data || salesData).slice(0, 3)); // Get last 3 sales
      setProducts(productsData.data || productsData);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="md:ml-64 p-8 text-center">
        <Loader className="animate-spin mx-auto mb-4 text-gray-400" size={48} />
        <p className="text-gray-600 text-lg">Loading dashboard...</p>
      </div>
    );
  }

  // Calculate stats from analytics data
  const stats = [
    {
      label: 'Today\'s Sales',
      value: analytics?.totalSales ? `₦${analytics.totalSales.toLocaleString()}` : '₦0',
      change: '+15.2%',
      icon: DollarSign,
      color: 'from-orange-500 to-amber-500',
    },
    {
      label: 'Profit',
      value: analytics?.totalProfit ? `₦${analytics.totalProfit.toLocaleString()}` : '₦0',
      change: '+12.5%',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
    },
    {
      label: 'Items Sold',
      value: analytics?.itemsSold || 0,
      change: '+8.3%',
      icon: ShoppingCart,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Low Stock Items',
      value: products.filter(p => p.stock <= 2).length,
      change: '-2%',
      icon: Package,
      color: 'from-purple-500 to-pink-500',
    },
  ];

  // Get top products
  const topProducts = products
    .slice(0, 3)
    .map(p => ({
      name: p.name,
      sales: 'N/A',
      revenue: `₦${(p.sellingPrice * (products.indexOf(p) + 1)).toLocaleString()}`,
    }));

  const profitMargin = analytics?.totalSales > 0
    ? ((analytics.totalProfit / analytics.totalSales) * 100).toFixed(2)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:ml-64">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, today's overview</p>
          </div>
          <Button variant="accent" size="md" onClick={fetchDashboardData}>
            ↻ Refresh
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="md:ml-64 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <div>
            <p className="font-semibold text-red-800">Error Loading Dashboard</p>
            <p className="text-sm text-red-700">{error}</p>
            <Button variant="secondary" size="sm" onClick={fetchDashboardData} className="mt-2">
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:ml-64 mb-20 md:mb-0">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-black mt-2">{stat.value}</p>
                  <p className="text-green-600 text-xs font-medium mt-2">{stat.change}</p>
                </div>
                <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-xl`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:ml-64 pb-24 md:pb-6">
        {/* Recent Sales */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-black">Recent Sales</h2>
              <Button variant="ghost" size="sm">View All</Button>
            </div>

            {sales.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No sales yet today</p>
            ) : (
              <div className="space-y-3">
                {sales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-black">{sale.customerName || 'Walk-in'}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-black">₦{sale.totalAmount.toLocaleString()}</p>
                      <span className="text-xs text-green-600 font-medium">✓ {sale.paymentMethod}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions & Top Products */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-black mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button variant="accent" className="w-full">
                + New Sale
              </Button>
              <Button variant="secondary" className="w-full">
                Check Inventory
              </Button>
              <Button variant="ghost" className="w-full">
                View Reports
              </Button>
            </div>
          </Card>

          {/* Business Info */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-black mb-4">Summary</h3>
            <div className="space-y-3">
              <div className="pb-3 border-b border-gray-100">
                <p className="text-sm text-gray-600">Profit Margin</p>
                <p className="text-xl font-bold text-orange-600 mt-1">{profitMargin}%</p>
              </div>
              <div className="pb-3 border-b border-gray-100">
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-xl font-bold text-black mt-1">{products.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Transactions</p>
                <p className="text-xl font-bold text-blue-600 mt-1">{analytics?.transactionCount || 0}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:ml-64">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, today's overview</p>
          </div>
          <Button variant="accent" size="md">
            ↻ Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:ml-64 mb-20 md:mb-0">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-black mt-2">{stat.value}</p>
                  <p className="text-green-600 text-xs font-medium mt-2">{stat.change}</p>
                </div>
                <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-xl`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:ml-64 pb-24 md:pb-6">
        {/* Recent Sales */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-black">Recent Sales</h2>
              <Button variant="ghost" size="sm">View All</Button>
            </div>

            <div className="space-y-3">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-black">{sale.customer}</p>
                    <p className="text-sm text-gray-600">{sale.items} items • {sale.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-black">{sale.amount}</p>
                    <span className="text-xs text-green-600 font-medium">✓ {sale.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions & Top Products */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-black mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button variant="accent" className="w-full">
                + New Sale
              </Button>
              <Button variant="secondary" className="w-full">
                Check Inventory
              </Button>
              <Button variant="ghost" className="w-full">
                Print Report
              </Button>
            </div>
          </Card>

          {/* Top Products */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-black mb-4">Top Products</h3>
            <div className="space-y-3">
              {topProducts.map((product, idx) => (
                <div key={idx} className="pb-3 border-b border-gray-100 last:border-b-0">
                  <p className="font-medium text-black text-sm">{product.name}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-600">{product.sales} sales</span>
                    <span className="text-xs font-semibold text-orange-600">{product.revenue}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
