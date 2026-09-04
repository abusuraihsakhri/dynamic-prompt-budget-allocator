# Dynamic Prompt Budget Allocator

> **Domain:** Autonomous Agent Systems & Context State Architecture
> **Reference Guidelines & Standards:** `Distributed Systems RFC & State Machine Verification`

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![Python](https://img.shields.io/badge/Python-3.10%20%7C%203.11%20%7C%203.12-3776AB.svg?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688.svg?logo=fastapi&logoColor=white)
![Audit Trail](https://img.shields.io/badge/Audit-HMAC--SHA256_Tamper--Evident-brightgreen.svg)
![Zero-PHI Guard](https://img.shields.io/badge/Guard-Zero--PHI_Outbound-blue.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?logo=docker&logoColor=white)

</div>

---

## 📖 What It Does

**Dynamic Prompt Budget Allocator** is an analytical platform implementing dynamic token budgeting, tool call compression, and KV-cache headroom preservation for autonomous agent systems. It provides multi-worker evaluation, cryptographic audit trails, and PHI outbound protection.

---

## ⚙️ Key Capabilities & Algorithmic Modules

- **Deterministic Calculation Engine**: Strict compliance with standard reference formulations and thresholds.
- **Risk & Urgency Classification**: Multi-tier categorization (ROUTINE, ELEVATED, CRITICAL_STAT) with automated action recommendations.
- **Validation & Guardrails**: Rigorous input bounds checking, NaN/Infinity rejection, and anomaly detection.
- **Multi-Worker Evaluation**: InvariantQCWorker, SafetyEscalationWorker, and ProtocolConformanceWorker for comprehensive analysis.

---

## 💻 Installation

```bash
# Clone the repository
git clone https://github.com/abusuraihsakhri/dynamic-prompt-budget-allocator.git
cd dynamic-prompt-budget-allocator

# Install dependencies
pip install fastapi uvicorn pydantic pytest
```

---

## 💻 CLI Quickstart & Usage

### 1. Single Task Evaluation
```bash
python cli.py audit --task-id TASK-001 --target KEY-01 --primary 28.5 --secondary 14.2 --critical --status DISCORDANT
```

### 2. Interactive Chat
```bash
python cli.py chat "What is the system status?"
```

### 3. Batch Processing
```bash
python cli.py batch -i sample.csv -o results.csv
```

### 4. Verify Audit Trail Integrity
```bash
python cli.py verify-audit
```

### 5. Launch REST API Server
```bash
python cli.py serve --host 127.0.0.1 --port 8000
```

### Parameter Reference
- `--task-id`: Unique task identifier (required)
- `--target`: Target entity identifier (required)
- `--primary`: Primary metric value (float, required)
- `--secondary`: Secondary metric value (float, default: 0.0)
- `--critical`: Flag for critical/emergency status
- `--status`: Status descriptor (e.g., NOMINAL, DISCORDANT)

### Input Data Schema

| Field | Description | Requirement |
|:------|:------------|:------------|
| `task_id` | Unique task identifier | Required |
| `target_identifier` | Target entity identifier | Required |
| `primary_metric` | Primary measurement value | Required |
| `secondary_metric` | Secondary measurement value | Optional |
| `is_critical_flag` | Emergency escalation flag | Optional |
| `status_descriptor` | Status code descriptor | Optional |

---

## 🛡️ Security & Enterprise Architecture

* **Zero-PHI Outbound Interceptor:** Active regex inspection blocking SSNs, MRNs, phone numbers, and patient identifiers.
* **Tamper-Evident HMAC-SHA256 Audit Trail:** Chained, cryptographically signed logs for every evaluation and state transition.
* **Input Validation:** Rejects NaN, Infinity, and malformed metric values.
* **Secure Defaults:** No hardcoded secrets; requires `AUDIT_SECRET_KEY` environment variable.

### Environment Variables

| Variable | Description | Required |
|:---------|:------------|:---------|
| `AUDIT_SECRET_KEY` | HMAC-SHA256 signing key for audit trail | Yes |
| `MODEL_PROVIDER` | LLM provider (mock, ollama, claude, openai) | No (default: mock) |

---

## 🧪 Testing & Verification

Run the automated test suite:

```bash
# Set test audit key
export AUDIT_SECRET_KEY="test-audit-key"

# Run tests
pytest -v
```

Execute high-throughput batch simulation benchmarks:

```bash
python simulator.py 1000
```

---

## 🐳 Container Deployment

```bash
# Build and run with Docker Compose
AUDIT_SECRET_KEY=$(python -c "import secrets; print(secrets.token_hex(32))") docker-compose up -d

# Or build and run manually
docker build -t dynamic-prompt-budget-allocator .
docker run -p 8000:8000 -e AUDIT_SECRET_KEY=your-secret-key dynamic-prompt-budget-allocator
```

---

## 📁 Project Structure

```
dynamic-prompt-budget-allocator/
├── agents/                  # Core agent modules
│   ├── api.py              # FastAPI REST endpoints
│   ├── base.py             # Security, PHI guard, audit trail
│   ├── models.py           # Pydantic data models
│   ├── supervisor.py       # Main supervisor orchestrator
│   ├── workers.py          # Specialized evaluation workers
│   ├── llm_factory.py      # LLM provider factory
│   ├── metrics.py          # Prometheus metrics
│   ├── learning.py         # Bayesian calibration engine
│   └── streamer.py         # WebSocket telemetry
├── prompt_budgeter/        # Alternative implementation
├── tests/                  # Test suite
├── web/                    # Web console (HTML)
├── cli.py                  # Main CLI entry point
├── enrichment.py           # Budget enrichment features
├── simulator.py            # High-throughput simulator
├── pyproject.toml          # Project configuration
├── Dockerfile              # Container build
└── docker-compose.yml      # Container orchestration
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
