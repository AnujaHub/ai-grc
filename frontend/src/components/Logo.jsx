function Logo({ taille = 'normal' }) {
  const tailleTitre = taille === 'grand' ? 'text-2xl' : 'text-lg'

  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-full border-2 border-ink flex items-center justify-center shrink-0">
        <span className="font-mono text-[10px] font-semibold text-ink">42001</span>
      </div>
      <span className={`font-display ${tailleTitre} text-ink leading-none`}>
        <span className="italic text-accent">AI Compliance Register</span>
      </span>
    </div>
  )
}

export default Logo