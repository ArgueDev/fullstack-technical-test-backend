import express from 'express';
import cors from 'cors';

import eventRoutes from './routes/event.routes.js';
import { corsConfig } from './config/cors.js';

const app = express();

app.use(cors(corsConfig));
app.use(express.json());

app.use('/events', eventRoutes);

export default app;