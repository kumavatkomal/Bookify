'use client'

import { useEffect, useState } from 'react'

type TypingMode = 'typing' | 'pausing' | 'deleting'

const suggestions = [
  'Move the 1:00 PM sync to 2:15 PM to open a 90-minute focus block.',
  'Auto-hold 3:45 PM for a quick client recap and send recap notes.',
  'Slide the 11:00 AM call by 15 minutes to reduce back-to-back load.',
]

export default function LiveTypingText() {
  const [text, setText] = useState('')
  const [index, setIndex] = useState(0)
  const [mode, setMode] = useState<TypingMode>('typing')

  useEffect(() => {
    const current = suggestions[index]
    let timer: number | undefined

    if (mode === 'typing') {
      if (text.length < current.length) {
        timer = window.setTimeout(() => {
          setText(current.slice(0, text.length + 1))
        }, 32)
      } else {
        timer = window.setTimeout(() => setMode('pausing'), 900)
      }
    }

    if (mode === 'pausing') {
      timer = window.setTimeout(() => setMode('deleting'), 450)
    }

    if (mode === 'deleting') {
      if (text.length > 0) {
        timer = window.setTimeout(() => {
          setText(text.slice(0, -1))
        }, 18)
      } else {
        setMode('typing')
        setIndex((prev) => (prev + 1) % suggestions.length)
      }
    }

    return () => {
      if (timer) window.clearTimeout(timer)
    }
  }, [text, mode, index])

  return (
    <span>
      {text}
      <span aria-hidden="true" className="ml-1 inline-block w-2 animate-pulse">
        |
      </span>
    </span>
  )
}
