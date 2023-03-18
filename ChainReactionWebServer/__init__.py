"""
The flask webserver to simulate the Chain Reaction game (both local and online version).
"""
from base64 import b64encode
from datetime import timedelta
from flask_session import Session
from flask import Flask
from flask_mysqldb import MySQL, MySQLdb
from flask_mail import Mail
from flask_login import LoginManager
from flask_bcrypt import Bcrypt
import hashlib, uuid
import pusher

#************************* import the predefined MACROS before configuring flask application
from ChainReactionWebServer.ChainReactionConfig import *

#************************* configure flask app secret ******************
app = Flask(__name__)
app.secret_key = uuid.uuid4().hex
#******************************* SMTP Mail setup **********************
app.config.update(
    #server address for the mail
    MAIL_SERVER=REMOTE_SERVER_EMAIL_PROVIDER,
    MAIL_PORT=REMOTE_SERVER_EMAIL_PORT,
    MAIL_USE_SSL=True,
    MAIL_USERNAME = REMOTE_SERVER_EMAIL,
    #password to access smtp service. In case of gmail, an App password may need to be generated (see https://support.google.com/mail/answer/185833).
    MAIL_PASSWORD = REMOTE_SERVER_EMAIL_PASSWORD,
    MAIL_DEFAULT_SENDER = ('Chain Reaction Server', REMOTE_SERVER_EMAIL)
)
mail = Mail(app)

#************************************* Pusher Server Setup **************************************
#------------ master key for Pusher end-to-end encryption ---------
#generate a 32 bytes random secure token:
pusher_master_key = hashlib.sha256(uuid.uuid4().bytes).digest()
#encode the 32-bytes token in base64: 
pusher_master_key = b64encode(pusher_master_key)
#configure the pusher client
pusher_client = pusher.Pusher(
    app_id= '1478583', #pusher-application ID.
    key = PUSHER_SETTINGS['app_key'],
    #this is your pusher-application secret to which only the webserver has access. Don't reveal it to the online users on the client side.
    secret = '6b026bface4dd5bbaa24',
    ssl=True,
    cluster = PUSHER_SETTINGS['cluster'],
    encryption_master_key_base64 = pusher_master_key
)
#************************************* password-hashing setup using bcrypt **********************
app.config.update(
    BCRYPT_HANDLE_LONG_PASSWORDS = True
)
flask_bcrypt = Bcrypt(app)

#************************************* MySQL SETUP **************************************
app.config.update(
    MYSQL_HOST = REMOTE_DB_HOST,
    MYSQL_USER = REMOTE_DB_USER,
    MYSQL_PASSWORD = REMOTE_DB_PASSWORD, #be careful before publishing! raw password!
    MYSQL_DB = REMOTE_DB_NAME,
    MYSQL_CURSORCLASS = 'DictCursor'
)
# The main MySQL app instance
mysql = MySQL(app)
# Once the MySQL app and flask app is configured, create the database tables with name 
# {REMOTE_DB_SESSION_TABLE}, {REMOTE_DB_SESSION_TABLE}, {REMOTE_DB_SESSION_TABLE} defined in configuration script
# if they do not already exist:
with app.app_context():
    cursor = None
    try:
        cursor = mysql.connection.cursor()
        userTableCreationSql = f'''CREATE TABLE IF NOT EXISTS `{REMOTE_DB_USER_TABLE}` (`ID` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, `username` VARCHAR(50) NOT NULL UNIQUE, `hash` CHAR(60) NOT NULL UNIQUE, `activation_status` TINYINT(4) NOT NULL DEFAULT 1, `activation_hash` VARCHAR(100) NULL, `password_reset_hash` VARCHAR(100) NULL, `time_stamp` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP, `email` VARCHAR(50) NOT NULL);'''
        isDatabaseChanged = cursor.execute(userTableCreationSql)
        sessionTableCreationSql = f'''CREATE TABLE IF NOT EXISTS `{REMOTE_DB_SESSION_TABLE}` (`ID` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, `username` VARCHAR(50) NOT NULL UNIQUE, `activation_status` TINYINT(4) NOT NULL DEFAULT 1, `time_stamp` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP, `game_state` JSON, `session_id` VARCHAR(100) NULL, INDEX (`session_id`));'''
        isDatabaseChanged += cursor.execute(sessionTableCreationSql)
        channelTableCreationSql = f'''CREATE TABLE IF NOT EXISTS `{REMOTE_DB_CHANNEL_TABLE}` (`ID` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, `channel_name` VARCHAR(50) NOT NULL, `room_name` VARCHAR(50) NOT NULL UNIQUE, `user_count` SMALLINT(5) NOT NULL DEFAULT 0);'''
        isDatabaseChanged += cursor.execute(channelTableCreationSql)
        if isDatabaseChanged: mysql.connection.commit()
    except:
        raise MySQLdb.Error("Could not connect to MySQL database!")
    finally:
        if cursor: cursor.close()
#*********************************** Login manager setup *********************************************
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "/chainreaction-online/login" #a route where users will be redirected in case unauthenticated users try to access routes protected by @login_required directive. To avoid recursion, the route must not be under @login_required directive.
login_manager.login_message = "Please log in before proceeding." #a flask Flash message that will be displayed on the `login_view` route.
login_manager.login_message_category = "error" #class of the above flask Flash message.

#*********************************** server-side (flask) session setup *******************************
app.config.update(
    PERMANENT_SESSION_LIFETIME = timedelta(seconds=SESSION_TIMEOUT_SECONDS,minutes=SESSION_TIMEOUT_MINUTES,hours=SESSION_TIMEOUT_HOURS),
    SESSION_COOKIE_SAMESITE = 'None',
    SESSION_COOKIE_SECURE = True,
    SESSION_TYPE = 'filesystem',
    SESSION_FILE_THRESHOLD = 100 # maximum number of locally stored session files before the app starts deleting some, defaults to 500 if not set
)
Session(app)
#************************************************************************************************************************************

import ChainReactionWebServer.views # define routes and views
