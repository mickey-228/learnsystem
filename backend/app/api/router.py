from fastapi import APIRouter

from app.api.knowledge import notes as knowledge_notes
from app.api.knowledge import obsidian
from app.api.learning import checkins, goals, plans, subjects, time_sessions
from app.api.life import budgets, finance, funds, habits, schedule, shopping

api_router = APIRouter()
api_router.include_router(goals.router)
api_router.include_router(subjects.router)
api_router.include_router(plans.router)
api_router.include_router(checkins.router)
api_router.include_router(time_sessions.router)
api_router.include_router(obsidian.router)
api_router.include_router(knowledge_notes.router)
api_router.include_router(budgets.router)
api_router.include_router(shopping.router)
api_router.include_router(funds.router)
api_router.include_router(finance.router)
api_router.include_router(habits.router)
api_router.include_router(schedule.router)
