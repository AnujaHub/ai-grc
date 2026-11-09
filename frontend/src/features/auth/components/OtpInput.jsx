import { useRef } from 'react'

function OtpInput({ length = 6, value, onChange, error = false, disabled = false }) {
  const inputs = useRef([])
  const digits = Array.from({ length }, (_, i) => value[i] || '')

  const focus = (index) => inputs.current[Math.max(0, Math.min(length - 1, index))]?.focus()

  const setDigit = (index, digit) => {
    const next = digits.slice()
    next[index] = digit
    onChange(next.join(''))
  }

  const handleChange = (index, e) => {
    const digit = e.target.value.replace(/\D/g, '').slice(-1)
    if (!digit) return
    setDigit(index, digit)
    focus(index + 1)
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      if (digits[index]) setDigit(index, '')
      else if (index > 0) {
        setDigit(index - 1, '')
        focus(index - 1)
      }
    } else if (e.key === 'ArrowLeft') focus(index - 1)
    else if (e.key === 'ArrowRight') focus(index + 1)
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return
    e.preventDefault()
    onChange(pasted)
    focus(pasted.length)
  }

  return (
    <div className="flex justify-between gap-2" onPaste={handlePaste}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          className={[
            'h-12 w-full max-w-12 border text-center font-mono text-lg font-semibold text-ink outline-none sm:h-14',
            error ? 'border-danger' : digit ? 'border-accent/60' : 'border-line',
            'focus:border-accent disabled:opacity-60',
          ].join(' ')}
        />
      ))}
    </div>
  )
}

export default OtpInput
