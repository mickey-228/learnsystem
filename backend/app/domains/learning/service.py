from datetime import date

from fastapi import HTTPException, status
from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session, joinedload

from app.domains.learning import models, schemas


def _not_found(name: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"{name} not found")


def get_goal(db: Session, goal_id: int) -> models.LearningGoal:
    goal = db.get(models.LearningGoal, goal_id)
    if goal is None:
        raise _not_found("Goal")
    return goal


def get_subject(db: Session, subject_id: int) -> models.LearningSubject:
    subject = db.get(models.LearningSubject, subject_id)
    if subject is None:
        raise _not_found("Subject")
    return subject


def get_or_create_day_plan(db: Session, plan_date: date) -> models.LearningDayPlan:
    plan = db.scalar(
        select(models.LearningDayPlan).where(models.LearningDayPlan.plan_date == plan_date)
    )
    if plan is None:
        plan = models.LearningDayPlan(plan_date=plan_date)
        db.add(plan)
        db.commit()
        db.refresh(plan)
    return plan


def build_summary(items: list[models.LearningPlanItem]) -> schemas.DaySummary:
    total = len(items)
    done = sum(1 for item in items if item.status == "done")
    planned_minutes = sum(item.estimated_minutes for item in items)
    actual_minutes = sum(item.actual_minutes for item in items if item.status == "done")
    return schemas.DaySummary(
        total_items=total,
        done_items=done,
        completion_rate=round(done / total, 4) if total else 0.0,
        planned_minutes=planned_minutes,
        actual_minutes=actual_minutes,
    )


def get_day_plan_read(db: Session, plan_date: date) -> schemas.DayPlanRead:
    plan = get_or_create_day_plan(db, plan_date)
    items = sorted(plan.items, key=lambda item: (item.sort_order, item.id))
    return schemas.DayPlanRead(
        id=plan.id,
        plan_date=plan.plan_date,
        focus=plan.focus,
        notes=plan.notes,
        items=[schemas.PlanItemRead.model_validate(item) for item in items],
        summary=build_summary(items),
    )


def create_plan_item(
    db: Session, plan_date: date, payload: schemas.PlanItemCreate
) -> models.LearningPlanItem:
    plan = get_or_create_day_plan(db, plan_date)
    if payload.subject_id is not None:
        get_subject(db, payload.subject_id)

    max_order = db.scalar(
        select(func.max(models.LearningPlanItem.sort_order)).where(
            models.LearningPlanItem.day_plan_id == plan.id
        )
    )
    item = models.LearningPlanItem(
        day_plan_id=plan.id,
        sort_order=(max_order or 0) + 1,
        **payload.model_dump(),
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def get_plan_item(db: Session, item_id: int) -> models.LearningPlanItem:
    item = db.get(models.LearningPlanItem, item_id)
    if item is None:
        raise _not_found("Plan item")
    return item


def update_plan_item(
    db: Session, item_id: int, payload: schemas.PlanItemUpdate
) -> models.LearningPlanItem:
    item = get_plan_item(db, item_id)
    data = payload.model_dump(exclude_unset=True)

    for required_field in ("title", "estimated_minutes", "priority"):
        if required_field in data and data[required_field] is None:
            data.pop(required_field)

    if "subject_id" in data and data["subject_id"] is not None:
        get_subject(db, data["subject_id"])

    for key, value in data.items():
        setattr(item, key, value)

    db.commit()
    db.refresh(item)
    return item


def delete_plan_item(db: Session, item_id: int) -> None:
    item = get_plan_item(db, item_id)
    db.delete(item)
    db.commit()


def complete_plan_item(
    db: Session, item_id: int, payload: schemas.CompleteItemRequest
) -> models.LearningPlanItem:
    item = get_plan_item(db, item_id)
    if item.status == "done":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Plan item is already done"
        )

    item.status = "done"
    item.actual_minutes = payload.minutes
    item.completed_at = models.utc_now()

    checkin = models.LearningCheckin(
        plan_item_id=item.id,
        date=item.day_plan.plan_date,
        subject_id=item.subject_id,
        minutes=payload.minutes,
        content=payload.content,
        self_rating=payload.self_rating,
    )
    db.add(checkin)
    db.commit()
    db.refresh(item)
    return item


def reopen_plan_item(db: Session, item_id: int) -> models.LearningPlanItem:
    item = get_plan_item(db, item_id)
    item.status = "pending"
    item.actual_minutes = 0
    item.completed_at = None
    db.execute(delete(models.LearningCheckin).where(models.LearningCheckin.plan_item_id == item.id))
    db.commit()
    db.refresh(item)
    return item


def list_checkins(db: Session, on_date: date) -> list[models.LearningCheckin]:
    return list(
        db.scalars(
            select(models.LearningCheckin)
            .where(models.LearningCheckin.date == on_date)
            .order_by(models.LearningCheckin.created_at.desc())
        )
    )


def list_tasks(db: Session, from_date: date, to_date: date) -> list[models.LearningPlanItem]:
    return list(
        db.scalars(
            select(models.LearningPlanItem)
            .join(models.LearningDayPlan)
            .where(
                models.LearningDayPlan.plan_date >= from_date,
                models.LearningDayPlan.plan_date <= to_date,
            )
            .options(joinedload(models.LearningPlanItem.day_plan))
            .order_by(
                models.LearningDayPlan.plan_date,
                models.LearningPlanItem.sort_order,
                models.LearningPlanItem.id,
            )
        )
    )


def list_time_sessions(db: Session, on_date: date) -> list[models.LearningTimeSession]:
    return list(
        db.scalars(
            select(models.LearningTimeSession)
            .where(func.date(models.LearningTimeSession.started_at) == on_date)
            .order_by(models.LearningTimeSession.started_at.desc())
        )
    )


def create_time_session(
    db: Session, payload: schemas.TimeSessionCreate
) -> models.LearningTimeSession:
    if payload.plan_item_id is not None:
        get_plan_item(db, payload.plan_item_id)
    if payload.goal_id is not None:
        get_goal(db, payload.goal_id)
    if payload.ended_at < payload.started_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ended_at must be after started_at",
        )

    session = models.LearningTimeSession(**payload.model_dump())
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def delete_time_session(db: Session, session_id: int) -> None:
    session = db.get(models.LearningTimeSession, session_id)
    if session is None:
        raise _not_found("Time session")
    db.delete(session)
    db.commit()
