from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.domains.life import models, schemas, service
from app.shared.db import get_db

router = APIRouter(prefix="/api/finance", tags=["finance"])


@router.get("/transactions", response_model=list[schemas.FinanceTransactionRead])
def list_transactions(
    month: str,
    db: Session = Depends(get_db),
) -> list[models.FinanceTransaction]:
    return service.list_transactions(db, service.parse_month(month))


@router.post(
    "/transactions",
    response_model=schemas.FinanceTransactionRead,
    status_code=status.HTTP_201_CREATED,
)
def create_transaction(
    payload: schemas.FinanceTransactionCreate,
    db: Session = Depends(get_db),
) -> models.FinanceTransaction:
    return service.create_transaction(db, payload)


@router.delete("/transactions/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(transaction_id: int, db: Session = Depends(get_db)) -> None:
    service.delete_transaction(db, transaction_id)


@router.get("/summary", response_model=schemas.FinanceSummary)
def finance_summary(
    month: str,
    db: Session = Depends(get_db),
) -> schemas.FinanceSummary:
    return service.finance_summary(db, service.parse_month(month))
