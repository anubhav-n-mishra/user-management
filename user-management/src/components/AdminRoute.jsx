import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (user.role !== 'admin') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        color: '#fff',
        gap: '12px'
      }}>
        <h2 style={{ color: '#ffcc00', margin: 0 }}>Access Denied</h2>
        <p style={{ maxWidth: 480, textAlign: 'center', opacity: .85 }}>
          You must be an <strong>admin</strong> to view the User Management page. Your current role is <code>{user.role}</code>.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/dashboard" style={{ padding: '8px 14px', background: '#444', borderRadius: 6, color: '#fff', textDecoration: 'none' }}>Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
