# pyrefly: ignore [missing-import]
from sqlalchemy.orm import sessionmaker
# pyrefly: ignore [missing-import]
from sqlalchemy import create_engine

db_url = "postgresql://postgres:12345678@localhost:5432/mahesh"
engine = create_engine(
    # "postgresql://postgres:postgres@localhost:5432/postgres",
    db_url,
    echo=True,
)

SessionLocal=sessionmaker(autocommit=False, autoflush=False, bind=engine)