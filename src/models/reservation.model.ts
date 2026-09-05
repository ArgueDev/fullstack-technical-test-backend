import {Schema, model, Document, type InferSchemaType} from 'mongoose';

const reservationSchema = new Schema({
    eventId: {
        type: Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
    },

    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    quantity: {
        type: Number,
        required: true,
        min: 1,
        validate: {
            validator: Number.isInteger,
            message: 'Debe ser un número entero',
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
            }
            delete data._id;
        }
    }
});

export type Reservation = InferSchemaType<typeof reservationSchema> & Document;

const ReservationModel = model('Reservation', reservationSchema);

export default ReservationModel;