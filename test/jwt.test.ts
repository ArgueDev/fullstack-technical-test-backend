import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';

import { generateToken, verifyToken } from '../src/utils/jwt.js';

let originalSecret: string | undefined;

// No se carga dotenv. Cada test utiliza un secreto ficticio y restaura el entorno.
beforeEach(() => {
  originalSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'jwt-secret-only-for-unit-tests';
});

afterEach(() => {
  if (originalSecret === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = originalSecret;
  }
});

test('genera tokens verificables que conservan userId y ambos roles', () => {
  for (const role of ['user', 'admin'] as const) {
    const payload = { userId: '507f1f77bcf86cd799439011', role };
    const token = generateToken(payload);

    assert.equal(typeof token, 'string');
    assert.equal(token.split('.').length, 3);

    const decoded = verifyToken(token);
    assert.equal(decoded.userId, payload.userId);
    assert.equal(decoded.role, payload.role);
  }
});

test('verifyToken rechaza un token firmado con otro secreto', () => {
  const token = generateToken({ userId: 'test-user', role: 'user' });
  process.env.JWT_SECRET = 'different-secret-only-for-unit-tests';

  assert.throws(() => verifyToken(token), {
    name: 'JsonWebTokenError',
    message: 'invalid signature',
  });
});

test('generateToken falla si JWT_SECRET no está definido', () => {
  delete process.env.JWT_SECRET;

  assert.throws(() => generateToken({ userId: 'test-user', role: 'user' }), {
    message: 'JWT_SECRET_NOT_DEFINED',
  });
});

test('verifyToken falla si JWT_SECRET no está definido', () => {
  const token = generateToken({ userId: 'test-user', role: 'user' });
  delete process.env.JWT_SECRET;

  assert.throws(() => verifyToken(token), {
    message: 'JWT_SECRET_NOT_DEFINED',
  });
});
