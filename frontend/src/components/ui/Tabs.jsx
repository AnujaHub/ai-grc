function Tabs({ tabs, active, onChange, className = '' }) {
  return (
    <div className={`-mx-1 overflow-x-auto ${className}`}>
      <div role="tablist" className="inline-flex min-w-full gap-1 border-b border-line px-1">
        {tabs.map((tab) => {
          const selected = tab.id === active
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(tab.id)}
              className={`-mb-px inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm cursor-pointer ${
                selected ? 'border-accent text-accent' : 'border-transparent text-ink-soft hover:text-ink'
              }`}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {tab.label}
              {tab.count !== undefined && (
                <span className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] ${selected ? 'bg-accent-soft' : 'bg-paper text-ink-soft'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default Tabs
