import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { FormEvent } from 'react'

import { errorMessage } from '../../api/client'
import { knowledgeApi } from '../../api/knowledge'
import type { Note, Vault } from '../../api/knowledge'

function formatDate(value: string): string {
  return new Date(value).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function VaultForm({ vault, onSaved }: { vault: Vault | null; onSaved: () => void }) {
  const [name, setName] = useState(vault?.name ?? '')
  const [path, setPath] = useState(vault?.path ?? '')
  const [syncMode, setSyncMode] = useState<'folder' | 'rest_api'>(
    vault?.sync_mode ?? 'folder',
  )

  const saveVault = useMutation({
    mutationFn: () =>
      knowledgeApi.saveConfig({
        name: name.trim(),
        path: path.trim(),
        sync_mode: syncMode,
      }),
    onSuccess: onSaved,
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim() || !path.trim()) {
      return
    }
    saveVault.mutate()
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="card-head">
        <span className="card-title">
          {vault ? 'Obsidian 连接设置' : '连接 Obsidian'}
        </span>
      </div>
      <p className="sub">后端读取本地 vault 文件夹，浏览器不能直接访问本地文件。</p>
      <div className="add-form">
        <input
          className="input"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Vault 名称，例如 LifeVault"
        />
        <input
          className="input"
          value={path}
          onChange={(event) => setPath(event.target.value)}
          placeholder="本地路径，例如 D:\Obsidian\LifeVault"
        />
        <select
          className="input"
          value={syncMode}
          onChange={(event) => setSyncMode(event.target.value as 'folder' | 'rest_api')}
          aria-label="同步方式"
        >
          <option value="folder">文件夹扫描</option>
          <option value="rest_api">Local REST API</option>
        </select>
        <button
          type="submit"
          disabled={saveVault.isPending}
          className="btn primary"
        >
          保存连接
        </button>
      </div>
      {errorMessage(saveVault.error) ? (
        <p className="error-text">{errorMessage(saveVault.error)}</p>
      ) : null}
    </form>
  )
}

function NoteRow({ note, vault }: { note: Note; vault: Vault }) {
  const openUrl = `obsidian://open?vault=${encodeURIComponent(vault.name)}&file=${encodeURI(note.path)}`
  return (
    <li className="note-row">
      <div className="note-info">
        <p className="note-title">{note.title}</p>
        <p className="note-meta">{note.path}</p>
        <div className="note-tags">
          {note.tags.map((tag) => (
            <span className="note-tag" key={tag}>
              #{tag}
            </span>
          ))}
        </div>
      </div>
      <div className="note-side">
        <span className="obsidian-meta">{formatDate(note.modified_at)}</span>
        <a className="note-open" href={openUrl}>
          在 Obsidian 打开
        </a>
      </div>
    </li>
  )
}

export function NotesPage() {
  const queryClient = useQueryClient()
  const statusQuery = useQuery({
    queryKey: ['obsidian-status'],
    queryFn: knowledgeApi.getStatus,
  })
  const notesQuery = useQuery({
    queryKey: ['knowledge-notes'],
    queryFn: knowledgeApi.listNotes,
  })
  const syncNotes = useMutation({
    mutationFn: knowledgeApi.sync,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['obsidian-status'] })
      void queryClient.invalidateQueries({ queryKey: ['knowledge-notes'] })
    },
  })

  const [query, setQuery] = useState('')
  const [tag, setTag] = useState('')

  const vault = statusQuery.data?.vault ?? null
  const notes = notesQuery.data ?? []
  const allTags = Array.from(new Set(notes.flatMap((note) => note.tags))).sort()
  const normalizedQuery = query.trim().toLowerCase()
  const filtered = notes.filter((note) => {
    if (tag && !note.tags.includes(tag)) return false
    if (!normalizedQuery) return true
    return (
      note.title.toLowerCase().includes(normalizedQuery) ||
      note.path.toLowerCase().includes(normalizedQuery)
    )
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['obsidian-status'] })
    void queryClient.invalidateQueries({ queryKey: ['knowledge-notes'] })
  }

  return (
    <>
      <header className="page-head">
        <div>
          <p className="eyebrow">笔记</p>
          <h1 className="page-title">Obsidian 笔记</h1>
          <p className="page-sub">
            学习笔记按标题、路径和标签索引，点击可以在 Obsidian 里打开。
          </p>
        </div>
      </header>

      {statusQuery.isError ? (
        <p className="error-text">{errorMessage(statusQuery.error)}</p>
      ) : null}

      <VaultForm
        key={vault?.id ?? 'new'}
        vault={vault}
        onSaved={() => {
          invalidate()
          setTag('')
          setQuery('')
        }}
      />

      {vault ? (
        <>
          <section className="card tone-2">
            <div className="card-head">
              <span className="card-title">{vault.name}</span>
              <span className="badge">{statusQuery.data?.note_count ?? 0} 篇笔记</span>
            </div>
            <p className="sub">
              {statusQuery.data?.last_synced_at
                ? `最近同步 ${formatDate(statusQuery.data.last_synced_at)}`
                : '还没有同步'}
            </p>
            <p className="sub">{vault.path}</p>
            <div className="row">
              <button
                type="button"
                className="btn primary"
                onClick={() => syncNotes.mutate()}
                disabled={syncNotes.isPending}
              >
                {syncNotes.isPending ? '同步中…' : '同步笔记'}
              </button>
              <a
                className="btn"
                href={`obsidian://open?vault=${encodeURIComponent(vault.name)}`}
              >
                打开 Obsidian
              </a>
            </div>
          </section>

          {syncNotes.data ? (
            <p className="success-text">
              同步完成：扫描 {syncNotes.data.scanned} 篇，新增 {syncNotes.data.created}
              ，更新 {syncNotes.data.updated}，删除 {syncNotes.data.removed}，共{' '}
              {syncNotes.data.total} 篇。
            </p>
          ) : null}
          {errorMessage(syncNotes.error) ? (
            <p className="error-text">{errorMessage(syncNotes.error)}</p>
          ) : null}
        </>
      ) : (
        <p className="empty">
          还没有连接 Obsidian。填写 vault 名称和本地路径，保存后点「同步笔记」。
        </p>
      )}

      <div className="filters">
        <input
          className="input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索标题或路径"
        />
        <div className="chips">
          <button
            type="button"
            className={`chip${tag === '' ? ' active' : ''}`}
            onClick={() => setTag('')}
          >
            全部
          </button>
          {allTags.map((item) => (
            <button
              key={item}
              type="button"
              className={`chip${item === tag ? ' active' : ''}`}
              onClick={() => setTag(item === tag ? '' : item)}
            >
              #{item}
            </button>
          ))}
        </div>
      </div>

      {notesQuery.isError ? (
        <p className="error-text">{errorMessage(notesQuery.error)}</p>
      ) : null}
      {notesQuery.isLoading ? <p className="sub">加载中…</p> : null}

      <ul className="note-list">
        {filtered.map((note) => (
          <NoteRow key={note.id} note={note} vault={vault!} />
        ))}
      </ul>

      {vault && !notesQuery.isLoading && filtered.length === 0 ? (
        <p className="empty">没有匹配的笔记。换一个关键词或先同步一次。</p>
      ) : null}
    </>
  )
}
