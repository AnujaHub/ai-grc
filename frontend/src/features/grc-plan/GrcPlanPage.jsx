import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { LayoutDashboard, ListTodo, GanttChartSquare, CalendarDays, Flag, Gauge, AlertTriangle, Hourglass, Wallet, Plus } from 'lucide-react'
import { Alert, Button, PageHeader, StatusBadge, Tabs } from '../../components/ui'
import DashboardState from '../dashboard/components/DashboardState'
import KpiCard from '../dashboard/components/KpiCard'
import SectionCard from '../dashboard/components/SectionCard'
import ProgressBar from '../dashboard/components/ProgressBar'
import DonutChart from '../dashboard/components/DonutChart'
import DeadlineList from '../dashboard/components/DeadlineList'
import useDashboardData from '../dashboard/hooks/useDashboardData'
import { daysUntil, dueLabel, dueTone, formatDate } from '../dashboard/utils/format'
import { getCurrentUser, canReview } from '../../utils/roles'
import { displayStatus, getPlan, isOverdue } from './planData'
import TaskList from './TaskList'
import PlanTimeline from './PlanTimeline'
import PlanCalendar from './PlanCalendar'

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'timeline', label: 'Timeline', icon: GanttChartSquare },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'milestones', label: 'Milestones', icon: Flag },
]

const STATUS_COLORS = ['#38d9c2', '#7dd3fc', '#f5b85b', '#fb7185', '#64748b']

const money = (value, currency) => new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)

function Overview({ plan, milestones, tasks }) {
  const total = tasks.length
  const completed = tasks.filter((t) => t.status === 'completed').length
  const overdue = tasks.filter(isOverdue)
  const progress = Math.round(tasks.reduce((s, t) => s + t.progress, 0) / total)
  const elapsed = plan.timeElapsed
  const counts = ['completed', 'in_progress', 'in_review', 'overdue', 'not_started'].map((s, i) => ({
    name: ['Completed', 'In progress', 'In review', 'Overdue / blocked', 'Not started'][i],
    value: tasks.filter((t) => (s === 'overdue' ? ['overdue', 'blocked'].includes(displayStatus(t)) : displayStatus(t) === s)).length,
  }))
  const upcoming = tasks
    .filter((t) => t.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5)
    .map((t) => ({ id: t.id, title: t.title, owner: t.owner, dueDate: t.dueDate, status: displayStatus(t), type: t.id }))

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-line bg-paper-dark p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-ink">Project status</h2>
              <StatusBadge status={plan.health} />
            </div>
            <p className="mt-1 text-sm text-ink-soft">{plan.healthReason}</p>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-4 text-sm">
            <div>
              <div className="mb-1.5 flex justify-between text-xs text-ink-soft"><span>Work completed</span><span className="font-mono text-ink">{progress}%</span></div>
              <ProgressBar value={progress} />
            </div>
            <div>
              <div className="mb-1.5 flex justify-between text-xs text-ink-soft"><span>Time elapsed</span><span className="font-mono text-ink">{elapsed}%</span></div>
              <ProgressBar value={elapsed} tone={elapsed > progress + 10 ? 'warning' : 'info'} />
            </div>
          </div>
        </div>
        {elapsed > progress + 10 && <p className="mt-3 text-xs text-warning">Work is {elapsed - progress} points behind the schedule.</p>}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard icon={Gauge} label="Overall progress" value={progress} suffix="%" hint={`${completed} of ${total} tasks done`} />
        <KpiCard icon={AlertTriangle} label="Overdue tasks" value={overdue.length} tone="danger" hint="need attention" delay={0.05} />
        <KpiCard icon={Hourglass} label="Days remaining" value={Math.max(0, daysUntil(plan.endDate))} tone="info" hint={`ends ${formatDate(plan.endDate)}`} delay={0.1} />
        <KpiCard icon={Wallet} label="Budget used" value={Math.round((plan.budget.spent / plan.budget.total) * 100)} suffix="%" tone="warning"
          hint={`${money(plan.budget.spent, plan.budget.currency)} of ${money(plan.budget.total, plan.budget.currency)}`} delay={0.15} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard title="Progress by milestone" className="lg:col-span-2">
          <ul className="space-y-4">
            {milestones.map((m) => (
              <li key={m.id}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-ink">{m.title}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="text-xs text-ink-soft">{formatDate(m.dueDate)}</span>
                    <StatusBadge status={m.status} />
                  </span>
                </div>
                <ProgressBar value={m.progress} tone={m.status === 'overdue' ? 'danger' : m.status === 'completed' ? 'accent' : 'info'} />
              </li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard title="Tasks by status">
          <DonutChart data={counts} colors={STATUS_COLORS} centerLabel="tasks" />
        </SectionCard>
      </div>

      <SectionCard title="Next deadlines" action={{ label: 'All tasks', to: '/grc-plan?tab=tasks' }}>
        <DeadlineList items={upcoming} />
      </SectionCard>
    </div>
  )
}

function Milestones({ milestones, tasks }) {
  return (
    <ol className="relative space-y-4 border-l border-line pl-6">
      {milestones.map((m) => {
        const related = tasks.filter((t) => t.milestoneId === m.id)
        return (
          <li key={m.id} className="relative">
            <span className={`absolute -left-[31px] top-5 flex h-3.5 w-3.5 rotate-45 border-2 ${m.status === 'completed' ? 'border-accent bg-accent' : m.status === 'overdue' ? 'border-danger bg-danger' : 'border-sky-300 bg-paper'}`} />
            <div className="rounded-xl border border-line bg-paper-dark p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-xs text-ink-soft">{m.id} · {m.owner}</p>
                  <h3 className="text-base font-semibold text-ink">{m.title}</h3>
                  <p className="mt-1 text-sm text-ink-soft">{m.description}</p>
                </div>
                <div className="shrink-0 text-left sm:text-right">
                  <StatusBadge status={m.status} />
                  <p className="mt-1.5 text-xs text-ink-soft">Due {formatDate(m.dueDate)}</p>
                  {m.completedAt ? <p className="text-xs text-accent">Done {formatDate(m.completedAt)}</p> : <p className={`text-xs ${dueTone(m.dueDate)}`}>{dueLabel(m.dueDate)}</p>}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <ProgressBar value={m.progress} tone={m.status === 'overdue' ? 'danger' : m.status === 'completed' ? 'accent' : 'info'} />
                <span className="w-10 text-right font-mono text-xs text-ink">{m.progress}%</span>
              </div>
              {related.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {related.map((t) => (
                    <Link key={t.id} to={`/grc-plan/tasks/${t.id}`} className="rounded border border-line bg-paper px-2 py-0.5 text-xs text-ink-soft hover:border-accent/50 hover:text-accent">
                      {t.id} · {t.progress}%
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function GrcPlanPage() {
  const [params, setParams] = useSearchParams()
  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'overview'
  const { data, loading, error, reload, setData } = useDashboardData(getPlan)
  const [creating, setCreating] = useState(false)
  const manager = canReview(getCurrentUser())

  return (
    <DashboardState loading={loading} error={error} onRetry={reload}>
      {data && (
        <>
          <PageHeader
            eyebrow="GRC plan & project tracking"
            title={data.plan.name}
            subtitle={`${formatDate(data.plan.startDate)} – ${formatDate(data.plan.endDate)} · Sponsor: ${data.plan.owner}`}
            actions={manager && <Button onClick={() => { setParams({ tab: 'tasks' }); setCreating(true) }}><Plus className="h-4 w-4" /> New task</Button>}
          />

          {data.tasks.some((t) => t.status === 'blocked') && (
            <Alert variant="warning">
              {data.tasks.filter((t) => t.status === 'blocked').map((t) => (
                <span key={t.id} className="block"><Link to={`/grc-plan/tasks/${t.id}`} className="font-semibold hover:underline">{t.id} is blocked</Link>: {t.blockedReason}</span>
              ))}
            </Alert>
          )}

          <Tabs tabs={TABS.map((t) => (t.id === 'tasks' ? { ...t, count: data.tasks.length } : t))} active={tab} onChange={(id) => setParams(id === 'overview' ? {} : { tab: id })} />

          {tab === 'overview' && <Overview plan={data.plan} milestones={data.milestones} tasks={data.tasks} />}
          {tab === 'tasks' && (
            <TaskList
              tasks={data.tasks}
              milestones={data.milestones}
              canCreate={manager}
              creating={creating}
              onCreatingChange={setCreating}
              onCreated={(task) => setData((d) => ({ ...d, tasks: [...d.tasks, task] }))}
            />
          )}
          {tab === 'timeline' && <PlanTimeline plan={data.plan} milestones={data.milestones} tasks={data.tasks} />}
          {tab === 'calendar' && <PlanCalendar milestones={data.milestones} tasks={data.tasks} events={data.events} />}
          {tab === 'milestones' && <Milestones milestones={data.milestones} tasks={data.tasks} />}
        </>
      )}
    </DashboardState>
  )
}

export default GrcPlanPage
