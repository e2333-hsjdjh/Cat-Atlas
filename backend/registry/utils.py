from io import BytesIO
from pathlib import Path
from django.core.files.base import ContentFile
from PIL import Image, ImageOps

def sanitize_upload(upload):
    if not upload: return None
    if upload.size > 15*1024*1024: raise ValueError("图片不能超过 15MB")
    image=ImageOps.exif_transpose(Image.open(upload)).convert("RGB")
    image.thumbnail((1920,1920),Image.Resampling.LANCZOS)
    out=BytesIO(); image.save(out,"WEBP",quality=86,optimize=True)
    return ContentFile(out.getvalue(),name=f"{Path(upload.name).stem}.webp")
