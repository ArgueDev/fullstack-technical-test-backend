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
  return EventModel.findByIdAndDelete(id);
};