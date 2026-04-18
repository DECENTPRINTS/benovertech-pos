/**
 * Desktop Sidebar Navigation
 * Premium design with hover effects and active states
 */
import { LayoutDashboard, ShoppingCart, Package, BarChart3, Settings, LogOut } from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'sales', label: 'Sales', icon: ShoppingCart },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

const bottomMenuItems = [
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'logout', label: 'Logout', icon: LogOut },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-black fixed left-0 top-0 border-r border-gray-800">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-center">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
            <ShoppingCart size={24} className="text-white" />
          </div>
          <div className="ml-3">
            <h1 className="text-white font-bold text-lg">BENOVER</h1>
            <p className="text-gray-500 text-xs">POS System</p>
          </div>
        </div>
      </div>

      {/* Main Menu */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-xl
                transition-all duration-200
                ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-900'
                }
              `}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Menu */}
      <div className="px-3 py-4 space-y-2 border-t border-gray-800">
        {bottomMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className="
                w-full flex items-center space-x-3 px-4 py-3 rounded-xl
                text-gray-400 hover:text-white hover:bg-gray-900
                transition-all duration-200
              "
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="text-xs text-gray-600 text-center">
          <p>© 2024 BENOVERTECH</p>
          <p>Gadgets POS System</p>
        </div>
      </div>
    </aside>
  );
}
