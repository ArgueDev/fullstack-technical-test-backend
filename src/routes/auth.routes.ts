import { Router } from 'express';
import { body } from 'express-validator';

import {
  register,
  login,
} from '../controllers/auth.controller.js';

import { handleInputErrors } from '../middlewares/validation.middleware.js';

const router = Router();

router.post('/register',
  body('name').isString().trim().notEmpty().withMessage('El nombre es obligatorio.'),
  body('email').isEmail().normalizeEmail().withMessage('Debe ingresar un correo electrónico válido.'),
  body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.'),
  handleInputErrors,
  register
);

router.post('/login',
  body('email').isEmail().normalizeEmail().withMessage('Debe ingresar un correo electrónico válido.'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria.'),
  handleInputErrors,
  login
);

export default router;