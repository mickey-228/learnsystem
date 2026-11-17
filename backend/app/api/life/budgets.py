from fastapi import APIRouter, Depends, Path
from sqlalchemy.orm import Session

from app.domains.life import models, schemas, service
from app.shared.db import get_db

router = APIRouter(prefix="/api/life", tags=["life-budgets"])


@router.get("/months/{month}", response_model=schemas.MonthRead)
def get_month(
    month: str = Path(pattern=service.MONTH_PATTERN),
    db: Session = Depends(get_db),
) -> schemas.MonthRead:
    return service.get_month_read(db, service.parse_month(month))


@router.put("/months/{month}/budget", response_model=schemas.BudgetRead)
def upsert_budget(
    payload: schemas.BudgetUpsert,
    month: str = Path(pattern=service.MONTH_PATTERN),
    db: Session = Depends(get_db),
) -> models.LifeMonthlyBudget:
    return service.upsert_budget(db, service.parse_month(month), payload)
