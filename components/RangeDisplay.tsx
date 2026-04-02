'use client'

import { useEffect, useRef, useState } from 'react'
import { CalculatorResult, Vehicle } from '@/lib/calculator'
import { getRangeColor, getRangeGlow } from '@/lib/calculator'
import { Gauge, Zap, BatteryMedium, TrendingUp } from 'lucide-react'

interface Props {
  result: CalculatorResult
  vehicle: Vehicle
  customBattery: number
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
      // Ease out cubic
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

const EFFICIENCY_CONFIG = {
  Excellent: { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', dot: 'bg-emerald-400' },
  Good:      { color: 'text-blue-400',    bg: 'bg-blue-400/10',    border: 'border-blue-400/20',    dot: 'bg-blue-400' },
  Fair:      { color: 'text-orange-400',  bg: 'bg-orange-400/10',  border: 'border-orange-400/20',  dot: 'bg-orange-400' },
  Poor:      { color: 'text-red-400',     bg: 'bg-red-400/10',     border: 'border-red-400/20',     dot: 'bg-red-400' },
}

export default function RangeDisplay({ result, vehicle, customBattery }: Props) {
  const battery = vehicle.custom ? customBattery : vehicle.battery
  const maxRange = Math.round((battery * 1000) / vehicle.baseWh)
  const rangeColor = getRangeColor(result.range, maxRange)
  const rangeGlow = getRangeGlow(result.range, maxRange)
  const effConfig = EFFICIENCY_CONFIG[result.efficiencyLabel]

  const ringPct = Math.min(100, (result.range / maxRange) * 100)
  const circumference = 2 * Math.PI * 54 // r=54
  const dashOffset = circumference - (ringPct / 100) * circumference

  const ringStroke =
    result.range / maxRange > 0.65
      ? 'url(#greenGrad)'
      : result.range / maxRange > 0.35
      ? 'url(#orangeGrad)'
      : 'url(#redGrad)'

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Circular ring + main number */}
      <div className="relative flex items-center justify-center">
        <svg width="140" height="140" className="absolute" style={{ transform: 'rotate(-90deg)' }}>
          <defs>
            <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
            <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
          </defs>
          {/* Background track */}
          <circle
            cx="70" cy="70" r="54"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="8"
          />
          {/* Progress */}
          <circle
            cx="70" cy="70" r="54"
            fill="none"
            stroke={ringStroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </svg>

        <div className="text-center z-10">
          <div className={`text-5xl font-black tabular-nums leading-none ${rangeColor} ${rangeGlow} transition-colors duration-500`}>
            <AnimatedNumber value={result.range} />
          </div>
          <div className="text-xs font-semibold text-white/40 mt-1 tracking-widest uppercase">km</div>
        </div>
      </div>

      {/* Label */}
      <div className="text-center">
        <div className="text-xs text-white/30 uppercase tracking-widest font-medium">Estimated Range</div>
        <div className="text-sm text-white/50 mt-0.5">
          Ideal: <span className="text-white/70 font-semibold">{maxRange} km</span>
        </div>
      </div>

      {/* Secondary metrics */}
      <div className="w-full grid grid-cols-3 gap-3">
        {/* Efficiency Wh/km */}
        <div className="glass-card p-3 text-center">
          <div className="flex justify-center mb-1.5">
            <Gauge size={14} className="text-white/30" />
          </div>
          <div className="text-xl font-bold text-white tabular-nums">{result.efficiency}</div>
          <div className="text-[10px] text-white/30 mt-0.5 font-medium">Wh/km</div>
        </div>

        {/* Battery utilization */}
        <div className="glass-card p-3 text-center">
          <div className="flex justify-center mb-1.5">
            <BatteryMedium size={14} className="text-white/30" />
          </div>
          <div className="text-xl font-bold text-white tabular-nums">{result.batteryHealthPct}%</div>
          <div className="text-[10px] text-white/30 mt-0.5 font-medium">Utilization</div>
        </div>

        {/* Efficiency label */}
        <div className="glass-card p-3 text-center">
          <div className="flex justify-center mb-1.5">
            <TrendingUp size={14} className="text-white/30" />
          </div>
          <div className={`flex items-center justify-center gap-1 border rounded-full px-2 py-0.5 ${effConfig.bg} ${effConfig.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${effConfig.dot}`} />
            <span className={`text-[10px] font-bold ${effConfig.color}`}>{result.efficiencyLabel}</span>
          </div>
          <div className="text-[10px] text-white/30 mt-1 font-medium">Rating</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full">
        <div className="flex justify-between text-[10px] text-white/30 mb-1.5">
          <span>0 km</span>
          <span>{maxRange} km (ideal)</span>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              result.range / maxRange > 0.65
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : result.range / maxRange > 0.35
                ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                : 'bg-gradient-to-r from-red-600 to-red-400'
            }`}
            style={{ width: `${Math.min(100, (result.range / maxRange) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
