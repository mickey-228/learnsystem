"""add life domain v2 (shopping, funds, finance, habits, schedule)

Revision ID: 9c3d2e1a4b58
Revises: 77754bbf87d0
Create Date: 2026-11-10 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9c3d2e1a4b58'
down_revision: Union[str, Sequence[str], None] = '77754bbf87d0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'life_shopping_items',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('month', sa.Date(), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('estimated_price', sa.Numeric(10, 2), nullable=False),
        sa.Column('actual_price', sa.Numeric(10, 2), nullable=True),
        sa.Column('priority', sa.String(length=20), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('channel', sa.String(length=50), nullable=True),
        sa.Column('reason', sa.String(length=200), nullable=True),
        sa.Column('cooling_until', sa.Date(), nullable=True),
        sa.Column('url', sa.Text(), nullable=True),
        sa.Column('note', sa.Text(), nullable=True),
        sa.Column('bought_at', sa.Date(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    with op.batch_alter_table('life_shopping_items', schema=None) as batch_op:
        batch_op.create_index(
            batch_op.f('ix_life_shopping_items_month'), ['month'], unique=False
        )

    # 代买 → 待买：科目/收款语义移除，已买/已收款统一视为已买
    op.execute(
        """
        INSERT INTO life_shopping_items
            (month, name, category, quantity, estimated_price, actual_price,
             priority, status, note, bought_at, created_at, updated_at)
        SELECT
            substr(purchase_date, 1, 7) || '-01',
            item_name,
            '其他',
            quantity,
            unit_price,
            CASE WHEN status IN ('bought', 'settled') THEN amount ELSE 0 END,
            '想要',
            CASE WHEN status = 'planned' THEN 'want' ELSE 'bought' END,
            note,
            CASE WHEN status IN ('bought', 'settled') THEN purchase_date ELSE NULL END,
            created_at,
            updated_at
        FROM life_proxy_purchases
        """
    )

    op.create_table(
        'life_fund_projects',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('target_amount', sa.Numeric(12, 2), nullable=False),
        sa.Column('saved_amount', sa.Numeric(12, 2), nullable=False),
        sa.Column('deadline', sa.Date(), nullable=True),
        sa.Column('monthly_plan', sa.Numeric(10, 2), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('note', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'life_fund_entries',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('note', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['life_fund_projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    with op.batch_alter_table('life_fund_entries', schema=None) as batch_op:
        batch_op.create_index(
            batch_op.f('ix_life_fund_entries_project_id'), ['project_id'], unique=False
        )

    op.create_table(
        'finance_transactions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('type', sa.String(length=20), nullable=False),
        sa.Column('amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('note', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    with op.batch_alter_table('finance_transactions', schema=None) as batch_op:
        batch_op.create_index(
            batch_op.f('ix_finance_transactions_date'), ['date'], unique=False
        )

    op.create_table(
        'habits',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('archived', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'habit_checkins',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('habit_id', sa.Integer(), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['habit_id'], ['habits.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('habit_id', 'date', name='uq_habit_checkins_habit_date'),
    )
    with op.batch_alter_table('habit_checkins', schema=None) as batch_op:
        batch_op.create_index(
            batch_op.f('ix_habit_checkins_habit_id'), ['habit_id'], unique=False
        )
        batch_op.create_index(batch_op.f('ix_habit_checkins_date'), ['date'], unique=False)

    op.create_table(
        'schedule_events',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('start_time', sa.String(length=20), nullable=True),
        sa.Column('end_time', sa.String(length=20), nullable=True),
        sa.Column('location', sa.String(length=200), nullable=True),
        sa.Column('note', sa.Text(), nullable=True),
        sa.Column('done', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    with op.batch_alter_table('schedule_events', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_schedule_events_date'), ['date'], unique=False)

    op.drop_table('life_proxy_purchases')


def downgrade() -> None:
    op.create_table(
        'life_proxy_purchases',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('purchase_date', sa.Date(), nullable=False),
        sa.Column('item_name', sa.String(length=200), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('unit_price', sa.Numeric(10, 2), nullable=False),
        sa.Column('amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('payee', sa.String(length=100), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('note', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    with op.batch_alter_table('life_proxy_purchases', schema=None) as batch_op:
        batch_op.create_index(
            batch_op.f('ix_life_proxy_purchases_purchase_date'),
            ['purchase_date'],
            unique=False,
        )

    with op.batch_alter_table('schedule_events', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_schedule_events_date'))
    op.drop_table('schedule_events')

    with op.batch_alter_table('habit_checkins', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_habit_checkins_date'))
        batch_op.drop_index(batch_op.f('ix_habit_checkins_habit_id'))
    op.drop_table('habit_checkins')
    op.drop_table('habits')

    with op.batch_alter_table('finance_transactions', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_finance_transactions_date'))
    op.drop_table('finance_transactions')

    with op.batch_alter_table('life_fund_entries', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_life_fund_entries_project_id'))
    op.drop_table('life_fund_entries')
    op.drop_table('life_fund_projects')

    with op.batch_alter_table('life_shopping_items', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_life_shopping_items_month'))
    op.drop_table('life_shopping_items')
