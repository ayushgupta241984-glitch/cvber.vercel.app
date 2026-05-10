"""
Blockchain Timestamp Feature Test
Tests the blockchain timestamp functionality without requiring authentication.
"""
import asyncio
import sys
sys.path.insert(0, '.')

from app.services.blockchain import blockchain_service

async def test_blockchain_feature():
    """Test all blockchain timestamp functionality"""
    print("=" * 60)
    print("BLOCKCHAIN TIMESTAMP FEATURE TEST")
    print("=" * 60)

    # Test data
    test_content = b'Test artwork content for blockchain timestamp'
    test_name = 'test_artwork.png'
    test_user = 'test_user_123'

    print("\n1. Testing Timestamp Creation...")
    try:
        proof = await blockchain_service.create_timestamp(test_content, test_name, test_user)
        print("   [OK] SUCCESS: Timestamp created")
        print(f"   Proof ID: {proof.proof_id}")
        print(f"   Asset Hash: {proof.asset_hash}")
        print(f"   Status: {proof.status}")
        print(f"   Blockchain: {proof.blockchain}")
        print(f"   Verification URL: {proof.verification_url}")
    except Exception as e:
        print(f"   [FAIL] FAILED: {e}")
        return False

    print("\n2. Testing Hash Proof Creation...")
    try:
        hash_proof = blockchain_service.create_hash_proof(test_content, test_name)
        print("   [OK] SUCCESS: Hash proof created")
        print(f"   Hash: {hash_proof['hash']}")
        print(f"   Algorithm: {hash_proof['hash_algorithm']}")
        print(f"   Timestamp: {hash_proof['timestamp']}")
        print(f"   Blockchain: {hash_proof['anchoring']['blockchain']}")
    except Exception as e:
        print(f"   [FAIL] FAILED: {e}")
        return False

    print("\n3. Testing Timestamp Verification...")
    try:
        verification = await blockchain_service.verify_timestamp(proof.proof_id)
        print("   [OK] SUCCESS: Verification completed")
        print(f"   Valid: {verification['valid']}")
        print(f"   Proof ID: {verification['proof_id']}")
        print(f"   Status: {verification['status']}")
    except Exception as e:
        print(f"   [FAIL] FAILED: {e}")
        return False

    print("\n" + "=" * 60)
    print("BLOCKCHAIN TIMESTAMP FEATURE: ALL TESTS PASSED [OK]")
    print("=" * 60)
    return True

if __name__ == "__main__":
    result = asyncio.run(test_blockchain_feature())
    sys.exit(0 if result else 1)
