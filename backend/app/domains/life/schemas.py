from datetime import date
from datetime import date as Date

from pydantic import BaseModel, ConfigDict, Field

STATUS_PATTERN = "^(want|bought|dropped)$"
PRIORITY_PATTERN = "^(必需|想要|观望)$"
MONEY_PATTERN = "^(income|expense)$"


class BudgetUpsert(BaseModel):
    amount: float = Field(ge=0)
    note: str | None = None


class BudgetRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    amount: float
    note: str | None


class ShoppingItemCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    category: str = Field(default="其他", max_length=50)
    quantity: int = Field(default=1, ge=1)
    estimated_price: float = Field(default=0, ge=0)
    actual_price: float | None = Field(default=None, ge=0)
    priority: str = Field(default="想要", max_length=20)
    status: str = Field(default="want", pattern=STATUS_PATTERN)
    channel: str | None = Field(default=None, max_length=50)
    reason: str | None = Field(default=None, max_length=200)
    cooling_until: date | None = None
    url: str | None = None
    note: str | None = None


class ShoppingItemUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    category: str | None = Field(default=None, max_length=50)
    quantity: int | None = Field(default=None, ge=1)
    estimated_price: float | None = Field(default=None, ge=0)
    actual_price: float | None = Field(default=None, ge=0)
    priority: str | None = Field(default=None, max_length=20)
    status: str | None = Field(default=None, pattern=STATUS_PATTERN)
    channel: str | None = Field(default=None, max_length=50)
    reason: str | None = Field(default=None, max_length=200)
    cooling_until: date | None = None
    url: str | None = None
    note: str | None = None
    bought_at: date | None = None


class ShoppingItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    month: date
    name: str
    category: str
    quantity: int
    estimated_price: float
    actual_price: float | None
    priority: str
    status: str
    channel: str | None
    reason: str | None
    cooling_until: date | None
    url: str | None
    note: str | None
    bought_at: date | None


class StatusCounts(BaseModel):
    want: int = 0
    bought: int = 0
    dropped: int = 0


class MonthSummary(BaseModel):
    budget_amount: float | None
    spent_amount: float
    want_count: int
    want_amount: float
    bought_count: int
    remaining_amount: float | None
    usage_rate: float | None
    counts: StatusCounts


class MonthRead(BaseModel):
    month: date
    budget: BudgetRead | None
    items: list[ShoppingItemRead]
    summary: MonthSummary


class FundEntryCreate(BaseModel):
    date: Date = Field(default_factory=Date.today)
    amount: float = Field(gt=0)
    note: str | None = None


class FundEntryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    date: date
    amount: float
    note: str | None


class FundCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    target_amount: float = Field(gt=0)
    deadline: date | None = None
    monthly_plan: float = Field(default=0, ge=0)
    category: str = Field(default="其他", max_length=50)
    note: str | None = None


class FundUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    target_amount: float | None = Field(default=None, gt=0)
    deadline: date | None = None
    monthly_plan: float | None = Field(default=None, ge=0)
    category: str | None = Field(default=None, max_length=50)
    status: str | None = Field(default=None, pattern="^(active|done|paused)$")
    note: str | None = None


class FundRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    target_amount: float
    saved_amount: float
    deadline: date | None
    monthly_plan: float
    category: str
    status: str
    note: str | None
    progress: float
    remaining_amount: float


class FundEntryListRead(FundEntryRead):
    pass


class FinanceTransactionCreate(BaseModel):
    date: Date = Field(default_factory=Date.today)
    type: str = Field(default="expense", pattern=MONEY_PATTERN)
    amount: float = Field(gt=0)
    category: str = Field(default="其他", max_length=50)
    note: str | None = None


class FinanceTransactionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    date: date
    type: str
    amount: float
    category: str
    note: str | None


class CategoryAmount(BaseModel):
    category: str
    amount: float
    pct: float


class FinanceSummary(BaseModel):
    month: date
    income: float
    expense: float
    balance: float
    by_category: list[CategoryAmount]


class HabitCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class HabitUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    archived: bool | None = None


class HabitRead(BaseModel):
    id: int
    name: str
    archived: bool
    done_today: bool
    streak: int


class EventCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    date: date
    start_time: str | None = Field(default=None, max_length=20)
    end_time: str | None = Field(default=None, max_length=20)
    location: str | None = Field(default=None, max_length=200)
    note: str | None = None


class EventUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    date: Date | None = None
    start_time: str | None = Field(default=None, max_length=20)
    end_time: str | None = Field(default=None, max_length=20)
    location: str | None = Field(default=None, max_length=200)
    note: str | None = None
    done: bool | None = None


class EventRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    date: date
    start_time: str | None
    end_time: str | None
    location: str | None
    note: str | None
    done: bool
