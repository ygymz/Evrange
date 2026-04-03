'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Thermometer,
  Gauge,
  Zap,
  SlidersHorizontal,
  RotateCcw,
  Languages,
  Moon,
  Sun,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { VEHICLES, Vehicle, DrivingMix, calculateRange } from '@/lib/calculator'
import VehicleSelector from '@/components/VehicleSelector'
import SliderControl from '@/components/SliderControl'
import DrivingMixControl from '@/components/DrivingMixControl'
import RangeDisplay, { AnimatedNumber } from '@/components/RangeDisplay'
import FactorControls from '@/components/FactorControls'
import { useTranslation } from '@/lib/i18n'

import LoadingScreen from '@/components/LoadingScreen'

const DEFAULT_MIX: DrivingMix = { city: 10, highway: 90, rough: 0 }
const STORAGE_KEY = 'truerange-state'

interface PersistedState {
  vehicleId: string
  speed: number
  temperature: number
  drivingMix: DrivingMix
  climateControl: boolean
  extraLoad: number
  rimSize: '18' | '19' | '20'
}

function loadState(): Partial<PersistedState> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export default function Home() {
  const { t, language, setLanguage } = useTranslation()
  const { theme, setTheme } = useTheme()
  const [initialized, setInitialized] = useState(false)

  // Vehicle
  const [vehicle, setVehicle] = useState<Vehicle>(VEHICLES[0])

  // Primary sliders
  const [speed, setSpeed] = useState(90)
  const [temperature, setTemperature] = useState(20)

  // Driving mix
  const [drivingMix, setDrivingMix] = useState<DrivingMix>(DEFAULT_MIX)

  // Environmental factors
  const [climateControl, setClimateControl] = useState(false)
  const [extraLoad, setExtraLoad] = useState(0)
  const [rimSize, setRimSize] = useState<'18' | '19' | '20'>('19')

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = loadState()
    if (saved.vehicleId) {
      const found = VEHICLES.find((v) => v.id === saved.vehicleId)
      if (found) setVehicle(found)
    }
    if (saved.speed !== undefined) setSpeed(saved.speed)
    if (saved.temperature !== undefined) setTemperature(saved.temperature)
    if (saved.drivingMix) setDrivingMix(saved.drivingMix)
    if (saved.climateControl !== undefined) setClimateControl(saved.climateControl)
    if (saved.extraLoad !== undefined) setExtraLoad(saved.extraLoad)
    if (saved.rimSize) setRimSize(saved.rimSize)
    
    // Delay matches the LoadingScreen's animation duration (3.5s)
    const timer = setTimeout(() => {
      setInitialized(true)
    }, 3500)

    return () => clearTimeout(timer)
  }, [])

  // Persist state to localStorage
  const saveState = useCallback(() => {
    const state: PersistedState = {
      vehicleId: vehicle.id,
      speed,
      temperature,
      drivingMix,
      climateControl,
      extraLoad,
      rimSize,
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch { /* quota exceeded — ignore */ }
  }, [vehicle, speed, temperature, drivingMix, climateControl, extraLoad, rimSize])

  useEffect(() => {
    if (initialized) saveState()
  }, [initialized, saveState])

  const result = useMemo(
    () =>
      calculateRange({
        vehicle,
        speed,
        temperature,
        drivingMix,
        climateControl,
        extraLoad,
        rimSize,
      }),
    [vehicle, speed, temperature, drivingMix, climateControl, extraLoad, rimSize],
  )

  const handleReset = () => {
    setVehicle(VEHICLES[0])
    setSpeed(90)
    setTemperature(20)
    setDrivingMix(DEFAULT_MIX)
    setClimateControl(false)
    setExtraLoad(0)
    setRimSize('19')
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
  }

  const formatTemp = (v: number) => (v >= 0 ? `+${v}` : `${v}`)

  if (!initialized) {
    return <LoadingScreen />
  }

  const maxRange = Math.round((vehicle.battery * 1000) / vehicle.baseWh)
  const ratio = result.range / maxRange
  const rangeColorClass = ratio > 0.65 ? 'text-accent' : ratio > 0.35 ? 'text-amber-600' : 'text-red-600'

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-40 bg-surface-glass backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-base font-bold text-ink leading-none tracking-tight">{t('app.title')}</div>
              <div className="text-[10px] text-ink-muted font-medium tracking-wider uppercase mt-0.5">
                {t('app.subtitle')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {initialized && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-border text-ink-tertiary hover:text-ink-secondary hover:border-border-hover dark:hover:bg-surface-card hover:bg-white transition-all"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              </button>
            )}
            <button
              onClick={() => setLanguage(language === 'en' ? 'tr' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-ink-tertiary hover:text-ink-secondary hover:border-border-hover dark:hover:bg-surface-card hover:bg-white transition-all text-xs font-medium"
            >
              <Languages size={12} />
              {language.toUpperCase()}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-ink-tertiary hover:text-ink-secondary hover:border-border-hover dark:hover:bg-surface-card hover:bg-white transition-all text-xs font-medium"
            >
              <RotateCcw size={12} />
              {t('app.reset')}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sticky Range Banner */}
      <div className="lg:hidden sticky top-[65px] z-30 bg-surface-glass backdrop-blur-md border-b border-border px-5 py-3 flex items-center justify-between shadow-sm">
        <div className="flex flex-col">
          <span className="text-[10px] text-ink-muted font-bold tracking-widest uppercase">{t('range.estimated')}</span>
          <span className="text-xs font-semibold text-ink mt-0.5 truncate max-w-[180px] sm:max-w-[300px]">
            {vehicle.name}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-baseline gap-1">
            <div className={`num text-2xl font-bold leading-none ${rangeColorClass} transition-colors duration-500`}>
              <AnimatedNumber value={result.range} />
            </div>
            <div className="text-[10px] uppercase font-bold text-ink-muted tracking-widest">km</div>
          </div>
          <div className={`text-[10px] font-bold mt-1 ${
              result.range === maxRange ? 'text-ink-muted' : 
              result.range > maxRange ? 'text-accent' : 
              'text-red-500'
          }`}>
            {result.range > maxRange ? '+' : ''}{Math.round(((result.range - maxRange) / maxRange) * 100)}%
          </div>
        </div>
      </div>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

          {/* LEFT COLUMN — Controls */}
          <div className="space-y-5">

            {/* Vehicle Selector */}
            <div className="card p-5 space-y-4">
              <SectionHeader icon={Zap} title={t('section.vehicle')} />
              <VehicleSelector
                selected={vehicle}
                onSelect={setVehicle}
              />
            </div>

            {/* Primary Sliders */}
            <div className="card p-5 space-y-6">
              <SectionHeader icon={Gauge} title={t('section.speedTemp')} />
              <SliderControl
                label={t('term.speed')}
                value={speed}
                min={30}
                max={180}
                unit="km/h"
                icon={<Gauge size={14} />}
                colorStops="var(--accent)"
                onChange={setSpeed}
              />
              <div className="border-t border-border" />
              <SliderControl
                label={t('term.temp')}
                value={temperature}
                min={-20}
                max={45}
                unit="°C"
                icon={<Thermometer size={14} />}
                colorStops={temperature < 0 ? '#0891B2' : temperature < 20 ? '#6366F1' : '#D97706'}
                formatValue={formatTemp}
                onChange={setTemperature}
              />
            </div>

            {/* Driving Mix */}
            <div className="card p-5 space-y-4">
              <SectionHeader
                icon={SlidersHorizontal}
                title={t('section.drivingMix')}
                badge={t('badge.total100')}
              />
              <DrivingMixControl mix={drivingMix} onChange={setDrivingMix} />
            </div>

            {/* Environment & Load */}
            <div className="card p-5 space-y-4">
              <SectionHeader icon={Thermometer} title={t('section.envLoad')} />
              <FactorControls
                climateControl={climateControl}
                extraLoad={extraLoad}
                rimSize={rimSize}
                onClimateControl={setClimateControl}
                onExtraLoad={setExtraLoad}
                onRimSize={setRimSize}
              />
            </div>
          </div>

          {/* RIGHT COLUMN — Output */}
          <div className="lg:sticky lg:top-24 space-y-5">
            {/* Range Card */}
            <div className="card-strong p-7">
              <div className="text-center mb-5">
                <div className="text-[11px] font-semibold text-ink-tertiary uppercase tracking-widest">
                  {vehicle.name}
                </div>
                <div className="num text-[10px] text-ink-muted mt-0.5">
                  {vehicle.battery} kWh · {vehicle.baseWh} Wh/km base
                </div>
              </div>

              <RangeDisplay
                result={result}
                vehicle={vehicle}
              />
            </div>

            {/* Conditions Summary */}
            <div className="card p-4">
              <div className="text-[10px] text-ink-muted uppercase tracking-widest font-semibold mb-3">
                {t('sidebar.activeConditions')}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <ConditionPill label={t('term.speed')} value={`${speed} km/h`} />
                <ConditionPill label={t('term.temp')} value={`${formatTemp(temperature)}°C`} />
                <ConditionPill label={t('term.city')} value={`${drivingMix.city}%`} />
                <ConditionPill label={t('term.highway')} value={`${drivingMix.highway}%`} />
                <ConditionPill label={t('term.load')} value={`+${extraLoad} kg`} />
                <ConditionPill label={t('term.climate')} value={climateControl ? t('term.on') : t('term.off')} />
                <ConditionPill label={t('term.rims')} value={`${rimSize}"`} />
              </div>
            </div>

            {/* Disclaimer */}
            <div className="text-center text-[11px] text-ink-muted leading-relaxed px-4">
              {t('footer.disclaimer')}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 text-center">
          <div className="text-xs text-ink-muted">
            {t('footer.credits')} · {new Date().getFullYear()}
          </div>
        </div>
      </footer>
    </div>
  )
}

function SectionHeader({
  icon: Icon,
  title,
  badge,
}: {
  icon: React.ElementType
  title: string
  badge?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-ink-tertiary" />
        <h3 className="text-sm font-semibold text-ink-secondary">{title}</h3>
      </div>
      {badge && (
        <span className="text-[10px] text-ink-tertiary bg-surface border border-border px-2 py-0.5 rounded-full font-medium">
          {badge}
        </span>
      )}
    </div>
  )
}

function ConditionPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-2.5 py-1.5 bg-surface rounded-lg">
      <span className="text-[10px] text-ink-muted font-medium">{label}</span>
      <span className="num text-[10px] text-ink-secondary font-semibold">{value}</span>
    </div>
  )
}
