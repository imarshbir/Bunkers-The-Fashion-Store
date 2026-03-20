-- =====================================================
-- FIX: Update orders table status constraint
-- Run this in Supabase > SQL Editor
-- =====================================================

-- Step 1: Drop the old CHECK constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Step 2: Add the new constraint that allows 'placed'
ALTER TABLE orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('placed', 'shipped', 'delivered', 'cancelled'));

-- Step 3: Update any old 'pending' or 'confirmed' orders to 'placed'
UPDATE orders SET status = 'placed' WHERE status IN ('pending', 'confirmed');

-- Verify it worked
SELECT id, status, customer_name FROM orders ORDER BY created_at DESC LIMIT 10;
