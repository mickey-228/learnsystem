from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.domains.knowledge import models, schemas, service
from app.shared.db import get_db

router = APIRouter(prefix="/api/knowledge/obsidian", tags=["knowledge-obsidian"])


@router.get("/status", response_model=schemas.VaultStatus)
def get_status(db: Session = Depends(get_db)) -> schemas.VaultStatus:
    return service.get_status(db)


@router.put("/config", response_model=schemas.VaultRead)
def upsert_config(
    payload: schemas.VaultConfig,
    db: Session = Depends(get_db),
) -> models.KnowledgeVault:
    return service.upsert_vault(db, payload)


@router.post("/sync", response_model=schemas.SyncResult)
def sync_notes(db: Session = Depends(get_db)) -> schemas.SyncResult:
    vault = service.get_vault(db)
    if vault is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="vault is not configured",
        )
    return service.scan_vault(db, vault)
