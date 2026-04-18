/**
 * Main App Component
 * Premium POS System with responsive navigation and page routing
 */
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Inventory from './pages/Inventory';
import Analytics from './pages/Analytics';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Page components
  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'sales':
        return <Sales />;
      case 'inventory':
        return <Inventory />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="App min-h-screen bg-gray-50">
      {/* Sidebar Navigation (Desktop) */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <main className="md:pl-64 bg-white md:bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          {renderPage()}
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}

export default App;
