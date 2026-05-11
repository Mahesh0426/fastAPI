import database_models
from fastapi import Depends ,FastAPI
from models import Product
from database import SessionLocal, engine
from database_models import Base
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session

app = FastAPI()

# Create tables in the database
Base.metadata.create_all(bind=engine)

@app.get("/")
def greet():
    return "welcome to invebtry app"

products = [
    Product(id=1,name="phone",price=100,quantity=10,description="Smart phone"),
    Product(id=2,name="laptop",price=200,quantity=20,description="Gaming Laptop"),
    Product(id=3,name="watch",price=300,quantity=30,description="Apple Watch"),
    Product(id=4,name="meta glass",price=400,quantity=40,description="VR Headset"),
    Product(id=5,name="play station",price=500,quantity=50,description="Gaming Console"),
    Product(id=6,name="drone",price=600,quantity=60,description="DJI Drone"),
    Product(id=7,name="bike-toys",price=700,quantity=70,description="Sports Bike"),
    Product(id=8,name="car-toys",price=200,quantity=20,description="Audi R8"),
    
 
    
]

# this function will return the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

#initialize the database tables with products
def init_db():
    db = SessionLocal()
    count = db.query(database_models.Product).count()

    if count == 0:
        for product in products:
            db.add(database_models.Product(**product.model_dump()))
        db.commit()
        

init_db()
    

# get all products
@app.get("/products")
def get_all_product(db:Session = Depends(get_db)):
    #connect db
    db_products = db.query(database_models.Product).all()
    return db_products


# get products by id
@app.get("/products/{product_id}")
def get_product_by_id(product_id:int , db:Session = Depends(get_db)):
    product = db.query(database_models.Product).filter(database_models.Product.id == product_id).first()
    if not product:
        return {"error": "Product not found"}
    return product
    

# add new products
@app.post("/products")
def add_product(product:Product,db:Session = Depends(get_db)):
    new_product = database_models.Product(**product.model_dump())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return {
        "message": "Product added successfully!!",
        "product": new_product,
    }


# update products
@app.put("/products/{product_id}")
def update_product(product_id:int,product:Product,db:Session = Depends(get_db)):
    update_product = db.query(database_models.Product).filter(database_models.Product.id == product_id).first()
    if not update_product:
        return {"error": "Product not found"}
    update_product.name = product.name
    update_product.price = product.price
    update_product.quantity = product.quantity
    update_product.description = product.description
    db.commit()
    db.refresh(update_product)
    return {
        "message": "Product updated successfully!!",
        "product": update_product,
    }
    
# @app.delete("/products/{product_id}")  
# def delete_product(product_id:int):
#     for i in range(len(products)):
#         if products[i].id == product_id:
#             # del products[i]
#             products.pop(i)
#             return {
#                 "message": "Product deleted successfully",
#             }
#     return { "error": "No product found with this id" }      

@app.delete("/products/{product_id}")
def delete_product(product_id: int):
    for index, product in enumerate(products):
        if product.id == product_id:
            products.pop(index)
            return { "message": "Product deleted successfully" }

    return { "error": "No product found with this id" }

             

