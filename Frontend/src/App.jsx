import { Navigate, Route, Routes } from 'react-router-dom'
import AnimatedBackground from './components/AnimatedBackground.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import TransactionsPage from './pages/TransactionsPage.jsx'
import EditProfilePage from './pages/EditProfilePage.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import SocialFooter from './components/SocialFooter.jsx'
import { useAuth } from './context/AuthContext.jsx'

const App = () => {
  const { isAuthenticated } = useAuth()

  return (
    <>
      <AnimatedBackground />
      <Routes>
        <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={(
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/profile"
          element={(
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/edit-profile"
          element={(
            <ProtectedRoute>
              <EditProfilePage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/transactions"
          element={(
            <ProtectedRoute>
              <TransactionsPage />
            </ProtectedRoute>
          )}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <SocialFooter />
    </>
  )
}

export default App
