from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.rubric import RoleRubric, RubricCriterion
from app.schemas.rubric import RoleRubricCreate, RoleRubricUpdate, RoleRubricResponse

router = APIRouter(prefix="/rubrics", tags=["Rubrics"])


@router.get("/", response_model=list[RoleRubricResponse])
def list_rubrics(role_id: int | None = None, active_only: bool = True, db: Session = Depends(get_db)):
    query = db.query(RoleRubric)
    if role_id:
        query = query.filter(RoleRubric.role_id == role_id)
    if active_only:
        query = query.filter(RoleRubric.is_active.is_(True))
    return query.all()


@router.get("/{rubric_id}", response_model=RoleRubricResponse)
def get_rubric(rubric_id: int, db: Session = Depends(get_db)):
    rubric = db.query(RoleRubric).filter(RoleRubric.id == rubric_id).first()
    if rubric is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rubric not found")
    return rubric


@router.get("/{rubric_id}/html")
def get_rubric_html(rubric_id: int, db: Session = Depends(get_db)):
    """Return the rubric HTML content for real-time rendering during interviews."""
    rubric = db.query(RoleRubric).filter(RoleRubric.id == rubric_id).first()
    if rubric is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rubric not found")
    if rubric.html_content is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No HTML content for this rubric")
    from fastapi.responses import HTMLResponse
    return HTMLResponse(
        content=rubric.html_content,
        headers={"Content-Security-Policy": "script-src 'none'; object-src 'none'"},
    )


@router.post("/", response_model=RoleRubricResponse, status_code=status.HTTP_201_CREATED)
def create_rubric(data: RoleRubricCreate, db: Session = Depends(get_db)):
    criteria_data = data.criteria
    rubric_data = data.model_dump(exclude={"criteria"})
    rubric = RoleRubric(**rubric_data)
    for criterion in criteria_data:
        rubric.criteria.append(RubricCriterion(**criterion.model_dump()))
    db.add(rubric)
    db.commit()
    db.refresh(rubric)
    return rubric


@router.post("/{rubric_id}/upload-html", response_model=RoleRubricResponse)
async def upload_rubric_html(
    rubric_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload an HTML rubric file for a role. The HTML is stored and served to interviewers in real-time."""
    rubric = db.query(RoleRubric).filter(RoleRubric.id == rubric_id).first()
    if rubric is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rubric not found")
    if not file.filename or not file.filename.endswith((".html", ".htm")):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only .html files are accepted")
    content = await file.read()
    rubric.html_content = content.decode("utf-8")
    rubric.version += 1
    db.commit()
    db.refresh(rubric)
    return rubric


@router.put("/{rubric_id}", response_model=RoleRubricResponse)
def update_rubric(rubric_id: int, data: RoleRubricUpdate, db: Session = Depends(get_db)):
    rubric = db.query(RoleRubric).filter(RoleRubric.id == rubric_id).first()
    if rubric is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rubric not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(rubric, field, value)
    db.commit()
    db.refresh(rubric)
    return rubric


@router.delete("/{rubric_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_rubric(rubric_id: int, db: Session = Depends(get_db)):
    rubric = db.query(RoleRubric).filter(RoleRubric.id == rubric_id).first()
    if rubric is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rubric not found")
    db.delete(rubric)
    db.commit()
