"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole, UserResource } from '@/types/api.types';

interface UserContextType {
  user: UserResource | null;
  role: UserRole | null;
  setRole: (role: UserRole) => void;
  setUser: (user: UserResource | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(null);
  const [user, setUser] = useState<UserResource | null>(null);

  return (
    <UserContext.Provider value={{ user, role, setRole, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
