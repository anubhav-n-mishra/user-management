import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import ApiService from '../services/ApiService';
import './userManagement.css';

function UserManagement() {
    const { user, signout } = useAuth();
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
    role: 'user',
        profile: {
            bio: '',
            phone: '',
            address: ''
        }
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const allUsers = await ApiService.getAllUsers();
            
            if (user.role === 'admin') {
                const otherUsers = allUsers.filter(u => u.id !== user.id);
                setUsers(otherUsers);
            } else {
                setUsers([]);
            }
        } catch (error) {
            setError('Failed to load users: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!newUser.name || !newUser.email) {
            setError('Please fill in all required fields');
            setLoading(false);
            return;
        }

        try {
            const userToAdd = {
                ...newUser,
                createdBy: user.email,
                role: newUser.role
            };

            await ApiService.createUser(userToAdd);
            
            setNewUser({
                name: '',
                email: '',
                role: 'user',
                profile: { bio: '', phone: '', address: '' }
            });
            setShowAddForm(false);
            setSuccess('User added successfully');
            loadUsers();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError('Failed to add user: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditUser = (userToEdit) => {
        setEditingUser({ ...userToEdit });
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await ApiService.updateUser(editingUser.id, editingUser);
            setEditingUser(null);
            setSuccess('User updated successfully');
            loadUsers();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError('Failed to update user: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                setLoading(true);
                await ApiService.deleteUser(userId);
                setSuccess('User deleted successfully');
                loadUsers();
                setTimeout(() => setSuccess(''), 3000);
            } catch (error) {
                setError('Failed to delete user: ' + error.message);
            } finally {
                setLoading(false);
            }
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSignOut = () => {
        signout();
    };

    return (
        <div className="user-management">
            <header className="user-management-header">
                <h1>User Management</h1>
                <nav className="user-nav">
                    <div className="user-info">
                        <span>Welcome, {user?.name}!</span>
                    </div>
                    <div className="nav-links">
                        <Link to="/dashboard" className="nav-link">Dashboard</Link>
                        <Link to="/profile" className="nav-link">Profile</Link>
                        <button onClick={handleSignOut} className="signout-btn">Sign Out</button>
                    </div>
                </nav>
            </header>

            <main className="user-management-content">
                {error && <div className="error">{error}</div>}
                {success && <div className="success">{success}</div>}

                <div className="management-controls">
                    <div className="search-section">
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    
                    <button 
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="add-user-btn"
                    >
                        {showAddForm ? 'Cancel' : 'Add New User'}
                    </button>
                </div>

                {showAddForm && (
                    <div className="add-user-form">
                        <h3>Add New User</h3>
                        <form onSubmit={handleAddUser}>
                            <div className="form-row">
                                <input
                                    type="text"
                                    placeholder="Full Name *"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                                    required
                                />
                                <input
                                    type="email"
                                    placeholder="Email *"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                                    required
                                />
                                {user.role === 'admin' && (
                                    <select
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                )}
                            </div>
                            <div className="form-row">
                                <input
                                    type="tel"
                                    placeholder="Phone"
                                    value={newUser.profile.phone}
                                    onChange={(e) => setNewUser({
                                        ...newUser, 
                                        profile: {...newUser.profile, phone: e.target.value}
                                    })}
                                />
                                <input
                                    type="text"
                                    placeholder="Bio"
                                    value={newUser.profile.bio}
                                    onChange={(e) => setNewUser({
                                        ...newUser, 
                                        profile: {...newUser.profile, bio: e.target.value}
                                    })}
                                />
                            </div>
                            <textarea
                                placeholder="Address"
                                value={newUser.profile.address}
                                onChange={(e) => setNewUser({
                                    ...newUser, 
                                    profile: {...newUser.profile, address: e.target.value}
                                })}
                            />
                            <button type="submit" disabled={loading} className="submit-btn">
                                {loading ? 'Adding...' : 'Add User'}
                            </button>
                        </form>
                    </div>
                )}

                <div className="users-table-container">
                    <h3>Users ({filteredUsers.length})</h3>
                    {loading && <div className="loading">Loading users...</div>}
                    
                    {filteredUsers.length === 0 && !loading ? (
                        <div className="no-users">No users found</div>
                    ) : (
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(userItem => (
                                    <tr key={userItem.id}>
                                        <td>{userItem.name}</td>
                                        <td>{userItem.email}</td>
                                        <td>{userItem.profile?.phone || 'Not provided'}</td>
                                        <td>{userItem.createdAt ? new Date(userItem.createdAt).toLocaleDateString('en-IN') : 'N/A'}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button 
                                                    onClick={() => handleEditUser(userItem)}
                                                    className="edit-btn"
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteUser(userItem.id)}
                                                    className="delete-btn"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>

            {editingUser && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Edit User</h3>
                        <form onSubmit={handleUpdateUser}>
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    value={editingUser.name}
                                    onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={editingUser.email}
                                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                                    required
                                />
                            </div>
                            {user.role === 'admin' && (
                                <div className="form-group">
                                    <label>Role</label>
                                    <select
                                        value={editingUser.role}
                                        onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            )}
                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    value={editingUser.profile?.phone || ''}
                                    onChange={(e) => setEditingUser({
                                        ...editingUser, 
                                        profile: {...editingUser.profile, phone: e.target.value}
                                    })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Bio</label>
                                <input
                                    type="text"
                                    value={editingUser.profile?.bio || ''}
                                    onChange={(e) => setEditingUser({
                                        ...editingUser, 
                                        profile: {...editingUser.profile, bio: e.target.value}
                                    })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <textarea
                                    value={editingUser.profile?.address || ''}
                                    onChange={(e) => setEditingUser({
                                        ...editingUser, 
                                        profile: {...editingUser.profile, address: e.target.value}
                                    })}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="submit" disabled={loading}>
                                    {loading ? 'Updating...' : 'Update User'}
                                </button>
                                <button type="button" onClick={() => setEditingUser(null)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserManagement;
