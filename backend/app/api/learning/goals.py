from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domains.learning import models, schemas, service
from app.shared.db import get_db

router = APIRouter(prefix="/api/learning/goals", tags=["learning-goals"])


@router.get("", response_model=list[schemas.GoalRead])
def list_goals(
    status_filter: str | None = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
) -> list[models.LearningGoal]:
    stmt = select(models.LearningGoal).order_by(models.LearningGoal.created_at.desc())
    if status_filter is not None:
        stmt = stmt.where(models.LearningGoal.status == status_filter)
    return list(db.scalars(stmt))


@router.post("", response_model=schemas.GoalRead, status_code=status.HTTP_201_CREATED)
def create_goal(payload: schemas.GoalCreate, db: Session = Depends(get_db)) -> models.LearningGoal:
    goal = models.LearningGoal(**payload.model_dump())
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


@router.patch("/{goal_id}", response_model=schemas.GoalRead)
def update_goal(
    goal_id: int, payload: schemas.GoalUpdate, db: Session = Depends(get_db)
) -> models.LearningGoal:
    goal = service.get_goal(db, goal_id)
    data = payload.model_dump(exclude_unset=True)

    for required_field in ("title", "start_date"):
        if required_field in data and data[required_field] is None:
            data.pop(required_field)

    for key, value in data.items():
        setattr(goal, key, value)

    db.commit()
    db.refresh(goal)
    return goal


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(goal_id: int, db: Session = Depends(get_db)) -> None:
    goal = service.get_goal(db, goal_id)
    db.delete(goal)
    db.commit()


@router.get("/{goal_id}", response_model=schemas.GoalRead)
def get_goal(goal_id: int, db: Session = Depends(get_db)) -> models.LearningGoal:
    return service.get_goal(db, goal_id)
