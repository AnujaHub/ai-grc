function Logo({ taille = 'normal' }) {
  const tailleTitre = taille === 'grand' ? 'text-2xl' : 'text-base'

  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-xl bg-accent text-[#0b1120] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(56,217,194,0.22)]">
        <span className="font-mono text-[10px] font-bold">AI</span>
      </div>
      <span className={`font-display ${tailleTitre} text-ink leading-none tracking-tight`}>
        <span className="font-semibold">Nova</span><span className="text-accent"> GRC</span>
      </span>
    </div>
  )
}

export default Logo