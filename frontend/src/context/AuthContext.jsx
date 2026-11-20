import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getStoredUser, clearAuthToken, getAuthToken } from '../Services/postServices';
import { fetchCurrentUser, syncStoredUser } from '../Services/userServices';

const AuthContext = createContext(null);

/**
 * AuthProvider
 * Centralized React Context providing:
 * - Single source of truth for current authenticated student
 * - Automatic background synchronization with backend on mount
 * - Cross-tab and in-memory synchronization via storage & custom events
 * - Seamless immediate avatar updates across all components
 */
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [isLoading, setIsLoading] = useState(true);

  // Synchronize with database on initial mount
  const refreshUser = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setCurrentUser(null);
      setIsLoading(false);
      return null;
    }
    try {
      const user = await fetchCurrentUser();
      if (user) {
        setCurrentUser(user);
      }
      return user;
    } catch (err) {
      console.warn('Failed to refresh user from backend:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Synchronize immediately whenever sociofy_user_updated or storage event fires
  useEffect(() => {
    const handleUserUpdate = (e) => {
      const updated = e.detail || getStoredUser();
      setCurrentUser(updated);
    };

    window.addEventListener('sociofy_user_updated', handleUserUpdate);
    window.addEventListener('storage', handleUserUpdate);
    return () => {
      window.removeEventListener('sociofy_user_updated', handleUserUpdate);
      window.removeEventListener('storage', handleUserUpdate);
    };
  }, []);

  const updateUser = useCallback((userData) => {
    syncStoredUser(userData);
    setCurrentUser((prev) => ({ ...prev, ...userData }));
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
    setCurrentUser(null);
    window.dispatchEvent(new CustomEvent('sociofy_user_updated', { detail: null }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        updateUser,
        refreshUser,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to consume the AuthContext safely
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Graceful fallback if called outside provider
    const user = getStoredUser();
    return {
      currentUser: user,
      updateUser: syncStoredUser,
      refreshUser: fetchCurrentUser,
      logout: clearAuthToken,
      isLoading: false,
    };
  }
  return context;
};

export default AuthContext;
