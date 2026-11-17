from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.domains.knowledge import models, schemas, service
from app.shared.db import get_db

router = APIRouter(prefix="/api/knowledge", tags=["knowledge-notes"])


@router.get("/notes", response_model=list[schemas.NoteRead])
def list_notes(
    tag: str | None = Query(default=None),
    q: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> list[models.KnowledgeNote]:
    return service.list_notes(db, tag=tag, query=q)
