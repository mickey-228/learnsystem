from datetime import date

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.domains.life import models, schemas, service
from app.shared.db import get_db

router = APIRouter(prefix="/api/schedule", tags=["schedule"])


@router.get("/events", response_model=list[schemas.EventRead])
def list_events(
    from_date: date = Query(default_factory=date.today),
    to_date: date = Query(default_factory=date.today),
    db: Session = Depends(get_db),
) -> list[models.ScheduleEvent]:
    return service.list_events(db, from_date, to_date)


@router.post("/events", response_model=schemas.EventRead, status_code=status.HTTP_201_CREATED)
def create_event(
    payload: schemas.EventCreate,
    db: Session = Depends(get_db),
) -> models.ScheduleEvent:
    return service.create_event(db, payload)


@router.patch("/events/{event_id}", response_model=schemas.EventRead)
def update_event(
    event_id: int,
    payload: schemas.EventUpdate,
    db: Session = Depends(get_db),
) -> models.ScheduleEvent:
    return service.update_event(db, event_id, payload)


@router.delete("/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event_id: int, db: Session = Depends(get_db)) -> None:
    service.delete_event(db, event_id)
