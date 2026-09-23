// =====================================================
// EXPRESS REQUEST AUGMENTATION (Observability & Auth)
// =====================================================

export interface AuthenticatedUser {
  _id: string | any;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: any;
  status: string;
  lastLogin?: Date | null;
  permissions?: string[];
  comparePassword?: (password: string) => Promise<boolean>;
}

declare global {
  namespace Express {
    interface Request {
      id?: string;
      user?: AuthenticatedUser;
    }
  }
}
