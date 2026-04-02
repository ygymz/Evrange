'use client'

import { useEffect, useRef, useState } from 'react'
import { CalculatorResult, Vehicle } from '@/lib/calculator'
import { useTranslation } from '@/lib/i18n'

interface Props {
  result: CalculatorResult
  vehicle: Vehicle
}

function AnimatedNumber({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(value)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const start = displayed
    const end = value
    const duration = 400
    const startTime = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(start + (end - start) * eased))
      if (progress < 1) frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <>{displayed}</>
}

const LABEL_CONFIG = {
  Excellent: { color: 'text-accent',    bg: 'bg-accent-light',  border: 'border-accent/20',    dot: 'bg-accent' },
  Good:      { color: 'text-blue-600',  bg: 'bg-blue-50',       border: 'border-blue-200',     dot: 'bg-blue-500' },
  Fair:      { color: 'text-amber-600', bg: 'bg-amber-50',      border: 'border-amber-200',    dot: 'bg-amber-500' },
  Poor:      { color: 'text-red-600',   bg: 'bg-red-50',        border: 'border-red-200',      dot: 'bg-red-500' },
}

function getRangeColor(ratio: number): string {
  if (ratio > 0.65) return 'text-accent'
  if (ratio > 0.35) return 'text-amber-600'
  return 'text-red-600'
}

function getRangeArc(ratio: number): string {
  if (ratio > 0.65) return '#0F766E'
  if (ratio > 0.35) return '#D97706'
  return '#B83B3B'
}

export default function RangeDisplay({ result, vehicle }: Props) {
  const { t } = useTranslation()
  const battery = vehicle.battery
  const maxRange = Math.round((battery * 1000) / vehicle.baseWh)
  const ratio = result.range / maxRange
  const rangeColor = getRangeColor(ratio)
  const arcColor = getRangeArc(ratio)
  const effConfig = LABEL_CONFIG[result.efficiencyLabel]

  const ringPct = Math.min(100, ratio * 100)
  const circumference = 2 * Math.PI * 58
  const dashOffset = circumference - (ringPct / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Circular arc + main number */}
      <div className="relative flex items-center justify-center w-[148px] h-[148px]">
        <svg width="148" height="148" className="absolute" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background track */}
          <circle
            cx="74" cy="74" r="58"
            fill="none"
            stroke="#E5E2DA"
            strokeWidth="5"
          />
          {/* Progress arc */}
          <circle
            cx="74" cy="74" r="58"
            fill="none"
            stroke={arcColor}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.5s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.5s ease' }}
          />
        </svg>

        <div className="text-center z-10">
          <div className={`num text-5xl font-bold leading-none ${rangeColor} transition-colors duration-500`}>
            <AnimatedNumber value={result.range} />
          </div>
          <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-widest">km</div>
        </div>
      </div>

      {/* Ideal range reference */}
      <div className="text-center">
        <div className="text-[11px] text-ink-tertiary uppercase tracking-wider font-medium">{t('range.estimated')}</div>
        <div className="text-sm text-ink-secondary mt-0.5">
          {t('range.ideal')}: <span className="num font-semibold text-ink">{maxRange} km</span>
        </div>
      </div>

      {/* Secondary metrics */}
      <div className="w-full grid grid-cols-3 gap-2">
        <div className="p-3 rounded-xl bg-surface border border-border text-center">
          <div className="num text-lg font-bold text-ink">{result.efficiency}</div>
          <div className="text-[10px] text-ink-muted mt-0.5 font-medium">Wh/km</div>
        </div>

        <div className="p-3 rounded-xl bg-surface border border-border text-center">
          <div className="num text-lg font-bold text-ink">{result.batteryHealthPct}%</div>
          <div className="text-[10px] text-ink-muted mt-0.5 font-medium">{t('range.utilization')}</div>
        </div>

        <div className="p-3 rounded-xl bg-surface border border-border text-center">
          <div className={`inline-flex items-center gap-1 border rounded-full px-2 py-0.5 ${effConfig.bg} ${effConfig.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${effConfig.dot}`} />
            <span className={`text-[10px] font-bold ${effConfig.color}`}>{t(`rating.${result.efficiencyLabel}`)}</span>
          </div>
          <div className="text-[10px] text-ink-muted mt-1 font-medium">{t('range.rating')}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full">
        <div className="flex justify-between text-[10px] text-ink-muted mb-1.5">
          <span className="num">0 km</span>
          <span className="num">{maxRange} km</span>
        </div>
        <div className="h-1.5 rounded-full bg-border/60 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, ratio * 100)}%`,
              backgroundColor: arcColor,
            }}
          />
        </div>
      </div>
    </div>
  )
}
