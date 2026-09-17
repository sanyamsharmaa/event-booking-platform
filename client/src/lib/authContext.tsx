'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserItem, ArtistItem } from '@/types';

interface AuthContextType {
  user: UserItem | null;
  token: string | null;
  login: (token: string, user: UserItem) => void;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  isArtist: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchedArtists: ArtistItem[];
  setSearchedArtists: (artists: ArtistItem[]) => void;
  clearSearch: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
  isAuthenticated: false,
  isArtist: false,
  searchQuery: '',
  setSearchQuery: () => {},
  searchedArtists: [],
  setSearchedArtists: () => {},
  clearSearch: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserItem | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Global search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedArtists, setSearchedArtists] = useState<ArtistItem[]>([]);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('showpass_token');
      const storedUser = localStorage.getItem('showpass_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Error loading stored auth:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: UserItem) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('showpass_token', newToken);
    localStorage.setItem('showpass_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('showpass_token');
    localStorage.removeItem('showpass_user');
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchedArtists([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isLoading,
        isAuthenticated: !!token && !!user,
        isArtist: user?.role === 'artist',
        searchQuery,
        setSearchQuery,
        searchedArtists,
        setSearchedArtists,
        clearSearch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

