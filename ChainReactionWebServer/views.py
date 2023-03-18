"""
Routes and views for the flask application.
"""
import time, string
import random
from base64 import urlsafe_b64encode, urlsafe_b64decode
from datetime import datetime, timedelta
from http.client import BAD_GATEWAY, BAD_REQUEST, FORBIDDEN, INTERNAL_SERVER_ERROR, UNAUTHORIZED
import uuid, json, flask_login
from flask_mail import Message
from flask_login import login_required, UserMixin
from validate_email import validate_email
from flask import render_template_string, request, render_template, session, redirect, Markup, jsonify, url_for, send_from_directory, abort, flash
from functools import wraps

from ChainReactionWebServer.ChainReactionConfig import *
from ChainReactionWebServer.GameUtilities import GameState
from ChainReactionWebServer import app #main flask app instance
from ChainReactionWebServer import pusher_client #pusher client
from ChainReactionWebServer import mysql #Mysql client
from ChainReactionWebServer import mail #mail instance to send email to online users
from ChainReactionWebServer import flask_bcrypt #password hashing client
from ChainReactionWebServer import login_manager #to manage login

########################################################################################
#--------------------------------Global definitions-------------------------------------

class User(UserMixin):
    def __init__(self, userID : "str | None"  = None, username: "str | None"  = None ):
        self.id = userID #unique id to identify the user. UserMixin method `get_id` fetches it.
        self.username = username
        self.authenticated = False
        self.active = False
        self.game_state = None

@login_manager.user_loader
def user_loader(sessionID):
    try: cursor = mysql.connection.cursor()
    except: return
    sql = f'''SELECT `username`, `activation_status`, `game_state` FROM `{REMOTE_DB_SESSION_TABLE}` WHERE `session_id` = %s'''
    sessionCount = cursor.execute(sql,(sessionID,))
    userInstance = None
    if sessionCount > 0:
        sessionData=cursor.fetchone()
        userInstance = User()
        userInstance.id = sessionID
        userInstance.username = sessionData['username']
        userInstance.active = True if sessionData['activation_status'] == 1 else False
        gameStateJsonData = json.loads(sessionData['game_state'])
        userGameState = GameState()
        userGameState.updateFromJson(gameStateJsonData)
        userInstance.game_state = userGameState
    cursor.close()
    return userInstance

#Uncomment this for defining custom unauthorization handler.
#@login_manager.unauthorized_handler
#def unauthorized_handler():
#    abort(UNAUTHORIZED)

def generateSecureKey(username: str, salt: str, passwordForEncryption: str):
    passwordResetHash = flask_bcrypt.generate_password_hash(salt)
    if type(passwordResetHash) == str: passwordResetHash = passwordResetHash.encode('UTF-8')
    passwordResetHash = urlsafe_b64encode(passwordResetHash).decode('UTF-8')
    publicKey = passwordResetHash[-30:] #last 30 characters of the base64 hash. It is sent to the client
    privateKey = passwordResetHash[:-30] #everything except the last 30 characters of the base64 hash. It is stored in the database 
    encryptedUsername = urlsafe_b64encode(username.encode('UTF-8')).decode('UTF-8')
    output={'publicKey': publicKey, 'privateKey': privateKey, 'userKey': encryptedUsername}
    return output

def hashCompare(hashA: str,hashB: str)->bool:
    if type(hashA) != type(hashB): return False
    if (len(hashA)!=len(hashB)): return False
    if type(hashA) == str:
        state=0
        for i in range(len(hashA)):
            state |= ord(hashA[i])^ord(hashB[i]) #bitwise equality check
        return state==0
    elif type(hashA) == bytes:
        state = 0
        for i in range(len(hashA)):
            state |= hashA[i]^hashB[i] #bitwise equality check
        return state==0
    else: return None

def verifyCredentials(username: str, password: str, cursor: any = None, closeSqlCursor: bool = True) -> int :
    """
    * Verifies credentials from database.
    * Returns VALID_CREDENTIALS if credentials match and user account is activated.
    * Returns DORMANT_ACCOUNT if credentials match, but user account is not activated.
    * Returns INVALID_CREDENTIALS if credentials do not match.
    * Returns QUERY_ERROR if sql query failed
    """
    print(REMOTE_SERVER_ADDRESS)
    output = QUERY_ERROR
    falsePassword = flask_bcrypt.generate_password_hash("testing") #to prevent timing-attack
    cursorCreated = False
    if not cursor:
        try:
            cursor = mysql.connection.cursor()
            cursorCreated = True
        except: return output
    if type(password) == str: password = password.encode('UTF-8')
    sql = f'''SELECT `hash`, `activation_status`, `password_reset_hash` FROM `{REMOTE_DB_USER_TABLE}` WHERE `username` = %s'''
    userCount = cursor.execute(sql, (username,))
    output = INVALID_CREDENTIALS
    if (userCount == 1):
        userData = cursor.fetchone()
        passwordHash = userData['hash'].encode('UTF-8');
        passwordMatched = flask_bcrypt.check_password_hash(passwordHash, password)
        if passwordMatched:
            passwordResetHash = userData['password_reset_hash']
            if passwordResetHash and len(passwordResetHash) > 0:
                sql = f'''UPDATE `{REMOTE_DB_USER_TABLE}` SET `password_reset_hash` = %s WHERE `username` = %s'''
                dataChanged = cursor.execute(sql, ('', username))
                if dataChanged: mysql.connection.commit()
            if userData['activation_status'] == 1: output = VALID_CREDENTIALS
            else: output = DORMANT_ACCOUNT
    else:
        if userCount > 1: output = _QUERY_ERROR
        flask_bcrypt.check_password_hash(falsePassword, "preventTimingAttack!")
    if cursorCreated or closeSqlCursor: cursor.close()
    return output

def update_session(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        currentUser = flask_login.current_user.__deepcopy__()
        if currentUser.is_authenticated:
            sessionID = uuid.uuid4().hex #generate a unique and random session ID
            flask_login.logout_user()
            loginUser(sessionID, currentUser.username, currentUser.active)
        return f(*args, **kwargs)
    return wrapper
##################################################################################################
##################################################################################################
##-------------------------------------website routes---------------------------------------------

#*****************************************************************************************************
#******************************************** User authentication and registration related routes ***********************
#******************************************************************************************************

#Uncomment the following to bump the expiry time of session with each request
@app.before_request
def func():
    session.modified = True

@app.route('/')
def showWelcome():
    return render_template("welcome-page.html")

@app.route('/chainreaction-online/login', methods=['GET'])
def login():
    if flask_login.current_user.is_authenticated:
        next_page = request.args.get('next')
        if next_page: return redirect(next_page)
        else: return redirect("/chainreaction-online")
    else:
        _user = request.args.get('username')
        if not _user: _user = ''
        return render_template('login-page.html', username = _user)

@app.route('/chainreaction-online/verify-credentials', methods=['POST'])
def authenticate():
    if flask_login.current_user.is_authenticated: return redirect('/chainreaction-online')
    username = request.form.get('username');
    password = request.form.get('password');
    redirect_URL = request.referrer
    if not (username and password):
        flash("Invaid credentials.", "error")
        return redirect(redirect_URL)
    cursor = None
    try:
        cursor = mysql.connection.cursor()
        credentialQueryResult = verifyCredentials(username, password, cursor, False)
        if (credentialQueryResult == VALID_CREDENTIALS or credentialQueryResult == DORMANT_ACCOUNT):
            sessionID = uuid.uuid4().hex #generate a unique and random session ID
            isUserActive = True if credentialQueryResult == VALID_CREDENTIALS else False
            isUserLoggedIn = loginUser(sessionID, username, isUserActive, cursor, False)
            if not isUserLoggedIn: flash("Database query failed.", "error")
        elif credentialQueryResult == INVALID_CREDENTIALS:
            flash("Invalid credentials.", "error")
        else:
            flash("Server is down at the moment.", "message")
    except mysql.connection.Error: flash("Database query failed.", "error")
    finally:
        if cursor: cursor.close()
        return redirect(redirect_URL)

@app.route('/forbidden-page')
def forbiddenRequest():
    if flask_login.current_user.is_authenticated: return redirect('/chainreaction-online/login')
    else: abort(FORBIDDEN)

@app.route('/chainreaction-online/logout', methods=['GET', 'POST'])
def logout():
    authToken = None
    requestMethod = request.method
    if requestMethod == 'GET': authToken = request.args.get('token')
    else: authToken = request.form.get('token')
    pageUserId = None
    try: pageUserId = urlsafe_b64decode(authToken.encode('UTF-8')).decode('UTF-8')
    except:
        if requestMethod == 'GET': return redirect(url_for('login'))
        else: abort(UNAUTHORIZED)
    currentUser = flask_login.current_user
    sessionID = currentUser.get_id()
    if pageUserId != sessionID: abort(BAD_GATEWAY)
    if sessionID:
        currentGameState = currentUser.game_state
        logoutUser(sessionID, currentGameState)
    if requestMethod == 'GET': return redirect(url_for('login'))
    else: return jsonify(success = True), 200;

@app.route('/chainreaction-online/register', methods=['GET', 'POST'])
def showRegistration():
    if request.method == 'GET':
        return render_template('registration-page.html')
    else:
        output = {'success': False, 'reason': 'received insufficient data'}
        _username = request.form.get("_user")
        _password = request.form.get("_pass")
        _email = request.form.get("_email")
        if not (_username and _password and _email): return jsonify(output)
        isDataValid = False
        if 5 <= len(_username) <= 15 and 5 <= len(_password): isDataValid = True
        if not isDataValid:
            output['reason'] = 'received invalid data'
            return jsonify(output)
        isEmailValid = validate_email(_email, check_smtp = False)
        if not isEmailValid:
            output['reason'] = 'invalid email'
            return jsonify(output)
        cursor = None
        output = {'success': False, 'reason': 'database query failed'}
        try:
            cursor = mysql.connection.cursor()
            parameterList = { 'username': _username, 'password': _password, 'email': _email}
            sql = f'''SELECT `ID` FROM `{REMOTE_DB_USER_TABLE}` WHERE `username`=%s'''
            userCount = cursor.execute(sql, (parameterList['username'],))
            if userCount > 0: output['reason'] = 'user exists'
            else:
                registrationSuccess = registerUser(**parameterList, cursor = cursor, closeSqlCursor = False)
                if not registrationSuccess:
                    removeUser(parameterList['username'])
                    output['reason'] = "server database is not reachable"
                else:
                    sessionID = uuid.uuid4().hex #generate a unique and random session ID for the fresh user!
                    loginUser(sessionID, _username, False, cursor, False)
                    session['isActivationKeySent'] = True
                    output['success'] = True
                    output['reason'] = ''
        except mysql.connection.Error:
            output['reason'] = 'server database is not reachable'
        finally:
            if cursor: cursor.close()
            return jsonify(output)

@app.route('/chainreaction-online/activate', methods=['GET', 'POST'])
def showActivation():
    if request.method == 'GET':
        _user = request.args.get('username')
        parameterList = {}
        parameterList['page_title'] = 'Chain Reaction Account Activation'
        parameterList['form_header'] = Markup('Activate your account and start playing <a style="color: darkred;" href="/chainreaction-online/login">Chain Reaction</a>!')
        parameterList['form_action'] = '/chainreaction-online/activate'
        parameterList['token_placeholder'] = 'Activation key'
        parameterList['script_name'] = 'activation'
        parameterList['username'] = _user if _user != None else ''
        output = render_template('custom-token-page.html', **parameterList)
        encryptedUsername = request.args.get('q')
        _activationKey = request.args.get('_token')
        if (encryptedUsername and _activationKey):
            try:
                _username = urlsafe_b64decode(encryptedUsername.encode('UTF-8'))
                if len(_username) > 0:
                    activationSuccess = activateAccount(_username, _activationKey)
                    if (activationSuccess['success'] == True):
                        if flask_login.current_user.is_authenticated: output = redirect('/chainreaction-online')
                        else:
                            flash("Your account was successfully activated. Login and start playing with other players!", "info")
                            output = redirect(f'/chainreaction-online/login?username={_username}')
                    else:
                        reason = activationSuccess['reason']
                        if reason != 'invalid request':
                            if flask_login.current_user.is_authenticated: output = redirect('/chainreaction-online')
                            else:
                                flash(f"Activation failed for the following reason: {reason}")
                                output = redirect(f'/chainreaction-online/login?username={_username}')
            except: output = render_template('custom-token-page.html', **parameterList)
        return output
    else:
        output = {'success': False, 'reason': 'received insufficient data'}
        _username = request.form.get("_user")
        _activationKey = request.form.get("_activation_key")
        if not (_username and _activationKey): return jsonify(output)
        output = activateAccount(_username, _activationKey)
        return jsonify(output)

@app.route('/chainreaction-online/regenerate-activation-key', methods=['POST'])
@login_required
def regenerateActivationKey():
    output = {'success': False, 'reason': 'invalid request'}
    if flask_login.current_user.active: return jsonify(output)
    token = request.form.get('token')
    decryptedToken = ''
    try:
        decryptedToken = urlsafe_b64decode(token.encode('UTF-8')).decode('UTF-8')
    except: decryptedToken = ''
    if decryptedToken != flask_login.current_user.get_id():
        output['reason'] = 'invalid session'
        return jsonify(output)
    _user = flask_login.current_user.username
    _email = session.get('email')
    _isActivationKeySent = session.get('isActivationKeySent')
    if not (_user and _email): abort(INTERNAL_SERVER_ERROR)
    if _isActivationKeySent:
        output['reason'] = 'already sent'
        return jsonify(output)
    cursor = None
    try:
        cursor = mysql.connection.cursor()
        sql = f'''SELECT `hash`, `activation_status` FROM `{REMOTE_DB_USER_TABLE}` WHERE `username`=%s'''
        sqlRowCount = cursor.execute(sql, (_user,))
        if sqlRowCount:
            sqlRowData = cursor.fetchone()
            activationStatus = sqlRowData['activation_status']
            if not activationStatus:
                salt = sqlRowData['hash'][-20:]
                activationData = generateSecureKey(_user, salt, APPLICATION_POST_PASSWORD)
                privateActivationHash = activationData['privateKey'] #Everything except the last 30 characters of the base64 hash
                publicActivationHash = activationData['publicKey'] #The last 30 characters of the base64 hash
                userKey = activationData['userKey']
                activationLink = f"{REMOTE_SERVER_ACTIVATION_PAGE}?q={userKey}&_token={publicActivationHash}"
                sql = f'''UPDATE `{REMOTE_DB_USER_TABLE}` SET `activation_hash`=%s WHERE `username`=%s'''
                activationKeyUpdated = cursor.execute(sql, (privateActivationHash, _user))
                if activationKeyUpdated:
                    mysql.connection.commit()
                    sendWelcomeEmail(_email, _user, publicActivationHash, activationLink, f"{REMOTE_SERVER_ACTIVATION_PAGE}?username={_user}")
                    output['success'] = True
                    session['isActivationKeySent'] = True
                    output['reason'] = ''
    except mysql.connection.Error: output['reason'] = 'database query failed'
    finally:
        if cursor: cursor.close()
        return jsonify(output)

@app.route('/chainreaction-online/reset', methods=['GET', 'POST'])
def processPasswordResetRequest():
    if request.method == 'GET':
        output = render_template("recovery-page.html")
        encryptedUsername = request.args.get('q')
        _token = request.args.get('_token')
        if (encryptedUsername and _token):
            encryptedUsername = encryptedUsername.encode('UTF-8')
            try:
                username = urlsafe_b64decode(encryptedUsername).decode('UTF-8')
            except: return output
            if len(username) > 0:
                cursor = None
                try:
                    cursor = mysql.connection.cursor()
                    sql = f'''SELECT `hash`, `password_reset_hash`, `time_stamp` FROM `{REMOTE_DB_USER_TABLE}` WHERE `username`=%s'''
                    userCount = cursor.execute(sql, (username,))
                    if userCount == 1:
                        sqlRowData = cursor.fetchone()
                        passwordResetHash = sqlRowData['password_reset_hash']
                        timeDelta = datetime.now() - sqlRowData['time_stamp']
                        if timeDelta.total_seconds() <= PASSWORD_RESET_EXPIRY_SECONDS and passwordResetHash != None and len(passwordResetHash) != 0:
                            try:
                                passwordResetHash = passwordResetHash + _token
                                passwordResetHash = passwordResetHash.encode('UTF-8')
                                passwordResetHash = urlsafe_b64decode(passwordResetHash)
                                salt = sqlRowData['hash'][-20:]
                                isResetRequestValid = flask_bcrypt.check_password_hash(passwordResetHash, salt)
                                if isResetRequestValid:
                                    encryptedUsername = encryptedUsername.decode('UTF-8')
                                    session['encrypted_q'] = encryptedUsername
                                    session['decrypted_q'] = username
                                    session['_token'] = _token
                                    output = render_template("password-reset.html", form_header = f"Hi {username}! Please choose a new password for your account.", q = encryptedUsername, token = _token)
                            except: pass
                        else:
                            sql = f'''UPDATE `{REMOTE_DB_SESSION_TABLE}` SET `password_reset_hash`=%s WHERE `username`=%s'''
                            isPasswordResetHashRemoved = cursor.execute(sql, ('', username))
                            if isPasswordResetHashRemoved: mysql.connection.commit()
                except mysql.connection.Error: pass
                finally:
                    if cursor: cursor.close()
        return output
    else:
        output = {'success': False, 'reason': 'received insufficient data'}
        _user = request.form.get('_user')
        _email = request.form.get('_email')
        if not (_user and _email): return jsonify(output)
        isEmailValid = validate_email(_email, check_smtp = False)
        if not isEmailValid or len(_user) < 5 or len(_user) > 15:
            output['reason'] = 'received invalid data'
            return jsonify(output)
        output['reason'] = 'invalid request'
        cursor = None
        try:
            cursor = mysql.connection.cursor()
            sql = f'''SELECT `hash`, `password_reset_hash`, `activation_status`, `time_stamp` FROM `{REMOTE_DB_USER_TABLE}` WHERE `username`=%s AND `email`=%s'''
            sqlUserCount = cursor.execute(sql, (_user, _email))
            if sqlUserCount==1:
                sqlRowData = cursor.fetchone()
                activationStatus = sqlRowData['activation_status']
                if activationStatus == 1:
                    passwordResetHash = sqlRowData['password_reset_hash']
                    oldTimeStamp = sqlRowData['time_stamp']
                    currentTime = datetime.now()
                    totalSecondsSinceLastUpdate = (currentTime - oldTimeStamp).total_seconds()
                    if passwordResetHash == None or len(passwordResetHash) == 0 or totalSecondsSinceLastUpdate > PASSWORD_RESET_EXPIRY_SECONDS:
                        output['reason'] = 'database query failed'
                        salt = sqlRowData['hash'][-20:]
                        passwordResetData = generateSecureKey(_user, salt, APPLICATION_POST_PASSWORD)
                        privateKey = passwordResetData['privateKey']
                        publicKey = passwordResetData['publicKey']
                        userKey = passwordResetData['userKey']
                        passwordResetLink = f"{REMOTE_SERVER_PASSWORD_RESET_PAGE}?q={userKey}&_token={publicKey}"
                       
                        sql = f'''UPDATE `{REMOTE_DB_USER_TABLE}` SET `password_reset_hash`=%s, `time_stamp`=%s WHERE `username`=%s'''
                        isPasswordResetHashUpdated = cursor.execute(sql, (privateKey, currentTime, _user))
                        if isPasswordResetHashUpdated == 1:
                            mysql.connection.commit()
                            sendPasswordResetEmail(_email, _user, publicKey, passwordResetLink, f"{REMOTE_SERVER_PASSWORD_RESET_BY_TOKEN_PAGE}?username={_user}")
                            output['success'] = True
                            output['reason'] = ''
                    else:
                        output['reason'] = 'an email is already sent to help you with the password recovery'
                else: output['reason'] = 'permission denied because this account is not yet activated'
        except mysql.connection.Error:
            output['reason'] = 'database query failed'
        finally:
            if cursor: cursor.close()
            return jsonify(output)

@app.route('/chainreaction-online/reset-by-auth-key', methods=['GET', 'POST'])
def processPasswordResetByAuthKeyRequest():
    if request.method == 'GET':
        _user = request.args.get('username')
        parameterList = {}
        parameterList['page_title'] = 'Chain Reaction Password Reset'
        parameterList['form_header'] = Markup('Please provide the following details.')
        parameterList['form_action'] = '/chainreaction-online/reset-by-auth-key'
        parameterList['token_placeholder'] = 'Authentication token'
        parameterList['script_name'] = 'password-reset-by-token'
        parameterList['username'] = _user if _user != None else ''
        return render_template('custom-token-page.html', **parameterList)
    else:
        _user = request.form.get('_user')
        _token = request.form.get('_token')
        isRequestValid = True
        if not (_user and _token): isRequestValid = False
        elif len(_user) < 5 or len(_user) > 15 or len(_token) < 5: isRequestValid = False
        if not isRequestValid: return redirect(request.referrer)
        encryptedUsername = urlsafe_b64encode(_user.encode('UTF-8')).decode('UTF-8')
        return redirect(f"/chainreaction-online/reset?q={encryptedUsername}&_token={_token}")

@app.route('/chainreaction-online/reset-password', methods = ['POST'])
def resetPassword():
    encrypted_q = session.get('encrypted_q')
    decrypted_q = session.get('decrypted_q')
    _token = session.get('_token')
    if not (encrypted_q and decrypted_q and _token): abort(BAD_REQUEST)
    else:
        session.pop('encrypted_q')
        session.pop('decrypted_q')
        session.pop('_token')
        output = redirect('/chainreaction-online/login')
        _client_q = request.form.get('q')
        _client_token = request.form.get('_token')
        _client_password_a = request.form.get('_pass')
        _client_password_b = request.form.get('_passAgain')
        if encrypted_q != _client_q or _token != _client_token or _client_password_a != _client_password_b or not _client_password_a or not _client_password_b or len(_client_password_a) < 5:
            abort(BAD_REQUEST)
        try:
            encryptedUsername = encrypted_q.encode('UTF-8')
            username = urlsafe_b64decode(encryptedUsername).decode('UTF-8')
        except: abort(BAD_REQUEST)
        if (hashCompare(username, decrypted_q)):
            cursor = None
            try:
                cursor = mysql.connection.cursor()
                newPasswordHash = flask_bcrypt.generate_password_hash(_client_password_a)
                sql = f'''UPDATE `{REMOTE_DB_USER_TABLE}` SET `hash`=%s, `password_reset_hash`=%s, `time_stamp`=%s  WHERE `username`=%s'''
                isPasswordChanged = cursor.execute(sql, (newPasswordHash, '', datetime.now(), username))
                if isPasswordChanged == 1:
                    mysql.connection.commit()
                    if flask_login.current_user.is_authenticated:
                        sessionID = flask_login.current_user.get_id()
                        currentGameState = flask_login.current_user.game_state
                        logoutUser(sessionID, currentGameState, cursor, False)
                    flash(f"Hi {username}. Your password was successfully updated. Try signing in!", "info")
                    output = redirect(f"/chainreaction-online/login?username={username}")
            except mysql.connection.Error:
                flash("Database query failed while updating password.", "error")
                output = redirect(f"/chainreaction-online/login?username={username}")
            if cursor: cursor.close()
        return output
#------------------------------------------------------------------------------------------------------------------------------------
#-----------------------------------------------------------------------------------------------------------------------------------
def activateAccount(username, activationKey, cursor = None, closeSqlCursor = True):
    output = {'success': False, 'reason': 'database query failed'}
    cursorCreated = False
    if not cursor:
        try:
            cursor = mysql.connection.cursor()
            cursorCreated = True
        except: return output
    try:
        sql = f'''SELECT `hash`, `activation_status`, `activation_hash` FROM `{REMOTE_DB_USER_TABLE}` WHERE `username`=%s'''
        userCount = cursor.execute(sql, (username,))
        output['reason'] = 'invalid request'
        if userCount == 1: 
            sqlRowData = cursor.fetchone()
            activationStatus = sqlRowData['activation_status']
            activationHash = sqlRowData['activation_hash'] + activationKey
            try:
                if not activationStatus:
                    activationHash = urlsafe_b64decode(activationHash.encode('UTF-8'))
                    salt = sqlRowData['hash'][-20:]
                    isActivationKeyValid = flask_bcrypt.check_password_hash(activationHash, salt)
                    if not isActivationKeyValid: output['reason'] = "invalid key"
                    else:
                        sql = f'''UPDATE {REMOTE_DB_USER_TABLE} SET `activation_status`=%s, `activation_hash`=%s WHERE `username`=%s'''
                        userActivated = cursor.execute(sql, (1, '', username))
                        sql = f'''UPDATE {REMOTE_DB_SESSION_TABLE} SET `activation_status`=%s WHERE `username`=%s'''
                        sessionActivated = cursor.execute(sql, (1, username))
                        if userActivated or sessionActivated: mysql.connection.commit()
                        if userActivated and sessionActivated:
                            sessionID = uuid.uuid4().hex #generate a unique and random session ID for the freshly activated user account!
                            loginUser(sessionID, username, True, cursor, False)
                            output['success'] = True
                            output['reason'] = ''
            except mysql.connection.Error: output['reason'] = 'database query failed'
            except: output['reason'] = 'invalid key'
    except mysql.connection.Error:
        output['reason'] = 'server database is not reachable'
    finally:
        if cursorCreated or closeSqlCursor: cursor.close()
        return output

def logoutUser(sessionID, gameState=None, cursor = None, closeSqlCursor = True):
    cursorCreated = False
    if not cursor:
        try:
            cursor = mysql.connection.cursor()
            cursorCreated = True
        except: return False
    output = True
    if not gameState:
        sql = f'''SELECT `game_state` FROM `{REMOTE_DB_SESSION_TABLE}` WHERE `session_id`=%s'''
        gameStateFound = cursor.execute(sql, (sessionID,))
        if gameStateFound: gameState = cursor.fetchone()['game_state']
        else: output = False
    if output:
        channelName = gameState.getChannelName()
        numberOfPlayers = gameState.getNumberOfPlayers()
        if channelName and numberOfPlayers: updateChannelDatabase(channelName, numberOfPlayers, cursor, False)
        sql = f'''UPDATE `{REMOTE_DB_SESSION_TABLE}` SET `time_stamp` = %s, `session_id` = %s WHERE `session_id` = %s'''
        recordCount = cursor.execute(sql, (datetime.now(), '', sessionID))
        if recordCount > 0:
            mysql.connection.commit()
            flask_login.logout_user()
            session.clear()
        else: output = False
    if cursorCreated or closeSqlCursor: cursor.close()
    return output

def registerUser(username, password, email, cursor = None, closeSqlCursor = True):
    cursorCreated = False
    if not cursor:
        try:
            cursor = mysql.connection.cursor()
            cursorCreated = True
        except: return False
    if type(password) == str: password = password.encode('UTF-8')
    passwordHash = flask_bcrypt.generate_password_hash(password)
    salt = passwordHash[-20:]
    activationData = generateSecureKey(username, salt, APPLICATION_POST_PASSWORD)
    privateActivationHash = activationData['privateKey'] #Everything except the last 30 characters of the base64 hash
    publicActivationHash = activationData['publicKey'] #The last 30 characters of the base64 hash
    userKey = activationData['userKey']
    activationLink = f"{REMOTE_SERVER_ACTIVATION_PAGE}?q={userKey}&_token={publicActivationHash}"
    activationStatus = 0
    sql = f'''INSERT INTO `{REMOTE_DB_USER_TABLE}` (`username`, `hash`, `activation_status`, `activation_hash`, `email`) VALUES (%s, %s, %s, %s, %s);'''
    userInserted = cursor.execute(sql, (username, passwordHash, activationStatus, privateActivationHash, email))
    sql = f'''INSERT INTO `{REMOTE_DB_SESSION_TABLE}` (`username`, `activation_status`) VALUES (%s, %s);'''
    sessionDataInserted = cursor.execute(sql, (username, activationStatus))
    if userInserted or sessionDataInserted: mysql.connection.commit()
    if cursorCreated or closeSqlCursor: cursor.close()
    registrationSuccess = userInserted == 1 and sessionDataInserted == 1
    if registrationSuccess: sendWelcomeEmail(email, username, publicActivationHash, activationLink, f"{REMOTE_SERVER_ACTIVATION_PAGE}?username={username}")
    return registrationSuccess

def removeUser(username, cursor = None, closeSqlCursor: bool = True):
    cursorCreated = False
    if not cursor:
        try:
            cursor = mysql.connection.cursor()
            cursorCreated = True
        except: return False
    sql = f'''DELETE FROM `{REMOTE_DB_USER_TABLE}` WHERE `username` = %s;'''
    userDeleted = cursor.execute(sql, (username,))
    sql = f'''DELETE FROM `{REMOTE_DB_SESSION_TABLE}` WHERE `username` = %s;'''
    sessionDataDeleted = cursor.execute(sql, (REMOTE_DB_SESSION_TABLE, username))
    if (sessionDataDeleted or userDeleted): mysql.connection.commit()
    if cursorCreated or closeSqlCursor: cursor.close()
    return userDeleted + sessionDataDeleted

def sendWelcomeEmail(email, username, activationKey, activationLink, activationPage):
    emailMessage = Message(subject='Activate your new account!', recipients=[email])
    emailTemplate = "<html><body>Hi!</body></html>"
    with app.app_context():
        emailTemplate = render_template("welcome-email.html", server_page = REMOTE_SERVER_ADDRESS, user_name = username, activation_link = activationLink, activation_page = activationPage, activation_key = activationKey)
    emailMessage.html = emailTemplate
    mail.send(emailMessage)

def sendPasswordResetEmail(email, username, passwordResetKey, passwordResetLink, passwordResetPage):
    emailMessage = Message(subject='Important: reset your account password!', recipients=[email])
    emailTemplate = "<html><body>Hi!</body></html>"
    with app.app_context():
        emailTemplate = render_template("password-reset-email.html", server_page = REMOTE_SERVER_ADDRESS, user_name = username, password_reset_link = passwordResetLink, password_reset_page = passwordResetPage, password_reset_key = passwordResetKey)
    emailMessage.html = emailTemplate
    mail.send(emailMessage)
#**************************************************************************************************************

#***************************************************************************************************************
#******************************************* Pusher client related routes ***************************************
#***************************************************************************************************************
@app.route('/pusher/application-settings', methods = ['GET','POST'])
@login_required
@update_session
def getPusherSettings():
    sessionID = flask_login.current_user.get_id()
    if sessionID:
        tokenValue = urlsafe_b64encode(sessionID.encode('UTF-8')).decode('UTF-8')
        pusherAppSettings = {}
        pusherAppSettings['app_key'] = PUSHER_SETTINGS['app_key']
        pusherAppSettings['cluster'] = PUSHER_SETTINGS['cluster']
        pusherAppSettings['encrypted'] = PUSHER_SETTINGS['ssl']
        #pusherAppSettings['authEndpoint'] = PUSHER_SETTINGS['authEndpoint']
        pusherAppSettings['channelAuthorization'] = PUSHER_SETTINGS['channelAuthorization']
        pusherAppSettings['userAuthentication'] = PUSHER_SETTINGS['userAuthentication']
        if 'params' in pusherAppSettings['userAuthentication']: pusherAppSettings['userAuthentication']['params']['token'] = tokenValue
        if 'params' in pusherAppSettings['channelAuthorization']: pusherAppSettings['channelAuthorization']['params']['token'] = tokenValue
        return jsonify(success = True, settings = pusherAppSettings, token = tokenValue)
    else: return jsonify(success = False, reason = 'unauthorized')

@app.route('/pusher/channel-auth',methods=['POST'])
@login_required
def pusherChannelAuth():
    if not flask_login.current_user.is_authenticated: return jsonify({'success': False, 'reason': 'unauthorized'}), 403
    userID = flask_login.current_user.get_id()
    currentGameState = flask_login.current_user.game_state
    socketID = request.form.get("socket_id")
    channelName = request.form.get('channel_name')
    token = request.form.get('token')
    if not (channelName and socketID and token): return jsonify({'success' : False, 'reason' : 'invalid data'}), 403
    decryptedToken = None
    try: decryptedToken = urlsafe_b64decode(token.encode('UTF-8')).decode('UTF-8')
    except: pass
    if decryptedToken != userID: return jsonify({'success' : False, 'reason' : 'unauthorized'}), 403
    if channelName.startswith('private-'):
        if (channelName == f"private-{token}"):
            auth = pusher_client.authenticate(channelName, socketID)
            return auth, 200
        else: return jsonify({'success' : False, 'reason' : 'unauthorized to this channel'}), 403
    else:
        serverAssignedChannelName = currentGameState.getChannelName()
        if channelName == serverAssignedChannelName and len(serverAssignedChannelName) != 0:
            userData = { u"user_id": token, u"user_info": {"subscription_time": time.time()} } #The time stamp (subscription time) is important for determining a player's game position. It must be included in user data.
            auth = pusher_client.authenticate(channel = channelName, socket_id = socketID, custom_data = userData);
            return auth, 200
        else: return jsonify({'success' : False, 'reason' : 'unauthorized to this channel'}), 403

@app.route('/pusher/user-auth',methods=['POST'])
@login_required
def pusherUserAuth():
    output = {'success' : False, 'reason' : 'unauthorized'}
    if not flask_login.current_user.is_authenticated: return jsonify(output), 403
    #print("user-auth form:", request.form)
    token = request.form.get('token')
    decryptedToken = None
    try: decryptedToken = urlsafe_b64decode(token.encode('UTF-8')).decode('UTF-8')
    except: pass    
    if not (token and decryptedToken): return jsonify(output), 403
    userID = flask_login.current_user.get_id()
    if decryptedToken != userID: return jsonify(output), 403
    userData = {u"id": userID, u"user_info": {}, u"watchlist": []}
    socketID = request.form.get("socket_id")
    auth = pusher_client.authenticate(channel = "all", socket_id= socketID, custom_data = userData)
    return auth, 200

#*******************************************************************************************

#*******************************************************************************************
#***************************************** Game related routes ******************************
#*******************************************************************************************
@app.route('/chainreaction-offline')
def showOfflineGamePage():
    return render_template('chainreaction-offline.html')

@app.route('/chainreaction-offline/<path:filename>')
def getStaticFile(filename):
    if len(filename) == 0: return redirect("./chainreaction-offline")
    dirPath = "./static"
    return send_from_directory(dirPath, filename)

@app.route('/chainreaction-online',methods=['GET'])
@login_required
def showOnlineGamePage():
    if not flask_login.current_user.is_authenticated: abort(UNAUTHORIZED)
    currentId = flask_login.current_user.get_id()
    currentEncodedId = urlsafe_b64encode(currentId.encode('UTF-8')).decode('UTF-8')
    if flask_login.current_user.active:
        currentGameState = flask_login.current_user.game_state
        print(currentGameState.getJsonString())
        channel = currentGameState.getChannelName()
        numberOfPlayers = currentGameState.getNumberOfPlayers()
        if channel != None and numberOfPlayers != None: updateChannelDatabase(channel, numberOfPlayers)
        if channel or (session.get('game_state_changed')): resetGameState(currentId)
        return render_template('chainreaction-online.html', token = currentEncodedId, username=flask_login.current_user.username)
    else:# if the account is not activated, show a the page for dormant account.
        _email = session.get('email')
        if not _email: abort(INTERNAL_SERVER_ERROR)
        update_session(print)("User session was updated.")
        updatedId = flask_login.current_user.get_id()
        updatedEncodedId = urlsafe_b64encode(updatedId.encode('UTF-8')).decode('UTF-8')
        return render_template("dormant-account.html", token = updatedEncodedId, username = flask_login.current_user.username, email = _email, resend_activation_page = url_for('regenerateActivationKey'))

@app.route('/chainreaction-online/<path:filename>')
@login_required
def getProtectedFile(filename):
    dirPath = "./protected"
    return send_from_directory(dirPath, filename)

@app.route('/game-server-endpoint',methods=['POST'])
def processCommand():
    if not flask_login.current_user.is_authenticated: abort(UNAUTHORIZED)
    listOfCommands = ['search-game', 'cancel-search', 'start-game', 'reset-state']
    receivedCommand = request.form.get('command') #possible commands : search-game, cancel-search, quit-game, start-game
    authToken = request.form.get('token')
    if not authToken: abort(UNAUTHORIZED)
    pageUserId = None
    try: pageUserId = urlsafe_b64decode(authToken.encode('UTF-8')).decode('UTF-8')
    except: abort(BAD_GATEWAY)
    if pageUserId != flask_login.current_user.get_id(): abort(BAD_GATEWAY)
    print(receivedCommand)
    if receivedCommand == 'search-game':
        return processGameRequest()
    if receivedCommand == 'cancel-search':
        return processCancelGameRequest()
    if receivedCommand == 'start-game':
        return processStartGameRequest()
    #if receivedCommand == 'update-move':
    #    return processUpdateMoveRequest()
    if receivedCommand == 'reset-state':
        return processResetStateRequest()
    return jsonify({'success': False, 'reason': f"invalid command: {receivedCommand}", 'available-commands' : listOfCommands}), 200
#****************************************************************************************************************
#******************************************* functions handling requests related to game ************************
#****************************************************************************************************************
def processGameRequest():
    '''Handles the response of `search-game` command received by POST at the `game-server-endpoint`.'''
    output = {'success' : False, 'reason': ""}
    if not flask_login.current_user.is_authenticated:
        output['reason'] = 'unauthorized'
        return jsonify(output), 200
    currentGameState = flask_login.current_user.game_state
    #stop further processing if a game has started or a game-request was already submitted before.
    if currentGameState.hasGameStarted() or currentGameState.isWaitingForGame():
        output['reason'] = 'invalid game state'
        return jsonify(output), 200
    players = request.form.get('players')
    numberOfRows = request.form.get('rows')
    numberOfColumns = request.form.get('columns')
    #stop processing if all information were not correctly included in the post request.
    if not (players.isdigit() and numberOfRows.isdigit() and numberOfColumns.isdigit()):
        output['reason'] = 'received bad data'
        return jsonify(output), 200
    players = int(players)
    numberOfRows = int(numberOfRows)
    numberOfColumns = int(numberOfColumns)
    #********** verification of the game-state and data was successful, proceed to update game-state and database.
    channelName = f"presence-{players}.{numberOfRows}.{numberOfColumns}"
    try: cursor = mysql.connection.cursor()
    except:
        output['reason'] = 'database query failed'
        return jsonify(output), 200
    sql = f'''SELECT * FROM `{REMOTE_DB_CHANNEL_TABLE}` WHERE `channel_name` = %s AND `user_count` < %s'''
    availableNumberOfRoom = cursor.execute(sql, (channelName, players))
    if availableNumberOfRoom == 0:
        roomName = uuid.uuid4().hex
        userCount = 1
        sql = f'''INSERT INTO `{REMOTE_DB_CHANNEL_TABLE}` (`channel_name`, `room_name`, `user_count`) VALUES (%s, %s, %s)'''
        sqlSuccess = cursor.execute(sql, (channelName, roomName, userCount))
        if sqlSuccess:
            mysql.connection.commit()
            output['success'] = True
            output['reason'] = ""
            #output['onlinePosition'] = 1
        else: output['reason'] = 'database query failed'
    else:
        rowData = cursor.fetchone()
        rowID = rowData['ID']
        roomName = rowData['room_name']
        userCount = rowData['user_count']
        sql = f'''UPDATE `{REMOTE_DB_CHANNEL_TABLE}` SET `user_count` = %s WHERE `ID` = %s'''
        sqlSuccess = cursor.execute(sql, (userCount + 1, rowID))
        if sqlSuccess:
            mysql.connection.commit()
            output['success'] = True
            output['reason'] = ""; 
            #output['onlinePosition'] = userCount + 1
        else: output['reason'] = 'database query failed'
    if (output['success'] == True):
        currentUserID = flask_login.current_user.get_id()
        currentGameState.setWaitingForGame(True)
        currentGameState.setHasGameStarted(False)
        currentGameState.setChannelName(f"{channelName}.{roomName}")
        currentGameState.setNumberOfRows(numberOfRows)
        currentGameState.setNumberOfColumns(numberOfColumns)
        currentGameState.setNumberOfPlayers(players)
        gameStateJsonObject = currentGameState.getJsonObject()
        gameStateJsonString = json.JSONEncoder(ensure_ascii= True).encode(gameStateJsonObject)
        sql = f'''UPDATE `{REMOTE_DB_SESSION_TABLE}` SET `game_state` = %s WHERE session_id = %s'''
        sqlSuccess = cursor.execute(sql, (gameStateJsonString, currentUserID))
        if sqlSuccess:
            mysql.connection.commit()
            session['game_state_changed'] = True
            output['game_state'] = gameStateJsonObject
        else:
            output['success'] = False
            output['reason'] = 'database query failed'
            sql = None; sqlData = None
            sql = f'''UPDATE `{REMOTE_DB_CHANNEL_TABLE}` SET `user_count` = %s WHERE `room_name` = %s'''
            sqlData = (userCount - 1, roomName)
            sqlSucces = cursor.execute(sql, sqlData)
            if sqlSucces: mysql.connection.commit()
    cursor.close()
    response = jsonify(output)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response, 200

def processCancelGameRequest():
    '''Handles the response of `cancel-search` command received by POST at the `game-server-endpoint`.'''
    output = {'success' : False, 'reason': ""}
    if not flask_login.current_user.is_authenticated:
        output['reason'] = 'unauthorized'
        return jsonify(output), 200
    currentUserID = flask_login.current_user.get_id()
    currentGameState = flask_login.current_user.game_state
    if currentGameState.hasGameStarted() or not currentGameState.isWaitingForGame():
        output['reason'] = 'invalid game state'
        return jsonify(output), 200
    totalPlayers = request.form.get('totalPlayers')
    numberOfRows = request.form.get('rows')
    numberOfColumns = request.form.get('columns')
    channelName = request.form.get('channel')
    validData = True
    if not (totalPlayers.isdigit() and numberOfRows.isdigit() and numberOfColumns.isdigit()): validData = False
    if not (validData and channelName):
        output['reason'] = 'received bad data'
        return jsonify(output), 200
    totalPlayers = int(totalPlayers)
    numberOfRows = int(numberOfRows)
    numberOfColumns = int(numberOfColumns)
    serverStateRows = currentGameState.getNumberOfRows()
    serverStateColumns = currentGameState.getNumberOfColumns()
    serverStatePlayers = currentGameState.getNumberOfPlayers()
    serverStateChannel = currentGameState.getChannelName()
    if (totalPlayers != serverStatePlayers) or (numberOfRows != serverStateRows) or (numberOfColumns != serverStateColumns) or (channelName != serverStateChannel):
        output['reason'] = 'invalid game parameters'
        return jsonify(output), 200
    #********** verification of the game-state and data was successful, proceed to update game-state and database.
    cursor = None
    try:
        cursor = mysql.connection.cursor()
        channelUpdated = updateChannelDatabase(serverStateChannel, serverStatePlayers, cursor, False)
        if not channelUpdated: output['reason'] = 'database query failed'
        else:
            currentGameState.setWaitingForGame(False)
            currentGameState.setChannelName(None)
            currentGameState.setHasGameStarted(False)
            currentGameState.setNumberOfRows(None)
            currentGameState.setNumberOfColumns(None)
            currentGameState.setNumberOfPlayers(None)
            currentGameState.setOnlinePosition(None)
            gameStateJsonObject = currentGameState.getJsonObject()
            gameStateJsonString = json.JSONEncoder(ensure_ascii= True).encode(gameStateJsonObject)
            sql = f'''UPDATE `{REMOTE_DB_SESSION_TABLE}` SET `game_state` = %s WHERE session_id = %s'''
            sqlSuccess = cursor.execute(sql, (gameStateJsonString, currentUserID))
            if sqlSuccess:
                mysql.connection.commit()
                output['success'] = True
                session['game_state_changed'] = True
                output['game_state'] = gameStateJsonObject
                output['reason'] = ""
            else:
                output['success'] = False
                output['reason'] = 'database query failed'
    except mysql.connection.Error: output['reason'] = 'database query failed'
    finally:
        if cursor: cursor.close()
        return jsonify(output), 200

def processStartGameRequest():
    '''Handles the response of `start-game` command received by POST at the `game-server-endpoint`.'''
    output = {'success' : False, 'reason': ""}
    if not flask_login.current_user.is_authenticated:
        output['reason'] = 'unauthorized'
        return jsonify(output), 200
    currentUserID = flask_login.current_user.get_id()
    currentGameState = flask_login.current_user.game_state
    totalPlayers = request.form.get('totalPlayers')
    numberOfRows = request.form.get('rows')
    numberOfColumns = request.form.get('columns')
    channelName = request.form.get('channel')
    positionInGame = request.form.get('onlinePosition')
    eventNameForStartingGame = request.form.get('eventName')
    validData = True
    if not (totalPlayers.isdigit() and numberOfRows.isdigit() and numberOfColumns.isdigit() and positionInGame.isdigit()): validData = False
    if not (validData and channelName):
        output['reason'] = 'received bad data'
        return jsonify(output), 200
    totalPlayers = int(totalPlayers)
    numberOfRows = int(numberOfRows)
    numberOfColumns = int(numberOfColumns)
    positionInGame = int(positionInGame)
    if positionInGame > totalPlayers or positionInGame < 1: validData = False
    serverStateRows = currentGameState.getNumberOfRows()
    serverStateColumns = currentGameState.getNumberOfColumns()
    serverStatePlayers = currentGameState.getNumberOfPlayers()
    serverStateChannel = currentGameState.getChannelName()
    serverStatePosition = currentGameState.getOnlinePosition()
    if (totalPlayers != serverStatePlayers) or (numberOfRows != serverStateRows) or (numberOfColumns != serverStateColumns) or (channelName != serverStateChannel):
        output['reason'] = 'invalid game parameters'
        return jsonify(output), 200
    #presence of this parameter means game-state is already updated and all players are ready. Trigger the start of the game via server. 
    if eventNameForStartingGame and len(eventNameForStartingGame) > 0:
        print(f"triggerring event {eventNameForStartingGame} in response of 'start-game' command")
        eventTriggered = False
        if serverStatePosition == 1:#This request is processed only if it is from player 1.
            eventTriggered = pusher_client.trigger(serverStateChannel, eventNameForStartingGame, {});
            output['success'] = eventTriggered
            if eventTriggered: output['reason'] = ''
            else: output['reason'] = 'pusher client failure'
        return jsonify(output), 200
    if currentGameState.hasGameStarted() or not currentGameState.isWaitingForGame():
        output['reason'] = 'invalid game state'
        return jsonify(output), 200
    #********** data verification was successful ************
    # proceed to update state and database.
    cursor = None
    try:
        cursor = mysql.connection.cursor()
        roomName = serverStateChannel.split(".")[-1] #room name is the phrase following the last "." character
        sql = f'''SELECT `user_count` FROM `{REMOTE_DB_CHANNEL_TABLE}` WHERE `room_name` = %s'''
        sqlSuccess = cursor.execute(sql, (roomName,))
        if not sqlSuccess: output['reason'] = 'lobby does not exist'
        else:
            serverChannelData = cursor.fetchone()
            registeredUsersInChannel = serverChannelData['user_count']
            numberOfsubscribedUsers = pusher_client.channel_info(channelName,['user_count'])['user_count']
            if numberOfsubscribedUsers < serverStatePlayers: output['reason'] = 'lobby is not full yet'
            elif numberOfsubscribedUsers != registeredUsersInChannel: output['reason'] = 'some user is offline'
            else:
                currentGameState.setWaitingForGame(False)
                currentGameState.setHasGameStarted(True)
                if positionInGame == 1: currentGameState.setWaitingForMove(False)
                else: currentGameState.setWaitingForMove(True)
                currentGameState.setOnlinePosition(positionInGame);
                gameStateJsonObject = currentGameState.getJsonObject()
                gameStateJsonString = json.JSONEncoder(ensure_ascii= True).encode(gameStateJsonObject)
                sql = f'''UPDATE `{REMOTE_DB_SESSION_TABLE}` SET `game_state` = %s WHERE session_id = %s'''
                sqlSuccess = cursor.execute(sql, (gameStateJsonString, currentUserID))
                if sqlSuccess:
                    mysql.connection.commit()
                    output['success'] = True
                    session['game_state_changed'] = True
                    output['game_state'] = gameStateJsonObject
                    output['reason'] = ""
                else:
                    output['success'] = False
                    output['reason'] = 'database query failed'
    except mysql.connection.Error: output['reason'] = 'database query failed'
    finally:
        if cursor: cursor.close()
        return jsonify(output), 200

def processResetStateRequest():
    '''Handles the response of `reset-state` command received by POST at the `game-server-endpoint`.'''
    output = {'success' : False, 'reason': ""}
    if not flask_login.current_user.is_authenticated:
        output['reason'] = 'unauthorized'
        return jsonify(output), 200
    cursor = None
    try:
        cursor = mysql.connection.cursor()
        updateChannel = request.form.get('updateChannel')
        updateChannel = True if updateChannel == "true" else False
        currentUserID = flask_login.current_user.get_id()
        currentGameState = flask_login.current_user.game_state
        channelName = currentGameState.getChannelName()
        numberOfPlayers = currentGameState.getNumberOfPlayers()
        defaultGameStateJsonObject = GameState().getJsonObject()
        defaultGameStateJsonString = json.JSONEncoder(ensure_ascii = True).encode(defaultGameStateJsonObject)
        sql = f'''UPDATE `{REMOTE_DB_SESSION_TABLE}` SET `game_state` = %s WHERE session_id = %s'''
        sqlSuccess = cursor.execute(sql, (defaultGameStateJsonString, currentUserID))
        if sqlSuccess: mysql.connection.commit()
        if updateChannel: updateChannelDatabase(channelName, numberOfPlayers, cursor)
        output['success'] = True
        output['reason'] = ""
        output['game_state'] = defaultGameStateJsonObject
    except mysql.connection.Error: output['reason'] = 'database query failed'
    finally:
        if cursor: cursor.close()
        return jsonify(output), 200

#------------------------------------------------------------------------------------------------------------------------------------
#-----------------------------------------------------------------------------------------------------------------------------------
def updateChannelDatabase(channelName: str, numberOfPlayers: int, cursor: any = None, closeSqlCursor: bool = True)->bool:
    cursorCreated = False
    if not cursor:
        try:
            cursor = mysql.connection.cursor()
            cursorCreated = True
        except: return False
    if not channelName:
        output = True
    else:
        output = False
        if (channelName.startswith('presence-')):
            roomName = channelName.split(".")[-1] #room name is the phrase following the last "." character
            sql = f'''SELECT * FROM `{REMOTE_DB_CHANNEL_TABLE}` WHERE `room_name` = %s'''
            sqlSuccess = cursor.execute(sql, (roomName,))
            if sqlSuccess: #otherwise, the channel was already deleted.
                data = cursor.fetchone()
                userCount = data['user_count']
                channelID = data['ID']
                if userCount == numberOfPlayers:#it is a full channel! a game was running.
                    sql = f'''DELETE FROM `{REMOTE_DB_CHANNEL_TABLE}` WHERE `ID` = %s''' #delete the channel
                    sqlSuccess = cursor.execute(sql, (channelID,))
                else:
                    sql = f'''UPDATE `{REMOTE_DB_CHANNEL_TABLE}` SET `user_count` = %s WHERE `ID` = %s'''
                    sqlSuccess = cursor.execute(sql, (max(0, userCount - 1), channelID))
                if sqlSuccess:
                    session['game_state_changed'] = True
                    mysql.connection.commit()
            output = True
    if cursorCreated or closeSqlCursor: cursor.close()
    return output

def invalidateSession(sessionID):
    token = urlsafe_b64encode(sessionID.encode('UTF-8')).decode('UTF-8')
    #print("Channel name while reseting", channel)
    channel = f"private-{token}"
    isUserSubscribed = pusher_client.channel_info(channel,['occupied'])['occupied']
    if isUserSubscribed:
        print(f"User {sessionID} is currently subscribed to channel {channel}.")
        wasUserRequestedToUnsubscribe = pusher_client.trigger(channel, f"{token}.session_invalidated", {})

def loginUser(sessionID, username=None, isActive = True, cursor = None, closeSqlCursor = True):
    cursorCreated = False
    if not cursor:
        try:
            cursor = mysql.connection.cursor()
            cursorCreated = True
        except: return False
    isUserLoggedIn = False
    sql = f'''SELECT `session_id` FROM `{REMOTE_DB_SESSION_TABLE}` WHERE `username` = %s'''
    sessionQueryResult = cursor.execute(sql, (username,))
    if sessionQueryResult:
        sqlRowData = cursor.fetchone()
        oldSessionID = sqlRowData['session_id']
        if (oldSessionID and len(oldSessionID) != 0): invalidateSession(oldSessionID)
        if not isActive:
            sql = f'''SELECT `email` FROM `{REMOTE_DB_USER_TABLE}` WHERE `username` = %s'''
            emailQueryResult = cursor.execute(sql, (username,))
            if emailQueryResult: session['email'] = cursor.fetchone()['email']
            else:
                if cursorCreated or closeSqlCursor: cursor.close()
                return False
        currentTimeStamp = datetime.now()
        expireTime = (SESSION_TIMEOUT_HOURS * 3600 + SESSION_TIMEOUT_MINUTES * 60 + SESSION_TIMEOUT_SECONDS)
        userInstance = User(sessionID) #create user instance with sessionID
        userInstance.active = isActive
        userInstance.username = username
        defaultGameStateObject = GameState().getJsonObject()
        defaultGameStateString = json.JSONEncoder(ensure_ascii=True).encode(defaultGameStateObject)
        sql = f'''UPDATE `{REMOTE_DB_SESSION_TABLE}` SET `time_stamp` = %s, `game_state` = %s, `session_id` = %s WHERE `username` = %s;'''
        updateQueryResult = cursor.execute(sql,(currentTimeStamp, defaultGameStateString, sessionID, username))
        if (updateQueryResult > 0):
            mysql.connection.commit()
            session.permanent = True
            session['game_state_changed'] = False
            flask_login.login_user(user = userInstance, remember = True, duration= timedelta(seconds = expireTime), force = True)
            isUserLoggedIn = True
    if cursorCreated or closeSqlCursor: cursor.close()
    return isUserLoggedIn

def resetGameState(sessionID, cursor = None, closeSqlCursor = True):
    cursorCreated = False
    if not cursor:
        try:
            cursor = mysql.connection.cursor()
            cursorCreated = True
        except: return False
    sql = f'''SELECT `activation_status` FROM `{REMOTE_DB_SESSION_TABLE}` WHERE `session_id`=%s'''
    isGameStateFound = cursor.execute(sql, (sessionID,))
    if isGameStateFound:
        sqlData = cursor.fetchone()
        isUserActive = sqlData['activation_status']
        if not isUserActive:
            if cursorCreated or closeSqlCursor: cursor.close()
            return True
    else:
        if cursorCreated or closeSqlCursor: cursor.close()
        return False
    defaultGameStateObject = GameState().getJsonObject()
    defaultGameStateString = json.JSONEncoder(ensure_ascii=True).encode(defaultGameStateObject)
    sql = f'''UPDATE `{REMOTE_DB_SESSION_TABLE}` SET `game_state` = %s WHERE `session_id` = %s;''';
    updateQueryResult = cursor.execute(sql,(defaultGameStateString, sessionID))
    output = False
    if (updateQueryResult):
        session['game_state_changed'] = False
        mysql.connection.commit()
        output = True
    if cursorCreated or closeSqlCursor: cursor.close()
    return output
#*********************************************************************************************
