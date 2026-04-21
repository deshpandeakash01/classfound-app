import React, { createContext, useContext, useState, ReactNode } from 'react';

// 1. Define what our User data looks like
type UserRole = 'student' | 'faculty' | 'cr';

interface User {
  name: string;
  email: string;
  role: UserRole;
  initials: string;
}

interface UserContextType {
  user: User;
  setUserRole: (role: UserRole) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// 2. Create the Provider (The "Source of Truth")
export function UserProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('faculty');

  // Dynamically update user data based on role
  const user: User = {
    name: role === 'faculty' ? 'Dr. Sharma' : 'Rahul Kumar',
    email: role === 'faculty' ? 'sharma.cse@bmsce.ac.in' : 'rahul.cse24@bmsce.ac.in',
    role: role,
    initials: role === 'faculty' ? 'DS' : 'RK',
  };

  const setUserRole = (newRole: UserRole) => setRole(newRole);

  return (
    <UserContext.Provider value={{ user, setUserRole }}>
      {children}
    </UserContext.Provider>
  );
}

// 3. Create a Custom Hook to use this data easily
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}