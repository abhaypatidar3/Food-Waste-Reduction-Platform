import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup'
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard';
import VerifyEmail from './components/auth/VerifyEmail';
import ForgotPassword from './components/auth/ForgotPassword';
import ProtectedRoute from './components/common/ProtectedRoute';
import NGOOverview from './pages/ngo/NGOOverview';
import NearbyDonations from './pages/ngo/NearbyDonations';
import MyAcceptances from './pages/ngo/MyAcceptances';
import Notifications from './pages/ngo/Notifications';
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDonations from './pages/admin/AdminDonations';


function App(){
  return (
    <div>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        
        <Route path='/verify-email' element={<VerifyEmail />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />


        <Route path='/ngo/dashboard' element={<NGOOverview />} />
        <Route path='/ngo/donations' element={<NearbyDonations/>} />
        <Route path='/ngo/notifications' element={<Notifications />} />
        <Route path='/ngo/acceptances' element={<MyAcceptances />} />

        <Route path='/restaurant/dashboard' element={<RestaurantDashboard />} />

           <Route path="/admin/dashboard" element={ <ProtectedRoute allowedRoles={['admin']}> <AdminOverview /> </ProtectedRoute>}/>
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/donations"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDonations />
              </ProtectedRoute>
            }
          />

        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="*" element={<Navigate to="/login" replace />} />

        
        {/* Protected Routes */}
        <Route 
          path='/restaurant-dashboard' 
          element={
            <ProtectedRoute allowedRoles={['restaurant']}>
              <RestaurantDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>

      <Routes path="/verify-email" element={<VerifyEmail />} />

    </div>
  );
}

export default App;