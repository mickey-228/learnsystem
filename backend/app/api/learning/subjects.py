from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domains.learning import models, schemas, service
from app.shared.db import get_db

router = APIRouter(prefix="/api/learning/subjects", tags=["learning-subjects"])


@router.get("", response_model=list[schemas.SubjectRead])
def list_subjects(db: Session = Depends(get_db)) -> list[models.LearningSubject]:
    return list(db.scalars(select(models.LearningSubject).order_by(models.LearningSubject.name)))


@router.post("", response_model=schemas.SubjectRead, status_code=status.HTTP_201_CREATED)
def create_subject(
    payload: schemas.SubjectCreate, db: Session = Depends(get_db)
) -> models.LearningSubject:
    duplicate = db.scalar(
        select(models.LearningSubject).where(models.LearningSubject.name == payload.name)
    )
    if duplicate is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Subject name already exists"
        )
    if payload.goal_id is not None:
        service.get_goal(db, payload.goal_id)

    subject = models.LearningSubject(**payload.model_dump())
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return subject


@router.patch("/{subject_id}", response_model=schemas.SubjectRead)
def update_subject(
    subject_id: int, payload: schemas.SubjectUpdate, db: Session = Depends(get_db)
) -> models.LearningSubject:
    subject = service.get_subject(db, subject_id)
    data = payload.model_dump(exclude_unset=True)

    if "name" in data and data["name"] is not None:
        duplicate = db.scalar(
            select(models.LearningSubject).where(
                models.LearningSubject.name == data["name"],
                models.LearningSubject.id != subject_id,
            )
        )
        if duplicate is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Subject name already exists"
            )
    else:
        data.pop("name", None)

    if "color" in data and data["color"] is None:
        data.pop("color")

    if data.get("goal_id") is not None:
        service.get_goal(db, data["goal_id"])

    for key, value in data.items():
        setattr(subject, key, value)

    db.commit()
    db.refresh(subject)
    return subject


@router.delete("/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subject(subject_id: int, db: Session = Depends(get_db)) -> None:
    subject = service.get_subject(db, subject_id)
    db.delete(subject)
    db.commit()
