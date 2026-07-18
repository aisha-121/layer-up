/* eslint-disable react-refresh/only-export-components */

import * as React from "react";
import {
  getUsers,
  setUser,
  getSessionEmail,
  setSession,
  getProfile,
  saveProfile,
} from "@/db/storage";
import { hashPassword, verifyPassword } from "@/lib/hash";
import type { UserProfile } from "@/types";
import { SCHEMA_VERSION } from "@/types";

interface AuthState {
  email: string | null;
  profile: UserProfile | null;
  loading: boolean;
  register(email: string, name: string, password: string): Promise<void>;
  login(email: string, password: string): Promise<void>;
  logout(): void;
  updateProfile(updater: (p: UserProfile) => UserProfile): void;
}

const Ctx = React.createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = React.useState<string | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const e = getSessionEmail();
    if (e) {
      setEmail(e);
      setProfile(getProfile(e));
    }
    setLoading(false);
  }, []);

  const register = React.useCallback(
    async (em: string, name: string, password: string) => {
      const users = getUsers();
      if (users[em.toLowerCase()]) {
        throw new Error("An account already exists for that email.");
      }
      const lc = em.toLowerCase();
      setUser({
        email: lc,
        name,
        passwordHash: await hashPassword(password),
        createdAt: new Date().toISOString(),
      });
      const fresh: UserProfile = {
        email: lc,
        schemaVersion: SCHEMA_VERSION,
        onboardingComplete: false,
        preferences: {
          temperatureSensitivity: "average",
          sensitivityNotes: "",
          savedAesthetics: [],
          savedLocations: [],
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveProfile(fresh);
      setSession(lc);
      setEmail(lc);
      setProfile(fresh);
    },
    [],
  );

  const login = React.useCallback(async (em: string, password: string) => {
    const lc = em.toLowerCase();
    const users = getUsers();
    const rec = users[lc];
    if (!rec) throw new Error("No account found for that email.");
    const ok = await verifyPassword(password, rec.passwordHash);
    if (!ok) throw new Error("Incorrect password.");
    setSession(lc);
    setEmail(lc);
    setProfile(getProfile(lc));
  }, []);

  const logout = React.useCallback(() => {
    setSession(null);
    setEmail(null);
    setProfile(null);
  }, []);

  const updateProfile = React.useCallback(
    (updater: (p: UserProfile) => UserProfile) => {
      setProfile((prev) => {
        if (!prev) return prev;
        const next = updater(prev);
        saveProfile(next);
        return next;
      });
    },
    [],
  );

  const value = React.useMemo<AuthState>(
    () => ({ email, profile, loading, register, login, logout, updateProfile }),
    [email, profile, loading, register, login, logout, updateProfile],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
