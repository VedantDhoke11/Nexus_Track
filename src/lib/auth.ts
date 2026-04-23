import { UserRole } from './data';

export interface AuthUser {
  email: string;
  role: UserRole;
}

const AUTH_STORAGE_KEY = 'nexustrack_auth_user';

type Credentials = {
  email: string;
  password: string;
  role: UserRole;
};

const TEST_CREDENTIALS: Credentials[] = [
  {
    email: 'admin@test.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    email: 'user@test.com',
    password: 'user123',
    role: 'participant'
  },
  {
    email: 'judge@test.com',
    password: 'judge123',
    role: 'judge'
  }
];

export function isBrowser() {
  return typeof window !== 'undefined';
}

export function getCurrentUser(): AuthUser | null {
  if (!isBrowser()) return null;

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function login(
  email: string,
  password: string,
  role: UserRole
): AuthUser | null {
  const match = TEST_CREDENTIALS.find(
    (cred) =>
      cred.email.toLowerCase() === email.toLowerCase() &&
      cred.password === password &&
      cred.role === role
  );

  if (!match) {
    return null;
  }

  const user: AuthUser = {
    email: match.email,
    role: match.role
  };

  if (isBrowser()) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  }

  return user;
}

export function logout() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

