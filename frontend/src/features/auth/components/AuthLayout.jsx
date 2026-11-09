import { motion } from 'framer-motion'
import { ShieldCheck, ClipboardCheck, FileSearch, Activity } from 'lucide-react'
import Logo from '../../../components/Logo'

const HIGHLIGHTS = [
  { Icon: ClipboardCheck, title: 'ISO/IEC 42001 assessments', text: 'Track all 93 controls in one place.' },
  { Icon: FileSearch, title: 'Evidence management', text: 'Link documents and proofs to controls.' },
  { Icon: Activity, title: 'Risk & GRC planning', text: 'Follow tasks, deadlines and milestones.' },
]

function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <aside className="relative hidden w-[44%] max-w-xl flex-col justify-between overflow-hidden border-r border-line bg-paper-dark p-10 lg:flex">
        <div
          className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl"
          aria-hidden="true"
        />
        <Logo taille="grand" />

        <div className="relative">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-3 py-1 font-mono text-xs text-accent">
            <ShieldCheck className="h-3.5 w-3.5" /> AI governance platform
          </p>
          <h2 className="font-display text-3xl font-semibold leading-tight text-ink">
            Govern your AI systems with confidence.
          </h2>
          <p className="mt-3 max-w-sm text-sm text-ink-soft">
            Compliance, risk and evidence for responsible AI — in a single workspace.
          </p>

          <ul className="mt-8 space-y-5">
            {HIGHLIGHTS.map(({ Icon, title, text }) => (
              <li key={title} className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-paper text-accent">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{title}</p>
                  <p className="text-sm text-ink-soft">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="font-mono text-xs text-ink-soft">© {new Date().getFullYear()} Nova GRC · ISO/IEC 42001</p>
      </aside>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo taille="grand" />
          </div>
          {children}
        </motion.div>
      </main>
    </div>
  )
}

export default AuthLayout
