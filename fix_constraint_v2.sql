-- =====================================================
-- FIX: Run these statements ONE BY ONE in order
-- Supabase > SQL Editor > New Query
-- =====================================================

-- Step 1: Drop the old constraint first
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Step 2: Update ALL existing rows to valid new values
UPDATE orders SET status = 'placed'    WHERE status IN ('pending', 'confirmed');
UPDATE orders SET status = 'shipped'   WHERE status = 'shipping';
UPDATE orders SET status = 'delivered' WHERE status = 'complete';

-- Step 3: NOW add the new constraint (rows are clean)
ALTER TABLE orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('placed', 'shipped', 'delivered', 'cancelled'));

-- Step 4: Verify
SELECT status, COUNT(*) as count FROM orders GROUP BY status;
