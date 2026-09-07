import mongoose, { type HydratedDocument } from 'mongoose';

import EventModel, { type Event } from '../models/event.model.js';
import ReservationModel from '../models/reservation.model.js';

interface CreateReservationInput {
  eventId: string;
  userId: string;
  quantity: number;
}

export const createReservation = async ( data: CreateReservationInput ) => {
  if (!mongoose.isValidObjectId(data.eventId)) {
    throw new Error('INVALID_EVENT_ID');
  }

  if (!Number.isInteger(data.quantity) || data.quantity < 1) {
    throw new Error('INVALID_QUANTITY');
  }

  const session = await mongoose.startSession();

  try {
    const reservation = await session.withTransaction(async () => {
      const event = await EventModel.findOneAndUpdate(
        {
          _id: data.eventId,
          availableTickets: {
            $gte: data.quantity,
          },
        },
        {
          $inc: {
            availableTickets: -data.quantity,
          },
        },
        {
          returnDocument: 'after',
          runValidators: true,
          session,
        }
      );

      if (!event) {
        const existingEvent = await EventModel
          .findById(data.eventId)
          .session(session);

        if (!existingEvent) {
          throw new Error('EVENT_NOT_FOUND');
        }

        throw new Error('INSUFFICIENT_TICKETS');
      }

      const newReservation = new ReservationModel({
        eventId: data.eventId,
        userId: data.userId,
        quantity: data.quantity,
      });

      await newReservation.save({ session });

      return newReservation;
    });

    if (!reservation) {
      throw new Error('RESERVATION_TRANSACTION_FAILED');
    }

    return reservation;
  } finally {
    await session.endSession();
  }
};

type ReservationEvent = HydratedDocument<Pick<Event, 'name' | 'date' | 'location'>>;

export const getReservationsByUser = async (userId: string) => {
  return ReservationModel.find({ userId })
    .select('quantity createdAt eventId')
    .sort({ createdAt: -1, _id: -1 })
    .populate<{ eventId: ReservationEvent | null }>({
      path: 'eventId',
      select: 'name date location',
    })
    .exec();
};
