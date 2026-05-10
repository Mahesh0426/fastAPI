# pyrefly: ignore [missing-import]
from sqlalchemy.ext.declarative import declarative_base
# pyrefly: ignore [missing-import]
from sqlalchemy import Column, Integer, String, Float

Base = declarative_base()

class Product(Base):
    #Product table schema
    __tablename__="products"

    id = Column(Integer,primary_key=True,index=True)
    name = Column(String)
    price = Column(Float)
    quantity = Column(Integer)
    description = Column(String)
