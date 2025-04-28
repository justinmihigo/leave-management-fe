import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  emailLogin: (email: string, password: string) => Promise<void>;
  emailSignup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  applyForLeave: (leaveData: {
    startDate: string;
    endDate: string;
    type: string;
    reason: string;
  }) => Promise<void>;
  getUserLeaves: () => Promise<any[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Function to fetch user details
  const fetchUserDetails = async (userId: string, authToken: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        throw new Error('Failed to fetch user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
    }
  };

  // Function to apply for leave
  const applyForLeave = async (leaveData: {
    startDate: string;
    endDate: string;
    type: string;
    reason: string;
  }) => {
    if (!token || !user) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch('http://localhost:8080/api/leaves', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          leaveType: leaveData.type,
          startDate: leaveData.startDate,
          endDate: leaveData.endDate,
          reason: leaveData.reason,
          status: 'PENDING',
          isHalfDay: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to apply for leave');
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error('Error applying for leave:', error);
      throw error;
    }
  };

  // Function to get user's leaves
  const getUserLeaves = async () => {
    if (!token || !user) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch(`http://localhost:8080/api/leaves/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user leaves');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user leaves:', error);
      throw error;
    }
  };

  const emailLogin = async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const { token, userId } = await response.json();
        setToken(token);
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        await fetchUserDetails(userId, token);
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Error during email login:', error);
      throw error;
    }
  };

  const emailSignup = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:8080/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        const { token, userId } = await response.json();
        setToken(token);
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        await fetchUserDetails(userId, token);
      } else {
        throw new Error('Signup failed');
      }
    } catch (error) {
      console.error('Error during email signup:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  };

  // Check for existing token and user data on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    
    if (storedToken && storedUserId) {
      setToken(storedToken);
      fetchUserDetails(storedUserId, storedToken).catch(() => {
        // If there's an error fetching user details, clear the stored data
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      });
    }
  }, []);

  const value = useMemo(() => ({ 
    user, 
    isAuthenticated,
    token,
    emailLogin,
    emailSignup,
    logout,
    applyForLeave,
    getUserLeaves
  }), [user, isAuthenticated, token]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};