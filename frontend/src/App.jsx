import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup'
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard';
import NGODashboard from './pages/NGODashboard';
import VerifyEmail from './components/auth/VerifyEmail';
import ForgotPassword from './components/auth/ForgotPassword';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import NGOOverview from './pages/ngo/NGOOverview';
import NearbyDonations from './pages/ngo/NearbyDonations';
import MyAcceptances from './pages/ngo/MyAcceptances';
import Notifications from './pages/ngo/Notifications';


function App(){
  return (
    <div>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        
        <Route path='/ngo-dashboard' element={<NGODashboard/>} />
        <Route path='/verify-email' element={<VerifyEmail />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/admin-dashboard' element={<AdminDashboard />} />


        <Route path='/ngo/dashboard' element={<NGOOverview />} />
        <Route path='/ngo/donations' element={<NearbyDonations/>} />
        <Route path='/ngo/notifications' element={<Notifications />} />
        <Route path='/ngo/acceptances' element={<MyAcceptances />} />

        <Route path='/restaurant/dashboard' element={<RestaurantDashboard />} />

        <Route path="/" element={<Navigate to="/login" replace />} />

        
        {/* Protected Routes */}
        <Route 
          path='/restaurant-dashboard' 
          element={
            <ProtectedRoute allowedRoles={['restaurant']}>
              <RestaurantDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path='/ngo-dashboard' 
          element={
            <ProtectedRoute allowedRoles={['ngo']}>
              <NGODashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>

    </div>
  );
}

export default App;