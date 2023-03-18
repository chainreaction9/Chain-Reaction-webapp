"""
This script defines several global variables that are used to properly configure the chain reaction webserver.
"""

import uuid

# email address for the webserver. This will be used to send email to users for account activation, password recovery, etc.
REMOTE_SERVER_EMAIL = ''
#server address for the mail. In case of gmail smtp server, e.g., smtp.gmail.com
REMOTE_SERVER_EMAIL_PROVIDER = ''
#port for accessing the mail server. In case of smtp server, it is typically 465.
REMOTE_SERVER_EMAIL_PORT = 465
#password to access mail service. In case of gmail smtp, an App password may need to be generated (see https://support.google.com/mail/answer/185833).
REMOTE_SERVER_EMAIL_PASSWORD = ''
#************* The following MACROS are used in email contents to inform online users about relevant pages.
#the address in which this webserver is running, e.g., http://localhost:5555
REMOTE_SERVER_ADDRESS = "http://localhost:5555"
#url to the activation page of an online user account.
REMOTE_SERVER_ACTIVATION_PAGE = f"{REMOTE_SERVER_ADDRESS}/chainreaction-online/activate"
#url to the password recovery page of an online user account.
REMOTE_SERVER_PASSWORD_RESET_PAGE = f"{REMOTE_SERVER_ADDRESS}/chainreaction-online/reset"
#url to the password reset page of an online user account.
REMOTE_SERVER_PASSWORD_RESET_BY_TOKEN_PAGE = f"{REMOTE_SERVER_ADDRESS}/chainreaction-online/reset-by-auth-key"
#**************************************************************************************************************

# the time (in seconds) duration a password reset link (sent via email) remains valid
PASSWORD_RESET_EXPIRY_SECONDS = 7200
# a random string for extra-security purpose while processing HTML post request in the webserver
APPLICATION_POST_PASSWORD = uuid.uuid4().hex

#********************************* Pusher Client Settings Setup ***************************************************
#********************************* Requires a pusher-client library of version higher than 8.0.0 on the client side ***************************
#********************************* This settings are used on the client side pusher app with which an online user communicates. ***************
#********************************* An online user can download these settings after signing in and by sending an HTML POST request to the endpoint '/pusher/application-settings'.
#********************************* Therefore be careful before putting sensitive information ***********************
PUSHER_SETTINGS = {}
PUSHER_SETTINGS['app_key'] = '' # your pusher application key.
PUSHER_SETTINGS['cluster'] = '' # the cluster your pusher application is based in.
PUSHER_SETTINGS['app_id'] = '' # your pusher application ID.
PUSHER_SETTINGS['ssl'] = True
PUSHER_SETTINGS['channelAuthorization'] = {
    'endpoint' : '/pusher/channel-auth', #routes to the pusher-channel authentication page
    'transport' : 'ajax',
    'params' : {'token' : ''},
    'headers' : {},
    'paramsProvider' : None,
    'headersProvider' : None,
    'customHandler' : None
    }
PUSHER_SETTINGS['userAuthentication'] = {
    'endpoint' : '/pusher/user-auth', #routes to the pusher-user authentication page
    'transport' : 'ajax',
    'params' : {'token' : ''},
    'headers' : {},
    'paramsProvider' : None,
    'headersProvider' : None,
    'customHandler' : None
  }
#*****************************************************************************************************************

#************************************* MySQL MACRO SETUP **************************************
REMOTE_DB_HOST='localhost'#server address that hosts the MySQL database
REMOTE_DB_USER='' #username to use for signing into the MySQL database
REMOTE_DB_NAME="" #name of the MySQL database
REMOTE_DB_PASSWORD='' #raw password to sign in to the MySQL server. Please be careful before publishing!
#name of the database table containing the session information of each user.
#  required column fields in the table:
#  `ID` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
#  `username` VARCHAR(50) NOT NULL UNIQUE
#  `hash` CHAR(60) NOT NULL UNIQUE
#  `activation_status` TINYINT(4) NOT NULL DEFAULT 1
#  `activation_hash` VARCHAR(100) NULL
#  `password_reset_hash` VARCHAR(100) NULL
#  `time_stamp` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
#  `email` VARCHAR(50) NOT NULL
REMOTE_DB_SESSION_TABLE="session_data_test"

#name of the database table containing user information like username, password hash, etc.
#  required column fields in the table:
#  `ID` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
#  `username` VARCHAR(50) NOT NULL UNIQUE
#  `activation_status` TINYINT(4) NOT NULL DEFAULT 1
#  `time_stamp` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
#  `game_state` JSON
#  `session_id` VARCHAR(100) NULL, INDEX (`session_id`)
REMOTE_DB_USER_TABLE="user_data_test"

#name of the database table containing channel information (like name of pusher channel, number of members, etc.) for each game instance.
#   required column fields in the table:
#   `ID` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
#   `channel_name` VARCHAR(50) NOT NULL
#   `room_name` VARCHAR(50) NOT NULL UNIQUE
#   `user_count` SMALLINT(5) NOT NULL DEFAULT 0
REMOTE_DB_CHANNEL_TABLE="game_data_test"

#*********************************** server-side (flask) session setup *******************************
SESSION_TIMEOUT_SECONDS=0
SESSION_TIMEOUT_MINUTES=0
SESSION_TIMEOUT_HOURS=3

#Credential verification MACROS
INVALID_CREDENTIALS = -1
DORMANT_ACCOUNT = 0
VALID_CREDENTIALS = 1
QUERY_ERROR = -2

