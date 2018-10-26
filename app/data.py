import time

from app import Base, session, createAll
from app import Column, Integer, String

from app.users import getUser, User

class Message(Base):
    __tablename__ = 'messages'

    id = Column('id', Integer, primary_key=True)
    content = Column('content', String)
    time = Column('time', Integer)

    def __init__(self, content):
        self.content = content
        self.time = int(round(time.time() * 1000))
        session.add(self)
        session.commit()

class Join(Base):
    __tablename__ = 'join'

    user = Column('user', Integer, primary_key=True)
    message = Column('message', Integer, primary_key=True)

    def __init__(self, user, message):
        self.user = user.id
        self.message = message.id
        session.add(self)
        session.commit()

def addMessage(user, content):
    theUser = getUser(user)
    if theUser is not None:
        return Join(theUser, Message(content)) 
    return None;

def getMessages(user=None):
    userFilter = (True)
    if user is not None:
        userFilter = (Join.user == getUser(user).id)

    joins = session.query(Join) \
        .filter(userFilter).all()

    return list(map(lambda x: { \
        "user": session.query(User).get(x.user).name,
        "content": session.query(Message).get(x.message).content \
        }, joins))

createAll()
