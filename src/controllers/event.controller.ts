import type { Request, Response } from 'express';
import mongoose from 'mongoose';

import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../services/event.service.js';

export const getEvents = async ( _req: Request, res: Response ): Promise<void> => {
  try {
    const events = await getAllEvents();

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener los eventos',
    });
  }
};

export const getEvent = async ( req: Request, res: Response ): Promise<void> => {
  try {
    const { id } = req.params;

    if (typeof id !== 'string' || !mongoose.isValidObjectId(id)) {
      res.status(400).json({
        message: 'ID de evento inválido',
      });
      return;
    }

    const event = await getEventById(id);

    if (!event) {
      res.status(404).json({
        message: 'Evento no encontrado',
      });
      return;
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener el evento',
    });
  }
};

export const postEvent = async ( req: Request, res: Response ): Promise<void> => {
  try {
    const event = await createEvent(req.body);

    res.status(201).json(event);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({
        message: 'Error de validación en los datos del evento',
      });
      return;
    }

    res.status(500).json({
      message: 'Error al crear el evento',
    });
  }
};

export const putEvent = async ( req: Request, res: Response ): Promise<void> => {
  try {
    const { id } = req.params;

    if (typeof id !== 'string' || !mongoose.isValidObjectId(id)) {
      res.status(400).json({
        message: 'ID de evento inválido',
      });
      return;
    }

    const event = await updateEvent(id, req.body);

    if (!event) {
      res.status(404).json({
        message: 'Evento no encontrado',
      });
      return;
    }

    res.status(200).json(event);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({
        message: 'Error de validación en los datos del evento',
      });
      return;
    }

    res.status(500).json({
      message: 'Error al actualizar el evento',
    });
  }
};

export const removeEvent = async ( req: Request, res: Response ): Promise<void> => {
  try {
    const { id } = req.params;

    if (typeof id !== 'string' || !mongoose.isValidObjectId(id)) {
      res.status(400).json({
        message: 'ID de evento inválido',
      });
      return;
    }

    const event = await deleteEvent(id);

    if (!event) {
      res.status(404).json({
        message: 'Evento no encontrado',
      });
      return;
    }

    res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message === 'EVENT_HAS_RESERVATIONS') {
      res.status(409).json({
        message: 'No se puede eliminar el evento porque tiene reservas asociadas',
      });
      return;
    }

    res.status(500).json({
      message: 'Error al eliminar el evento',
    });
  }
};