import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import './profile.css';

function Profile() {
    const { user, updateProfile, deleteAccount, signout } = useAuth();
    const navigate = useNavigate();
    
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const [profileData, setProfileData] = useState({
        bio: user?.profile?.bio || '',
        phone: user?.profile?.phone || '',
        address: user?.profile?.address || ''
    });

    const handleEdit = () => {
        setIsEditing(true);
        setError('');
        setSuccess('');
    };

    const handleCancel = () => {
        setIsEditing(false);
        setProfileData({
            bio: user?.profile?.bio || '',
            phone: user?.profile?.phone || '',
            address: user?.profile?.address || ''
        });
        setError('');
    };

    const handleSave = async () => {
        setLoading(true);
        setError('');
        
        try {
            await updateProfile(profileData);
            setIsEditing(false);
            setSuccess('Profile updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setProfileData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDeleteAccount = async () => {
        setLoading(true);
        try {
            await deleteAccount();
            navigate('/signin', { 
                state: { message: 'Account deleted successfully' }
            });
        } catch (err) {
            setError('Failed to delete account');
            setLoading(false);
        }
    };

    const handleSignOut = () => {
        signout();
        navigate('/signin');
    };

    return (
        <div className="profile">
            <header className="profile-header">
                <h1>Profile</h1>
                <nav>
                    <Link to="/dashboard" className="nav-link">← Back to Dashboard</Link>
                    <button onClick={handleSignOut} className="signout-btn">
                        Sign Out
                    </button>
                </nav>
            </header>

            <main className="profile-content">
                {error && <div className="error">{error}</div>}
                {success && <div className="success">{success}</div>}

                {/* Basic Information (Read-only) */}
                <section className="profile-section">
                    <h2>Basic Information</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Name:</label>
                            <span>{user?.name}</span>
                        </div>
                        <div className="info-item">
                            <label>Email:</label>
                            <span>{user?.email}</span>
                        </div>
                        <div className="info-item">
                            <label>Member Since:</label>
                            <span>{new Date('2025-08-07').toLocaleDateString('en-IN')}</span>
                        </div>
                    </div>
                </section>

                {/* Profile Information (Editable) */}
                <section className="profile-section">
                    <div className="section-header">
                        <h2>Profile Information</h2>
                        {!isEditing && (
                            <button onClick={handleEdit} className="edit-btn">
                                Edit Profile
                            </button>
                        )}
                    </div>

                    <div className="profile-form">
                        <div className="form-group">
                            <label>Bio:</label>
                            {isEditing ? (
                                <textarea
                                    value={profileData.bio}
                                    onChange={(e) => handleInputChange('bio', e.target.value)}
                                    placeholder="Tell us about yourself..."
                                    rows={4}
                                    disabled={loading}
                                />
                            ) : (
                                <div className="profile-value">
                                    {user?.profile?.bio || 'No bio added yet'}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Phone:</label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    value={profileData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    placeholder="Your phone number"
                                    disabled={loading}
                                />
                            ) : (
                                <div className="profile-value">
                                    {user?.profile?.phone || 'No phone number added'}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Address:</label>
                            {isEditing ? (
                                <textarea
                                    value={profileData.address}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    placeholder="Your address"
                                    rows={3}
                                    disabled={loading}
                                />
                            ) : (
                                <div className="profile-value">
                                    {user?.profile?.address || 'No address added'}
                                </div>
                            )}
                        </div>

                        {isEditing && (
                            <div className="form-actions">
                                <button 
                                    onClick={handleSave} 
                                    className="save-btn"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button 
                                    onClick={handleCancel} 
                                    className="cancel-btn"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="profile-section danger-zone">
                    <h2>Danger Zone</h2>
                    <div className="danger-content">
                        <p>Once you delete your account, there is no going back. Please be certain.</p>
                        <button 
                            onClick={() => setShowDeleteConfirm(true)}
                            className="delete-btn"
                            disabled={loading}
                        >
                            Delete Account
                        </button>
                    </div>
                </section>
            </main>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Confirm Account Deletion</h3>
                        <p>Are you sure you want to delete your account? This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button 
                                onClick={handleDeleteAccount}
                                className="delete-btn"
                                disabled={loading}
                            >
                                {loading ? 'Deleting...' : 'Yes, Delete Account'}
                            </button>
                            <button 
                                onClick={() => setShowDeleteConfirm(false)}
                                className="cancel-btn"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;
