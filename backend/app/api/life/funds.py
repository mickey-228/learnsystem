from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.domains.life import models, schemas, service
from app.shared.db import get_db

router = APIRouter(prefix="/api/life/funds", tags=["life-funds"])


@router.get("", response_model=list[schemas.FundRead])
def list_funds(db: Session = Depends(get_db)) -> list[schemas.FundRead]:
    return service.list_funds(db)


@router.post("", response_model=schemas.FundRead, status_code=status.HTTP_201_CREATED)
def create_fund(
    payload: schemas.FundCreate,
    db: Session = Depends(get_db),
) -> schemas.FundRead:
    return service.create_fund(db, payload)


@router.patch("/{fund_id}", response_model=schemas.FundRead)
def update_fund(
    fund_id: int,
    payload: schemas.FundUpdate,
    db: Session = Depends(get_db),
) -> schemas.FundRead:
    return service.update_fund(db, fund_id, payload)


@router.delete("/{fund_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_fund(fund_id: int, db: Session = Depends(get_db)) -> None:
    service.delete_fund(db, fund_id)


@router.post(
    "/{fund_id}/entries",
    response_model=schemas.FundEntryRead,
    status_code=status.HTTP_201_CREATED,
)
def add_fund_entry(
    fund_id: int,
    payload: schemas.FundEntryCreate,
    db: Session = Depends(get_db),
) -> models.LifeFundEntry:
    return service.add_fund_entry(db, fund_id, payload)
