import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const CHART_COLORS = ['#38d9c2', '#7dd3fc', '#f5b85b', '#fb7185', '#a78bfa']

const tooltipStyle = {
  background: '#111a2b',
  border: '1px solid #25334b',
  borderRadius: 8,
  color: '#e7eefb',
  fontSize: 12,
}

function DonutChart({ data, centerValue, centerLabel, colors = CHART_COLORS }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <div className="relative h-40 w-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={52} outerRadius={72} paddingAngle={2} stroke="none">
              {data.map((entry, i) => (
                <Cell key={entry.name} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#e7eefb' }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-2xl font-semibold text-ink">{centerValue ?? total}</span>
          {centerLabel && <span className="text-[11px] text-ink-soft">{centerLabel}</span>}
        </div>
      </div>

      <ul className="w-full space-y-2">
        {data.map((entry, i) => (
          <li key={entry.name} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-ink-soft">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: colors[i % colors.length] }} />
              {entry.name}
            </span>
            <span className="font-mono text-ink">
              {entry.value}
              <span className="ml-1.5 text-xs text-ink-soft">{total ? Math.round((entry.value / total) * 100) : 0}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default DonutChart
