from agents.base import AuditTrail


def test_chained_entries():
    trail = AuditTrail(secret_key="unit-test-only")
    trail.log("test", "unit", "created", {"value": 1})
    trail.log("test", "unit", "updated", {"value": 2})
    assert trail.verify_integrity()


def test_entry_tampering():
    trail = AuditTrail(secret_key="unit-test-only")
    entry = trail.log("test", "unit", "created", {"value": 1})
    entry["event_type"] = "altered"
    assert not trail.verify_integrity()


def test_signature_tampering():
    trail = AuditTrail(secret_key="unit-test-only")
    trail.log("test", "unit", "created", {"value": 1})
    trail.logs[0]["current_hash"] = "0" * 64
    assert not trail.verify_integrity()
