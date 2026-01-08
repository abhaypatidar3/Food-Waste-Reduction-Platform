import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getNotifications, markAsRead, markAllAsRead } from '../../services/notificationService';
import { useQuery , useMutation, useQueryClient } from '@tanstack/react-query';


const Notifications = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'unread'
  const queryClient = useQueryClient();

  const {data, isLoading:loading, isError } = useQuery({
    queryKey: ['notifications'],
    queryFn: async ()=>{
      const response = await getNotifications();
      return response;
    },
    staleTime: 60*1000,
    refetchOnMount:true,
    refetchOnWindowFocus:false,
    retry:2
  })

  const notifications = data?.notification || [];
  const unreadCount = data?.unreadCount || 0;

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId)=>{
      return await markAsRead(notificationId);
    },
    onSuccess: (_,notificationId)=>{
      queryClient.setQueryData(['notifications'], (old)=>{
        if(!old){
          return old;
        }
        return{
          notifications: old.notifications.map(n =>
            n._id === notificationId ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, old.unreadCount - 1)
        };
      });
    },
    onError: (error)=>{
      console.error('Error marking as read:', error);
      refetch();
    },
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return await markAllAsRead();
    },
    onSuccess: () => {
      queryClient.setQueryData(['ngoNotifications'], (old) => {
        if (!old) return old;
        
        return {
          notifications: old. notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0
        };
      });
    },
    onError: (error) => {
      console.error('Error marking all as read:', error);
      refetch();
    }
  });

  const handleNotificationClick = async (notification) => {
    // func for marking read
    if (! notification.read) {
      markAsReadMutation.mutate(notification._id);
    }

    if (notification.type === 'new_donation' || notification.type === 'urgent') {
      navigate('/ngo/donations');
    } else if (notification.type === 'reminder' || notification.type === 'completed') {
      navigate('/ngo/acceptances');
    }
  };

  const handleMarkAllAsRead = async () => {
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
      new_donation: { icon: '📍', bg: 'bg-blue-100', color: 'text-blue-600' },
      urgent: { icon: '⏰', bg: 'bg-orange-100', color: 'text-orange-600' },
      reminder: { icon: '🔔', bg: 'bg-purple-100', color: 'text-purple-600' },
      completed: { icon: '✓', bg: 'bg-green-100', color: 'text-green-600' },
      impact: { icon: '📊', bg: 'bg-indigo-100', color: 'text-indigo-600' },
      accepted: { icon: '✋', bg: 'bg-teal-100', color: 'text-teal-600' }
    };
    return icons[type] || icons.new_donation;
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' :  ''} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
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
    <DashboardLayout role="ngo" >
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Notifications</h1>
            <p className="text-gray-600">Stay updated on new donations and reminders</p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
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
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔔</span>
                </div>
                <p className="text-lg text-gray-600 mb-2">No notifications</p>
                <p className="text-sm text-gray-500">You're all caught up!</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const iconConfig = getNotificationIcon(notification. type);
                
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
                        <span className={`text-2xl ${iconConfig.color}`}>
                          {iconConfig.icon}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-1">
                          <h3 className="font-bold text-gray-800">{notification.title}</h3>
                          {! notification.read && (
                            <div className="w-2. 5 h-2.5 bg-green-500 rounded-full flex-shrink-0 mt-1.5"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <p className="text-xs text-gray-500">{getTimeAgo(notification. createdAt)}</p>
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