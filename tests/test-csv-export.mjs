import assert from "node:assert";

function escapeCsvCell(val) {
  if (val === null || val === undefined) return '""';
  let str = String(val);
  if (/^[=\+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

console.log("Testing escapeCsvCell function...");

// Normal strings
assert.strictEqual(escapeCsvCell("normal text"), '"normal text"');
assert.strictEqual(escapeCsvCell('text with "quotes"'), '"text with ""quotes"""');
assert.strictEqual(escapeCsvCell(""), '""');
assert.strictEqual(escapeCsvCell(null), '""');
assert.strictEqual(escapeCsvCell(undefined), '""');
assert.strictEqual(escapeCsvCell(123), '"123"');

// Formula injection strings
assert.strictEqual(escapeCsvCell("=1+1"), '"\'=1+1"');
assert.strictEqual(escapeCsvCell("+1+1"), '"\'+1+1"');
assert.strictEqual(escapeCsvCell("-1+1"), '"\'-1+1"');
assert.strictEqual(escapeCsvCell("@SUM(A1:A10)"), '"\'@SUM(A1:A10)"');
assert.strictEqual(escapeCsvCell("\tcmd"), '"\'\tcmd"');
assert.strictEqual(escapeCsvCell("\rcmd"), '"\'\rcmd"');

// Formula injection with double quotes
assert.strictEqual(escapeCsvCell('="hello ""world"""'), '"\'=""hello """"world"""""""');

console.log("All escapeCsvCell tests passed successfully!");
