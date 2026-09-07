import { Router } from 'express';
import { body } from 'express-validator';

import { postReservation, getMyReservations } from '../controllers/reservation.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { handleInputErrors } from '../middlewares/validation.middleware.js';

const router = Router();

router.get('/me', authenticate, getMyReservations);

router.post('/',
  authenticate,
  body('eventId').isMongoId().withMessage('El ID del evento no es válido.'),
  body('quantity').isInt({ min: 1 }).withMessage('La cantidad debe ser un número entero mayor a 0.'),
  handleInputErrors,
  postReservation
);

export default router;