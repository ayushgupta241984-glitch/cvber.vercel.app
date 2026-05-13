-- Remove UNIQUE constraint on asset_hash to allow re-timestamping the same file
ALTER TABLE blockchain_proofs DROP CONSTRAINT IF EXISTS blockchain_proofs_asset_hash_key;
