// maths.js

// basic operations
function add(a, b) { return a + b; }
function subtract(a, b) { return a - b; }
function multiply(a, b) { return a * b; }
function divide(a, b) { return b === 0 ? 'Error: Division by Zero' : a / b; }

// functions and equasions
function power(base, exponent) { return Math.pow(base, exponent); }
function squareRoot(x) { return Math.sqrt(x); }
function sum(array) { return array.reduce((a, b) => a + b, 0); }
function cosine(x) { return Math.cos(x); }
function sine(x) { return Math.sin(x); }
function tangent(x) { return Math.tan(x); }
function naturalLog(x) { return Math.log(x); }
function logarithm(base, x) { return Math.log(x) / Math.log(base); }
function exponent(x) { return Math.exp(x); }

export { add, subtract, multiply, divide, power, squareRoot, sum, cosine, sine, tangent, naturalLog, logarithm, exponent};