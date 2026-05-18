'use client'

import { useRef, useCallback } from 'react'
import { Move } from 'lucide-react'

interface FocalPointPickerProps {
  value: string        // "X% Y%"
  onChange: (position: string) => void
  imageUrl: string
}

function parsePosition(value: string): { x: number; y: number } {
  const parts = value.replace(/%/g, '').split(' ')
  const x = parseFloat(parts[0]) || 50
  const y = parseFloat(parts[1]) || 50
  return { x, y }
}

export default function FocalPointPicker({ value, onChange, imageUrl }: FocalPointPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const { x, y } = parsePosition(value)

  const updatePosition = useCallback((clientX: number, clientY: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
    const py = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100))
    onChange(`${Math.round(px)}% ${Math.round(py)}%`)
  }, [onChange])

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true
    updatePosition(e.clientX, e.clientY)

    const onMove = (ev: MouseEvent) => {
      if (isDragging.current) updatePosition(ev.clientX, ev.clientY)
    }
    const onUp = () => {
      isDragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    updatePosition(touch.clientX, touch.clientY)

    const onMove = (ev: TouchEvent) => {
      ev.preventDefault()
      updatePosition(ev.touches[0].clientX, ev.touches[0].clientY)
    }
    const onEnd = () => {
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
    }
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onEnd)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-ink-muted">
        <Move size={13} />
        <span>Clique ou arraste para definir o ponto focal da imagem</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Editor — imagem completa com crosshair arrastável */}
        <div>
          <p className="text-xs text-ink-muted mb-1.5">Arraste o ponto na imagem:</p>
          <div
            ref={containerRef}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            className="relative overflow-hidden bg-paper-warm border border-border cursor-crosshair select-none"
            style={{ aspectRatio: '3/2' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Focal point editor"
              className="w-full h-full object-cover pointer-events-none"
              style={{ objectPosition: `${x}% ${y}%` }}
              draggable={false}
            />

            {/* Crosshair lines */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ left: `${x}%` }}
            >
              <div className="absolute top-0 bottom-0 w-px bg-white opacity-60" style={{ left: `${x}%` }} />
              <div className="absolute left-0 right-0 h-px bg-white opacity-60" style={{ top: `${y}%` }} />
            </div>

            {/* Focal point dot */}
            <div
              className="absolute w-5 h-5 pointer-events-none"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="w-full h-full rounded-full border-2 border-white shadow-md bg-accent opacity-90" />
            </div>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Posição: <span className="font-medium text-ink">{Math.round(x)}% × {Math.round(y)}%</span>
          </p>
        </div>

        {/* Preview — como vai aparecer no card (16:9) */}
        <div>
          <p className="text-xs text-ink-muted mb-1.5">Prévia do card (16:9):</p>
          <div className="relative overflow-hidden bg-paper-warm border border-border" style={{ aspectRatio: '16/9' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-full object-cover pointer-events-none"
              style={{ objectPosition: `${x}% ${y}%` }}
              draggable={false}
            />
          </div>
          <p className="text-xs text-ink-muted mt-1">Assim vai aparecer nos cards da homepage.</p>
        </div>
      </div>
    </div>
  )
}
