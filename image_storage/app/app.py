from fastapi import FastAPI,HTTPException,File, UploadFile,Form,Depends
from app.schemas  import PostCreate,UserRead,UserCreate,UserUpdate
from app.db import Post, create_db_and_tables, get_async_session,User
from sqlalchemy.ext.asyncio import AsyncSession
from contextlib import asynccontextmanager
from sqlalchemy import select
from app.images import imagekit
import shutil
import os
import uuid
import tempfile
from app.users import current_active_user, auth_backend, fastapi_users

# Initialize ImageKit

#startup and shutdown logic using a lifespan function.
@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db_and_tables()

    yield

app = FastAPI(lifespan=lifespan)

# Include the authentication routes provided by FastAPI Users
app.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/auth/jwt",
    tags=["auth"],
)

# Include user registration routes provided by FastAPI Users
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)

# Include the reset password routes provided by FastAPI Users
app.include_router(
    fastapi_users.get_reset_password_router(),   
    prefix="/auth",
    tags=["auth"],
)

# Include the  user verification routes provided by FastAPI Users
app.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix="/auth",
    tags=["auth"],
)

# Include the user management routes provided by FastAPI Users
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)

@app.get("/")
def test():
    return {"message": "FastAPI is working!!"}

# Endpoint to upload an image
@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    caption: str = Form(""),
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session)

):
    temp_file_path = None
    try:
        # Save uploaded file temporarily
        suffix = os.path.splitext(file.filename or ".bin")[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file_path = temp_file.name
            shutil.copyfileobj(file.file, temp_file)

        # Upload to ImageKit
        with open(temp_file_path, "rb") as f:
            upload_result = imagekit.files.upload(
                file=f,
                file_name=file.filename or "upload",
                use_unique_file_name=True,
                tags=["backend_upload"]
            )

        # Create DB record
        post = Post(
            user_id=user.id,
            caption=caption,
            url=upload_result.url,
            file_type="video" if file.content_type and file.content_type.startswith("video/") else "image",
            file_name=upload_result.name
        )
        session.add(post)
        await session.commit()
        await session.refresh(post)
        return {"message": "File uploaded successfully", "post": {
            "id": post.id,
            "caption": post.caption,
            "url": post.url,
            "file_type": post.file_type,
            "file_name": post.file_name
        }}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            os.unlink(temp_file_path)
        file.file.close()


# Endpoint to get the feed of posts
@app.get("/feed")
async def get_feed(
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user)
    ):

        result = await session.execute(select(Post).order_by(Post.created_at.desc()))
        posts = [row[0] for row in result.all()]

        user_results = await session.execute(select(User).where(User.id.in_([post.user_id for post in posts])))
        users = {user.id: user for user in user_results.scalars().all()}

        post_data = []
        for post in posts:
            post_data.append({
                "id": str(post.id),
                "user_id": str(post.user_id),
                "caption": post.caption,
                "url": post.url,
                "file_type": post.file_type,
                "file_name": post.file_name,
                "created_at": post.created_at.isoformat(),
                "is_owner": post.user_id == user.id,
                "email": post.user.email if post.user else "Unknown"
            })
        return {"posts": post_data}


# Endpoint to delete a post
@app.delete("/posts/{post_id}")
async def delete_post(post_id: str, session: AsyncSession = Depends(get_async_session), user: User = Depends(current_active_user)):
    try:
        post_uuid = uuid.UUID(post_id)
        result = await session.execute(select(Post).where(Post.id == post_uuid))
        post = result.scalars().first()

        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        if post.user_id != user.id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this post")


        # Delete from ImageKit
        await session.delete(post)
        await session.commit()
        return {
            "success": True,
            "message": "Post deleted successfully"
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


