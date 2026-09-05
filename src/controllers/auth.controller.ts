import type { Request, Response } from 'express';

import {
  registerUser,
  loginUser,
} from '../services/auth.service.js';

export const register = async ( req: Request, res: Response ): Promise<void> => {
  try {
    const user = await registerUser(req.body);

    res.status(201).json({
      message: 'Usuario registrado correctamente',
      user,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'EMAIL_ALREADY_EXISTS'
    ) {
      res.status(409).json({
        message: 'El correo electrónico ya está registrado',
      });
      return;
    }

    res.status(500).json({
      message: 'Error al registrar el usuario',
    });
  }
};

export const login = async ( req: Request, res: Response ): Promise<void> => {
  try {
    const { user, token } = await loginUser(req.body);

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      user,
      token,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'INVALID_CREDENTIALS'
    ) {
      res.status(401).json({
        message: 'Correo electrónico o contraseña incorrectos',
      });
      return;
    }

    res.status(500).json({
      message: 'Error al iniciar sesión',
    });
  }
};