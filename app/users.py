import time
import string
from random import choice

from passlib.apps import custom_app_context as pwd

from app import Base, session, createAll
from app import Column, Integer, String

TOKEN_EXPIRE = 3600 * 1000
TOKEN_SIZE = 17

def getTime():
    return int(round(time.time() * 1000))

class User(Base):
    __tablename__ = 'users'

    id = Column('id', Integer, primary_key=True)
    name = Column('name', String)
    token = Column('token', String)
    expire = Column('expire', Integer)
    password = Column('password', String)

    def verifyToken(self, token):
        if token == self.token and self.expire > getTime():
            return True;
        return False;

    def getToken(self, password):
        if pwd.verify(password, self.password):

            # generate token
            alphabet = string.ascii_letters + string.digits
            self.token = ''.join( \
                    choice(alphabet) for i in range(TOKEN_SIZE))

            self.expire = getTime() + TOKEN_EXPIRE
            session.commit()
            return self.token;

        return None

    def __init__(self, name, password):
        self.name = name
        self.password = pwd.encrypt(password)
        session.add(self)
        session.commit()

def addUser(username, password):
    return User(username, password)

def getUser(name=None):
    nameFilter = (True)
    if name is not None:
        nameFilter = (User.name == name)

    return session.query(User) \
        .filter(nameFilter).first()

createAll()
