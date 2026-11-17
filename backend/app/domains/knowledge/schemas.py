from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class VaultConfig(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    path: str = Field(min_length=1, max_length=500)
    sync_mode: str = Field(default="folder", pattern="^(folder|rest_api)$")


class VaultRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    path: str
    sync_mode: str
    last_synced_at: datetime | None
    enabled: bool


class NoteRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    vault_id: int
    path: str
    title: str
    tags: list[str]
    modified_at: datetime
    indexed_at: datetime


class VaultStatus(BaseModel):
    vault: VaultRead | None
    note_count: int
    last_synced_at: datetime | None


class SyncResult(BaseModel):
    scanned: int
    created: int
    updated: int
    removed: int
    total: int
