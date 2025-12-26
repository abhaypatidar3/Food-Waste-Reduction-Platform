import { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const DashboardLayout = ({ children, role }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get theme color based on role
  const getThemeColor = () => {
    if (role === 'admin') return 'bg-purple-600';
    return 'bg-green-600';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={role} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={24} className="text-gray-600" />
            </button>
            
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 ${getThemeColor()} rounded-lg flex items-center justify-center text-white font-bold`}>
                {role === 'admin' ? '🛡️' : '🍃'}
              </div>
              <h1 className="text-lg font-bold text-gray-800">FoodShare</h1>
            </div>
            
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;