import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Leaf, ShieldAlert } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Leaf className="text-emerald-600 animate-pulse" size={40} />
            <h1 className="text-3xl font-bold text-emerald-600">FoodShare</h1>
          </div>
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user's email is verified
  if (user && !user.isVerified) {
    return <Navigate to="/verify-email" state={{ email: user.email }} replace />;
  }

  // Check if user's role is allowed for this route
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Show unauthorized message briefly before redirecting
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="text-red-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to your dashboard...
          </p>
        </div>
        {/* Auto-redirect after showing message */}
        {setTimeout(() => {
          switch (user?.role) {
            case 'restaurant':
              window.location.href = '/restaurant-dashboard';
              break;
            case 'ngo':
              window.location.href = '/ngo-dashboard';
              break;
            case 'admin':
              window. location.href = '/admin-dashboard';
              break;
            default:
              window.location.href = '/';
          }
        }, 2000)}
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;