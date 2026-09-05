import type {
  Request,
  Response,
  NextFunction,
} from 'express';

import UserModel from '../models/user.model.js';
import { verifyToken } from '../utils/jwt.js';

export const authenticate = async ( req: Request, res: Response, next: NextFunction ): Promise<void> => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    res.status(401).json({
      message: 'No autorizado',
    });
    return;
  }

  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    res.status(401).json({
      message: 'Formato de token inválido',
    });
    return;
  }

  try {
    const decoded = verifyToken(token);

    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      res.status(401).json({
        message: 'Token no válido',
      });
      return;
    }

    req.user = {
      id: user.id,
      name: user.name as string,
      email: user.email as string,
      role: user.role as 'user' | 'admin',
    };

    next();
  } catch {
    res.status(401).json({
      message: 'Token no válido o expirado',
    });
  }
};

export const isAdmin = ( req: Request, res: Response, next: NextFunction ): void => {
  if (!req.user) {
    res.status(401).json({
      message: 'No autorizado',
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      message: 'Acceso denegado',
    });
    return;
  }

  next();
};