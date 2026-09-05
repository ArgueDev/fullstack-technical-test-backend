import { Router } from 'express';
import { body } from 'express-validator';

import { handleInputErrors } from '../middlewares/validation.middleware.js';

import {
  getEvents,
  getEvent,
  postEvent,
  putEvent,
  removeEvent,
} from '../controllers/event.controller.js';

import {
  authenticate,
  isAdmin,
} from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getEvents);

router.get('/:id', getEvent);

router.post('/',
    authenticate,
    isAdmin,
    body('name').isString().notEmpty().withMessage('El nombre del evento es obligatorio.'),
    body('date').isISO8601().toDate().withMessage('La fecha del evento debe ser una fecha válida.'),
    body('location').isString().notEmpty().withMessage('La ubicación del evento es obligatoria.'),
    body('availableTickets').isInt({ min: 0 }).withMessage('Los tickets disponibles deben ser un número entero mayor o igual a 0.'),
    handleInputErrors,
    postEvent
);

router.put('/:id',
    body('name').optional().isString().notEmpty().withMessage('El nombre del evento debe ser una cadena de texto no vacía.'),
    body('date').optional().isISO8601().toDate().withMessage('La fecha del evento debe ser una fecha válida.'),
    body('location').optional().isString().notEmpty().withMessage('La ubicación del evento debe ser una cadena de texto no vacía.'),
    body('availableTickets').optional().isInt({ min: 0 }).withMessage('Los tickets disponibles deben ser un número entero mayor o igual a 0.'),
    handleInputErrors,
    putEvent
);

router.delete('/:id', 
    authenticate,
    isAdmin,
    removeEvent
);

export default router;