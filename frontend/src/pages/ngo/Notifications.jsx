import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';

const Notifications = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'unread'
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'new_donation',
      title: 'New donation nearby',
      message: 'Tasty Bites Restaurant posted Fresh Bread & Pastries (40 items) - 0.8 km away',
      time: '5 minutes ago',
      read: false,
      icon: '📍',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      id: 2,
      type: 'urgent',
      title: 'Urgent donation expiring soon',
      message: 'Vegetable Curry from Spice Kitchen expires in 1 hour - 1.2 km away',
      time: '15 minutes ago',
      read:  false,
      icon: '⏰',
      iconBg: 'bg-orange-100',
      iconColor:  'text-orange-600'
    },
    {
      id: 3,
      type: 'reminder',
      title: 'Pickup reminder',
      message: "Don't forget to pickup Rice & Dal from Green Kitchen by 8: 00 PM today",
      time: '1 hour ago',
      read:  false,
      icon: '🔔',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      id: 4,
      type: 'completed',
      title: 'Donation completed',
      message: 'Successfully picked up Fruit Salad from Fresh Foods.  25 people fed! ',
      time: '2 hours ago',
      read: true,
      icon: '✓',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      id: 5,
      type: 'new_donation',
      title: 'New donation nearby',
      message: "Baker's Corner posted Packaged Snacks (30 items) - 1.5 km away",
      time: '3 hours ago',
      read:  true,
      icon: '📍',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      id: 6,
      type: 'impact',
      title: 'Weekly impact summary',
      message: 'Great work!  You helped feed 250 people this week with 15 donations',
      time: '1 day ago',
      read:  true,
      icon: '📊',
      iconBg:  'bg-indigo-100',
      iconColor: 'text-indigo-600'
    }
  ]);

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    
    // Navigate based on notification type
    if (notification.type === 'new_donation' || notification.type === 'urgent') {
      navigate('/ngo/donations');
    } else if (notification.type === 'reminder' || notification.type === 'completed') {
      navigate('/ngo/acceptances');
    }
  };

  const getFilteredNotifications = () => {
    if (activeTab === 'unread') {
      return notifications.filter(n => !n.read);
    }
    return notifications;
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n. read).length;

  return (
    <DashboardLayout role="ngo" notificationCount={unreadCount}>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Notifications</h1>
            <p className="text-gray-600">Stay updated on new donations and reminders</p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 text-green-600 hover:text-green-700 font-semibold text-sm transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-4 font-semibold transition-colors ${
                activeTab === 'all'
                  ?  'text-green-600 border-b-2 border-green-600'
                  :  'text-gray-600 hover:text-green-600'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`px-6 py-4 font-semibold transition-colors ${
                activeTab === 'unread'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="divide-y divide-gray-200">
            {filteredNotifications. length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔔</span>
                </div>
                <p className="text-lg text-gray-600 mb-2">No notifications</p>
                <p className="text-sm text-gray-500">You're all caught up!</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification. id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-6 cursor-pointer transition-all hover:bg-gray-50 ${
                    ! notification.read ?  'bg-green-50/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 ${notification.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <span className={`text-2xl ${notification.iconColor}`}>
                        {notification.icon}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-1">
                        <h3 className="font-bold text-gray-800">{notification.title}</h3>
                        {! notification.read && (
                          <div className="w-2.5 h-2.5 bg-green-500 rounded-full flex-shrink-0 mt-1.5"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <p className="text-xs text-gray-500">{notification.time}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Info Box */}
        {filteredNotifications.length > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-blue-600 text-xl">💡</span>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Notification Settings</h4>
                <p className="text-sm text-blue-700">
                  Click on any notification to view details.  You can customize your notification preferences in Settings.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notifications;