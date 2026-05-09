# pyrefly: ignore [missing-import]
from pydantic import BaseModel

class Product(BaseModel):
    id : int
    name : str
    price : float
    quantity : int
    description:str


# if you do not use pydentic use this in this case 
    # def __init__(self,id:int,name:str,price:float,quantity:int,description:str):
    #     self.id = id
    #     self.name = name
    #     self.price =     price
    #     self.quantity = quantity
    #     self.description = description

