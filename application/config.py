
class Config():
    DEBUG = False
    SQLITE_DB_DIR = None
    SQLALCHEMY_DATABASE_URI = None
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    WTF_CSRF_ENABLED = False
    

    CELERY_BROKER_URL = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND = "redis://localhost:6379/2"

class LocalDevelopmentConfig(Config):
    DEBUG = True
    SECRET_KEY =  "ash ah secet"
    # Flask-Security configuration
    SECURITY_PASSWORD_HASH = "bcrypt"    
    SECURITY_PASSWORD_SALT = "really super secret" 
    SECURITY_REGISTERABLE = True
    SECURITY_CONFIRMABLE = False
    SECURITY_SEND_REGISTER_EMAIL = False
    SECURITY_UNAUTHORIZED_VIEW = None
    WTF_CSRF_ENABLED = False
    SECURITY_REDIRECT_BEHAVIOR = None
    SECURITY_LOGIN_USER_TEMPLATE = 'index.html'
    SECURITY_TOKEN_AUTHENTICATION_HEADER = "Authentication-Token"
    SECURITY_TOKEN_AUTHENTICATION_KEY = 'token'
    
    # Add more events to track as needed
    SECURITY_TRACKABLE = True  # Enable tracking of user activity
    SECURITY_LOGIN_TRACKING = 'all'  # Track all login events
    SECURITY_LOGOUT_TRACKING = 'all'  # Track all logout events


    
    CELERY_BROKER_URL = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND = "redis://localhost:6379/2"
