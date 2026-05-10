"""
SHA-256 Hash Check Feature Test
Tests the SHA-256 hash checking functionality (without database).
"""
import sys
sys.path.insert(0, '.')

from app.services.hash_check import hash_check_service

def test_hash_check_feature():
    """Test SHA-256 hash checking functionality"""
    print("=" * 60)
    print("SHA-256 HASH CHECK FEATURE TEST")
    print("=" * 60)

    # Test data
    test_content = b'Test artwork content for hash check'
    test_content_2 = b'Different artwork content for hash check'

    print("\n1. Testing Hash Calculation...")
    try:
        file_hash = hash_check_service.calculate_hash(test_content)
        print("   [OK] SUCCESS: Hash calculated")
        print(f"   Hash: {file_hash}")
    except Exception as e:
        print(f"   [FAIL] FAILED: {e}")
        return False

    print("\n2. Testing Hash Consistency...")
    try:
        hash1 = hash_check_service.calculate_hash(test_content)
        hash2 = hash_check_service.calculate_hash(test_content)
        hash3 = hash_check_service.calculate_hash(test_content_2)

        if hash1 == hash2:
            print("   [OK] SUCCESS: Same content produces same hash")
        else:
            print("   [FAIL] FAILED: Same content produced different hashes")
            return False

        if hash1 != hash3:
            print("   [OK] SUCCESS: Different content produces different hash")
        else:
            print("   [FAIL] FAILED: Different content produced same hash")
            return False
    except Exception as e:
        print(f"   [FAIL] FAILED: {e}")
        return False

    print("\n3. Testing Empty Content Validation...")
    try:
        try:
            hash_check_service.calculate_hash(b'')
            print("   [FAIL] FAILED: Should have raised ValueError")
            return False
        except ValueError:
            print("   [OK] SUCCESS: Empty content properly rejected")
    except Exception as e:
        print(f"   [FAIL] FAILED: {e}")
        return False

    print("\n4. Testing Hash Format...")
    try:
        hash_result = hash_check_service.calculate_hash(test_content)
        # SHA-256 should be 64 hex characters
        if len(hash_result) == 64 and all(c in '0123456789abcdef' for c in hash_result):
            print("   [OK] SUCCESS: Hash format is correct (64 hex chars)")
        else:
            print(f"   [FAIL] FAILED: Hash format incorrect (length: {len(hash_result)})")
            return False
    except Exception as e:
        print(f"   [FAIL] FAILED: {e}")
        return False

    print("\n" + "=" * 60)
    print("SHA-256 HASH CHECK FEATURE: ALL TESTS PASSED [OK]")
    print("=" * 60)
    return True

if __name__ == "__main__":
    result = test_hash_check_feature()
    sys.exit(0 if result else 1)
