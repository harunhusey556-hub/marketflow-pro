import { nanoid } from "nanoid";

export type LocalUserRole = "customer" | "admin";

export interface LocalUser {
  id: string;
  email: string;
  password: string;
  fullName: string;
  role: LocalUserRole;
  createdAt: string;
}

interface AuthState {
  currentUserId: string | null;
  users: LocalUser[];
}

const STORAGE_KEY = "marketflow-local-auth";

const defaultState: AuthState = {
  currentUserId: null,
  users: [
    {
      id: "demo-admin",
      email: "admin@test.com",
      password: "admin123",
      fullName: "Demo Admin",
      role: "admin",
      createdAt: new Date().toISOString(),
    },
    {
      id: "demo-customer",
      email: "customer@test.com",
      password: "customer123",
      fullName: "Demo Customer",
      role: "customer",
      createdAt: new Date().toISOString(),
    },
  ],
};

const deepCopy = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

let memoryState: AuthState = deepCopy(defaultState);

type AuthListener = (user: LocalUser | null) => void;
const listeners = new Set<AuthListener>();

const hasWindow = typeof window !== "undefined";

function readState(): AuthState {
  if (!hasWindow) {
    return memoryState;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    writeState(defaultState);
    return deepCopy(defaultState);
  }

  try {
    return JSON.parse(raw) as AuthState;
  } catch (error) {
    console.warn("[localAuth] Failed to parse storage, resetting", error);
    writeState(defaultState);
    return deepCopy(defaultState);
  }
}

function writeState(state: AuthState) {
  memoryState = deepCopy(state);
  if (hasWindow) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryState));
  }
}

function getUserFromState(state: AuthState): LocalUser | null {
  if (!state.currentUserId) return null;
  return state.users.find((user) => user.id === state.currentUserId) ?? null;
}

function notify(user: LocalUser | null) {
  listeners.forEach((listener) => listener(user));
}

export function getCurrentUser(): LocalUser | null {
  return getUserFromState(readState());
}

export function getAllUsers(): LocalUser[] {
  return readState().users;
}

export async function signIn(email: string, password: string): Promise<LocalUser> {
  const state = readState();
  const normalizedEmail = email.toLowerCase();
  const user = state.users.find((entry) => entry.email.toLowerCase() === normalizedEmail);
  if (!user || user.password !== password) {
    throw new Error("Invalid credentials");
  }

  const nextState: AuthState = { ...state, currentUserId: user.id };
  writeState(nextState);
  notify(user);
  return user;
}

export async function signUp(params: { email: string; password: string; fullName: string }): Promise<LocalUser> {
  const state = readState();
  const normalizedEmail = params.email.toLowerCase();
  const existing = state.users.find((entry) => entry.email.toLowerCase() === normalizedEmail);
  if (existing) {
    throw new Error("Email already registered");
  }

  const newUser: LocalUser = {
    id: nanoid(),
    email: normalizedEmail,
    password: params.password,
    fullName: params.fullName,
    role: "customer",
    createdAt: new Date().toISOString(),
  };

  const nextState: AuthState = {
    currentUserId: newUser.id,
    users: [...state.users, newUser],
  };

  writeState(nextState);
  notify(newUser);
  return newUser;
}

export async function signOut(): Promise<void> {
  const state = readState();
  if (!state.currentUserId) {
    return;
  }
  const nextState: AuthState = { ...state, currentUserId: null };
  writeState(nextState);
  notify(null);
}

export function onAuthStateChange(listener: AuthListener) {
  listeners.add(listener);
  return {
    subscription: {
      unsubscribe: () => listeners.delete(listener),
    },
  };
}
