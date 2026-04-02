'use client'

import { Building2, Milestone, Mountain } from 'lucide-react'
import { DrivingMix } from '@/lib/calculator'

interface Props {
  mix: DrivingMix
  onChange: (mix: DrivingMix) => void
}

const SEGMENTS = [
  {
    key: 'city' as const,
    label: 'City',
    sublabel: 'Regen braking',
    icon: Building2,
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-500/20',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    barColor: 'bg-gradient-to-r from-emerald-500 to-teal-400',
    badge: '-15%',
    badgeColor: 'text-emerald-400 bg-emerald-400/10',
  },
  {
    key: 'highway' as const,
    label: 'Highway',
    sublabel: 'Aero drag',
    icon: Milestone,
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'bg-blue-500/20',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    barColor: 'bg-gradient-to-r from-blue-500 to-indigo-400',
    badge: '+25%',
    badgeColor: 'text-orange-400 bg-orange-400/10',
  },
  {
    key: 'rough' as const,
    label: 'Rough Road',
    sublabel: 'Resistance',
    icon: Mountain,
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500/20',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    barColor: 'bg-gradient-to-r from-amber-500 to-orange-400',
    badge: '+10%',
    badgeColor: 'text-red-400 bg-red-400/10',
  },
]

export default function DrivingMixControl({ mix, onChange }: Props) {
  const total = mix.city + mix.highway + mix.rough

  const handleChange = (key: keyof DrivingMix, rawValue: number) => {
    const newVal = Math.max(0, Math.min(100, rawValue))
    const others = (['city', 'highway', 'rough'] as (keyof DrivingMix)[]).filter((k) => k !== key)

    const remaining = 100 - newVal
    const currentOtherTotal = others.reduce((sum, k) => sum + mix[k], 0)

    let updated: DrivingMix = { ...mix, [key]: newVal }

    if (currentOtherTotal === 0) {
      const split = Math.floor(remaining / 2)
      updated[others[0]] = split
      updated[others[1]] = remaining - split
    } else {
      others.forEach((k) => {
        updated[k] = Math.round((mix[k] / currentOtherTotal) * remaining)
      })
      // Fix rounding drift — apply to the largest other segment
      const newTotal = updated.city + updated.highway + updated.rough
      if (newTotal !== 100) {
        const diff = 100 - newTotal
        const target = updated[others[0]] >= updated[others[1]] ? others[0] : others[1]
        updated[target] = updated[target] + diff
      }
    }

    onChange(updated)
  }

  return (
    <div className="space-y-4">
      {/* Visual bar */}
      <div className="h-3 rounded-full overflow-hidden flex gap-0.5">
        <div
          className="bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-200 rounded-l-full"
          style={{ width: `${mix.city}%` }}
        />
        <div
          className="bg-gradient-to-r from-blue-500 to-indigo-400 transition-all duration-200"
          style={{ width: `${mix.highway}%` }}
        />
        <div
          className="bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-200 rounded-r-full"
          style={{ width: `${mix.rough}%` }}
        />
      </div>

      {/* Sliders */}
      <div className="space-y-3">
        {SEGMENTS.map((seg) => {
          const Icon = seg.icon
          return (
            <div key={seg.key} className={`p-3 rounded-xl border ${seg.borderColor} ${seg.bgColor}/30`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon size={14} className={seg.textColor} />
                  <span className="text-sm font-medium text-white/80">{seg.label}</span>
                  <span className="text-xs text-white/30">{seg.sublabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${seg.badgeColor}`}>
                    {seg.badge}
                  </span>
                  <span className={`text-base font-bold tabular-nums ${seg.textColor}`}>
                    {mix[seg.key]}%
                  </span>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={mix[seg.key]}
                onChange={(e) => handleChange(seg.key, Number(e.target.value))}
                className="slider-track w-full"
                style={{
                  background: `linear-gradient(to right, var(--tw-gradient-from, #10b981) ${mix[seg.key]}%, rgba(255,255,255,0.08) ${mix[seg.key]}%)`,
                }}
              />
            </div>
          )
        })}
      </div>

      {/* Total indicator */}
      <div
        className={`text-center text-xs font-medium transition-colors ${
          total === 100 ? 'text-white/30' : 'text-red-400'
        }`}
      >
        {total === 100 ? 'Total: 100% ✓' : `Total: ${total}% — must equal 100%`}
      </div>
    </div>
  )
}
