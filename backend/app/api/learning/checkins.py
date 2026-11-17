from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.domains.learning import models, schemas, service
from app.shared.db import get_db

router = APIRouter(prefix="/api/learning/checkins", tags=["learning-checkins"])


@router.get("", response_model=list[schemas.CheckinRead])
def list_checkins(
    on_date: date = Query(alias="date"), db: Session = Depends(get_db)
) -> list[models.LearningCheckin]:
    return service.list_checkins(db, on_date)
