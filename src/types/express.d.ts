import type { User } from '../models/user.model.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: 'user' | 'admin';
      };
    }
  }
}

export {};