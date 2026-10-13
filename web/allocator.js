"use strict";
/* Deterministic browser counterpart of prompt_budgeter/allocator.py. */
(function (root) {
  const LIMIT = 1000000000;
  function integer(value, label, minimum = 0) {
    if (!Number.isSafeInteger(value) || value < minimum || value > LIMIT) {
      throw new Error(label + " must be an integer from " + minimum + " to " + LIMIT);
    }
    return value;
  }

  function allocateBudget(totalTokens, sections, reserveTokens = 0) {
    const total = integer(totalTokens, "total_tokens");
    const reserve = integer(reserveTokens, "reserve_tokens");
    if (reserve > total) throw new Error("reserve_tokens exceeds total_tokens");
    if (!Array.isArray(sections) || sections.length < 1 || sections.length > 1000) {
      throw new Error("sections must contain 1 to 1000 objects");
    }
    const names = new Set();
    const rows = sections.map((item, index) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        throw new Error("section " + (index + 1) + " must be an object");
      }
      let name = typeof item.name === "string" ? item.name.trim() : "";
      if (!name || name.length > 128 || names.has(name)) {
        throw new Error("Invalid or duplicate section name: " + name);
      }
      names.add(name);
      const requested_tokens = integer(item.requested_tokens, name + " requested_tokens");
      const minimum_tokens = integer(item.minimum_tokens ?? 0, name + " minimum_tokens");
      const priority = integer(item.priority ?? 1, name + " priority", 1);
      if (minimum_tokens > requested_tokens) throw new Error(name + ": minimum exceeds demand");
      return { name, requested_tokens, minimum_tokens, priority, allocated_tokens: minimum_tokens };
    });
    const inputBudget = total - reserve;
    const minSum = rows.reduce((acc, item) => acc + item.minimum_tokens, 0);
    if (minSum > inputBudget) throw new Error("section minima exceed input budget");
    let remaining = inputBudget - minSum;
    while (remaining) {
      let active = rows.filter(item => item.allocated_tokens < item.requested_tokens);
      if (!active.length) break;
      let weight = active.reduce((acc, item) => acc + item.priority, 0);
      let used = 0;
      for (const item of active) {
        const quota = Number(BigInt(remaining) * BigInt(item.priority) / BigInt(weight));
        const amount = Math.min(item.requested_tokens - item.allocated_tokens, quota);
        item.allocated_tokens += amount;
        used += amount;
      }
      remaining -= used;
      if (!remaining) break;
      active = rows.filter(item => item.allocated_tokens < item.requested_tokens);
      if (!active.length) break;
      weight = active.reduce((acc, item) => acc + item.priority, 0);
      const ranked = active.map((item, index) => ({item, index}));
      const fraction = item => BigInt(remaining) * BigInt(item.priority) % BigInt(weight);
      ranked.sort((a, b) => {
        const fa = fraction(a.item), fb = fraction(b.item);
        if (fa !== fb) return fa > fb ? -1 : 1;
        return b.item.priority - a.item.priority || a.index - b.index;
      });
      for (const entry of ranked) {
        if (!remaining) break;
        entry.item.allocated_tokens += 1;
        remaining -= 1;
      }
    }
    const allocated = rows.reduce((acc, item) => acc + item.allocated_tokens, 0);
    return {total_tokens: total, reserve_tokens: reserve, input_budget: inputBudget,
            allocated_tokens: allocated, unused_input_tokens: inputBudget - allocated,
            sections: rows};
  }
  root.allocateBudget = allocateBudget;
  if (typeof module !== "undefined") module.exports = {allocateBudget};
})(typeof globalThis !== "undefined" ? globalThis : this);
