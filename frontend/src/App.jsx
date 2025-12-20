import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup'
import RestaurantDashboard from './pages/RestaurantDashboard';
import NGODashboard from './pages/NGODashboard';
import VerifyEmail from './components/auth/VerifyEmail';
import ForgotPassword from './components/auth/ForgotPassword';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <div>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/restaurant-dashboard' element={<RestaurantDashboard/>} />
        <Route path='/ngo-dashboard' element={<NGODashboard/>} />
        <Route path='/verify-email' element={<VerifyEmail />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        
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