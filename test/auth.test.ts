import assert from 'node:assert/strict';
import { test } from 'node:test';

import { comparePassword, hashPassword } from '../src/utils/auth.js';

test('hashPassword no devuelve la contraseña en texto plano', async () => {
  const password = 'password-only-for-tests';
  const hash = await hashPassword(password);

  assert.ok(hash.length > 0);
  assert.notEqual(hash, password);
});

test('comparePassword acepta la contraseña correcta', async () => {
  const password = 'password-only-for-tests';
  const hash = await hashPassword(password);

  assert.equal(await comparePassword(password, hash), true);
});

test('comparePassword rechaza una contraseña incorrecta', async () => {
  const hash = await hashPassword('password-only-for-tests');

  assert.equal(await comparePassword('incorrect-password', hash), false);
});
