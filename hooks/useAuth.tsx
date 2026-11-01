"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { PublicUser, AuthSession, MockSubscription, UserRole } from "@/types/user";
import {
  login as authLogin,
  logout as authLogout,
  getSessionUser,
  getSession,
  register as authRegister,
  activateSubscription as authActivateSubscription,
  type RegisterStep1Data,
  type RegisterStep2Data,
} from "@/lib/services/auth";
import { initSeedData } from "@/lib/services/seedData";
import { useToast } from "@/hooks/useToast";

export interface AuthContextValue {
  user: PublicUser | null;
  session: AuthSession | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ user: PublicUser; session: AuthSession }>;
  logout: () => void;
  register: (
    step1: RegisterStep1Data,
    step2: RegisterStep2Data
  ) => Promise<{ user: PublicUser; session: AuthSession }>;
  activateSubscription: (paymentMethod: MockSubscription["paymentMethod"]) => Promise<void>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { info, error: toastError } = useToast();

  const refreshUser = useCallback(() => {
    try {
      const currentSession = getSession();
      if (!currentSession) {
        setUser(null);
        setSession(null);
        return;
      }
      const currentUser = getSessionUser();
      if (currentUser) {
        setUser(currentUser);
        setSession(currentSession);
      } else {
        setUser(null);
        setSession(null);
      }
    } catch (err) {
      console.error("Erreur lors de la synchronisation de session :", err);
      setUser(null);
      setSession(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        await initSeedData((resetMsg) => {
          info(resetMsg, "Données initialisées");
        });

        if (mounted) {
          refreshUser();
        }
      } catch (err) {
        console.error("Erreur initSeedData :", err);
        toastError("Erreur d'initialisation du stockage local.");
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [info, toastError, refreshUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authLogin(email, password);
      setUser(res.user);
      setSession(res.session);
      return res;
    },
    []
  );

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
    setSession(null);
  }, []);

  const register = useCallback(
    async (step1: RegisterStep1Data, step2: RegisterStep2Data) => {
      const res = await authRegister(step1, step2);
      setUser(res.user);
      setSession(res.session);
      return res;
    },
    []
  );

  const activateSubscription = useCallback(
    async (paymentMethod: MockSubscription["paymentMethod"]) => {
      if (!user) throw new Error("Utilisateur non connecté.");
      await authActivateSubscription(user.id, paymentMethod);
      refreshUser();
    },
    [user, refreshUser]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        login,
        logout,
        register,
        activateSubscription,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

/**
 * Role guard helper for pages requiring specific privileges
 */
export function useRequireRole(requiredRole: UserRole): {
  authorized: boolean;
  isLoading: boolean;
} {
  const { user, isLoading } = useAuth();
  if (isLoading) return { authorized: false, isLoading: true };
  if (!user || user.role !== requiredRole) return { authorized: false, isLoading: false };
  return { authorized: true, isLoading: false };
}
