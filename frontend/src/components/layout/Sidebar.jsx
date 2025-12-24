import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getNotifications } from '../../services/notificationService';
import { X, Menu } from 'lucide-react';

const Sidebar = ({ role = 'ngo', isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    fetchNotificationCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchNotificationCount = async () => {
    try {
      const response = await getNotifications();
      if (response.success) {
        setNotificationCount(response.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      setLoading(true);
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleNavClick = (path) => {
    navigate(path);
    if (onClose) onClose(); // Close mobile menu after navigation
  };

  // NGO Menu Items
  const ngoMenuItems = [
    { icon: '▦', label:  'Overview', path: '/ngo/dashboard' },
    { icon: '📍', label:  'Nearby Donations', path: '/ngo/donations' },
    { icon: '↻', label: 'My Acceptances', path: '/ngo/acceptances' },
    { icon: '🔔', label:  'Notifications', path: '/ngo/notifications', badge: notificationCount },
  ];

  // Restaurant Menu Items
  const restaurantMenuItems = [
    { icon: '▦', label:  'Overview', path: '/restaurant/dashboard' },
    { icon: '📦', label: 'My Donations', path: '/restaurant/donations' },
    { icon: '📊', label:  'Analytics', path: '/restaurant/analytics' },
    { icon: '🔔', label:  'Notifications', path: '/restaurant/notifications', badge: notificationCount },
  ];

  const menuItems = role === 'ngo' ? ngoMenuItems :  restaurantMenuItems;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out lg:transform-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              🍃
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">FoodShare</h1>
              <p className="text-xs text-gray-500">{role === 'ngo' ? 'NGO Portal' : 'Restaurant Portal'}</p>
            </div>
          </div>

          {/* Close button (mobile only) */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover: bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems. map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => handleNavClick(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive(item.path)
                      ? 'bg-green-600 text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item. badge > 0 && (
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      isActive(item.path) ? 'bg-white text-green-600' : 'bg-orange-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button
            onClick={() => handleNavClick(`/${role}/settings`)}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
          >
            <span className="text-lg">⚙️</span>
            <span>Settings</span>
          </button>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
          >
            <span className="text-lg">↪</span>
            <span>{loading ? 'Logging out.. .' : 'Logout'}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;