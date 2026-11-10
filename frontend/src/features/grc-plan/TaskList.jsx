import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LayoutList, Columns3 } from 'lucide-react'
import { Button, EmptyState, FilterBar, Modal, Pagination, SearchInput, SelectFilter, SortableHeader, StatusBadge, TextField } from '../../components/ui'
import useTable from '../../utils/useTable'
import { toast } from '../../utils/toast'
import ProgressBar from '../dashboard/components/ProgressBar'
import { dueLabel, dueTone, initials } from '../dashboard/utils/format'
import { TEAM, findControl } from '../controls/controlsData'
import { PRIORITIES, TASK_STATUSES, createTask, displayStatus } from './planData'

const EMPTY = { search: '', status: '', owner: '', priority: '', milestone: '' }
const STATUS_FILTER = [...TASK_STATUSES, { value: 'overdue', label: 'Overdue' }]
const BOARD = TASK_STATUSES.map((s) => s.value)
const PRIORITY_RANK = { high: 0, medium: 1, low: 2 }
const taskValue = (row, key) => {
  if (key === 'dueDate') return new Date(row.dueDate).getTime()
  if (key === 'priority') return PRIORITY_RANK[row.priority]
  if (key === 'status') return displayStatus(row)
  return row[key]
}

function TaskTable({ tasks }) {
  const navigate = useNavigate()
  const { rows, sort, onSort, pagination } = useTable(tasks, { pageSize: 10, initialSort: { key: 'dueDate', dir: 'asc' }, getValue: taskValue })
  const head = (label, key, cls, align) => <SortableHeader label={label} sortKey={key} sort={sort} onSort={onSort} className={cls} align={align} />
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-paper-dark">
      <table className="w-full min-w-[820px] text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs text-ink-soft">
            {head('Task', 'title', 'px-5 py-3')}
            {head('Owner', 'owner', 'px-3 py-3')}
            {head('Priority', 'priority', 'px-3 py-3')}
            {head('Status', 'status', 'px-3 py-3')}
            {head('Progress', 'progress', 'w-36 px-3 py-3')}
            {head('Due', 'dueDate', 'px-5 py-3', 'right')}
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id} onClick={() => navigate(`/grc-plan/tasks/${t.id}`)} className="cursor-pointer border-b border-line last:border-0 hover:bg-paper">
              <td className="px-5 py-3">
                <p className="text-ink">{t.title}</p>
                <p className="font-mono text-xs text-ink-soft">{t.id} · control {t.control || '—'} · {t.milestoneId}</p>
              </td>
              <td className="px-3 py-3 text-ink-soft">{t.owner}</td>
              <td className="px-3 py-3"><StatusBadge status={t.priority} /></td>
              <td className="px-3 py-3"><StatusBadge status={displayStatus(t)} /></td>
              <td className="px-3 py-3">
                <div className="flex items-center gap-2">
                  <ProgressBar value={t.progress} />
                  <span className="w-9 text-right font-mono text-xs text-ink">{t.progress}%</span>
                </div>
              </td>
              <td className={`px-5 py-3 text-right text-xs ${t.status === 'completed' ? 'text-ink-soft' : dueTone(t.dueDate)}`}>{t.status === 'completed' ? 'Completed' : dueLabel(t.dueDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination {...pagination} />
    </div>
  )
}

const inputClass = 'w-full border border-line px-3 py-2.5 text-sm text-ink outline-none focus:border-accent'
const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft'

function NewTaskModal({ open, onClose, milestones, onCreated }) {
  const blank = { title: '', control: '', owner: TEAM[1].name, priority: 'medium', dueDate: '', milestoneId: milestones[0]?.id || '' }
  const [form, setForm] = useState(blank)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setErrors((er) => ({ ...er, [key]: undefined }))
  }

  const close = () => {
    setForm(blank)
    setErrors({})
    onClose()
  }

  const submit = async () => {
    const found = {}
    if (!form.title.trim()) found.title = 'Title is required.'
    if (form.control && !findControl(form.control.trim())) found.control = 'No control with this code.'
    if (!form.dueDate) found.dueDate = 'Due date is required.'
    setErrors(found)
    if (Object.keys(found).length) return
    setSaving(true)
    const task = await createTask({ ...form, control: form.control.trim(), dueDate: new Date(form.dueDate).toISOString() })
    setSaving(false)
    onCreated(task)
    toast(`Task ${task.id} created and assigned to ${task.owner}.`)
    close()
  }

  return (
    <Modal open={open} onClose={close} title="New task"
      footer={<><Button variant="secondary" onClick={close}>Cancel</Button><Button onClick={submit} loading={saving}>Create task</Button></>}>
      <div className="space-y-4">
        <TextField label="Title" value={form.title} onChange={set('title')} error={errors.title} placeholder="e.g. Review firewall rules for the DMZ" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Control code" value={form.control} onChange={set('control')} error={errors.control} placeholder="e.g. A.8.16" />
          <TextField label="Due date" type="date" value={form.dueDate} onChange={set('dueDate')} error={errors.dueDate} />
          <div>
            <label htmlFor="nt-owner" className={labelClass}>Owner</label>
            <select id="nt-owner" value={form.owner} onChange={set('owner')} className={`${inputClass} cursor-pointer`}>
              {TEAM.map((m) => <option key={m.name}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="nt-priority" className={labelClass}>Priority</label>
            <select id="nt-priority" value={form.priority} onChange={set('priority')} className={`${inputClass} cursor-pointer`}>
              {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="nt-milestone" className={labelClass}>Milestone</label>
          <select id="nt-milestone" value={form.milestoneId} onChange={set('milestoneId')} className={`${inputClass} cursor-pointer`}>
            {milestones.map((m) => <option key={m.id} value={m.id}>{m.id} · {m.title}</option>)}
          </select>
        </div>
      </div>
    </Modal>
  )
}

function TaskCard({ task }) {
  const status = displayStatus(task)
  return (
    <Link to={`/grc-plan/tasks/${task.id}`} className="block rounded-lg border border-line bg-paper p-3 hover:border-accent/50">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-ink-soft">{task.id} · {task.control}</span>
        <StatusBadge status={task.priority} />
      </div>
      <p className="text-sm text-ink">{task.title}</p>
      <div className="mt-3 flex items-center gap-2">
        <ProgressBar value={task.progress} tone={status === 'overdue' || status === 'blocked' ? 'danger' : 'accent'} />
        <span className="font-mono text-[11px] text-ink-soft">{task.progress}%</span>
      </div>
      <div className="mt-2.5 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-ink-soft">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-accent-soft font-mono text-[9px] text-accent">{initials(task.owner)}</span>
          {task.owner.split(' ')[0]}
        </span>
        <span className={task.status === 'completed' ? 'text-ink-soft' : dueTone(task.dueDate)}>{task.status === 'completed' ? 'Done' : dueLabel(task.dueDate)}</span>
      </div>
    </Link>
  )
}

function TaskList({ tasks, milestones, canCreate, creating, onCreatingChange, onCreated }) {
  const [filters, setFilters] = useState(EMPTY)
  const [view, setView] = useState('list')
  const set = (key) => (value) => setFilters((f) => ({ ...f, [key]: value }))

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    return tasks
      .filter((t) =>
        (!q || `${t.id} ${t.title} ${t.control} ${t.owner}`.toLowerCase().includes(q)) &&
        (!filters.status || displayStatus(t) === filters.status || (filters.status !== 'overdue' && t.status === filters.status)) &&
        (!filters.owner || t.owner === filters.owner) &&
        (!filters.priority || t.priority === filters.priority) &&
        (!filters.milestone || t.milestoneId === filters.milestone),
      )
  }, [tasks, filters])

  return (
    <div className="space-y-4">
      <FilterBar resultCount={filtered.length} showReset={Object.values(filters).some(Boolean)} onReset={() => setFilters(EMPTY)}>
        <SearchInput value={filters.search} onChange={set('search')} placeholder="Search tasks…" className="sm:w-60" />
        <SelectFilter label="Status" value={filters.status} onChange={set('status')} options={STATUS_FILTER} />
        <SelectFilter label="Owner" value={filters.owner} onChange={set('owner')} options={[...new Set(tasks.map((t) => t.owner))]} />
        <SelectFilter label="Priority" value={filters.priority} onChange={set('priority')} options={PRIORITIES} />
        <SelectFilter label="Milestone" value={filters.milestone} onChange={set('milestone')} options={milestones.map((m) => ({ value: m.id, label: `${m.id} · ${m.title}` }))} className="sm:max-w-52" />
        <div className="inline-flex rounded-lg border border-line bg-paper p-0.5 sm:ml-auto">
          {[{ id: 'list', Icon: LayoutList, label: 'List view' }, { id: 'board', Icon: Columns3, label: 'Board view' }].map(({ id, Icon, label }) => (
            <button key={id} type="button" onClick={() => setView(id)} aria-label={label} aria-pressed={view === id}
              className={`rounded-md p-1.5 cursor-pointer ${view === id ? 'bg-accent-soft text-accent' : 'text-ink-soft hover:text-ink'}`}>
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </FilterBar>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-line bg-paper-dark">
          <EmptyState title="No tasks match" message="Change the filters or create a new task." action={canCreate && <Button onClick={() => onCreatingChange(true)}>New task</Button>} />
        </div>
      ) : view === 'list' ? (
        <TaskTable key={JSON.stringify(filters)} tasks={filtered} />
      ) : (
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <div className="grid min-w-[1000px] grid-cols-5 gap-3">
            {BOARD.map((status) => {
              const column = filtered.filter((t) => t.status === status).sort((x, y) => new Date(x.dueDate) - new Date(y.dueDate))
              return (
                <div key={status} className="rounded-xl border border-line bg-paper-dark p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <StatusBadge status={status} />
                    <span className="font-mono text-xs text-ink-soft">{column.length}</span>
                  </div>
                  <div className="space-y-2">
                    {column.length ? column.map((t) => <TaskCard key={t.id} task={t} />) : <p className="py-4 text-center text-xs text-ink-soft">No tasks</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {canCreate && <NewTaskModal open={creating} onClose={() => onCreatingChange(false)} milestones={milestones} onCreated={onCreated} />}
    </div>
  )
}

export default TaskList
