import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/api';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Skip if already checked (performance optimization)
      if (authChecked && user) {
        setLoading(false);
        return;
      }

      try {
        // 1️⃣ First, try to get user from localStorage (fast)
        const savedUser = localStorage.getItem('user');
        
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser); // Set immediately for fast render
          
          // 2️⃣ Then verify with backend (HTTPOnly cookie sent automatically)
          try {
            const response = await authAPI.getMe();
            
            if (response.success && response.user) {
              // Update with fresh user data from backend
              setUser(response. user);
              localStorage.setItem('user', JSON.stringify(response.user));
              setAuthChecked(true);
            } else {
              // Backend says not authenticated
              localStorage.removeItem('user');
              setUser(null);
            }
          } catch (error) {
            // API verification failed (401 or network error)
            console.error('Authentication verification failed:', error);
            localStorage. removeItem('user');
            setUser(null);
          }
        } else {
          // No cached user, verify with backend
          try {
            const response = await authAPI.getMe();
            
            if (response. success && response.user) {
              setUser(response.user);
              localStorage.setItem('user', JSON.stringify(response.user));
              setAuthChecked(true);
            } else {
              setUser(null);
            }
          } catch (error) {
            // Not authenticated
            console.error('Not authenticated:', error);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('❌ Error checking authentication:', error);
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [location.pathname]); // Re-check on route change

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication... </p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to their appropriate dashboard
    if (user. role === 'ngo') {
      return <Navigate to="/ngo/dashboard" replace />;
    } else if (user.role === 'restaurant') {
      return <Navigate to="/restaurant/dashboard" replace />;
    } else if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  // Authorized - render children
  return children;
};

export default ProtectedRoute;