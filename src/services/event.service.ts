import mongoose from 'mongoose';
import ReservationModel from '../models/reservation.model.js';
import EventModel, { type Event } from '../models/event.model.js';

type CreateEventInput = Pick<
  Event,
  'name' | 'date' | 'location' | 'availableTickets'
>;

type UpdateEventInput = Partial<CreateEventInput>;

export const getAllEvents = async () => {
  return EventModel.find().sort({ date: 1 });
};

export const getEventById = async (id: string) => {
  return EventModel.findById(id);
};

export const createEvent = async (data: CreateEventInput) => {
  const event = new EventModel(data);
  return event.save();
};

export const updateEvent = async ( id: string, data: UpdateEventInput ) => {
  return EventModel.findByIdAndUpdate(id, data, {
    returnDocument: 'after',
    runValidators: true,
  });
};

export const deleteEvent = async (id: string) => {
  const session = await mongoose.startSession();
  try {
    return await session.withTransaction(async () => {
      const event = await EventModel.findById(id).session(session);
      if (!event) return null;

      const hasReservations = await ReservationModel.exists({ eventId: id }).session(session);
      if (hasReservations) throw new Error('EVENT_HAS_RESERVATIONS');

      return EventModel.findByIdAndDelete(id).session(session);
    });
  } finally {
    await session.endSession();
  }
};