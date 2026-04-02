'use client'

interface Props {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit: string
  icon?: React.ReactNode
  colorStops?: string  // CSS gradient string for the track
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

  const defaultGradient = `linear-gradient(to right, #3b82f6 ${pct}%, rgba(255,255,255,0.1) ${pct}%)`
  const trackStyle = colorStops
    ? {
        background: `linear-gradient(to right, ${colorStops} ${pct}%, rgba(255,255,255,0.1) ${pct}%)`,
      }
    : { background: defaultGradient }

  const displayValue = formatValue ? formatValue(value) : value

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <span className="text-white/50">{icon}</span>}
          <span className="text-sm font-medium text-white/70">{label}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-white tabular-nums">{displayValue}</span>
          <span className="text-xs text-white/40 font-medium">{unit}</span>
        </div>
      </div>
      <div className="relative">
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
          <span className="text-[10px] text-white/25 font-medium">
            {formatValue ? formatValue(min) : min} {unit}
          </span>
          <span className="text-[10px] text-white/25 font-medium">
            {formatValue ? formatValue(max) : max} {unit}
          </span>
        </div>
      </div>
    </div>
  )
}
