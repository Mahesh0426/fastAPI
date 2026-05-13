from fastapi import FastAPI,HTTPException,File, UploadFile,Form,Depends
from app.schemas  import PostCreate
from app.db import Post, create_db_and_tables, get_async_session
from sqlalchemy.ext.asyncio import AsyncSession
from contextlib import asynccontextmanager
from sqlalchemy import select


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db_and_tables()

    yield

app = FastAPI(lifespan=lifespan)



@app.get("/")
def test():
    return {"message": "FastAPI is working!!"}

# Endpoint to upload an image
@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    caption: str = Form(""),
    session: AsyncSession = Depends(get_async_session)

):
    # Process the uploaded image and save it to the database
    post = Post(
        caption=caption,
        url=f"/files/{file.filename}",  
        file_type=file.content_type,
        file_name=file.filename
    )
    session.add(post)
    await session.commit()
    await session.refresh(post)
    return {"message": "File uploaded successfully", "post": post}

# Endpoint to get the feed of posts
@app.get("/feed")
async def get_feed(session: AsyncSession = Depends(get_async_session)):
        result = await session.execute(select(Post).order_by(Post.created_at.desc()))
        posts = [row[0] for row in result.all()]

        post_data = []
        for post in posts:
            post_data.append({
                "id": str(post.id),
                "caption": post.caption,
                "url": post.url,
                "file_type": post.file_type,
                "file_name": post.file_name,
                "created_at": post.created_at.isoformat()
            })
        return {"posts": post_data}



