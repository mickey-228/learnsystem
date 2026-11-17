from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.domains.learning import models, schemas, service
from app.shared.db import get_db

router = APIRouter(prefix="/api/learning", tags=["learning-time"])


@router.get("/tasks", response_model=list[schemas.TaskRead])
def list_tasks(
    from_date: date,
    to_date: date,
    db: Session = Depends(get_db),
) -> list[models.LearningPlanItem]:
    if from_date > to_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="from_date must be before or equal to to_date",
        )
    return service.list_tasks(db, from_date, to_date)


@router.get("/time-sessions", response_model=list[schemas.TimeSessionRead])
def list_time_sessions(
    date: date,
    db: Session = Depends(get_db),
) -> list[models.LearningTimeSession]:
    return service.list_time_sessions(db, date)


@router.post(
    "/time-sessions",
    response_model=schemas.TimeSessionRead,
    status_code=status.HTTP_201_CREATED,
)
def create_time_session(
    payload: schemas.TimeSessionCreate,
    db: Session = Depends(get_db),
) -> models.LearningTimeSession:
    return service.create_time_session(db, payload)


@router.delete("/time-sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_time_session(session_id: int, db: Session = Depends(get_db)) -> None:
    service.delete_time_session(db, session_id)
