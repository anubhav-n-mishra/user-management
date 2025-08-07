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
                </div>

                <div className="dashboard-cards">
                    <div className="dashboard-card">
                        <h3>Profile Management</h3>
                        <p>View and edit your profile information</p>
                        <Link to="/profile" className="card-link">
                            Go to Profile →
                        </Link>
                    </div>

                    <div className="dashboard-card">
                        <h3>Account Info</h3>
                        <p>Member since: {new Date('2025-08-07').toLocaleDateString('en-IN')}</p>
                        <p>Status: Active</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>Quick Actions</h3>
                        <div className="quick-actions">
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
