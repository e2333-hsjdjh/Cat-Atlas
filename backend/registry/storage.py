from datetime import datetime, timezone
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import Storage
from django.utils.deconstruct import deconstructible
from django.utils.text import get_valid_filename
from qcloud_cos import CosConfig, CosS3Client
from qcloud_cos.cos_exception import CosServiceError

@deconstructible
class TencentCOSStorage(Storage):
    """Small Django storage adapter scoped to this project's `cat/` keys."""
    def __init__(self):
        options=settings.TENCENTCOS_STORAGE
        config=options["CONFIG"]
        self.bucket=options["BUCKET"]
        self.expire=options.get("URL_EXPIRE",3600)
        self.client=CosS3Client(CosConfig(Region=config["Region"],SecretId=config["SecretId"],SecretKey=config["SecretKey"],Scheme=config.get("Scheme","https")))

    def _save(self,name,content):
        name=self.get_available_name(name).lstrip("/")
        content.open("rb")
        body=content.read()
        self.client.put_object(Bucket=self.bucket,Key=name,Body=body,ContentType=getattr(content,"content_type",None) or "application/octet-stream")
        return name

    def _open(self,name,mode="rb"):
        response=self.client.get_object(Bucket=self.bucket,Key=name.lstrip("/"))
        return ContentFile(response["Body"].get_raw_stream().read(),name=name)

    def exists(self,name):
        try:self.client.head_object(Bucket=self.bucket,Key=name.lstrip("/")); return True
        except CosServiceError as exc:
            if exc.get_status_code()==404:return False
            raise

    def delete(self,name):
        if name:self.client.delete_object(Bucket=self.bucket,Key=name.lstrip("/"))

    def size(self,name):
        return int(self.client.head_object(Bucket=self.bucket,Key=name.lstrip("/"))["Content-Length"])

    def url(self,name):
        return self.client.get_presigned_url(Method="GET",Bucket=self.bucket,Key=name.lstrip("/"),Expired=self.expire)

    def get_modified_time(self,name):
        value=self.client.head_object(Bucket=self.bucket,Key=name.lstrip("/"))["Last-Modified"]
        return datetime.strptime(value,"%a, %d %b %Y %H:%M:%S %Z").replace(tzinfo=timezone.utc)
