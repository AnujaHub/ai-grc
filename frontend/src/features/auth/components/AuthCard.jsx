function AuthCard({ children, footer }) {
  return (
    <>
      <div className="rounded-xl border border-line bg-paper-dark p-6 shadow-[0_14px_34px_rgba(0,0,0,0.18)] sm:p-8">
        {children}
      </div>
      {footer && <div className="mt-6 text-center text-sm text-ink-soft">{footer}</div>}
    </>
  )
}

export default AuthCard
