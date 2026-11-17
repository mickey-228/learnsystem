from datetime import date

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.domains.life import schemas, service
from app.shared.db import get_db

router = APIRouter(prefix="/api/habits", tags=["habits"])


@router.get("", response_model=list[schemas.HabitRead])
def list_habits(
    date: date = Query(default_factory=date.today),
    db: Session = Depends(get_db),
) -> list[schemas.HabitRead]:
    return service.list_habits(db, date)


@router.post("", response_model=schemas.HabitRead, status_code=status.HTTP_201_CREATED)
def create_habit(
    payload: schemas.HabitCreate,
    db: Session = Depends(get_db),
) -> schemas.HabitRead:
    return service.create_habit(db, payload)


@router.patch("/{habit_id}", response_model=schemas.HabitRead)
def update_habit(
    habit_id: int,
    payload: schemas.HabitUpdate,
    date: date = Query(default_factory=date.today),
    db: Session = Depends(get_db),
) -> schemas.HabitRead:
    return service.update_habit(db, habit_id, payload, date)


@router.delete("/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_habit(habit_id: int, db: Session = Depends(get_db)) -> None:
    service.delete_habit(db, habit_id)


@router.post("/{habit_id}/toggle", response_model=schemas.HabitRead)
def toggle_habit(
    habit_id: int,
    date: date = Query(default_factory=date.today),
    db: Session = Depends(get_db),
) -> schemas.HabitRead:
    return service.toggle_habit(db, habit_id, date)
