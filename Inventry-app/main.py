from fastapi import FastAPI
from models import Product


app = FastAPI()

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

@app.get("/products")
def get_all_product():
    return products

@app.get("/products/{product_id}")
def get_product_by_id(product_id:int):
    for product in products:
        if product.id == product_id:
            return product
    return {"error": "Product not found"}
    
@app.post("/products")
def add_product(product:Product):
    products.append(product)
    return {
        "message": "Product added successfully",
        "product": product,
        "total_products": len(products)
    }
              
             

