import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

/** Redirect to login if not authenticated */
export const ProtectedRoute = ({ children }) => {
  const { user, initialized } = useSelector((s) => s.auth);
  if (!initialized) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

/** Redirect to login if not authenticated OR not admin */
export const AdminRoute = ({ children }) => {
  const { user, initialized } = useSelector((s) => s.auth);
  if (!initialized) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const LoadingScreen = () => (
  <div className="min-h-screen bg-luxury-black flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin" />
      <p className="text-luxury-gray text-sm tracking-wider">Loading...</p>
    </div>
  </div>
);

export default LoadingScreen;
