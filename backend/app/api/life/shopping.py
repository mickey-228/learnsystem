from fastapi import APIRouter, Depends, Path, status
from sqlalchemy.orm import Session

from app.domains.life import models, schemas, service
from app.shared.db import get_db

router = APIRouter(prefix="/api/life", tags=["life-shopping"])


@router.post(
    "/months/{month}/items",
    response_model=schemas.ShoppingItemRead,
    status_code=status.HTTP_201_CREATED,
)
def create_item(
    payload: schemas.ShoppingItemCreate,
    month: str = Path(pattern=service.MONTH_PATTERN),
    db: Session = Depends(get_db),
) -> models.LifeShoppingItem:
    return service.create_item(db, service.parse_month(month), payload)


@router.patch("/items/{item_id}", response_model=schemas.ShoppingItemRead)
def update_item(
    item_id: int,
    payload: schemas.ShoppingItemUpdate,
    db: Session = Depends(get_db),
) -> models.LifeShoppingItem:
    return service.update_item(db, item_id, payload)


@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int, db: Session = Depends(get_db)) -> None:
    service.delete_item(db, item_id)
