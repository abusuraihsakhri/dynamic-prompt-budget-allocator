import pytest
from prompt_budgeter.allocator import allocate_budget


def test_weighted_with_reserve():
    p = allocate_budget(130, [
        {"name": "system", "requested_tokens": 90, "minimum_tokens": 10, "priority": 3},
        {"name": "history", "requested_tokens": 90, "minimum_tokens": 10, "priority": 1},
    ], 30)
    assert [r["allocated_tokens"] for r in p["sections"]] == [70, 30]
    assert p["allocated_tokens"] + p["unused_input_tokens"] + p["reserve_tokens"] == 130


def test_caps_and_unused_capacity():
    p = allocate_budget(100, [
        {"name": "short", "requested_tokens": 2, "priority": 10},
        {"name": "long", "requested_tokens": 100, "priority": 1},
    ])
    assert [r["allocated_tokens"] for r in p["sections"]] == [2, 98]
    p = allocate_budget(100, [{"name": "only", "requested_tokens": 10}], 25)
    assert p["unused_input_tokens"] == 65


@pytest.mark.parametrize("total,sections,reserve", [
    (5, [{"name": "x", "requested_tokens": 4, "minimum_tokens": 4}], 2),
    (10, [{"name": "x", "requested_tokens": 2, "minimum_tokens": 3}], 0),
    (10, [{"name": "x", "requested_tokens": 2, "priority": 0}], 0),
    (10, [{"name": "x", "requested_tokens": 2.5}], 0),
    (10, [{"name": "x", "requested_tokens": 2}, {"name": "x", "requested_tokens": 2}], 0),
    (10, [{"name": "x", "requested_tokens": -1}], 0),
    (10, [{"name": "x", "requested_tokens": 1}], 11),
    (True, [{"name": "x", "requested_tokens": 1}], 0),
])
def test_invalid_inputs(total, sections, reserve):
    with pytest.raises(ValueError):
        allocate_budget(total, sections, reserve)


def test_invariants():
    for budget in [0, 1, 2, 5, 20, 101, 10000]:
        for reserve in [0, budget]:
            plan = allocate_budget(budget, [
                {"name": "a", "requested_tokens": 5, "priority": 3},
                {"name": "b", "requested_tokens": 200, "priority": 2},
                {"name": "c", "requested_tokens": 2, "priority": 1},
            ], reserve)
            assert all(0 <= r["allocated_tokens"] <= r["requested_tokens"] for r in plan["sections"])
            assert sum(r["allocated_tokens"] for r in plan["sections"]) == plan["allocated_tokens"]
            assert plan["allocated_tokens"] + plan["unused_input_tokens"] + reserve == budget
