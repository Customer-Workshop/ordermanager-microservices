from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.role import Role, RoleSkill
from app.schemas.role import RoleCreate, RoleUpdate, RoleResponse

router = APIRouter(prefix="/roles", tags=["Roles"])


@router.get("/", response_model=list[RoleResponse])
def list_roles(category: str | None = None, practice_unit_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(Role)
    if category:
        query = query.filter(Role.category == category)
    if practice_unit_id:
        query = query.filter(Role.practice_unit_id == practice_unit_id)
    return query.all()


@router.get("/{role_id}", response_model=RoleResponse)
def get_role(role_id: int, db: Session = Depends(get_db)):
    role = db.query(Role).filter(Role.id == role_id).first()
    if role is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
    return role


@router.post("/", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
def create_role(data: RoleCreate, db: Session = Depends(get_db)):
    skills_data = data.required_skills
    role_data = data.model_dump(exclude={"required_skills"})
    role = Role(**role_data)
    for skill in skills_data:
        role.required_skills.append(RoleSkill(**skill.model_dump()))
    db.add(role)
    db.commit()
    db.refresh(role)
    return role


@router.put("/{role_id}", response_model=RoleResponse)
def update_role(role_id: int, data: RoleUpdate, db: Session = Depends(get_db)):
    role = db.query(Role).filter(Role.id == role_id).first()
    if role is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(role, field, value)
    db.commit()
    db.refresh(role)
    return role


@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_role(role_id: int, db: Session = Depends(get_db)):
    role = db.query(Role).filter(Role.id == role_id).first()
    if role is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
    db.delete(role)
    db.commit()
