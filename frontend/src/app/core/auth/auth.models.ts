export interface AuthUser {
  id: number;
  loginName: string;
  roles: string[];
  permissions: string[];
}

export interface AuthResponse {
  user: AuthUser;
}

export interface LoginRequest {
  loginName: string;
  password: string;
}

export type AuthStatus = 'unknown' | 'loading' | 'authenticated' | 'anonymous';
