import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import { useEffect } from 'react';
import { wsService } from './services/websocket';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfileSetup from './pages/ProfileSetup';
import Discover from './pages/Discover';
import Matches from './pages/Matches';
import Chat from './pages/Chat';
import MyProfile from './pages/MyProfile';
import Badges from './pages/Badges';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const { isAuthenticated, loadUser, loadProfile } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadUser();
      loadProfile();
      wsService.connect();
    }
    return () => wsService.disconnect();
  }, [isAuthenticated]);

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: '#343a40', color: '#fff', borderRadius: '12px' },
        }}
      />
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/discover" /> : <Landing />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/discover" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/discover" /> : <Register />} />
        <Route
          path="/setup"
          element={
            <ProtectedRoute>
              <ProfileSetup />
            </ProtectedRoute>
          }
        />
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/discover" element={<Discover />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/chat/:matchId" element={<Chat />} />
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/badges" element={<Badges />} />
        </Route>
      </Routes>
    </>
  );
}
