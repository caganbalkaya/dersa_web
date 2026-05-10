import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for token on mount
    const storedUser = localStorage.getItem('dersa_user');
    const storedToken = localStorage.getItem('dersa_token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('dersa_user', JSON.stringify(userData));
    localStorage.setItem('dersa_token', jwtToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('dersa_user');
    localStorage.removeItem('dersa_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
