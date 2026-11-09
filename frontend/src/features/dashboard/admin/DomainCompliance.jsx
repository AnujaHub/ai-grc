import { useState } from 'react'
import ProgressBar from '../components/ProgressBar'
import { scoreTone } from '../utils/format'

const SCORE_TEXT = { accent: 'text-accent', warning: 'text-warning', danger: 'text-danger' }

function DomainCompliance({ domains, limit = 8 }) {
  const [showAll, setShowAll] = useState(false)
  const sorted = [...domains].sort((a, b) => a.score - b.score)
  const visible = showAll ? sorted : sorted.slice(0, limit)

  return (
    <div>
      <ul className="space-y-3.5">
        {visible.map((domain) => {
          const tone = scoreTone(domain.score)
          return (
            <li key={domain.code}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-ink">
                  <span className="mr-2 font-mono text-xs text-ink-soft">{domain.code.padStart(2, '0')}</span>
                  {domain.name}
                </span>
                <span className={`font-mono text-xs ${SCORE_TEXT[tone]}`}>{domain.score}%</span>
              </div>
              <ProgressBar value={domain.score} tone={tone} />
            </li>
          )
        })}
      </ul>
      {domains.length > limit && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-4 text-xs font-medium text-accent hover:underline cursor-pointer"
        >
          {showAll ? 'Show fewer' : `Show all ${domains.length} domains`}
        </button>
      )}
    </div>
  )
}

export default DomainCompliance
