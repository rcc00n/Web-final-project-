import { test } from 'node:test';
import assert from 'node:assert/strict';
import { add, subtract, multiply, divide, power, squareRoot, sum, cosine, sine, naturalLog, logarithm } from '../calculations.js';
test('arithmetic and division by zero preserve established outcomes', () => {
  assert.equal(add(2, 3), 5); assert.equal(subtract(3, 5), -2); assert.equal(multiply(-2, 3), -6);
  assert.equal(divide(6, 3), 2); assert.equal(divide(1, 0), 'Error: Division by Zero');
  assert.equal(sum([]), 0); assert.equal(sum([1, -2, 3]), 2);
});
test('scientific operations use radians and explicit JavaScript domain behavior', () => {
  assert.equal(power(2, 3), 8); assert.equal(squareRoot(9), 3); assert.ok(Number.isNaN(squareRoot(-1)));
  assert.equal(cosine(0), 1); assert.ok(Math.abs(sine(Math.PI)) < 1e-12);
  assert.equal(naturalLog(0), -Infinity); assert.equal(logarithm(10, 100), 2);
});
