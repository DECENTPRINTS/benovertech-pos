/**
 * Mobile Bottom Navigation
 * Premium design with icon-based navigation
 */
import { LayoutDashboard, ShoppingCart, Package, BarChart3 } from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'sales', label: 'Sales', icon: ShoppingCart },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export default function BottomNav({ activeTab, setActiveTab }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 z-50">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                flex flex-col items-center justify-center
                px-4 py-3 space-y-1
                transition-all duration-200
                ${
                  isActive
                    ? 'text-orange-500'
                    : 'text-gray-500 hover:text-gray-300'
                }
              `}
            >
              <Icon size={24} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
