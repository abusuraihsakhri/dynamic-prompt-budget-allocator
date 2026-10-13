# Dynamic Prompt Budget Allocator

### [Open the Live Application →](https://abusuraihsakhri.github.io/dynamic-prompt-budget-allocator/)

A deterministic allocator for prompt-section token budgets. The browser application runs locally without a backend or external inference service.

## What it does

Define a total token limit, reserve tokens for model output, and enter prompt sections with an estimated token demand, minimum guaranteed tokens, and a relative priority. The allocator:

- Guarantees output headroom and all feasible section minimums.
- Divides the remaining input capacity proportionally to priority, capped at each section's requested demand.
- Rejects negative, non-integer and infeasible budgets.
- Reports remaining unused tokens and exports the plan as JSON.
- Runs entirely inside a modern browser; the same algorithm is implemented in Python.

**Scope:** The tool plans allocation counts. It does not count actual model tokens, truncate text automatically, compress conversation history, change model-side KV caches or call a model provider.

## Browser application

Open [web/index.html](web/index.html) directly in a current desktop/mobile browser. For development, serve the directory locally:

    python -m http.server 8000 --directory web

The app has no server dependency and requires no external fonts, keys or network access. Its legacy-audit panel computes local preview thresholds; it does not create a signed audit record.

## Python library

Install:

    python -m pip install -e .

Example:

```python
from prompt_budgeter.allocator import allocate_budget

plan = allocate_budget(
    total_tokens=8192,
    reserve_tokens=1024,
    sections=[
        {"name": "System", "requested_tokens": 1400, "minimum_tokens": 900, "priority": 5},
        {"name": "Evidence", "requested_tokens": 5000, "minimum_tokens": 1000, "priority": 4},
        {"name": "History", "requested_tokens": 3000, "minimum_tokens": 0, "priority": 2},
    ],
)
print(plan)
```

Save a corresponding JSON request in a file, then run:

    dynamic-prompt-budget-allocator allocate -i request.json

This prints the allocation plan as JSON. The Python allocator uses the standard library and can be imported independently of the audit agents.

## Existing audit CLI and REST API

The legacy threshold-audit implementation is preserved. Install optional dependencies:

    python -m pip install -e ".[api,test]"

Configure a strong secret **before** using its HMAC-signed audit logging:

    export AUDIT_SECRET_KEY="$(python -c 'import secrets; print(secrets.token_hex(32))')"

Then run:

    python cli.py audit
    python cli.py verify-audit
    python cli.py serve --host 127.0.0.1 --port 8000

The main REST service provides health, audit and chat endpoints and an additional `POST /api/allocate` endpoint accepting `total_tokens`, `reserve_tokens`, and `sections`. The alternative `prompt_budgeter.server` app also provides the allocation endpoint. For container deployment, `docker compose up --build` requires `AUDIT_SECRET_KEY` in the environment.

## Tests

    python -m pip install -e ".[api,test]"
    AUDIT_SECRET_KEY=test-only python -m pytest -q
    node --check web/app.js
    node --check web/allocator.js
    node web/test_allocator.cjs

The GitHub Actions CI workflow tests Python 3.10, 3.11 and 3.12. A separate workflow deploys the static `web/` directory to GitHub Pages when Pages is configured for GitHub Actions.

## Privacy and limitations

Browser inputs stay on the user's device and are not uploaded. The legacy Python service holds dossiers and signed audit entries in process memory. Its regular-expression PHI guard does not establish HIPAA compliance or reliable de-identification; do not input patient records or secrets. The legacy audit modules classify user-supplied numeric metrics against fixed demonstration thresholds, not clinically validated standards.

## License

MIT. See [LICENSE](LICENSE).
