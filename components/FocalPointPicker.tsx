'use client'

interface FocalPointPickerProps {
  value: string
  onChange: (position: string) => void
  imageUrl?: string
}

const POINTS = [
  { label: 'Topo esquerdo',   value: 'top left' },
  { label: 'Topo centro',     value: 'top center' },
  { label: 'Topo direito',    value: 'top right' },
  { label: 'Meio esquerdo',   value: 'center left' },
  { label: 'Centro',          value: 'center center' },
  { label: 'Meio direito',    value: 'center right' },
  { label: 'Base esquerda',   value: 'bottom left' },
  { label: 'Base centro',     value: 'bottom center' },
  { label: 'Base direita',    value: 'bottom right' },
]

export default function FocalPointPicker({ value, onChange, imageUrl }: FocalPointPickerProps) {
  return (
    <div className="flex items-start gap-4">
      {/* Preview */}
      {imageUrl && (
        <div className="relative w-40 h-24 flex-shrink-0 overflow-hidden border border-border bg-paper-warm">
          <img
            src={imageUrl}
            alt="Preview"
            className="w-full h-full object-cover"
            style={{ objectPosition: value }}
          />
        </div>
      )}

      {/* 3×3 grid */}
      <div>
        <p className="text-xs text-ink-muted mb-2">Clique para definir o ponto focal da imagem:</p>
        <div className="grid grid-cols-3 gap-1 w-28">
          {POINTS.map(p => (
            <button
              key={p.value}
              type="button"
              title={p.label}
              onClick={() => onChange(p.value)}
              className={`w-8 h-8 border-2 rounded-sm transition-colors ${
                value === p.value
                  ? 'border-accent bg-accent'
                  : 'border-border bg-white hover:border-ink-muted'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-ink-muted mt-2">Selecionado: <span className="text-ink font-medium">{POINTS.find(p => p.value === value)?.label ?? 'Centro'}</span></p>
      </div>
    </div>
  )
}
