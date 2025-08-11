// API Base URL
const API_BASE_URL = 'http://localhost/user-management-api';

// Get current user from localStorage
const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

// Get headers with authentication
const getAuthHeaders = () => {
    const user = getCurrentUser();
    return {
        'Content-Type': 'application/json',
        'X-User-Id': user?.id || '',
        'X-User-Role': user?.role || 'user'
    };
};

// API Service Class
class ApiService {
    // Authentication endpoints
    static async signup(userData) {
        const response = await fetch(`${API_BASE_URL}/auth_new.php?action=signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Signup failed');
        }

        return response.json();
    }

    static async signin(credentials) {
        const response = await fetch(`${API_BASE_URL}/auth_new.php?action=signin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Signin failed');
        }

        return response.json();
    }

    // User management endpoints
    static async getAllUsers() {
        const response = await fetch(`${API_BASE_URL}/users_new.php`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch users');
        }

        return response.json();
    }

    static async getUser(id) {
        const response = await fetch(`${API_BASE_URL}/users_new.php?id=${id}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch user');
        }

        return response.json();
    }

    static async createUser(userData) {
        const response = await fetch(`${API_BASE_URL}/users_new.php`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create user');
        }

        return response.json();
    }

    static async updateUser(id, userData) {
        const response = await fetch(`${API_BASE_URL}/users_new.php?id=${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update user');
        }

        return response.json();
    }

    static async deleteUser(id) {
        const response = await fetch(`${API_BASE_URL}/users_new.php?id=${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete user');
        }

        return response.json();
    }
}

export default ApiService;
