import { apiRequest } from './client'

export type Vault = {
  id: number
  name: string
  path: string
  sync_mode: 'folder' | 'rest_api'
  last_synced_at: string | null
  enabled: boolean
}

export type VaultStatus = {
  vault: Vault | null
  note_count: number
  last_synced_at: string | null
}

export type VaultConfig = {
  name: string
  path: string
  sync_mode?: 'folder' | 'rest_api'
}

export type Note = {
  id: number
  vault_id: number
  path: string
  title: string
  tags: string[]
  modified_at: string
  indexed_at: string
}

export type SyncResult = {
  scanned: number
  created: number
  updated: number
  removed: number
  total: number
}

export const knowledgeApi = {
  getStatus: () => apiRequest<VaultStatus>('/api/knowledge/obsidian/status'),
  saveConfig: (payload: VaultConfig) =>
    apiRequest<Vault>('/api/knowledge/obsidian/config', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  sync: () =>
    apiRequest<SyncResult>('/api/knowledge/obsidian/sync', {
      method: 'POST',
    }),
  listNotes: () => apiRequest<Note[]>('/api/knowledge/notes'),
}
