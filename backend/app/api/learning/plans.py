from datetime import date

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.domains.learning import models, schemas, service
from app.shared.db import get_db

router = APIRouter(prefix="/api/learning", tags=["learning-plans"])


@router.get("/plans/{plan_date}", response_model=schemas.DayPlanRead)
def get_day_plan(plan_date: date, db: Session = Depends(get_db)) -> schemas.DayPlanRead:
    return service.get_day_plan_read(db, plan_date)


@router.post(
    "/plans/{plan_date}/items",
    response_model=schemas.PlanItemRead,
    status_code=status.HTTP_201_CREATED,
)
def create_plan_item(
    plan_date: date, payload: schemas.PlanItemCreate, db: Session = Depends(get_db)
) -> models.LearningPlanItem:
    return service.create_plan_item(db, plan_date, payload)


@router.patch("/plan-items/{item_id}", response_model=schemas.PlanItemRead)
def update_plan_item(
    item_id: int, payload: schemas.PlanItemUpdate, db: Session = Depends(get_db)
) -> models.LearningPlanItem:
    return service.update_plan_item(db, item_id, payload)


@router.delete("/plan-items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plan_item(item_id: int, db: Session = Depends(get_db)) -> None:
    service.delete_plan_item(db, item_id)


@router.post("/plan-items/{item_id}/complete", response_model=schemas.PlanItemRead)
def complete_plan_item(
    item_id: int, payload: schemas.CompleteItemRequest, db: Session = Depends(get_db)
) -> models.LearningPlanItem:
    return service.complete_plan_item(db, item_id, payload)


@router.post("/plan-items/{item_id}/reopen", response_model=schemas.PlanItemRead)
def reopen_plan_item(item_id: int, db: Session = Depends(get_db)) -> models.LearningPlanItem:
    return service.reopen_plan_item(db, item_id)
