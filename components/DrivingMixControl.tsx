'use client'

import { Building2, Milestone, Mountain } from 'lucide-react'
import { DrivingMix } from '@/lib/calculator'
import { useTranslation } from '@/lib/i18n'

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
    color: 'var(--accent)',
    barColor: 'bg-accent',
    textColor: 'text-accent',
    bgColor: 'bg-accent-light dark:bg-accent/10',
    borderColor: 'border-accent/20 dark:border-accent/30',
    badge: 'Regen',
    badgeStyle: 'text-accent bg-accent-light dark:bg-accent/20',
  },
  {
    key: 'highway' as const,
    label: 'Highway',
    sublabel: 'Aero drag',
    icon: Milestone,
    color: '#6366F1',
    barColor: 'bg-indigo-500',
    textColor: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-500/10',
    borderColor: 'border-indigo-200 dark:border-indigo-500/30',
    badge: 'Aero',
    badgeStyle: 'text-indigo-700 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-900/50',
  },
  {
    key: 'rough' as const,
    label: 'Rough Road',
    sublabel: 'Resistance',
    icon: Mountain,
    color: '#D97706',
    barColor: 'bg-amber-500',
    textColor: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-500/10',
    borderColor: 'border-amber-200 dark:border-amber-500/30',
    badge: 'Resist.',
    badgeStyle: 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-900/50',
  },
]

export default function DrivingMixControl({ mix, onChange }: Props) {
  const { t } = useTranslation()
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
      <div className="h-2.5 rounded-full overflow-hidden flex gap-0.5 bg-surface">
        <div
          className="bg-accent transition-all duration-200 rounded-l-full"
          style={{ width: `${mix.city}%` }}
        />
        <div
          className="bg-indigo-500 transition-all duration-200"
          style={{ width: `${mix.highway}%` }}
        />
        <div
          className="bg-amber-500 transition-all duration-200 rounded-r-full"
          style={{ width: `${mix.rough}%` }}
        />
      </div>

      {/* Sliders */}
      <div className="space-y-3">
        {SEGMENTS.map((seg) => {
          const Icon = seg.icon
          return (
            <div key={seg.key} className={`p-3 rounded-xl border ${seg.borderColor} ${seg.bgColor}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon size={14} className={seg.textColor} />
                  <span className="text-sm font-medium text-ink-secondary">{t(`mix.${seg.key}`)}</span>
                  <span className="text-xs text-ink-muted">{t(`mix.${seg.key}.sub`)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${seg.badgeStyle}`}>
                    {t(`mix.${seg.key}.badge`)}
                  </span>
                  <span className={`num text-sm font-bold ${seg.textColor}`}>
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
                  background: `linear-gradient(to right, ${seg.color} ${mix[seg.key]}%, var(--border) ${mix[seg.key]}%)`,
                }}
              />
            </div>
          )
        })}
      </div>

      {/* Total indicator */}
      <div
        className={`text-center text-xs font-medium transition-colors ${
          total === 100 ? 'text-ink-muted' : 'text-red-500'
        }`}
      >
        {total === 100 ? t('mix.total.ok') : t('mix.total.error', { val: total })}
      </div>
    </div>
  )
}
