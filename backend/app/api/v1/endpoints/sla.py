from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.sla import SLADefinition, SLATracking, SLAAttachment

router = APIRouter(prefix="/sla", tags=["SLA"])


# --- SLA Definitions ---

@router.get("/definitions", response_model=list[dict])
def list_sla_definitions(db: Session = Depends(get_db)):
    defs = db.query(SLADefinition).filter(SLADefinition.is_active.is_(True)).all()
    return [
        {
            "id": d.id, "name": d.name, "stage": d.stage.value,
            "target_days": d.target_days, "warning_threshold_days": d.warning_threshold_days,
            "description": d.description, "is_active": d.is_active,
            "attachments": [
                {"id": a.id, "file_name": a.file_name, "file_url": a.file_url, "description": a.description}
                for a in d.attachments
            ],
        }
        for d in defs
    ]


@router.post("/definitions", status_code=status.HTTP_201_CREATED)
def create_sla_definition(
    name: str,
    stage: str,
    target_days: int,
    warning_threshold_days: int,
    description: str | None = None,
    db: Session = Depends(get_db),
):
    sla_def = SLADefinition(
        name=name, stage=stage, target_days=target_days,
        warning_threshold_days=warning_threshold_days, description=description,
    )
    db.add(sla_def)
    db.commit()
    db.refresh(sla_def)
    return {"id": sla_def.id, "name": sla_def.name}


# --- SLA File Attachments (XLS/XLSX) ---

@router.post("/definitions/{sla_id}/upload-attachment")
async def upload_sla_attachment(
    sla_id: int,
    file: UploadFile = File(...),
    description: str | None = None,
    db: Session = Depends(get_db),
):
    """Upload an SLA document as .xls/.xlsx file."""
    sla_def = db.query(SLADefinition).filter(SLADefinition.id == sla_id).first()
    if sla_def is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SLA Definition not found")
    if not file.filename or not file.filename.endswith((".xls", ".xlsx")):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only .xls and .xlsx files are accepted")

    # In production, upload to S3 and store the URL
    # For now, store a placeholder URL
    content = await file.read()
    file_url = f"/uploads/sla/{sla_id}/{file.filename}"

    attachment = SLAAttachment(
        sla_definition_id=sla_id,
        file_name=file.filename,
        file_url=file_url,
        file_type=file.content_type or "application/vnd.ms-excel",
        file_size_bytes=len(content),
        description=description,
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    return {
        "id": attachment.id,
        "file_name": attachment.file_name,
        "file_url": attachment.file_url,
        "file_size_bytes": attachment.file_size_bytes,
        "message": "SLA attachment uploaded successfully",
    }


@router.get("/definitions/{sla_id}/attachments")
def list_sla_attachments(sla_id: int, db: Session = Depends(get_db)):
    attachments = db.query(SLAAttachment).filter(SLAAttachment.sla_definition_id == sla_id).all()
    return [
        {
            "id": a.id, "file_name": a.file_name, "file_url": a.file_url,
            "file_type": a.file_type, "file_size_bytes": a.file_size_bytes,
            "description": a.description, "created_at": a.created_at.isoformat(),
        }
        for a in attachments
    ]


# --- SLA Tracking ---

@router.get("/tracking", response_model=list[dict])
def list_sla_tracking(
    staffing_request_id: int | None = None,
    status_filter: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(SLATracking)
    if staffing_request_id:
        query = query.filter(SLATracking.staffing_request_id == staffing_request_id)
    if status_filter:
        query = query.filter(SLATracking.status == status_filter)
    records = query.all()
    return [
        {
            "id": r.id, "staffing_request_id": r.staffing_request_id,
            "sla_definition_id": r.sla_definition_id, "status": r.status.value,
            "start_date": r.start_date.isoformat(), "target_date": r.target_date.isoformat(),
            "days_elapsed": r.days_elapsed, "ai_risk_score": r.ai_risk_score,
        }
        for r in records
    ]
