from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.practice_unit import PracticeUnit, UnitAnchor
from app.schemas.practice_unit import (
    PracticeUnitCreate, PracticeUnitUpdate, PracticeUnitResponse,
    UnitAnchorCreate, UnitAnchorResponse,
)

router = APIRouter(prefix="/practice-units", tags=["Practice Units"])


@router.get("/", response_model=list[PracticeUnitResponse])
def list_practice_units(db: Session = Depends(get_db)):
    return db.query(PracticeUnit).all()


@router.get("/{unit_id}", response_model=PracticeUnitResponse)
def get_practice_unit(unit_id: int, db: Session = Depends(get_db)):
    unit = db.query(PracticeUnit).filter(PracticeUnit.id == unit_id).first()
    if unit is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Practice Unit not found")
    return unit


@router.post("/", response_model=PracticeUnitResponse, status_code=status.HTTP_201_CREATED)
def create_practice_unit(data: PracticeUnitCreate, db: Session = Depends(get_db)):
    existing = db.query(PracticeUnit).filter(PracticeUnit.code == data.code).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Practice Unit code already exists")
    unit = PracticeUnit(**data.model_dump())
    db.add(unit)
    db.commit()
    db.refresh(unit)
    return unit


@router.put("/{unit_id}", response_model=PracticeUnitResponse)
def update_practice_unit(unit_id: int, data: PracticeUnitUpdate, db: Session = Depends(get_db)):
    unit = db.query(PracticeUnit).filter(PracticeUnit.id == unit_id).first()
    if unit is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Practice Unit not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(unit, field, value)
    db.commit()
    db.refresh(unit)
    return unit


@router.delete("/{unit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_practice_unit(unit_id: int, db: Session = Depends(get_db)):
    unit = db.query(PracticeUnit).filter(PracticeUnit.id == unit_id).first()
    if unit is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Practice Unit not found")
    db.delete(unit)
    db.commit()


# --- Unit Anchors ---

@router.post("/{unit_id}/anchors", response_model=UnitAnchorResponse, status_code=status.HTTP_201_CREATED)
def add_anchor(unit_id: int, data: UnitAnchorCreate, db: Session = Depends(get_db)):
    unit = db.query(PracticeUnit).filter(PracticeUnit.id == unit_id).first()
    if unit is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Practice Unit not found")
    anchor = UnitAnchor(practice_unit_id=unit_id, user_id=data.user_id, is_primary=data.is_primary)
    db.add(anchor)
    db.commit()
    db.refresh(anchor)
    return anchor


@router.get("/{unit_id}/anchors", response_model=list[UnitAnchorResponse])
def list_anchors(unit_id: int, db: Session = Depends(get_db)):
    return db.query(UnitAnchor).filter(UnitAnchor.practice_unit_id == unit_id).all()


@router.delete("/{unit_id}/anchors/{anchor_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_anchor(unit_id: int, anchor_id: int, db: Session = Depends(get_db)):
    anchor = db.query(UnitAnchor).filter(
        UnitAnchor.id == anchor_id, UnitAnchor.practice_unit_id == unit_id
    ).first()
    if anchor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Anchor not found")
    db.delete(anchor)
    db.commit()
