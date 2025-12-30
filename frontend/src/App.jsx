import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup'
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
import RestaurantOverview from './pages/restaurant/RestaurantOverview';
import RestaurantHistory from './pages/restaurant/RestaurantHistory';
import RestaurantDonations from './pages/restaurant/RestaurantDonations';
import AddDonation from './pages/restaurant/AddDonation';
import RestaurantNotifications from './pages/restaurant/RestaurantNotifications';
import RestaurantProfile from './pages/restaurant/RestaurantProfile';
import NGOProfile from './pages/ngo/NGOProfile';
import AdminReports from './pages/admin/AdminReports';

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

        <Route path='/restaurant/dashboard' element={<RestaurantOverview/>} />
        <Route
              path="/restaurant/dashboard"
              element={
                <ProtectedRoute allowedRoles={['restaurant']}>
                  <RestaurantOverview />
                </ProtectedRoute>
              }
        />
        <Route
          path="/restaurant/add-donation"
          element={
            <ProtectedRoute allowedRoles={['restaurant']}>
              <AddDonation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/restaurant/donations"
          element={
            <ProtectedRoute allowedRoles={['restaurant']}>
              <RestaurantDonations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/restaurant/history"
          element={
            <ProtectedRoute allowedRoles={['restaurant']}>
              <RestaurantHistory />
            </ProtectedRoute>
          }
        />
            <Route
              path="/restaurant/history"
              element={
                <ProtectedRoute allowedRoles={['restaurant']}>
                  <RestaurantHistory />
                </ProtectedRoute>
              }
            />

          <Route path="/admin/dashboard" element={ <ProtectedRoute allowedRoles={['admin']}> <AdminOverview/> </ProtectedRoute>}/>
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminReports />
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

        <Route
          path="/restaurant/notifications"
           element={
             <ProtectedRoute allowedRoles={['restaurant']}>
               <RestaurantNotifications />
             </ProtectedRoute>
            }
        />
        <Route
          path="/restaurant/settings"
          element={
          <ProtectedRoute allowedRoles={['restaurant']}>
            <RestaurantProfile />
          </ProtectedRoute>
          }
        />
        <Route
          path="/ngo/settings"
          element={
            <ProtectedRoute allowedRoles={['ngo']}>
              <NGOProfile />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="*" element={<Navigate to="/login" replace />} />

        
      </Routes>

      <Routes path="/verify-email" element={<VerifyEmail />} />

    </div>
  );
}

export default App;