import { useMemo, useState } from 'react'
import { FileText, FileSpreadsheet, FileImage, File, Presentation, HardDrive, X, Search, FileCode, FileArchive, Mail, AlertTriangle, Download } from 'lucide-react'
import ProgressBar from '../dashboard/components/ProgressBar'
import { allControls } from '../controls/controlsData'
import { FORMAT_GROUPS, MAX_FILE_MB, STORAGE_WARNING_PERCENT, formatBytes } from './evidenceData'

const STYLE = {
  pdf: { Icon: FileText, color: 'text-rose-300 bg-rose-400/10' },
  doc: { Icon: FileText, color: 'text-sky-300 bg-sky-400/10' },
  text: { Icon: FileText, color: 'text-ink-soft bg-paper' },
  sheet: { Icon: FileSpreadsheet, color: 'text-emerald-300 bg-emerald-400/10' },
  slides: { Icon: Presentation, color: 'text-orange-300 bg-orange-400/10' },
  image: { Icon: FileImage, color: 'text-violet-300 bg-violet-400/10' },
  code: { Icon: FileCode, color: 'text-amber-300 bg-amber-400/10' },
  mail: { Icon: Mail, color: 'text-cyan-300 bg-cyan-400/10' },
  archive: { Icon: FileArchive, color: 'text-slate-300 bg-slate-400/10' },
}

const KIND = {
  pdf: 'pdf', doc: 'doc', docx: 'doc', odt: 'doc', rtf: 'text', txt: 'text',
  xls: 'sheet', xlsx: 'sheet', ods: 'sheet', csv: 'sheet',
  ppt: 'slides', pptx: 'slides', odp: 'slides',
  png: 'image', jpg: 'image', jpeg: 'image', gif: 'image', webp: 'image',
  log: 'code', json: 'code', xml: 'code',
  eml: 'mail', msg: 'mail',
  zip: 'archive',
}

const fileKind = (type) => KIND[type] || 'other'

const TYPE_STYLES = Object.fromEntries(Object.entries(KIND).map(([ext, kind]) => [ext, STYLE[kind]]))

export function FileTypeIcon({ type, size = 'md' }) {
  const { Icon, color } = TYPE_STYLES[type] || { Icon: File, color: 'text-ink-soft bg-paper' }
  const box = size === 'lg' ? 'h-12 w-12' : 'h-9 w-9'
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-lg ${box} ${color}`}>
      <Icon className={size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'} />
    </span>
  )
}

export function StorageUsage({ storage }) {
  const percent = Math.round((storage.usedBytes / storage.limitBytes) * 100)
  const tone = percent >= 90 ? 'danger' : percent >= 75 ? 'warning' : 'info'
  return (
    <div className="rounded-xl border border-line bg-paper-dark p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink"><HardDrive className="h-4 w-4 text-ink-soft" /> Storage</span>
        <span className="font-mono text-sm text-ink">{formatBytes(storage.usedBytes)} <span className="text-ink-soft">/ {formatBytes(storage.limitBytes)}</span></span>
      </div>
      <ProgressBar value={percent} tone={tone} />
      {percent >= STORAGE_WARNING_PERCENT && (
        <p className={`mt-3 flex items-center gap-1.5 text-xs ${percent >= 95 ? 'text-danger' : 'text-warning'}`}>
          <AlertTriangle className="h-3.5 w-3.5" />
          {percent >= 95 ? 'Storage is almost full. New uploads will be blocked when it is full.' : 'Storage is getting full. Remove old versions or ask an admin for more space.'}
        </p>
      )}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-soft">
        <span>{percent}% used · {formatBytes(storage.freeBytes)} free · {storage.files.toLocaleString()} files incl. versions · max {MAX_FILE_MB} MB per file</span>
        <span className="flex flex-wrap gap-3">
          {storage.byType.slice(0, 4).map((t) => (
            <span key={t.type} className="font-mono uppercase">{t.type} <span className="normal-case text-ink">{formatBytes(t.bytes)}</span></span>
          ))}
        </span>
      </div>
    </div>
  )
}

export function ControlChips({ codes, max = 3 }) {
  if (!codes.length) return <span className="text-xs text-ink-soft">None</span>
  return (
    <span className="flex flex-wrap gap-1">
      {codes.slice(0, max).map((code) => (
        <span key={code} className="rounded border border-line bg-paper px-1.5 py-0.5 font-mono text-[11px] text-accent">{code}</span>
      ))}
      {codes.length > max && <span className="px-1 text-[11px] text-ink-soft">+{codes.length - max}</span>}
    </span>
  )
}

export function ControlPicker({ value, onChange, error }) {
  const [query, setQuery] = useState('')
  const controls = allControls()
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return controls.filter((c) => !value.includes(c.code) && `${c.code} ${c.title} ${c.domain}`.toLowerCase().includes(q)).slice(0, 6)
  }, [query, value, controls])

  const add = (code) => {
    onChange([...value, code])
    setQuery('')
  }

  return (
    <div>
      {value.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {value.map((code) => {
            const control = controls.find((c) => c.code === code)
            return (
              <span key={code} className="inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent-soft py-1 pl-2 pr-1 text-xs text-accent">
                <span className="font-mono">{code}</span>
                <span className="max-w-40 truncate text-ink">{control?.title}</span>
                <button type="button" onClick={() => onChange(value.filter((c) => c !== code))} className="rounded p-0.5 hover:bg-accent/20 cursor-pointer" aria-label={`Remove control ${code}`}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )
          })}
        </div>
      )}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search controls by code or title, e.g. A.8.5 or backup"
          aria-label="Search controls"
          className={`w-full border py-2 pl-9 pr-3 text-sm text-ink outline-none ${error ? 'border-danger' : 'border-line focus:border-accent'}`}
        />
        {matches.length > 0 && (
          <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-line bg-paper-dark shadow-xl">
            {matches.map((c) => (
              <li key={c.code}>
                <button type="button" onClick={() => add(c.code)} className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-paper cursor-pointer">
                  <span className="w-10 font-mono text-xs text-accent">{c.code}</span>
                  <span className="min-w-0 flex-1 truncate text-ink">{c.title}</span>
                  <span className="hidden truncate text-xs text-ink-soft sm:block sm:max-w-40">{c.domain}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  )
}

export function AcceptedFormats() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
      {FORMAT_GROUPS.map((group) => (
        <span key={group.label} className="text-ink-soft">
          {group.label}: <span className="font-mono uppercase text-ink">{group.extensions.join(', ')}</span>
        </span>
      ))}
    </div>
  )
}

const Lines = ({ count, widths = ['w-full', 'w-11/12', 'w-4/5', 'w-full', 'w-3/4'] }) =>
  Array.from({ length: count }, (_, i) => <div key={i} className={`h-2 rounded bg-slate-200 ${widths[i % widths.length]}`} />)

export function FilePreview({ item }) {
  const kind = fileKind(item.fileType)
  if (['mail', 'archive', 'other'].includes(kind)) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-line bg-paper px-4 py-14 text-center">
        <FileTypeIcon type={item.fileType} size="lg" />
        <p className="text-sm text-ink">Preview is not available for .{item.fileType} files</p>
        <p className="text-xs text-ink-soft">Download the file to open it.</p>
        <span className="inline-flex items-center gap-1.5 text-xs text-accent"><Download className="h-3.5 w-3.5" /> {item.fileName}</span>
      </div>
    )
  }
  if (kind === 'code') {
    return (
      <div className="space-y-1.5 overflow-hidden rounded-lg border border-line bg-[#0a1220] p-4 font-mono text-[11px]">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="flex gap-3">
            <span className="w-5 text-right text-ink-soft/50">{i + 1}</span>
            <span className={`h-2 self-center rounded ${['bg-sky-400/40', 'bg-amber-300/40', 'bg-emerald-300/40', 'bg-line'][i % 4]} ${['w-40', 'w-64', 'w-32', 'w-52', 'w-24'][i % 5]}`} />
          </div>
        ))}
      </div>
    )
  }
  if (kind === 'image') {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-lg border border-line bg-gradient-to-br from-sky-400/10 via-paper to-accent/10">
        <div className="text-center text-ink-soft">
          <FileTypeIcon type={item.fileType} size="lg" />
          <p className="mt-2 text-xs">{item.fileName}</p>
        </div>
      </div>
    )
  }
  if (kind === 'sheet') {
    return (
      <div className="overflow-hidden rounded-lg border border-line">
        <table className="w-full text-xs">
          <thead className="bg-paper text-ink-soft">
            <tr>{['A', 'B', 'C', 'D', 'E'].map((c) => <th key={c} className="border-b border-r border-line px-3 py-1.5 text-left font-mono font-normal last:border-r-0">{c}</th>)}</tr>
          </thead>
          <tbody>
            {Array.from({ length: 9 }, (_, r) => (
              <tr key={r}>
                {Array.from({ length: 5 }, (_, c) => (
                  <td key={c} className="border-b border-r border-line px-3 py-2 last:border-r-0">
                    <div className={`h-2 rounded ${r === 0 ? 'bg-ink-soft/40' : 'bg-line'} ${['w-16', 'w-10', 'w-14', 'w-8', 'w-12'][(r + c) % 5]}`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  return (
    <div className="flex justify-center rounded-lg border border-line bg-paper p-4 sm:p-6">
      <div className="w-full max-w-md space-y-3 rounded p-6 shadow-lg sm:p-8" style={{ background: '#f8fafc' }}>
        <div className="h-3 w-2/3 rounded bg-slate-700" />
        <div className="h-2 w-1/3 rounded bg-slate-300" />
        <div className="space-y-2 pt-3"><Lines count={5} /></div>
        <div className="h-2.5 w-1/2 rounded bg-slate-500 pt-2" />
        <div className="space-y-2"><Lines count={4} /></div>
        <div className="space-y-2 pt-2"><Lines count={3} /></div>
      </div>
    </div>
  )
}
