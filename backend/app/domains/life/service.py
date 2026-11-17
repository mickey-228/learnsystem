from datetime import date, timedelta

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domains.life import models, schemas

MONTH_PATTERN = r"^\d{4}-(0[1-9]|1[0-2])$"


def _not_found(name: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"{name} not found")


def _bad_request(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


def _money(value: float) -> float:
    return round(float(value), 2)


def parse_month(value: str) -> date:
    year, month = value.split("-")
    return date(int(year), int(month), 1)


def month_bounds(month: date) -> tuple[date, date]:
    start = month.replace(day=1)
    end = date(month.year + month.month // 12, month.month % 12 + 1, 1)
    return start, end


# ── 预算 ─────────────────────────────────────────────


def get_budget(db: Session, month: date) -> models.LifeMonthlyBudget | None:
    return db.scalar(
        select(models.LifeMonthlyBudget).where(models.LifeMonthlyBudget.month == month)
    )


def upsert_budget(
    db: Session, month: date, payload: schemas.BudgetUpsert
) -> models.LifeMonthlyBudget:
    budget = get_budget(db, month)
    if budget is None:
        budget = models.LifeMonthlyBudget(
            month=month, amount=_money(payload.amount), note=payload.note
        )
        db.add(budget)
    else:
        budget.amount = _money(payload.amount)
        budget.note = payload.note
    db.commit()
    db.refresh(budget)
    return budget


# ── 待买 ─────────────────────────────────────────────


def list_month_items(db: Session, month: date) -> list[models.LifeShoppingItem]:
    return list(
        db.scalars(
            select(models.LifeShoppingItem)
            .where(models.LifeShoppingItem.month == month)
            .order_by(models.LifeShoppingItem.status.desc(), models.LifeShoppingItem.id.desc())
        )
    )


def build_month_summary(
    budget: models.LifeMonthlyBudget | None, items: list[models.LifeShoppingItem]
) -> schemas.MonthSummary:
    counts = schemas.StatusCounts()
    spent = 0.0
    want_amount = 0.0

    for item in items:
        if item.status == "want":
            counts.want += 1
            want_amount += float(item.estimated_price) * item.quantity
        elif item.status == "bought":
            counts.bought += 1
            spent += float(item.actual_price or 0)
        elif item.status == "dropped":
            counts.dropped += 1

    budget_amount = float(budget.amount) if budget is not None else None
    return schemas.MonthSummary(
        budget_amount=budget_amount,
        spent_amount=round(spent, 2),
        want_count=counts.want,
        want_amount=round(want_amount, 2),
        bought_count=counts.bought,
        remaining_amount=(round(budget_amount - spent, 2) if budget_amount is not None else None),
        usage_rate=round(spent / budget_amount, 4) if budget_amount else None,
        counts=counts,
    )


def get_month_read(db: Session, month: date) -> schemas.MonthRead:
    start = month.replace(day=1)
    budget = get_budget(db, start)
    items = list_month_items(db, start)
    return schemas.MonthRead(
        month=start,
        budget=schemas.BudgetRead.model_validate(budget) if budget is not None else None,
        items=[schemas.ShoppingItemRead.model_validate(item) for item in items],
        summary=build_month_summary(budget, items),
    )


def create_item(
    db: Session, month: date, payload: schemas.ShoppingItemCreate
) -> models.LifeShoppingItem:
    if payload.status == "bought" and payload.actual_price is None:
        raise _bad_request("标记已买时必须填写实际价格")
    item = models.LifeShoppingItem(
        **payload.model_dump(exclude={"estimated_price", "actual_price"}),
        month=month.replace(day=1),
        estimated_price=_money(payload.estimated_price),
        actual_price=_money(payload.actual_price) if payload.actual_price is not None else None,
        bought_at=date.today() if payload.status == "bought" else None,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def get_item(db: Session, item_id: int) -> models.LifeShoppingItem:
    item = db.get(models.LifeShoppingItem, item_id)
    if item is None:
        raise _not_found("Shopping item")
    return item


def update_item(
    db: Session, item_id: int, payload: schemas.ShoppingItemUpdate
) -> models.LifeShoppingItem:
    item = get_item(db, item_id)
    data = payload.model_dump(exclude_unset=True)

    new_status = data.get("status", item.status)
    actual = data.get("actual_price", float(item.actual_price) if item.actual_price else None)
    if new_status == "bought" and actual is None:
        raise _bad_request("标记已买时必须填写实际价格")

    for key, value in data.items():
        if key == "actual_price" and value is not None:
            value = _money(value)
        setattr(item, key, value)

    if item.status == "bought":
        if item.bought_at is None:
            item.bought_at = date.today()
    else:
        item.bought_at = None
        if item.status != "bought":
            item.actual_price = None

    db.commit()
    db.refresh(item)
    return item


def delete_item(db: Session, item_id: int) -> None:
    item = get_item(db, item_id)
    db.delete(item)
    db.commit()


# ── 资金项目 ─────────────────────────────────────────


def _fund_read(fund: models.LifeFundProject) -> schemas.FundRead:
    target = float(fund.target_amount)
    saved = float(fund.saved_amount)
    return schemas.FundRead(
        id=fund.id,
        name=fund.name,
        target_amount=target,
        saved_amount=saved,
        deadline=fund.deadline,
        monthly_plan=float(fund.monthly_plan),
        category=fund.category,
        status=fund.status,
        note=fund.note,
        progress=round(saved / target, 4) if target else 0.0,
        remaining_amount=round(target - saved, 2),
    )


def list_funds(db: Session) -> list[schemas.FundRead]:
    funds = list(db.scalars(select(models.LifeFundProject).order_by(models.LifeFundProject.id)))
    return [_fund_read(fund) for fund in funds]


def create_fund(db: Session, payload: schemas.FundCreate) -> schemas.FundRead:
    fund = models.LifeFundProject(
        name=payload.name,
        target_amount=_money(payload.target_amount),
        deadline=payload.deadline,
        monthly_plan=_money(payload.monthly_plan),
        category=payload.category,
        note=payload.note,
    )
    db.add(fund)
    db.commit()
    db.refresh(fund)
    return _fund_read(fund)


def get_fund_model(db: Session, fund_id: int) -> models.LifeFundProject:
    fund = db.get(models.LifeFundProject, fund_id)
    if fund is None:
        raise _not_found("Fund project")
    return fund


def update_fund(db: Session, fund_id: int, payload: schemas.FundUpdate) -> schemas.FundRead:
    fund = get_fund_model(db, fund_id)
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        if key in ("target_amount", "monthly_plan") and value is not None:
            value = _money(value)
        setattr(fund, key, value)
    db.commit()
    db.refresh(fund)
    return _fund_read(fund)


def delete_fund(db: Session, fund_id: int) -> None:
    fund = get_fund_model(db, fund_id)
    db.delete(fund)
    db.commit()


def add_fund_entry(
    db: Session, fund_id: int, payload: schemas.FundEntryCreate
) -> schemas.FundEntryRead:
    fund = get_fund_model(db, fund_id)
    entry = models.LifeFundEntry(
        project_id=fund.id,
        date=payload.date,
        amount=_money(payload.amount),
        note=payload.note,
    )
    db.add(entry)
    fund.saved_amount = _money(float(fund.saved_amount) + float(entry.amount))
    if fund.status == "active" and fund.saved_amount >= fund.target_amount:
        fund.status = "done"
    db.commit()
    db.refresh(entry)
    return schemas.FundEntryRead.model_validate(entry)


# ── 财务 ─────────────────────────────────────────────


def list_transactions(db: Session, month: date) -> list[models.FinanceTransaction]:
    start, end = month_bounds(month)
    return list(
        db.scalars(
            select(models.FinanceTransaction)
            .where(
                models.FinanceTransaction.date >= start,
                models.FinanceTransaction.date < end,
            )
            .order_by(models.FinanceTransaction.date.desc(), models.FinanceTransaction.id.desc())
        )
    )


def create_transaction(
    db: Session, payload: schemas.FinanceTransactionCreate
) -> models.FinanceTransaction:
    transaction = models.FinanceTransaction(
        **payload.model_dump(exclude={"amount"}), amount=_money(payload.amount)
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


def get_transaction(db: Session, transaction_id: int) -> models.FinanceTransaction:
    transaction = db.get(models.FinanceTransaction, transaction_id)
    if transaction is None:
        raise _not_found("Transaction")
    return transaction


def delete_transaction(db: Session, transaction_id: int) -> None:
    transaction = get_transaction(db, transaction_id)
    db.delete(transaction)
    db.commit()


def finance_summary(db: Session, month: date) -> schemas.FinanceSummary:
    start, end = month_bounds(month)
    transactions = list(
        db.scalars(
            select(models.FinanceTransaction).where(
                models.FinanceTransaction.date >= start,
                models.FinanceTransaction.date < end,
            )
        )
    )
    income = sum(float(t.amount) for t in transactions if t.type == "income")
    expense = sum(float(t.amount) for t in transactions if t.type == "expense")
    by_category: dict[str, float] = {}
    for transaction in transactions:
        if transaction.type == "expense":
            by_category[transaction.category] = by_category.get(transaction.category, 0) + float(
                transaction.amount
            )
    categories = [
        schemas.CategoryAmount(
            category=category,
            amount=round(amount, 2),
            pct=round(amount / expense, 4) if expense else 0.0,
        )
        for category, amount in sorted(by_category.items(), key=lambda kv: -kv[1])
    ]
    return schemas.FinanceSummary(
        month=start,
        income=round(income, 2),
        expense=round(expense, 2),
        balance=round(income - expense, 2),
        by_category=categories,
    )


# ── 习惯 ─────────────────────────────────────────────


def _habit_dates(db: Session, habit_id: int) -> set[date]:
    return set(
        db.scalars(select(models.HabitCheckin.date).where(models.HabitCheckin.habit_id == habit_id))
    )


def _habit_streak(dates: set[date], on_date: date) -> int:
    streak = 0
    cursor = on_date if on_date in dates else on_date - timedelta(days=1)
    while cursor in dates:
        streak += 1
        cursor -= timedelta(days=1)
    return streak


def _habit_read(db: Session, habit: models.Habit, on_date: date) -> schemas.HabitRead:
    dates = _habit_dates(db, habit.id)
    return schemas.HabitRead(
        id=habit.id,
        name=habit.name,
        archived=habit.archived,
        done_today=on_date in dates,
        streak=_habit_streak(dates, on_date),
    )


def list_habits(db: Session, on_date: date) -> list[schemas.HabitRead]:
    habits = list(
        db.scalars(
            select(models.Habit).where(models.Habit.archived.is_(False)).order_by(models.Habit.id)
        )
    )
    return [_habit_read(db, habit, on_date) for habit in habits]


def create_habit(db: Session, payload: schemas.HabitCreate) -> schemas.HabitRead:
    habit = models.Habit(name=payload.name)
    db.add(habit)
    db.commit()
    db.refresh(habit)
    return _habit_read(db, habit, date.today())


def get_habit_model(db: Session, habit_id: int) -> models.Habit:
    habit = db.get(models.Habit, habit_id)
    if habit is None:
        raise _not_found("Habit")
    return habit


def update_habit(
    db: Session, habit_id: int, payload: schemas.HabitUpdate, on_date: date
) -> schemas.HabitRead:
    habit = get_habit_model(db, habit_id)
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(habit, key, value)
    db.commit()
    db.refresh(habit)
    return _habit_read(db, habit, on_date)


def delete_habit(db: Session, habit_id: int) -> None:
    habit = get_habit_model(db, habit_id)
    db.delete(habit)
    db.commit()


def toggle_habit(db: Session, habit_id: int, on_date: date) -> schemas.HabitRead:
    habit = get_habit_model(db, habit_id)
    existing = db.scalar(
        select(models.HabitCheckin).where(
            models.HabitCheckin.habit_id == habit_id,
            models.HabitCheckin.date == on_date,
        )
    )
    if existing is not None:
        db.delete(existing)
    else:
        db.add(models.HabitCheckin(habit_id=habit_id, date=on_date))
    db.commit()
    db.refresh(habit)
    return _habit_read(db, habit, on_date)


# ── 日程 ─────────────────────────────────────────────


def list_events(db: Session, from_date: date, to_date: date) -> list[models.ScheduleEvent]:
    return list(
        db.scalars(
            select(models.ScheduleEvent)
            .where(
                models.ScheduleEvent.date >= from_date,
                models.ScheduleEvent.date <= to_date,
            )
            .order_by(models.ScheduleEvent.date, models.ScheduleEvent.start_time)
        )
    )


def _validate_event_times(start_time: str | None, end_time: str | None) -> None:
    if start_time and end_time and end_time <= start_time:
        raise _bad_request("结束时间必须晚于开始时间")


def create_event(db: Session, payload: schemas.EventCreate) -> models.ScheduleEvent:
    _validate_event_times(payload.start_time, payload.end_time)
    event = models.ScheduleEvent(**payload.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def get_event(db: Session, event_id: int) -> models.ScheduleEvent:
    event = db.get(models.ScheduleEvent, event_id)
    if event is None:
        raise _not_found("Event")
    return event


def update_event(db: Session, event_id: int, payload: schemas.EventUpdate) -> models.ScheduleEvent:
    event = get_event(db, event_id)
    data = payload.model_dump(exclude_unset=True)
    _validate_event_times(
        data.get("start_time", event.start_time), data.get("end_time", event.end_time)
    )
    for key, value in data.items():
        setattr(event, key, value)
    db.commit()
    db.refresh(event)
    return event


def delete_event(db: Session, event_id: int) -> None:
    event = get_event(db, event_id)
    db.delete(event)
    db.commit()
