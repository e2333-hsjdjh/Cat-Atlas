import json
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.environ.get("CAT_SECRET_KEY", "development-only-change-me")
DEBUG = os.environ.get("CAT_DEBUG", "false").lower() == "true"
ALLOWED_HOSTS = [h for h in os.environ.get("CAT_ALLOWED_HOSTS", "127.0.0.1,localhost").split(",") if h]
CSRF_TRUSTED_ORIGINS = [o for o in os.environ.get("CAT_CSRF_TRUSTED_ORIGINS", "").split(",") if o]

INSTALLED_APPS = ["django.contrib.admin","django.contrib.auth","django.contrib.contenttypes","django.contrib.sessions","django.contrib.messages","django.contrib.staticfiles","registry"]
MIDDLEWARE = ["django.middleware.security.SecurityMiddleware","django.contrib.sessions.middleware.SessionMiddleware","django.middleware.common.CommonMiddleware","django.middleware.csrf.CsrfViewMiddleware","django.contrib.auth.middleware.AuthenticationMiddleware","django.contrib.messages.middleware.MessageMiddleware","django.middleware.clickjacking.XFrameOptionsMiddleware"]
ROOT_URLCONF = "cat_backend.urls"
TEMPLATES = [{"BACKEND":"django.template.backends.django.DjangoTemplates","DIRS":[BASE_DIR/"templates"],"APP_DIRS":True,"OPTIONS":{"context_processors":["django.template.context_processors.debug","django.template.context_processors.request","django.contrib.auth.context_processors.auth","django.contrib.messages.context_processors.messages"]}}]
WSGI_APPLICATION = "cat_backend.wsgi.application"
DATABASES = {"default":{"ENGINE":"django.db.backends.sqlite3","NAME":BASE_DIR/"data"/"cat.sqlite3","OPTIONS":{"timeout":20}}}
AUTH_PASSWORD_VALIDATORS = [{"NAME":"django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},{"NAME":"django.contrib.auth.password_validation.MinimumLengthValidator"}]
LANGUAGE_CODE = "zh-hans"
TIME_ZONE = "Asia/Shanghai"
USE_I18N = True
USE_TZ = True
FORCE_SCRIPT_NAME = "/cat"
STATIC_URL = "/cat/static/"
STATIC_ROOT = BASE_DIR/"staticfiles"
MEDIA_URL = "/cat/media/"
MEDIA_ROOT = BASE_DIR/"media"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024
DATA_UPLOAD_MAX_MEMORY_SIZE = 20 * 1024 * 1024
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG

if os.environ.get("CAT_COS_BUCKET") and os.environ.get("CAT_COS_SECRET_ID"):
    DEFAULT_FILE_STORAGE = "registry.storage.TencentCOSStorage"
    TENCENTCOS_STORAGE = {
        "BUCKET": os.environ["CAT_COS_BUCKET"],
        "PRIVATE_READ": True,
        "URL_EXPIRE": 3600,
        "CONFIG": {
            "Region": os.environ.get("CAT_COS_REGION", "ap-shanghai"),
            "SecretId": os.environ["CAT_COS_SECRET_ID"],
            "SecretKey": os.environ["CAT_COS_SECRET_KEY"],
            "Scheme": "https",
        },
    }
