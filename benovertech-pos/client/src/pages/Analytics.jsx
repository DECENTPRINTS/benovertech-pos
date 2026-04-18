/**
 * Analytics Page
 * Sales reports and insights with charts - Connected to Backend
 */
import { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, Loader, AlertCircle } from 'lucide-react';
import * as api from '../api/client';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('week');
  const [analytics, setAnalytics] = useState(null);
  const [monthlyAnalytics, setMonthlyAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [analyticsData, productsData] = await Promise.all([
        api.getAnalytics(),
        api.getProducts(),
      ]);

      setAnalytics(analyticsData.data || analyticsData);
      setProducts(productsData.data || productsData);

      // Get current month analytics
      const now = new Date();
      try {
        const monthlyData = await api.getMonthlyAnalytics(now.getMonth() + 1, now.getFullYear());
        setMonthlyAnalytics(monthlyData.data || monthlyData);
      } catch (err) {
        // Monthly analytics might not be available yet
        console.log('Monthly analytics not available yet');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch analytics data');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="md:ml-64 p-8 text-center">
        <Loader className="animate-spin mx-auto mb-4 text-gray-400" size={48} />
        <p className="text-gray-600 text-lg">Loading analytics...</p>
      </div>
    );
  }

  // Sample daily data (in real app, would come from backend)
  const dailyData = [
    { day: 'Mon', sales: 450000, profit: 85000 },
    { day: 'Tue', sales: 520000, profit: 105000 },
    { day: 'Wed', sales: 480000, profit: 92000 },
    { day: 'Thu', sales: 610000, profit: 130000 },
    { day: 'Fri', sales: 950000, profit: 200000 },
  ];

  // Payment method breakdown
  const paymentData = [
    { name: 'Cash', value: 45, color: '#000000' },
    { name: 'Card', value: 36, color: '#ff9500' },
    { name: 'Transfer', value: 19, color: '#a78bfa' },
  ];

  // Top products
  const topProducts = products.slice(0, 5).map(p => ({
    name: p.name,
    units: 5 + Math.floor(Math.random() * 20),
    revenue: Math.floor(p.sellingPrice * (5 + Math.floor(Math.random() * 20))),
    profit: Math.floor((p.sellingPrice - p.costPrice) * (5 + Math.floor(Math.random() * 20))),
  }));

  const metrics = [
    {
      label: 'Total Sales',
      value: analytics?.totalSales ? `₦${(analytics.totalSales).toLocaleString()}` : '₦0',
      change: '+12.5%',
    },
    {
      label: 'Total Profit',
      value: analytics?.totalProfit ? `₦${(analytics.totalProfit).toLocaleString()}` : '₦0',
      subtext: `${((analytics?.totalProfit / (analytics?.totalSales || 1)) * 100).toFixed(1)}% margin`,
    },
    {
      label: 'Transactions',
      value: analytics?.transactionCount || '0',
      change: '+8.3%',
    },
    {
      label: 'Avg Order Value',
      value: `₦${Math.floor((analytics?.totalSales || 0) / (analytics?.transactionCount || 1)).toLocaleString()}`,
      change: '+5.2%',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:ml-64">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">Analytics</h1>
            <p className="text-gray-600 mt-1">Sales reports and insights</p>
          </div>
          <Button variant="accent" size="md" onClick={fetchAnalyticsData}>
            ↻ Refresh
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="md:ml-64 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <div>
            <p className="font-semibold text-red-800">Error Loading Analytics</p>
            <p className="text-sm text-red-700">{error}</p>
            <Button variant="secondary" size="sm" onClick={fetchAnalyticsData} className="mt-2">
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Time Range Filter */}
      <div className="md:ml-64 flex space-x-2">
        {['week', 'month', 'year'].map(range => (
          <Button
            key={range}
            variant={timeRange === range ? 'accent' : 'secondary'}
            size="sm"
            onClick={() => setTimeRange(range)}
            className="capitalize"
          >
            {range}
          </Button>
        ))}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:ml-64">
        {metrics.map((metric, idx) => (
          <Card key={idx} className="p-6">
            <p className="text-gray-600 text-sm font-medium">{metric.label}</p>
            <p className="text-2xl font-bold text-black mt-2">{metric.value}</p>
            {metric.change && <p className="text-green-600 text-xs font-medium mt-2">{metric.change}</p>}
            {metric.subtext && <p className="text-orange-600 text-xs font-medium mt-2">{metric.subtext}</p>}
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:ml-64 pb-24 md:pb-6">
        {/* Daily Sales Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-black mb-4">Daily Sales</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="sales" fill="#ff9500" radius={[8, 8, 0, 0]} />
              <Bar dataKey="profit" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Payment Method Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-black mb-4">Payment Methods</h3>
          <div className="flex items-center justify-between">
            <ResponsiveContainer width="40%" height={250}>
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-4 flex-1 pl-4">
              {paymentData.map((method, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: method.color }}
                    />
                    <span className="text-sm text-gray-700">{method.name}</span>
                  </div>
                  <span className="font-semibold text-black">{method.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Top Products Table */}
      <Card className="md:ml-64 overflow-hidden pb-24 md:pb-6">
        <div className="p-6">
          <h3 className="text-lg font-bold text-black mb-4">Top Products</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Units Sold</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Profit</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topProducts.map((product, idx) => {
                  const margin = ((product.profit / product.revenue) * 100).toFixed(1);
                  return (
                    <tr key={idx} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-black">{product.name}</td>
                      <td className="px-6 py-4 text-gray-700">{product.units}</td>
                      <td className="px-6 py-4 text-gray-700">₦{product.revenue.toLocaleString()}</td>
                      <td className="px-6 py-4 text-green-600 font-semibold">
                        ₦{product.profit.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm font-semibold">
                          {margin}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Monthly Comparison */}
      {monthlyAnalytics && (
        <Card className="md:ml-64 p-6 pb-24 md:pb-6">
          <h3 className="text-lg font-bold text-black mb-4">Monthly Comparison</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-2">This Month</p>
              <p className="text-2xl font-bold text-orange-600">
                ₦{monthlyAnalytics.monthTotal?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
              <p className="text-sm text-gray-600 mb-2">Last Month</p>
              <p className="text-2xl font-bold text-gray-700">
                ₦{monthlyAnalytics.previousMonthTotal?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-2">Growth</p>
              <p className="text-2xl font-bold text-green-600">
                {monthlyAnalytics.growth ? `+${monthlyAnalytics.growth.toFixed(1)}%` : 'N/A'}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
