import assert from 'node:assert/strict';
import { test } from 'node:test';
import mongoose from 'mongoose';
import ReservationModel from '../src/models/reservation.model.js';
import EventModel from '../src/models/event.model.js';
import { getReservationsByUser } from '../src/services/reservation.service.js';

const userId = '507f1f77bcf86cd799439012';

test('consulta reservas exclusivamente por usuario y configura orden, selección y populate', async (t) => {
  const rows = [{ quantity: 2, eventId: null }];
  t.mock.method(mongoose.Query.prototype, 'exec', async function (this: mongoose.Query<unknown, unknown>) {
    assert.deepEqual(this.getFilter(), { userId });
    assert.deepEqual(this.getOptions().sort, { createdAt: -1, _id: -1 });
    assert.deepEqual(this.projection(), { quantity: 1, createdAt: 1, eventId: 1 });
    assert.deepEqual(this.getPopulatedPaths(), ['eventId']);
    return rows;
  });
  assert.deepEqual(await getReservationsByUser(userId), rows);
});

test('usuario sin reservas recibe un array vacío', async (t) => {
  t.mock.method(mongoose.Query.prototype, 'exec', async function (this: mongoose.Query<unknown, unknown>) {
    assert.deepEqual(this.getFilter(), { userId });
    return [];
  });
  assert.deepEqual(await getReservationsByUser(userId), []);
});

test('usuarios diferentes generan filtros independientes', async (t) => {
  const filters: unknown[] = [];
  t.mock.method(mongoose.Query.prototype, 'exec', async function (this: mongoose.Query<unknown, unknown>) {
    filters.push(this.getFilter());
    return [];
  });
  const otherUserId = '507f1f77bcf86cd799439013';
  await getReservationsByUser(userId);
  await getReservationsByUser(otherUserId);
  assert.deepEqual(filters, [{ userId }, { userId: otherUserId }]);
});

test('serializers mantienen id, fecha y evento eliminado como null', () => {
  const event = new EventModel({ name: 'Concierto', date: new Date('2026-09-20'), location: 'Guayaquil' });
  const serializedEvent = JSON.parse(JSON.stringify(event));
  assert.equal(serializedEvent.date, '2026-09-20');
  assert.equal(typeof serializedEvent.id, 'string');
  assert.equal('_id' in serializedEvent, false);
  const reservation = new ReservationModel({ quantity: 2, eventId: null, createdAt: new Date('2026-09-07T12:00:00Z') });
  const serialized = JSON.parse(JSON.stringify(reservation));
  assert.equal(serialized.eventId, null);
  assert.equal(typeof serialized.id, 'string');
  assert.equal('_id' in serialized, false);
});
