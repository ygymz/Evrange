'use client'

import { Wind, Users, CircleDot } from 'lucide-react'

interface Props {
  climateControl: boolean
  windDirection: 'headwind' | 'tailwind' | 'none'
  extraLoad: number
  rimSize: '18' | '20'
  onClimateControl: (val: boolean) => void
  onWindDirection: (val: 'headwind' | 'tailwind' | 'none') => void
  onExtraLoad: (val: number) => void
  onRimSize: (val: '18' | '20') => void
}

function ToggleSwitch({
  label,
  sublabel,
  checked,
  onChange,
  activeColor = 'blue',
}: {
  label: string
  sublabel?: string
  checked: boolean
  onChange: (v: boolean) => void
  activeColor?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium text-white/70">{label}</div>
        {sublabel && <div className="text-xs text-white/30">{sublabel}</div>}
      </div>
      <label className="toggle-switch shrink-0">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="toggle-slider" />
      </label>
    </div>
  )
}

function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string; icon?: React.ReactNode }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-white/70">{label}</div>
      <div className="flex gap-1.5 p-1 bg-white/4 rounded-lg border border-white/8">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-semibold transition-all duration-200 ${
              value === opt.value
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-white/35 hover:text-white/60 hover:bg-white/5'
            }`}
          >
            {opt.icon}
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function FactorControls({
  climateControl,
  windDirection,
  extraLoad,
  rimSize,
  onClimateControl,
  onWindDirection,
  onExtraLoad,
  onRimSize,
}: Props) {
  const loadPct = ((extraLoad - 0) / (300 - 0)) * 100

  return (
    <div className="space-y-5">
      {/* Climate Control */}
      <ToggleSwitch
        label="Climate Control"
        sublabel={climateControl ? 'AC/Heat active (+22–35 Wh/km)' : 'Off'}
        checked={climateControl}
        onChange={onClimateControl}
      />

      <div className="border-t border-white/5" />

      {/* Wind */}
      <SegmentedControl
        label="Wind Direction"
        value={windDirection}
        onChange={onWindDirection}
        options={[
          { value: 'tailwind', label: 'Tailwind', icon: <Wind size={11} className="rotate-180" /> },
          { value: 'none',     label: 'Calm',      icon: <Wind size={11} className="opacity-40" /> },
          { value: 'headwind', label: 'Headwind',  icon: <Wind size={11} /> },
        ]}
      />

      <div className="border-t border-white/5" />

      {/* Extra Load */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-white/40" />
            <span className="text-sm font-medium text-white/70">Extra Load</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-white tabular-nums">{extraLoad}</span>
            <span className="text-xs text-white/40 font-medium">kg</span>
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
            background: `linear-gradient(to right, #8b5cf6 ${loadPct}%, rgba(255,255,255,0.1) ${loadPct}%)`,
          }}
        />
        <div className="flex justify-between">
          <span className="text-[10px] text-white/25">0 kg (empty)</span>
          <span className="text-[10px] text-white/25">300 kg (full load)</span>
        </div>
      </div>

      <div className="border-t border-white/5" />

      {/* Rim Size */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <CircleDot size={14} className="text-white/40" />
          <span className="text-sm font-medium text-white/70">Rim Size</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {([
            { size: '18' as const, label: '18"', sub: 'Aero / Efficient' },
            { size: '20' as const, label: '20"', sub: 'Performance +4%' },
          ]).map((opt) => (
            <button
              key={opt.size}
              onClick={() => onRimSize(opt.size)}
              className={`p-3 rounded-xl border text-center transition-all duration-200 ${
                rimSize === opt.size
                  ? 'border-blue-500/40 bg-blue-500/10 text-blue-300'
                  : 'border-white/8 bg-white/3 text-white/40 hover:border-white/15 hover:text-white/60'
              }`}
            >
              <div className="text-lg font-bold">{opt.label}</div>
              <div className="text-[10px] font-medium mt-0.5 opacity-70">{opt.sub}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
