"""Deterministic priority-weighted prompt allocation."""
from typing import Any, Dict, List

MAX_TOKENS = 1000000000


def require_int(value: Any, label: str, minimum: int = 0) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value < minimum or value > MAX_TOKENS:
        raise ValueError("{} must be an integer between {} and {}".format(label, minimum, MAX_TOKENS))
    return value


def allocate_budget(total_tokens: int, sections: List[Dict[str, Any]],
                    reserve_tokens: int = 0) -> Dict[str, Any]:
    """Reserve output, guarantee minima, and distribute capacity by priority.

    Counts are externally estimated, not measured by a tokenizer.
    """
    total = require_int(total_tokens, "total_tokens")
    reserve = require_int(reserve_tokens, "reserve_tokens")
    if reserve > total:
        raise ValueError("reserve_tokens exceeds total_tokens")
    if not isinstance(sections, list) or not 1 <= len(sections) <= 1000:
        raise ValueError("sections must contain 1 to 1000 objects")
    seen = set()
    rows = []
    for i, item in enumerate(sections):
        if not isinstance(item, dict):
            raise ValueError("section must be an object")
        name = item.get("name")
        if not isinstance(name, str) or not name.strip() or len(name) > 128:
            raise ValueError("section {} name is invalid".format(i + 1))
        name = name.strip()
        if name in seen:
            raise ValueError("duplicate section name: {}".format(name))
        seen.add(name)
        demand = require_int(item.get("requested_tokens"), name + ".requested_tokens")
        minimum = require_int(item.get("minimum_tokens", 0), name + ".minimum_tokens")
        priority = require_int(item.get("priority", 1), name + ".priority", 1)
        if minimum > demand:
            raise ValueError("{} minimum exceeds demand".format(name))
        rows.append({"name": name, "requested_tokens": demand,
                     "minimum_tokens": minimum, "priority": priority,
                     "allocated_tokens": minimum})
    available = total - reserve
    min_sum = sum(x["minimum_tokens"] for x in rows)
    if min_sum > available:
        raise ValueError("section minima exceed input budget")
    remaining = available - min_sum
    while remaining:
        active = [x for x in rows if x["allocated_tokens"] < x["requested_tokens"]]
        if not active:
            break
        weight = sum(x["priority"] for x in active)
        used = 0
        for x in active:
            amount = min(x["requested_tokens"] - x["allocated_tokens"],
                         remaining * x["priority"] // weight)
            x["allocated_tokens"] += amount
            used += amount
        remaining -= used
        if not remaining:
            break
        active = [x for x in rows if x["allocated_tokens"] < x["requested_tokens"]]
        if not active:
            break
        weight = sum(x["priority"] for x in active)
        ranked = sorted(enumerate(active), key=lambda pair: (
            -(remaining * pair[1]["priority"] % weight), -pair[1]["priority"], pair[0]))
        for _, x in ranked:
            if not remaining:
                break
            x["allocated_tokens"] += 1
            remaining -= 1
    allocated = sum(x["allocated_tokens"] for x in rows)
    return {"total_tokens": total, "reserve_tokens": reserve,
            "input_budget": available, "allocated_tokens": allocated,
            "unused_input_tokens": available - allocated, "sections": rows}
