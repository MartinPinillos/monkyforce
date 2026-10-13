export interface AuthenticatedUser {
  id: number;
  loginName: string;
  isActive: boolean;
  roles: string[];
  permissions: string[];
}
