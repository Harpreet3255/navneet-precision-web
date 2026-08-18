# ADR 0002: Multi-Agent Resilience & Database Idempotency Strategy

## Date
2026-08-18

## Status
**Accepted**

## Context & Problem Statement
The Navneet B2B platform's multi-agent workflow architecture (handling dispatch and invoicing) suffers from race conditions and occasional duplicate requests. When multiple agents or external services process high-volume, concurrent tasks, the system can theoretically deduct inventory multiple times or generate duplicate invoices. We need a secure, scalable mechanism to guarantee atomicity and idempotent API executions.

## Decision Drivers
* **Data Integrity:** Prevent overselling and duplicate financial records.
* **Compliance:** Ensure accurate audit trails for all operations.
* **Reliability:** Protect downstream services from cascading network failures.
* **Speed:** Maintain low latency during high-concurrency periods.

## Considered Options

### 1. Optimistic Locking with Application-Level Retry
* **Pros:** Fast reads, does not lock database rows, highly scalable.
* **Cons:** High probability of conflicts requiring complex application retry logic during high-volume periods; does not inherently protect against identical duplicate API requests without external state.

### 2. In-Memory Caching (Redis) for Idempotency
* **Pros:** Extremely fast check, offloads load from the primary relational database.
* **Cons:** Introduces a new infrastructure dependency (Redis). Potential split-brain or data-loss issues if the cache fails before a transaction successfully commits to the DB.

### 3. Pessimistic Locking (FOR UPDATE) with DB-Backed Idempotency Keys (Chosen Option)
* **Pros:** Bulletproof data integrity. By storing `idempotency_keys` in PostgreSQL alongside the invoices and locking inventory via `FOR UPDATE` in the same transaction, we guarantee absolute consistency. The transaction either entirely commits or rolls back perfectly.
* **Cons:** Locks rows during processing, slightly reducing concurrency for the *same* product items. 

## Decision Outcome
We decided to adopt **Option 3 (Pessimistic Locking + DB-backed Idempotency)** for the database layer, supplemented by a **Circuit Breaker & Redis Cache** in the API Middleware layer.

1. **API Layer (Shift-Left Protection):** Express middleware intercepts `Idempotency-Key` headers and checks a fast-access Redis cache. If a request is `IN_FLIGHT`, the API instantly rejects duplicates with `409 Conflict`, saving backend compute.
2. **Database Layer (Source of Truth):** When the request reaches the database RPC (`create_invoice_atomic`), PostgreSQL enforces a strict unique constraint on `idempotency_keys` and utilizes `FOR UPDATE` on inventory. 
3. **Resilience:** The API Executor utilizes Exponential Backoff with Full Jitter and a Circuit Breaker to ensure temporary outages do not snowball into complete system failure.

## Consequences

### Positive
* Complete elimination of double-billing and overselling race conditions.
* Drastic reduction in database load during traffic spikes due to the API middleware cache intercept.
* Bulletproof audit compliance.

### Negative
* Additional architectural complexity requiring strict management of `idempotency-key` lifecycle by frontend clients.
* `FOR UPDATE` row locks mean operations modifying the *same* inventory product concurrently will serialize, slightly impacting maximal throughput for a single high-demand SKU.
