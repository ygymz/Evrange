'use client'

import { Users, CircleDot } from 'lucide-react'

interface Props {
  climateControl: boolean
  extraLoad: number
  rimSize: '18' | '19' | '20'
  onClimateControl: (val: boolean) => void
  onExtraLoad: (val: number) => void
  onRimSize: (val: '18' | '19' | '20') => void
}

function ToggleSwitch({
  label,
  sublabel,
  checked,
  onChange,
}: {
  label: string
  sublabel?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium text-ink-secondary">{label}</div>
        {sublabel && <div className="text-xs text-ink-tertiary">{sublabel}</div>}
      </div>
      <label className="toggle-switch shrink-0">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="toggle-slider" />
      </label>
    </div>
  )
}

export default function FactorControls({
  climateControl,
  extraLoad,
  rimSize,
  onClimateControl,
  onExtraLoad,
  onRimSize,
}: Props) {
  const loadPct = (extraLoad / 300) * 100

  return (
    <div className="space-y-5">
      {/* Climate Control */}
      <ToggleSwitch
        label="Climate Control"
        sublabel={climateControl ? 'AC/Heat active (~0.8–3 kW)' : 'Off'}
        checked={climateControl}
        onChange={onClimateControl}
      />

      <div className="border-t border-border" />

      {/* Extra Load */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-ink-tertiary" />
            <span className="text-sm font-medium text-ink-secondary">Extra Load</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="num text-lg font-semibold text-ink">{extraLoad}</span>
            <span className="text-xs text-ink-tertiary font-medium">kg</span>
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={300}
          step={10}
          value={extraLoad}
          onChange={(e) => onExtraLoad(Number(e.target.value))}
          className="slider-track w-full"
          style={{
            background: `linear-gradient(to right, #6366F1 ${loadPct}%, #E5E2DA ${loadPct}%)`,
          }}
        />
        <div className="flex justify-between">
          <span className="text-[10px] text-ink-muted">0 kg (empty)</span>
          <span className="text-[10px] text-ink-muted">300 kg (full load)</span>
        </div>
      </div>

      <div className="border-t border-border" />

      {/* Rim Size */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <CircleDot size={14} className="text-ink-tertiary" />
          <span className="text-sm font-medium text-ink-secondary">Rim Size</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {([
            { size: '18' as const, label: '18"', sub: 'Efficient' },
            { size: '19' as const, label: '19"', sub: 'Standard' },
            { size: '20' as const, label: '20"', sub: 'Performance' },
          ]).map((opt) => (
            <button
              key={opt.size}
              onClick={() => onRimSize(opt.size)}
              className={`p-3 rounded-xl border text-center transition-all duration-150 ${
                rimSize === opt.size
                  ? 'border-accent bg-accent-light text-accent'
                  : 'border-border bg-white text-ink-tertiary hover:border-border-hover hover:text-ink-secondary'
              }`}
            >
              <div className="num text-lg font-bold">{opt.label}</div>
              <div className="text-[10px] font-medium mt-0.5 opacity-70">{opt.sub}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
