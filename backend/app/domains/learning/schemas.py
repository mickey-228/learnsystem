from datetime import date, datetime, time

from pydantic import BaseModel, ConfigDict, Field


class GoalCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    target_value: float | None = Field(default=None, ge=0)
    target_unit: str | None = Field(default=None, max_length=50)
    start_date: date = Field(default_factory=date.today)
    target_date: date | None = None


class GoalUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    target_value: float | None = Field(default=None, ge=0)
    target_unit: str | None = Field(default=None, max_length=50)
    start_date: date | None = None
    target_date: date | None = None
    status: str | None = Field(default=None, pattern="^(active|paused|completed|archived)$")


class GoalRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None
    target_value: float | None
    target_unit: str | None
    start_date: date
    target_date: date | None
    status: str
    created_at: datetime


class SubjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    color: str = Field(default="#6366f1", max_length=20)
    goal_id: int | None = None


class SubjectUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    color: str | None = Field(default=None, max_length=20)
    goal_id: int | None = None


class SubjectRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    color: str
    goal_id: int | None


class PlanItemCreate(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    subject_id: int | None = None
    estimated_minutes: int = Field(default=25, ge=1, le=1440)
    priority: int = Field(default=2, ge=1, le=3)
    scheduled_start: time | None = None


class PlanItemUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=300)
    subject_id: int | None = None
    estimated_minutes: int | None = Field(default=None, ge=1, le=1440)
    priority: int | None = Field(default=None, ge=1, le=3)
    scheduled_start: time | None = None


class PlanItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    subject_id: int | None
    subject_name: str | None
    estimated_minutes: int
    priority: int
    scheduled_start: time | None
    status: str
    actual_minutes: int
    sort_order: int
    completed_at: datetime | None


class CompleteItemRequest(BaseModel):
    minutes: int = Field(ge=1, le=1440)
    content: str | None = None
    self_rating: int | None = Field(default=None, ge=1, le=5)


class DaySummary(BaseModel):
    total_items: int
    done_items: int
    completion_rate: float
    planned_minutes: int
    actual_minutes: int


class DayPlanRead(BaseModel):
    id: int
    plan_date: date
    focus: str | None
    notes: str | None
    items: list[PlanItemRead]
    summary: DaySummary


class CheckinRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    plan_item_id: int | None
    date: date
    subject_id: int | None
    minutes: int
    content: str | None
    self_rating: int | None
    created_at: datetime


class TaskRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    plan_date: date
    title: str
    estimated_minutes: int
    priority: int
    status: str
    actual_minutes: int
    completed_at: datetime | None


class TimeSessionCreate(BaseModel):
    plan_item_id: int | None = None
    goal_id: int | None = None
    task_title: str | None = Field(default=None, max_length=300)
    started_at: datetime
    ended_at: datetime
    minutes: int = Field(ge=1, le=1440)
    mode: str = Field(default="focus", pattern="^(focus|short_break|long_break)$")
    source: str = Field(default="pomodoro", pattern="^(pomodoro|manual)$")
    note: str | None = None


class TimeSessionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    plan_item_id: int | None
    goal_id: int | None
    task_title: str | None
    started_at: datetime
    ended_at: datetime
    minutes: int
    mode: str
    source: str
    note: str | None
    created_at: datetime
