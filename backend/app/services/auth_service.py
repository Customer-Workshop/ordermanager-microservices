"""Authentication service — supports local auth and Infosys SSO (placeholder).

SSO integration will use SAML/OAuth2 with Infosys identity provider.
For now, provides JWT-based local authentication for development.
"""

import logging

from sqlalchemy.orm import Session

from app.config import settings
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User

logger = logging.getLogger(__name__)


class AuthService:

    @staticmethod
    def authenticate_local(db: Session, email: str, password: str) -> User | None:
        """Authenticate via local credentials (development/fallback)."""
        user = db.query(User).filter(User.email == email).first()
        if user is None or user.hashed_password is None:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    @staticmethod
    def authenticate_sso(sso_token: str) -> dict | None:
        """Validate SSO token with Infosys identity provider.

        TODO: Implement actual SSO validation when provider details are available.
        Expected flow:
        1. Frontend redirects to Infosys SSO login page
        2. SSO redirects back with auth code
        3. Backend exchanges code for token
        4. Backend validates token and extracts user info
        """
        if not settings.SSO_ENABLED:
            logger.info("SSO not enabled — returning None")
            return None

        # TODO: Implement SAML/OAuth2 validation
        # Example with OAuth2:
        # async with httpx.AsyncClient() as client:
        #     response = await client.post(
        #         f"{settings.SSO_PROVIDER_URL}/token",
        #         data={"grant_type": "authorization_code", "code": sso_token, ...}
        #     )
        #     token_data = response.json()
        #     userinfo = await client.get(
        #         f"{settings.SSO_PROVIDER_URL}/userinfo",
        #         headers={"Authorization": f"Bearer {token_data['access_token']}"}
        #     )
        #     return userinfo.json()

        logger.info("SSO authentication attempted — integration pending")
        return None

    @staticmethod
    def create_token_for_user(user: User) -> str:
        return create_access_token(data={"sub": str(user.id), "email": user.email})

    @staticmethod
    def register_user(db: Session, email: str, full_name: str, password: str | None = None, sso_id: str | None = None) -> User:
        user = User(
            email=email,
            full_name=full_name,
            hashed_password=get_password_hash(password) if password else None,
            sso_id=sso_id,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user


auth_service = AuthService()
