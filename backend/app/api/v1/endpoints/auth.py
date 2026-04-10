from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.user import Token, UserCreate, UserResponse
from app.services.auth_service import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth_service.authenticate_local(db, form_data.username, form_data.password)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = auth_service.create_token_for_user(user)
    return Token(access_token=token)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    from app.models.user import User
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    user = auth_service.register_user(db, user_data.email, user_data.full_name, user_data.password, user_data.sso_id)
    return user


@router.post("/sso/callback", response_model=Token)
def sso_callback(sso_token: str, db: Session = Depends(get_db)):
    """SSO callback endpoint — Infosys SSO integration (placeholder)."""
    user_info = auth_service.authenticate_sso(sso_token)
    if user_info is None:
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="SSO integration pending")
    return Token(access_token="sso-token-placeholder")
