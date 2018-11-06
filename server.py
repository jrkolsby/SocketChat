from flask import Flask, request
from flask import render_template, jsonify, make_response

from flask_login import LoginManager, UserMixin

from flask_socketio import SocketIO, send, emit

from app.data import addMessage, getMessages, addVote
from app.users import addUser, getUser

app = Flask(__name__)

login = LoginManager(app)
socketio = SocketIO(app)

def success(payload): 
    response = {
        "type": "SUCCESS",
        "payload": payload
    }
    return jsonify(response)

def error(payload):
    response = {
        "type": "ERROR",
        "payload": payload 
    }
    return jsonify(response)

def message(username, content):
    response = {
        "type": "MESSAGE",
        "payload": {
            "username": username,
            "content": content 
        }
    }
    # Socket will jsonify for us!
    return response

def vote(messageID, count):
    response = {
        "type": "VOTE",
        "payload": {
            "id": messageID,
            "count": count
        }
    }
    # Socket will jsonify for us!
    return response


@login.user_loader
def user_loader(userName):
    return getUser(userName)

@socketio.on('message')
def handleSocket(packet):
    packetType = packet['type']
    payload = packet['payload']

    username = payload['username']
    token = payload['token']
    user = getUser(username)

    if user is not None and user.verifyToken(token):

        if packetType == "MESSAGE":

            content = payload['content']
            send(message(username, content), broadcast = True)
            addMessage(username, content)

        elif packetType == "VOTE":
            messageID = payload['messageID']

            newCount = addVote(messageID)
            send(vote(messageID, newCount))

    else:
        print "WARN: Unverified user"


@app.route("/login", methods=['POST'])
def login():
    username = request.form.get('user')
    password = request.form.get('pass')

    if username == "" or password == "":
        return error("Incomplete Credentials")

    user = getUser(username)

    if user is None:
        return error("No such user")
    
    token = user.getToken(password)

    if token is None:
        return error("Invalid Password")

    return success(token)

@app.route("/signup", methods=['GET', 'POST', 'DELETE'])
def signup():
    username = request.form.get('user')
    password = request.form.get('pass')

    if username == "" or password == "":
        return error("Incomplete Credentials")

    if getUser(username) is not None:
        return error("User exists")
    
    user = addUser(username, password)

    return success(user.getToken(password))

@app.route("/")
def index():
    return render_template('index.html', messages=getMessages(), submit=True)

@app.route("/user/<id>")
def user(id):
    return render_template('index.html', messages=getMessages(id), submit=False)

@app.route("/messages")
def messages():
    return "INDEX"
