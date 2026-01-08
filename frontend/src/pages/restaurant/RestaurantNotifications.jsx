import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getNotifications, markAsRead, markAllAsRead } from '../../services/notificationService';
import { Bell, CheckCircle, AlertCircle, Info, Package } from 'lucide-react';
import {  useQuery, useMutation, useQueryClient  } from '@tanstack/react-query';

const RestaurantNotifications = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'unread'
  const notifications = [];
  const unreadCount = 0;

  useEffect(() => {
    fetchNotifications();
  }, []);

  const {data, isLoading, isError, refetch } = useQuery({
    queryKey: ['RestaurantNotifications'],
    queryFn: async ()=>{
      const response = await getNotifications();
      if (response.success) {
        return {
          notifications: response.notifications,
          unreadCount: response. unreadCount
        };
      }
      throw new Error('Failed to fetch notifications');
    },
    staleTime: 60*1000,
    retry: 2,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

   notifications = data?.notifications || [];
   unreadCount = data?.unreadCount || 0;

  const markAsReadMutation = useMutation({
    mutationFn:  async (notificationId) => {
      return await markAsRead(notificationId);
    },
    onSuccess: (_, notificationId) => {
      // Optimistically update the cache
      queryClient.setQueryData(['restaurantNotifications'], (old) => {
        if (! old) return old;
        
        return {
          notifications: old.notifications.map(n =>
            n._id === notificationId ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, old.unreadCount - 1)
        };
      });
    },
    onError: (error) => {
      console.error('Error marking as read:', error);
      // Refetch to ensure consistency
      refetch();
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return await markAllAsRead();
    },
    onSuccess: () => {
      // Optimistically update the cache
      queryClient.setQueryData(['restaurantNotifications'], (old) => {
        if (!old) return old;
        
        return {
          notifications: old.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0
        };
      });
    },
    onError: (error) => {
      console.error('Error marking all as read:', error);
      // Refetch to ensure consistency
      refetch();
    }
  });

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (! notification.read) {
      markAsReadMutation.mutate(notification._id);
    }
    
    // Navigate based on notification type
    if (notification.type === 'donation_accepted' || notification.type === 'donation_picked_up') {
      navigate('/restaurant/donations');
    }
  };
  const handleMarkAllAsRead = () => {
  markAllAsReadMutation.mutate();
  };
  

  const getFilteredNotifications = () => {
    if (activeTab === 'unread') {
      return notifications. filter(n => !n.read);
    }
    return notifications;
  };

  const getNotificationIcon = (type) => {
    const icons = {
      donation_accepted: { icon: CheckCircle, bg: 'bg-green-100', color: 'text-green-600' },
      donation_picked_up: { icon: Package, bg: 'bg-blue-100', color: 'text-blue-600' },
      donation_expired: { icon: AlertCircle, bg: 'bg-red-100', color: 'text-red-600' },
      info: { icon: Info, bg:  'bg-gray-100', color: 'text-gray-600' }
    };
    return icons[type] || icons.info;
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    
    const diffHours = Math. floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' :  ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return notifDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month:  'short',
      year:  'numeric'
    });
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <DashboardLayout role="restaurant">
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Notifications</h1>
            <p className="text-sm sm:text-base text-gray-600">Stay updated on your donations</p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
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
                  : 'text-gray-600 hover:text-green-600'
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
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="text-gray-400" size={32} />
                </div>
                <p className="text-lg text-gray-600 mb-2">No notifications</p>
                <p className="text-sm text-gray-500">You're all caught up!</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const iconConfig = getNotificationIcon(notification.type);
                const IconComponent = iconConfig.icon;
                
                return (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-6 cursor-pointer transition-all hover:bg-gray-50 ${
                      ! notification.read ? 'bg-green-50/30' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 ${iconConfig.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <IconComponent className={iconConfig.color} size={24} />
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
                        <p className="text-xs text-gray-500">{getTimeAgo(notification.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Info Box */}
        {filteredNotifications.length > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Info className="text-blue-600 flex-shrink-0" size={20} />
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

export default RestaurantNotifications;