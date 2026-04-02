'use client'

interface Props {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit: string
  icon?: React.ReactNode
  colorStops?: string
  formatValue?: (v: number) => string
  onChange: (v: number) => void
}

export default function SliderControl({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  icon,
  colorStops,
  formatValue,
  onChange,
}: Props) {
  const pct = ((value - min) / (max - min)) * 100
  const accentColor = colorStops || '#0F766E'

  const trackStyle = {
    background: `linear-gradient(to right, ${accentColor} ${pct}%, var(--border) ${pct}%)`,
  }

  const displayValue = formatValue ? formatValue(value) : value

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <span className="text-ink-tertiary">{icon}</span>}
          <span className="text-sm font-medium text-ink-secondary">{label}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="num text-lg font-semibold text-ink">{displayValue}</span>
          <span className="text-xs text-ink-tertiary font-medium">{unit}</span>
        </div>
      </div>
      <div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="slider-track w-full"
          style={trackStyle}
        />
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-ink-muted font-medium">
            {formatValue ? formatValue(min) : min} {unit}
          </span>
          <span className="text-[10px] text-ink-muted font-medium">
            {formatValue ? formatValue(max) : max} {unit}
          </span>
        </div>
      </div>
    </div>
  )
}
