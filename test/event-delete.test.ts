import assert from 'node:assert/strict';
import { test } from 'node:test';
import mongoose from 'mongoose';
import { deleteEvent } from '../src/services/event.service.js';

const id = '507f1f77bcf86cd799439011';

for (const scenario of ['unreserved', 'reserved', 'missing'] as const) {
  test(`deleteEvent: ${scenario}`, async (t) => {
    let ended = false;
    let deleted = false;
    let checked = false;
    const session = {
      withTransaction: async (callback: () => Promise<unknown>) => callback(),
      endSession: async () => { ended = true; },
    };
    t.mock.method(mongoose, 'startSession', async () => session);
    t.mock.method(mongoose.Query.prototype, 'exec', async function (this: mongoose.Query<unknown, unknown>) {
      assert.equal(this.getOptions().session, session);
      if (this.model.modelName === 'Reservation') {
        checked = true;
        assert.deepEqual(this.getFilter(), { eventId: id });
        return scenario === 'reserved' ? { _id: 'reservation-id' } : null;
      }
      assert.deepEqual(this.getFilter(), { _id: id });
      if ((this as mongoose.Query<unknown, unknown> & { op: string }).op === 'findOneAndDelete') {
        deleted = true;
        assert.equal(checked, true);
      }
      return scenario === 'missing' ? null : { id };
    });
    if (scenario === 'reserved') {
      await assert.rejects(deleteEvent(id), { message: 'EVENT_HAS_RESERVATIONS' });
    } else {
      assert.deepEqual(await deleteEvent(id), scenario === 'missing' ? null : { id });
    }
    assert.equal(deleted, scenario === 'unreserved');
    assert.equal(checked, scenario !== 'missing');
    assert.equal(ended, true);
  });
}
