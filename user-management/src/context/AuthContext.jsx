import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    console.log('📋 Existing users at startup:', existingUsers);
    const testUserExists = existingUsers.find(u => u.email === 'test@example.com');
    console.log('🔍 Test user exists?', testUserExists);
    
    if (!testUserExists) {
      const testUser = {
        id: new Date('2025-08-07').getTime(),
        name: 'Test User',
        email: 'test@example.com',
        password: 'test123',
        profile: {
          bio: 'This is a test user account for development purposes.',
          phone: '+91 98765 43210',
          address: '123 MG Road, Bangalore, Karnataka 560001, India'
        }
      };
      existingUsers.push(testUser);
      localStorage.setItem('users', JSON.stringify(existingUsers));
      console.log('🧪 Test user created:', testUser);
      console.log('📝 Updated users array:', existingUsers);
    }
    
    setLoading(false);
  }, []);

  const signup = (userData) => {
    const { confirmPassword, ...userToSave } = userData;
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const userExists = existingUsers.find(u => u.email === userData.email);
        
        if (userExists) {
          reject(new Error('User with this email already exists'));
          return;
        }

        const newUser = {
          id: Date.now(),
          ...userToSave,
          profile: {
            bio: '',
            phone: '',
            address: ''
          }
        };
        
        existingUsers.push(newUser);
        localStorage.setItem('users', JSON.stringify(existingUsers));
        resolve(newUser);
      }, 1000);
    });
  };

  const signin = (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
        
        const testUserExists = existingUsers.find(u => u.email === 'test@example.com');
        if (!testUserExists) {
          const testUser = {
            id: new Date('2025-08-07').getTime(),
            name: 'Test User',
            email: 'test@example.com',
            password: 'test123',
            profile: {
              bio: 'This is a test user account for development purposes.',
              phone: '+91 98765 43210',
              address: '123 MG Road, Bangalore, Karnataka 560001, India'
            }
          };
          existingUsers.push(testUser);
          localStorage.setItem('users', JSON.stringify(existingUsers));
        }
        
        console.log('🔍 All users in localStorage:', existingUsers);
        console.log('🔍 Trying to sign in with:', { email, password });
        
        const user = existingUsers.find(u => u.email === email && u.password === password);
        console.log('🔍 Found user:', user);
        
        if (user) {
          setUser(user);
          localStorage.setItem('user', JSON.stringify(user));
          resolve(user);
        } else {
          console.log('❌ No matching user found');
          reject(new Error('Invalid email or password'));
        }
      }, 1000);
    });
  };

  const signout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateProfile = (profileData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const updatedUser = {
          ...user,
          profile: { ...user.profile, ...profileData }
        };
        
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = existingUsers.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
          existingUsers[userIndex] = updatedUser;
          localStorage.setItem('users', JSON.stringify(existingUsers));
        }
        
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        resolve(updatedUser);
      }, 500);
    });
  };

  const deleteAccount = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const filteredUsers = existingUsers.filter(u => u.id !== user.id);
        localStorage.setItem('users', JSON.stringify(filteredUsers));
        
        signout();
        resolve();
      }, 500);
    });
  };

  const value = {
    user,
    loading,
    signup,
    signin,
    signout,
    updateProfile,
    deleteAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
