import piexif
import piexif.helper
from datetime import datetime
import os
import logging
from typing import Dict, Optional
import io
from PIL import Image

logger = logging.getLogger(__name__)

class MetadataEngine:
    """
    Service for injecting IPTC/EXIF metadata into image files.
    This creates a persistent 'Digital ID' inside the file itself.
    """
    
    def __init__(self):
        self.default_copyright = "Protected by Cvber. All rights reserved."
        self.default_terms = "This work is protected by the Cvber Registry. Utilization without permission is prohibited."

    def inject_metadata_in_memory(self, file_buffer: bytes, file_name: str, creator_info: Optional[Dict[str, str]] = None) -> bytes:
        """
        Injects metadata into the file buffer in memory.
        
        Args:
            file_buffer: Raw file bytes
            file_name: Name of the file (used for extension check)
            creator_info: Dict containing 'name', 'email', 'website', 'copyright_notice'
            
        Returns:
            Modified file bytes (or original if failed/unsupported)
        """
        try:
            # Check format
            ext = os.path.splitext(file_name)[1].lower()
            if ext not in ['.jpg', '.jpeg', '.tiff', '.webp']:
                logger.warning(f"Metadata injection skipped for unsupported format: {ext}")
                return file_buffer

            # Open image with Pillow
            img = Image.open(io.BytesIO(file_buffer))
            
            # Prepare User Data
            creator_name = creator_info.get('name', 'Cvber User') if creator_info else 'Cvber User'
            copyright_notice = creator_info.get('copyright_notice', self.default_copyright) if creator_info else self.default_copyright
            
            # 1. Load existing EXIF or create new
            if 'exif' in img.info:
                try:
                    exif_dict = piexif.load(img.info['exif'])
                except Exception:
                    exif_dict = {"0th": {}, "Exif": {}, "GPS": {}, "1st": {}, "thumbnail": None}
            else:
                exif_dict = {"0th": {}, "Exif": {}, "GPS": {}, "1st": {}, "thumbnail": None}

            # 2. Set '0th' IFD Data (Image Description, Artist, Copyright)
            exif_dict["0th"][piexif.ImageIFD.ImageDescription] = "Protected by Cvber. Verification: https://cvber.free/verify".encode('utf-8')
            exif_dict["0th"][piexif.ImageIFD.Artist] = creator_name.encode('utf-8')
            exif_dict["0th"][piexif.ImageIFD.Copyright] = copyright_notice.encode('utf-8')
            exif_dict["0th"][piexif.ImageIFD.Software] = "Cvber Security Engine".encode('utf-8')
            exif_dict["0th"][piexif.ImageIFD.DateTime] = datetime.now().strftime("%Y:%m:%d %H:%M:%S").encode('utf-8')

            # 3. Set 'Exif' IFD Data (UserComment)
            user_comment = piexif.helper.UserComment.dump(
                self.default_terms,
                encoding="unicode"
            )
            exif_dict["Exif"][piexif.ExifIFD.UserComment] = user_comment

            # 4. Dump EXIF bytes
            exif_bytes = piexif.dump(exif_dict)

            # 5. Save back to bytes
            output_buffer = io.BytesIO()
            
            # Preserve original format
            save_format = img.format if img.format else 'JPEG'
            
            img.save(output_buffer, format=save_format, exif=exif_bytes, quality=95)
            
            logger.info(f"Metadata injected successfully for {file_name}")
            return output_buffer.getvalue()

        except Exception as e:
            logger.error(f"Failed to inject metadata for {file_name}: {e}")
            return file_buffer

    # Keep legacy method for reference/future use if needed
    def inject_metadata_file(self, file_path: str, creator_info: Optional[Dict[str, str]] = None) -> bool:
        """Injects metadata into a file on disk."""
        if not os.path.exists(file_path):
            return False
        with open(file_path, 'rb') as f:
            data = f.read()
        
        new_data = self.inject_metadata_in_memory(data, os.path.basename(file_path), creator_info)
        
        if new_data != data:
            with open(file_path, 'wb') as f:
                f.write(new_data)
            return True
        return False

metadata_engine = MetadataEngine()
