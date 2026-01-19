import io
from PIL import Image
from app.services.metadata_engine import metadata_engine
import piexif

def test_injection():
    print("Testing Metadata Injection...")
    
    # 1. Create a dummy JPEG in memory
    img = Image.new('RGB', (100, 100), color = 'red')
    input_buffer = io.BytesIO()
    img.save(input_buffer, format='JPEG')
    input_bytes = input_buffer.getvalue()
    
    print(f"Created dummy image: {len(input_bytes)} bytes")
    
    # 2. Inject Metadata
    creator_info = {
        "name": "Test User",
        "copyright_notice": "© 2024 Test User. All rights reserved."
    }
    
    output_bytes = metadata_engine.inject_metadata_in_memory(
        file_buffer=input_bytes,
        file_name="test.jpg",
        creator_info=creator_info
    )
    
    print(f"Injected metadata. New size: {len(output_bytes)} bytes")
    
    # 3. Verify
    output_buffer = io.BytesIO(output_bytes)
    check_img = Image.open(output_buffer)
    
    if 'exif' in check_img.info:
        exif_dict = piexif.load(check_img.info['exif'])
        artist = exif_dict["0th"][piexif.ImageIFD.Artist].decode('utf-8')
        copyright_txt = exif_dict["0th"][piexif.ImageIFD.Copyright].decode('utf-8')
        software = exif_dict["0th"][piexif.ImageIFD.Software].decode('utf-8')
        
        print(f"\n[Verification Results]")
        print(f"Artist: {artist}")
        print(f"Copyright: {copyright_txt}")
        print(f"Software: {software}")
        
        if artist == "Test User" and "Cvber Security" in software:
            print("\nSUCCESS: Metadata injected correctly!")
        else:
            print("\nFAILURE: Metadata mismatch.")
    else:
        print("\nFAILURE: No EXIF data found.")

if __name__ == "__main__":
    try:
        test_injection()
    except Exception as e:
        print(f"Test failed with error: {e}")
