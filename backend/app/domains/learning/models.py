from datetime import UTC, date, datetime, time

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String, Text, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.db import Base


def utc_now() -> datetime:
    return datetime.now(UTC)


class LearningGoal(Base):
    __tablename__ = "learning_goals"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, default=None)
    target_value: Mapped[float | None] = mapped_column(Float, default=None)
    target_unit: Mapped[str | None] = mapped_column(String(50), default=None)
    start_date: Mapped[date] = mapped_column(Date, default=date.today)
    target_date: Mapped[date | None] = mapped_column(Date, default=None)
    status: Mapped[str] = mapped_column(String(20), default="active")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now
    )

    subjects: Mapped[list["LearningSubject"]] = relationship(back_populates="goal")


class LearningSubject(Base):
    __tablename__ = "learning_subjects"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    color: Mapped[str] = mapped_column(String(20), default="#6366f1")
    goal_id: Mapped[int | None] = mapped_column(
        ForeignKey("learning_goals.id", ondelete="SET NULL"), default=None
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    goal: Mapped[LearningGoal | None] = relationship(back_populates="subjects")
    plan_items: Mapped[list["LearningPlanItem"]] = relationship(back_populates="subject")


class LearningDayPlan(Base):
    __tablename__ = "learning_day_plans"

    id: Mapped[int] = mapped_column(primary_key=True)
    plan_date: Mapped[date] = mapped_column(Date, unique=True, index=True)
    focus: Mapped[str | None] = mapped_column(String(300), default=None)
    notes: Mapped[str | None] = mapped_column(Text, default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now
    )

    items: Mapped[list["LearningPlanItem"]] = relationship(
        back_populates="day_plan",
        cascade="all, delete-orphan",
        order_by="LearningPlanItem.sort_order, LearningPlanItem.id",
    )


class LearningPlanItem(Base):
    __tablename__ = "learning_plan_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    day_plan_id: Mapped[int] = mapped_column(
        ForeignKey("learning_day_plans.id", ondelete="CASCADE"), index=True
    )
    subject_id: Mapped[int | None] = mapped_column(
        ForeignKey("learning_subjects.id", ondelete="SET NULL"), default=None
    )
    title: Mapped[str] = mapped_column(String(300))
    estimated_minutes: Mapped[int] = mapped_column(Integer, default=25)
    priority: Mapped[int] = mapped_column(Integer, default=2)
    scheduled_start: Mapped[time | None] = mapped_column(Time, default=None)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    actual_minutes: Mapped[int] = mapped_column(Integer, default=0)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    day_plan: Mapped[LearningDayPlan] = relationship(back_populates="items")
    subject: Mapped[LearningSubject | None] = relationship(back_populates="plan_items")
    checkins: Mapped[list["LearningCheckin"]] = relationship(back_populates="plan_item")

    @property
    def subject_name(self) -> str | None:
        return self.subject.name if self.subject else None

    @property
    def plan_date(self) -> date:
        return self.day_plan.plan_date


class LearningCheckin(Base):
    __tablename__ = "learning_checkins"

    id: Mapped[int] = mapped_column(primary_key=True)
    plan_item_id: Mapped[int | None] = mapped_column(
        ForeignKey("learning_plan_items.id", ondelete="SET NULL"), default=None, index=True
    )
    date: Mapped[date] = mapped_column(Date, index=True)
    subject_id: Mapped[int | None] = mapped_column(
        ForeignKey("learning_subjects.id", ondelete="SET NULL"), default=None
    )
    minutes: Mapped[int] = mapped_column(Integer)
    content: Mapped[str | None] = mapped_column(Text, default=None)
    self_rating: Mapped[int | None] = mapped_column(Integer, default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    plan_item: Mapped[LearningPlanItem | None] = relationship(back_populates="checkins")
    subject: Mapped[LearningSubject | None] = relationship()


class LearningTimeSession(Base):
    __tablename__ = "learning_time_sessions"

    id: Mapped[int] = mapped_column(primary_key=True)
    plan_item_id: Mapped[int | None] = mapped_column(
        ForeignKey("learning_plan_items.id", ondelete="SET NULL"), default=None, index=True
    )
    goal_id: Mapped[int | None] = mapped_column(
        ForeignKey("learning_goals.id", ondelete="SET NULL"), default=None, index=True
    )
    task_title: Mapped[str | None] = mapped_column(String(300), default=None)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    ended_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    minutes: Mapped[int] = mapped_column(Integer)
    mode: Mapped[str] = mapped_column(String(20), default="focus")
    source: Mapped[str] = mapped_column(String(20), default="pomodoro")
    note: Mapped[str | None] = mapped_column(Text, default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

