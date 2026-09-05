import type { Request, Response } from 'express';

import { createReservation } from '../services/reservation.service.js';

export const postReservation = async (req: Request, res: Response): Promise<void> => {

    try {
        if (!req.user) {
            res.status(401).json({
                message: 'No autorizado',
            });
            return;
        }

        const reservation = await createReservation({
            eventId: req.body.eventId,
            quantity: req.body.quantity,
            userId: req.user.id,
        });

        res.status(201).json({
            message: 'Reserva creada correctamente',
            reservation,
        });

    } catch (error) {

        if (!(error instanceof Error)) {
            res.status(500).json({
                message: 'Error al crear la reserva',
            });
            return;
        }

        switch (error.message) {
            case 'INVALID_EVENT_ID':
                res.status(400).json({
                    message: 'ID de evento inválido',
                });
                return;

            case 'INVALID_QUANTITY':
                res.status(400).json({
                    message: 'La cantidad de tickets debe ser un número entero mayor a 0',
                });
                return;

            case 'EVENT_NOT_FOUND':
                res.status(404).json({
                    message: 'Evento no encontrado',
                });
                return;

            case 'INSUFFICIENT_TICKETS':
                res.status(409).json({
                    message: 'No hay suficientes tickets disponibles',
                });
                return;

            case 'RESERVATION_TRANSACTION_FAILED':
                res.status(500).json({
                    message: 'No se pudo completar la reserva',
                });
                return;

            default:
                res.status(500).json({
                    message: 'Error al crear la reserva',
                });
        }
    }
};