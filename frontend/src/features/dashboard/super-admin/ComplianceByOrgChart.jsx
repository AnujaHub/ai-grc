import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'

const colorFor = (score) => (score >= 75 ? '#38d9c2' : score >= 50 ? '#f5b85b' : '#fb7185')

function ComplianceByOrgChart({ data }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
          <CartesianGrid horizontal={false} stroke="#25334b" strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fill: '#91a1bb', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" width={120} tick={{ fill: '#e7eefb', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: 'rgba(56,217,194,0.06)' }}
            contentStyle={{ background: '#111a2b', border: '1px solid #25334b', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#e7eefb' }}
            formatter={(value) => [`${value}%`, 'Compliance']}
          />
          <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={14}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={colorFor(entry.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ComplianceByOrgChart
