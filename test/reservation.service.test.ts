import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createReservation } from '../src/services/reservation.service.js';

const validInput = {
  eventId: '507f1f77bcf86cd799439011',
  userId: '507f1f77bcf86cd799439012',
  quantity: 1,
};

// Estas entradas deben rechazarse antes de iniciar una sesión de MongoDB.
test('createReservation rechaza un eventId inválido', { timeout: 1000 }, async () => {
  await assert.rejects(
    createReservation({ ...validInput, eventId: 'invalid-event-id' }),
    { message: 'INVALID_EVENT_ID' },
  );
});

for (const quantity of [0, -1, 1.5]) {
  test(`createReservation rechaza quantity = ${quantity}`, { timeout: 1000 }, async () => {
    await assert.rejects(
      createReservation({ ...validInput, quantity }),
      { message: 'INVALID_QUANTITY' },
    );
  });
}
