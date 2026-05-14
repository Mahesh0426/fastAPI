from typing import Optional
from fastapi import Depends,Request
import uuid
from fastapi_users import BaseUserManager, UUIDIDMixin, FastAPIUsers,models
from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    JWTStrategy,
)
from fastapi_users.db import SQLAlchemyUserDatabase
from app.db import User, get_user_db
import os
from dotenv import load_dotenv

load_dotenv()


class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = os.getenv("SECRET")
    verification_token_secret = os.getenv("SECRET")

    async def on_after_register(self, user: User, request: Optional[Request] = None):
        print(f"User {user.id} has registered.")
    
    async def on_after_forgot_password(self, user: User, token: str, request: Optional[Request] = None):
        print(f"User {user.id} has forgot their password. Reset token: {token}")

    async def on_after_request_verify(self, user: User, token: str, request: Optional[Request] = None):
        print(f"Verification requested for user {user.id}. Verification token: {token}")

# Define the authentication backend
async def get_user_manager(user_db: SQLAlchemyUserDatabase = Depends(get_user_db)):
    yield UserManager(user_db)

# Define the transport method for authentication (Bearer token in this case)
bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")

# Define the JWT strategy to be used in the authentication backend
def get_jwt_strategy():
    return JWTStrategy(secret=os.getenv("SECRET"), lifetime_seconds=3600)

# Create the authentication backend using the transport and strategy defined above
auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

# Create the FastAPIUsers instance, which will handle user registration, authentication, and management
fastapi_users = FastAPIUsers[User, uuid.UUID](
    get_user_manager,
    [auth_backend], 
)

# Dependency to get the current active user
current_active_user = fastapi_users.current_user(active=True)

