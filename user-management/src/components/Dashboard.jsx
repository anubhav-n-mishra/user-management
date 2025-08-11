import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './dashboard.css';

function Dashboard() {
    const { user, signout } = useAuth();

    const handleSignOut = () => {
        signout();
    };

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1>Dashboard</h1>
                <nav>
                    {user?.role === 'admin' && (
                        <Link to="/users" className="nav-link">User Management</Link>
                    )}
                    <Link to="/profile" className="nav-link">Profile</Link>
                    <button onClick={handleSignOut} className="signout-btn">
                        Sign Out
                    </button>
                </nav>
            </header>
            
            <main className="dashboard-content">
                <div className="welcome-section">
                    <h2>Welcome back, {user?.name}!</h2>
                    <p className="user-email">Email: {user?.email}</p>
                    {user?.role === 'admin' && (
                        <p className="user-role">Role: Administrator</p>
                    )}
                </div>

                <div className="dashboard-cards">
                    {user?.role === 'admin' && (
                        <div className="dashboard-card">
                            <h3>User Management</h3>
                            <p>View, add, edit, and delete users in the system</p>
                            <Link to="/users" className="card-link">
                                Manage Users →
                            </Link>
                        </div>
                    )}

                    <div className="dashboard-card">
                        <h3>Profile Management</h3>
                        <p>View and edit your profile information</p>
                        <Link to="/profile" className="card-link">
                            Go to Profile →
                        </Link>
                    </div>

                    <div className="dashboard-card">
                        <h3>Account Info</h3>
                        <p>Member since: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : 'N/A'}</p>
                        <p>Role: {user?.role === 'admin' ? 'Administrator' : 'User'}</p>
                        <p>Status: Active</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>Quick Actions</h3>
                        <div className="quick-actions">
                            <Link to="/users" className="action-btn">Manage Users</Link>
                            <Link to="/profile" className="action-btn">Update Profile</Link>
                            <Link to="/profile" className="action-btn">View Profile</Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;
