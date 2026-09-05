import { model, Schema, type InferSchemaType } from "mongoose";

const eventSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    date: {
        type: Date,
        required: true
    },

    location: {
        type: String,
        required: true,
        trim: true
    },

    availableTickets: {
        type: Number,
        required: true,
        min: 0,
        validate: {
            validator: Number.isInteger,
            message: 'Los tickets disponibles deben ser un número entero.'
        }
    }
}, {
    timestamps: true,
    versionKey: false,
    toJSON: {
        virtuals: true,
        transform: (_doc, ret) => {
            const data = ret as {
                _id?: unknown;
                date?: Date | string;
            };

            delete data._id;

            if (data.date instanceof Date) {
                data.date = data.date.toISOString().slice(0, 10);
            }
        },
    },
});

export type Event = InferSchemaType<typeof eventSchema>;

const EventModel = model('Event', eventSchema);

export default EventModel;