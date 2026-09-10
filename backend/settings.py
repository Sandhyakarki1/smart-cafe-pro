import os
from pathlib import Path
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load variables from a local .env file (DB credentials, secret key, etc.)
load_dotenv(BASE_DIR / '.env')

# ==================================================
# BASIC SETTINGS
# ==================================================
SECRET_KEY = os.environ.get(
    'DJANGO_SECRET_KEY',
    'django-insecure-l6g6c(axm1g)m3gh0og2&$^szov!)b$w+4p35ajejmeqiksm19'
)
DEBUG = os.environ.get('DJANGO_DEBUG', 'True') == 'True'

# Local development only
ALLOWED_HOSTS = os.environ.get(
    'DJANGO_ALLOWED_HOSTS',
    'localhost,127.0.0.1,0.0.0.0'
).split(',')


# ==================================================
# INSTALLED APPS
# ==================================================
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third party tools
    'rest_framework',
    'corsheaders',

    #  SmartCafe App
    'admin_panel',
]

# ==================================================
# MIDDLEWARE 
# ==================================================
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', 
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware', 
    'django.contrib.messages.middleware.MessageMiddleware', 
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

# ==================================================
# TEMPLATES (Required for Django Admin to load)
# ==================================================
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.media', 
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# ==================================================
# DATABASE (PostgreSQL - local development)
# ==================================================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('PGDATABASE', os.environ.get('DB_NAME', 'smart_cafe')),
        'USER': os.environ.get('PGUSER', os.environ.get('DB_USER', 'postgres')),
        'PASSWORD': os.environ.get('PGPASSWORD', os.environ.get('DB_PASSWORD', '')),
        'HOST': os.environ.get('PGHOST', os.environ.get('DB_HOST', 'localhost')),
        'PORT': os.environ.get('PGPORT', os.environ.get('DB_PORT', '5432')),
    }
}

# ==================================================
# CORS & CSRF (local development only)
# ==================================================
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://192.168.1.65:5173",
]
CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://192.168.1.65:5173",
]

# Standard headers 
from corsheaders.defaults import default_headers
CORS_ALLOW_HEADERS = list(default_headers)

# ==================================================
# DRF SETTINGS
# ==================================================
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated', 
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

# ==================================================
# STATIC & MEDIA FILES (For Menu Images)
# ==================================================
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# ==================================================
# INTERNATIONALIZATION 
# ==================================================
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kathmandu'
USE_I18N = True
USE_TZ = True

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ==================================================
# EMAIL SETTINGS 
# ==================================================
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = f'SmartCafe <{EMAIL_HOST_USER}>'