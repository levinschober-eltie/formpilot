-- =====================================================
-- Migration 004: PIN Hashing
-- =====================================================
-- Migrates plaintext PIN to SHA-256 hashed PIN for secure verification.
-- Edge Function 'verify-pin' handles comparison server-side.

-- Step 0: Enable pgcrypto extension (required for digest())
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Step 1: Add new pin_hash column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pin_hash TEXT;

-- Step 2: Migrate existing plaintext PINs to SHA-256 hashes
-- SHA-256 of demo PINs:
-- '1234' -> '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'
-- '5678' -> '1b70304ec2e3b2dbbad1942178e11cddd6ded7c62f4b7ce14301c2c08adebcd0'
-- '9999' -> '8aa25ce9d60e4341f9b26277ce0640c69e58cd90a71fb85e1a0f483e0a2a11ae'
UPDATE profiles SET pin_hash = encode(digest(pin, 'sha256'), 'hex') WHERE pin IS NOT NULL;

-- Step 3: Drop old plaintext PIN column
ALTER TABLE profiles DROP COLUMN IF EXISTS pin;

-- Step 4: Add rate limiting columns for PIN attempts
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pin_attempts INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pin_locked_until TIMESTAMPTZ;

-- Step 5: Index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_pin_hash ON profiles (pin_hash) WHERE pin_hash IS NOT NULL;
