const assert = require("node:assert/strict");
const {allocateBudget} = require("./allocator.js");

const p = allocateBudget(130, [
  {name: "system", requested_tokens: 90, minimum_tokens: 10, priority: 3},
  {name: "history", requested_tokens: 90, minimum_tokens: 10, priority: 1},
], 30);
assert.deepEqual(p.sections.map(s => s.allocated_tokens), [70, 30]);
assert.equal(p.allocated_tokens + p.unused_input_tokens + p.reserve_tokens, 130);
const capped = allocateBudget(100, [
  {name: "short", requested_tokens: 2, priority: 10},
  {name: "long", requested_tokens: 100, priority: 1},
]);
assert.deepEqual(capped.sections.map(s => s.allocated_tokens), [2, 98]);
assert.throws(() => allocateBudget(5, [{name: "x", requested_tokens: 4, minimum_tokens: 4}], 2));
assert.throws(() => allocateBudget(5, [{name: "x", requested_tokens: 4}, {name: "x", requested_tokens: 4}]));
for (let i = 0; i < 100; i++) {
  const result = allocateBudget(i * 3, [
    {name: "A", requested_tokens: 250, priority: 7},
    {name: "B", requested_tokens: 3, priority: 1},
    {name: "C", requested_tokens: 130, priority: 2},
  ]);
  assert.equal(result.allocated_tokens + result.unused_input_tokens, i * 3);
  assert.ok(result.sections.every(s => s.allocated_tokens <= s.requested_tokens));
}
console.log("Browser allocator tests passed");
