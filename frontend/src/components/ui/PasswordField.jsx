import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import TextField from './TextField'

function PasswordField(props) {
  const [visible, setVisible] = useState(false)

  return (
    <TextField
      icon={Lock}
      type={visible ? 'text' : 'password'}
      rightSlot={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="rounded p-1 text-ink-soft hover:text-accent cursor-pointer"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
      {...props}
    />
  )
}

export default PasswordField
