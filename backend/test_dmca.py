"""
DMCA Automation Feature Test
Tests the DMCA notice generation functionality.
"""
import sys
sys.path.insert(0, '.')

from app.services.enforcement import enforcement_engine, DMCARequest

def test_dmca_feature():
    """Test DMCA notice generation"""
    print("=" * 60)
    print("DMCA AUTOMATION FEATURE TEST")
    print("=" * 60)

    # Test data
    request = DMCARequest(
        asset_name='test_artwork.png',
        asset_hash='3b75469f2677f8a81cd3cd0e780e2d5684e72e6479bbb9c8a9bb3b44b0728c47',
        originality_score=95.5,
        forensic_summary='Original artwork verified through CVBER analysis',
        infringement_url='https://example.com/stolen-art.jpg',
        platform='youtube',
        owner_name='Test Artist',
        owner_email='test@example.com',
        owner_address='123 Art Street, Creative City'
    )

    print("\n1. Testing DMCA Notice Generation...")
    try:
        notice = enforcement_engine.generate_notice(request)
        print("   [OK] SUCCESS: DMCA notice generated")
        print(f"   Notice ID: {notice.notice_id}")
        print(f"   Platform: {notice.platform}")
        print(f"   Status: {notice.status}")
        print(f"   Subject: {notice.subject_line}")
        print(f"   Created at: {notice.created_at}")
    except Exception as e:
        print(f"   [FAIL] FAILED: {e}")
        return False

    print("\n2. Testing Platform Contacts...")
    try:
        platforms = list(enforcement_engine.PLATFORM_CONTACTS.keys())
        print(f"   [OK] SUCCESS: {len(platforms)} platforms supported")
        for platform in platforms:
            info = enforcement_engine.PLATFORM_CONTACTS[platform]
            print(f"   - {platform}: {info['name']}")
    except Exception as e:
        print(f"   [FAIL] FAILED: {e}")
        return False

    print("\n3. Testing Submission Instructions...")
    try:
        instructions = enforcement_engine.get_submission_instructions('youtube')
        print("   [OK] SUCCESS: Instructions retrieved")
        print(f"   Method: {instructions['method']}")
        print(f"   URL: {instructions['url']}")
        print(f"   Notes: {instructions['notes']}")
    except Exception as e:
        print(f"   [FAIL] FAILED: {e}")
        return False

    print("\n" + "=" * 60)
    print("DMCA AUTOMATION FEATURE: ALL TESTS PASSED [OK]")
    print("=" * 60)
    return True

if __name__ == "__main__":
    result = test_dmca_feature()
    sys.exit(0 if result else 1)
