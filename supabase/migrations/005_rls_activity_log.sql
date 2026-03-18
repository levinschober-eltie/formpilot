-- =====================================================
-- Migration 005: Fix Activity Log RLS
-- =====================================================
-- Ensures activity log entries can only be created by authenticated users
-- and the user_id field matches the authenticated user.

-- Drop existing permissive INSERT policy
DROP POLICY IF EXISTS "activity_log_insert_own_org" ON activity_log;

-- Create strict INSERT policy: user_id must match auth.uid()
CREATE POLICY "activity_log_insert_own_org" ON activity_log
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    AND user_id = auth.uid()
  );
