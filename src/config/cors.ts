import type { CorsOptions } from 'cors';

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    const whitelist = [process.env.FRONTEND_URL].filter(
      (url): url is string => Boolean(url)
    );

    if (whitelist.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origen no permitido por CORS'));
  },
};