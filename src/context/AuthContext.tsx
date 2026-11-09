'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole } from '@/types/database';
import { dbStore } from '@/lib/supabase/client';

interface AuthContextType {
  user: Profile;
  allProfiles: Profile[];
  isAdmin: boolean;
  switchUser: (userId: string) => void;
  updateProfile: (updates: Partial<Profile>) => void;
  toggleRole: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('usr-alex-rivera-1');
  const [user, setUser] = useState<Profile | null>(null);

  useEffect(() => {
    const list = dbStore.getProfiles();
    setProfiles(list);

    const savedId = typeof window !== 'undefined' ? localStorage.getItem('desk_hub_current_user_id') : null;
    const initialId = savedId && list.some(p => p.id === savedId) ? savedId : 'usr-alex-rivera-1';
    setCurrentUserId(initialId);

    const activeUser = list.find((p) => p.id === initialId) || list[0];
    setUser(activeUser);
  }, []);

  const switchUser = (userId: string) => {
    const target = profiles.find((p) => p.id === userId);
    if (target) {
      setCurrentUserId(userId);
      setUser(target);
      if (typeof window !== 'undefined') {
        localStorage.setItem('desk_hub_current_user_id', userId);
      }
    }
  };

  const updateProfile = (updates: Partial<Profile>) => {
    if (!user) return;
    try {
      const updated = dbStore.updateProfile(user.id, updates);
      setUser(updated);
      setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const toggleRole = () => {
    if (!user) return;
    const newRole: UserRole = user.role === 'admin' ? 'user' : 'admin';
    updateProfile({ role: newRole });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-calm-bg flex items-center justify-center text-emerald-400 font-mono">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Initializing Desk Hub Companion Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        allProfiles: profiles,
        isAdmin: user.role === 'admin',
        switchUser,
        updateProfile,
        toggleRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
