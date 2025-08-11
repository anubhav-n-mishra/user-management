import { createContext, useContext, useState, useEffect } from 'react';
import ApiService from '../services/ApiService';

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
    setLoading(false);
  }, []);

  const signup = async (userData) => {
    try {
      const { confirmPassword, ...userToSave } = userData;
      const newUser = await ApiService.signup(userToSave);
      return newUser;
    } catch (error) {
      throw error;
    }
  };

  const signin = async (email, password) => {
    try {
      const user = await ApiService.signin({ email, password });
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      throw error;
    }
  };

  const signout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await ApiService.updateUser(user.id, {
        ...user,
        profile: { ...user.profile, ...profileData }
      });
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  const deleteAccount = async () => {
    try {
      await ApiService.deleteUser(user.id);
      signout();
    } catch (error) {
      throw error;
    }
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
