import { StatusBadge } from '../../../components/ui'
import ProgressBar from '../components/ProgressBar'
import { scoreTone, timeAgo } from '../utils/format'

function OrganisationsTable({ items }) {
  return (
    <div className="-mx-5 overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
            <th className="px-5 pb-3 font-semibold">Organisation</th>
            <th className="px-3 pb-3 text-right font-semibold">Users</th>
            <th className="px-3 pb-3 text-right font-semibold">AI systems</th>
            <th className="w-44 px-3 pb-3 font-semibold">Compliance</th>
            <th className="px-3 pb-3 font-semibold">Status</th>
            <th className="px-5 pb-3 text-right font-semibold">Last activity</th>
          </tr>
        </thead>
        <tbody>
          {items.map((org) => (
            <tr key={org.id} className="border-b border-line last:border-0">
              <td className="px-5 py-3">
                <p className="font-medium text-ink">{org.name}</p>
                <p className="text-xs text-ink-soft">{org.sector}</p>
              </td>
              <td className="px-3 py-3 text-right font-mono text-ink">{org.users}</td>
              <td className="px-3 py-3 text-right font-mono text-ink">{org.aiSystems}</td>
              <td className="px-3 py-3">
                <div className="flex items-center gap-2">
                  <ProgressBar value={org.compliance} tone={scoreTone(org.compliance)} />
                  <span className="w-9 text-right font-mono text-xs text-ink">{org.compliance}%</span>
                </div>
              </td>
              <td className="px-3 py-3"><StatusBadge status={org.status} /></td>
              <td className="px-5 py-3 text-right text-xs text-ink-soft">{timeAgo(org.lastActivity)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default OrganisationsTable
