-- Disable transaction wrapping for CONCURRENTLY index creation
-- Note: In Postgres, CREATE INDEX CONCURRENTLY cannot run inside a transaction block.

-- Set sensible timeouts for migration execution
SET statement_timeout = '60s';

-- 1. Idempotency Key Table
CREATE TABLE IF NOT EXISTS idempotency_keys (
    idempotency_key VARCHAR(255) PRIMARY KEY,
    agent_id VARCHAR(255),
    action VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);

-- 2. Audit Trail Table
CREATE TABLE IF NOT EXISTS audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_name VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    changes JSONB,
    performed_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: In Supabase/PostgreSQL, adding indexes concurrently avoids locking out 
-- reads/writes on production tables during the index build.

-- 3. Composite B-Tree Index for Filtering
-- Optimal for queries like: WHERE client_id = ? AND status = ? ORDER BY created_at DESC
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_client_status_created_at
ON invoices (client_id, status, created_at DESC);

-- 4. Partial Index for Active Workflows
-- Significantly reduces index size and speeds up lookups for active queues
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_pending_workflows
ON invoices (status, created_at DESC)
WHERE status IN ('draft', 'pending', 'processing');

-- 5. Covering Index for Main Dashboard
-- Enables Index-Only Scans by including columns retrieved frequently, skipping heap fetches.
-- Note: Assuming currency is derived or omitted, added total_amount and status based on schema.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_dashboard_covering
ON invoices (client_id, created_at DESC)
INCLUDE (total_amount, status);

-- 6. Keyset Pagination Index
-- Supports fast pagination: WHERE (created_at, id) < (?_created_at, ?_id) ORDER BY created_at DESC, id DESC
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_keyset_pagination
ON invoices (created_at DESC, id DESC);
