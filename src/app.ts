import express from 'express';
import cors from 'cors';

import { corsConfig } from './config/cors.js';
import eventRoutes from './routes/event.routes.js';
import authRoutes from './routes/auth.routes.js';
import reservationRoutes from './routes/reservation.routes.js';

const app = express();

app.use(cors(corsConfig));
app.use(express.json());

app.use('/events', eventRoutes);
app.use('/auth', authRoutes);
app.use('/reservations', reservationRoutes);

export default app;