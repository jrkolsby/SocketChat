import os

from sqlalchemy import Boolean, Integer, String
from sqlalchemy import Table, Column, ForeignKey
from sqlalchemy import create_engine, MetaData, select
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy.orm.exc import NoResultFound

from werkzeug.security import generate_password_hash, check_password_hash

cwd = os.path.dirname(os.path.realpath(__file__)) 

engine = create_engine('sqlite:///' + cwd + '/data.db', echo=False)
session = sessionmaker(bind=engine)()
metaData = MetaData()

Base = declarative_base(metadata=metaData)

def createAll():
    metaData.create_all(engine)
