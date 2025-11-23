import { createContext, useContext, useEffect, useState } from "react";
import type { LocalUser } from "@/services/localAuth";
import {
  getCurrentUser,
  onAuthStateChange,
  signIn as localSignIn,
  signOut as localSignOut,
  signUp as localSignUp,
} from "@/services/localAuth";

interface AuthContextValue {
  user: LocalUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<LocalUser>;
  signUp: (params: { email: string; password: string; fullName: string }) => Promise<LocalUser>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<LocalUser | null>(() => getCurrentUser());

  useEffect(() => {
    const { subscription } = onAuthStateChange(setUser);
    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === "admin",
        signIn: localSignIn,
        signUp: localSignUp,
        signOut: localSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
