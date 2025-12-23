import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getNotifications } from '../../services/notificationService';

const Sidebar = ({ role = 'ngo' }) => {
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

  // NGO Menu Items
  const ngoMenuItems = [
    { icon: '▦', label: 'Overview', path: '/ngo/dashboard' },
    { icon: '📍', label: 'Nearby Donations', path: '/ngo/donations' },
    { icon:  '↻', label: 'My Acceptances', path: '/ngo/acceptances' },
    { icon: '🔔', label: 'Notifications', path: '/ngo/notifications', badge: notificationCount },
  ];

  // Restaurant Menu Items
  const restaurantMenuItems = [
    { icon:  '▦', label: 'Overview', path: '/restaurant/dashboard' },
    { icon: '📦', label: 'My Donations', path: '/restaurant/donations' },
    { icon:  '📊', label: 'Analytics', path: '/restaurant/analytics' },
    { icon: '🔔', label: 'Notifications', path: '/restaurant/notifications', badge: notificationCount },
  ];

  const menuItems = role === 'ngo' ? ngoMenuItems : restaurantMenuItems;

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            🍃
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">FoodShare</h1>
            <p className="text-xs text-gray-500">{role === 'ngo' ? 'NGO Portal' : 'Restaurant Portal'}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item. path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive(item.path)
                    ? 'bg-green-600 text-white font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge > 0 && (
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                    isActive(item.path) ? 'bg-white text-green-600' : 'bg-orange-500 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <Link
          to={`/${role}/settings`}
          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
        >
          <span className="text-lg">⚙️</span>
          <span>Settings</span>
        </Link>
        <button
          onClick={handleLogout}
          disabled={loading}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all"
        >
          <span className="text-lg">↪</span>
          <span>{loading ? 'Logging out.. .' : 'Logout'}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;