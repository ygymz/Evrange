'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Thermometer,
  Gauge,
  Zap,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react'
import { VEHICLES, Vehicle, DrivingMix, calculateRange } from '@/lib/calculator'
import VehicleSelector from '@/components/VehicleSelector'
import SliderControl from '@/components/SliderControl'
import DrivingMixControl from '@/components/DrivingMixControl'
import RangeDisplay from '@/components/RangeDisplay'
import FactorControls from '@/components/FactorControls'

const DEFAULT_MIX: DrivingMix = { city: 100, highway: 0, rough: 0 }
const STORAGE_KEY = 'ev-range-hero-state'

interface PersistedState {
  vehicleId: string
  customBattery: number
  customBaseWh: number
  speed: number
  temperature: number
  drivingMix: DrivingMix
  climateControl: boolean
  windDirection: 'headwind' | 'tailwind' | 'none'
  extraLoad: number
  rimSize: '18' | '20'
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
  const [initialized, setInitialized] = useState(false)

  // Vehicle
  const [vehicle, setVehicle] = useState<Vehicle>(VEHICLES[0])
  const [customBattery, setCustomBattery] = useState(75)
  const [customBaseWh, setCustomBaseWh] = useState(160)

  // Primary sliders
  const [speed, setSpeed] = useState(90)
  const [temperature, setTemperature] = useState(20)

  // Driving mix
  const [drivingMix, setDrivingMix] = useState<DrivingMix>(DEFAULT_MIX)

  // Environmental factors
  const [climateControl, setClimateControl] = useState(false)
  const [windDirection, setWindDirection] = useState<'headwind' | 'tailwind' | 'none'>('none')
  const [extraLoad, setExtraLoad] = useState(0)
  const [rimSize, setRimSize] = useState<'18' | '20'>('18')

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = loadState()
    if (saved.vehicleId) {
      const found = VEHICLES.find((v) => v.id === saved.vehicleId)
      if (found) setVehicle(found)
    }
    if (saved.customBattery !== undefined) setCustomBattery(saved.customBattery)
    if (saved.customBaseWh !== undefined) setCustomBaseWh(saved.customBaseWh)
    if (saved.speed !== undefined) setSpeed(saved.speed)
    if (saved.temperature !== undefined) setTemperature(saved.temperature)
    if (saved.drivingMix) setDrivingMix(saved.drivingMix)
    if (saved.climateControl !== undefined) setClimateControl(saved.climateControl)
    if (saved.windDirection) setWindDirection(saved.windDirection)
    if (saved.extraLoad !== undefined) setExtraLoad(saved.extraLoad)
    if (saved.rimSize) setRimSize(saved.rimSize)
    setInitialized(true)
  }, [])

  // Persist state to localStorage
  const saveState = useCallback(() => {
    const state: PersistedState = {
      vehicleId: vehicle.id,
      customBattery,
      customBaseWh,
      speed,
      temperature,
      drivingMix,
      climateControl,
      windDirection,
      extraLoad,
      rimSize,
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch { /* quota exceeded — ignore */ }
  }, [vehicle, customBattery, customBaseWh, speed, temperature, drivingMix, climateControl, windDirection, extraLoad, rimSize])

  useEffect(() => {
    if (initialized) saveState()
  }, [initialized, saveState])

  const activeVehicle = useMemo<Vehicle>(() => {
    if (vehicle.custom) {
      return { ...vehicle, battery: customBattery, baseWh: customBaseWh }
    }
    return vehicle
  }, [vehicle, customBattery, customBaseWh])

  const result = useMemo(
    () =>
      calculateRange({
        vehicle: activeVehicle,
        speed,
        temperature,
        drivingMix,
        climateControl,
        windDirection,
        extraLoad,
        rimSize,
      }),
    [activeVehicle, speed, temperature, drivingMix, climateControl, windDirection, extraLoad, rimSize],
  )

  const handleReset = () => {
    setVehicle(VEHICLES[0])
    setCustomBattery(75)
    setCustomBaseWh(160)
    setSpeed(90)
    setTemperature(20)
    setDrivingMix(DEFAULT_MIX)
    setClimateControl(false)
    setWindDirection('none')
    setExtraLoad(0)
    setRimSize('18')
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
  }

  const formatTemp = (v: number) => (v >= 0 ? `+${v}` : `${v}`)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-40 bg-surface/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Zap size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-base font-bold text-ink leading-none tracking-tight">EV Range Hero</div>
              <div className="text-[10px] text-ink-muted font-medium tracking-wider uppercase mt-0.5">
                Real-World Calculator
              </div>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-ink-tertiary hover:text-ink-secondary hover:border-border-hover hover:bg-white transition-all text-xs font-medium"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

          {/* LEFT COLUMN — Controls */}
          <div className="space-y-5">

            {/* Section label */}
            <div className="flex items-center gap-2.5">
              <SlidersHorizontal size={13} className="text-ink-muted" />
              <h2 className="text-[11px] font-semibold text-ink-muted uppercase tracking-widest">
                Configure Your Journey
              </h2>
            </div>

            {/* Vehicle Selector */}
            <div className="card p-5 space-y-4">
              <SectionHeader icon={Zap} title="Vehicle" />
              <VehicleSelector
                selected={vehicle}
                customBattery={customBattery}
                customBaseWh={customBaseWh}
                onSelect={setVehicle}
                onCustomBattery={setCustomBattery}
                onCustomBaseWh={setCustomBaseWh}
              />
            </div>

            {/* Primary Sliders */}
            <div className="card p-5 space-y-6">
              <SectionHeader icon={Gauge} title="Speed & Temperature" />
              <SliderControl
                label="Speed"
                value={speed}
                min={30}
                max={180}
                unit="km/h"
                icon={<Gauge size={14} />}
                colorStops="#0F766E"
                onChange={setSpeed}
              />
              <div className="border-t border-border" />
              <SliderControl
                label="Temperature"
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
                title="Driving Mix"
                badge="Must total 100%"
              />
              <DrivingMixControl mix={drivingMix} onChange={setDrivingMix} />
            </div>

            {/* Environment & Load */}
            <div className="card p-5 space-y-4">
              <SectionHeader icon={Thermometer} title="Environment & Load" />
              <FactorControls
                climateControl={climateControl}
                windDirection={windDirection}
                extraLoad={extraLoad}
                rimSize={rimSize}
                onClimateControl={setClimateControl}
                onWindDirection={setWindDirection}
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
                  {activeVehicle.name}
                </div>
                <div className="num text-[10px] text-ink-muted mt-0.5">
                  {activeVehicle.battery} kWh · {activeVehicle.baseWh} Wh/km base
                </div>
              </div>

              <RangeDisplay
                result={result}
                vehicle={activeVehicle}
                customBattery={customBattery}
              />
            </div>

            {/* Conditions Summary */}
            <div className="card p-4">
              <div className="text-[10px] text-ink-muted uppercase tracking-widest font-semibold mb-3">
                Active Conditions
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <ConditionPill label="Speed" value={`${speed} km/h`} />
                <ConditionPill label="Temp" value={`${formatTemp(temperature)}°C`} />
                <ConditionPill label="City" value={`${drivingMix.city}%`} />
                <ConditionPill label="Highway" value={`${drivingMix.highway}%`} />
                <ConditionPill label="Wind" value={windDirection === 'none' ? 'Calm' : windDirection} />
                <ConditionPill label="Load" value={`+${extraLoad} kg`} />
                <ConditionPill label="Climate" value={climateControl ? 'On' : 'Off'} />
                <ConditionPill label="Rims" value={`${rimSize}"`} />
              </div>
            </div>

            {/* Disclaimer */}
            <div className="text-center text-[11px] text-ink-muted leading-relaxed px-4">
              All calculations are estimates based on coefficient modeling.
              Actual range varies with driving style and road conditions.
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 text-center">
          <div className="text-xs text-ink-muted">
            EV Range Hero · Coefficient-based range modeling · {new Date().getFullYear()}
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
