'use client'

import { useMemo, useState } from 'react'
import {
  Thermometer,
  Gauge,
  Zap,
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
} from 'lucide-react'
import { VEHICLES, Vehicle, DrivingMix, calculateRange } from '@/lib/calculator'
import VehicleSelector from '@/components/VehicleSelector'
import SliderControl from '@/components/SliderControl'
import DrivingMixControl from '@/components/DrivingMixControl'
import RangeDisplay from '@/components/RangeDisplay'
import FactorControls from '@/components/FactorControls'

const DEFAULT_MIX: DrivingMix = { city: 100, highway: 0, rough: 0 }

export default function Home() {
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

  // Accordion sections on mobile
  const [openSection, setOpenSection] = useState<string | null>('primary')

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
  }

  const formatTemp = (v: number) => (v >= 0 ? `+${v}` : `${v}`)

  const AccordionSection = ({
    id,
    title,
    icon: Icon,
    children,
  }: {
    id: string
    title: string
    icon: React.ElementType
    children: React.ReactNode
  }) => {
    const isOpen = openSection === id
    return (
      <div className="glass-card overflow-hidden">
        <button
          onClick={() => setOpenSection(isOpen ? null : id)}
          className="w-full flex items-center justify-between px-5 py-4 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-white/8 flex items-center justify-center">
              <Icon size={14} className="text-white/60" />
            </div>
            <span className="text-sm font-semibold text-white/80">{title}</span>
          </div>
          <ChevronDown
            size={16}
            className={`text-white/30 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
        {isOpen && <div className="px-5 pb-5">{children}</div>}
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-40 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Zap size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-base font-bold text-white leading-none">EV Range Hero</div>
              <div className="text-[10px] text-white/35 font-medium tracking-wider uppercase">
                Real-World Calculator
              </div>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/8 text-white/40 hover:text-white/70 hover:bg-white/8 hover:border-white/15 transition-all text-xs font-medium"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">

          {/* ── LEFT COLUMN — Controls ── */}
          <div className="space-y-6">

            {/* Section label */}
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-md bg-blue-500/20 flex items-center justify-center">
                <SlidersHorizontal size={11} className="text-blue-400" />
              </div>
              <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                Configure Your Journey
              </h2>
            </div>

            {/* Vehicle Selector */}
            <div className="glass-card p-5 space-y-4">
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
            <div className="glass-card p-5 space-y-6">
              <SectionHeader icon={Gauge} title="Speed & Temperature" />
              <SliderControl
                label="Speed"
                value={speed}
                min={30}
                max={180}
                unit="km/h"
                icon={<Gauge size={14} />}
                colorStops="#3b82f6"
                onChange={setSpeed}
              />
              <div className="border-t border-white/5" />
              <SliderControl
                label="Temperature"
                value={temperature}
                min={-20}
                max={45}
                unit="°C"
                icon={<Thermometer size={14} />}
                colorStops={temperature < 0 ? '#06b6d4' : temperature < 20 ? '#3b82f6' : '#f59e0b'}
                formatValue={formatTemp}
                onChange={setTemperature}
              />
            </div>

            {/* Driving Mix */}
            <div className="glass-card p-5 space-y-4">
              <SectionHeader
                icon={SlidersHorizontal}
                title="Driving Mix"
                badge="Must total 100%"
              />
              <DrivingMixControl mix={drivingMix} onChange={setDrivingMix} />
            </div>

            {/* Environment & Load */}
            <div className="glass-card p-5 space-y-4">
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

          {/* ── RIGHT COLUMN — Output ── */}
          <div className="lg:sticky lg:top-24 space-y-6">
            {/* Range Hero Card */}
            <div className="glass-card-strong p-8 relative overflow-hidden">
              {/* Ambient glow */}
              <div
                className={`absolute inset-0 opacity-5 blur-3xl pointer-events-none transition-all duration-1000 ${
                  result.range / Math.round((activeVehicle.battery * 1000) / activeVehicle.baseWh) > 0.65
                    ? 'bg-emerald-400'
                    : result.range / Math.round((activeVehicle.battery * 1000) / activeVehicle.baseWh) > 0.35
                    ? 'bg-orange-400'
                    : 'bg-red-400'
                }`}
              />

              <div className="relative z-10">
                <div className="text-center mb-6">
                  <div className="text-xs font-semibold text-white/30 uppercase tracking-widest">
                    {activeVehicle.name}
                  </div>
                  <div className="text-[10px] text-white/20 mt-0.5">
                    {activeVehicle.battery} kWh · {activeVehicle.baseWh} Wh/km base
                  </div>
                </div>

                <RangeDisplay
                  result={result}
                  vehicle={activeVehicle}
                  customBattery={customBattery}
                />
              </div>
            </div>

            {/* Conditions Summary */}
            <div className="glass-card p-4">
              <div className="text-[10px] text-white/25 uppercase tracking-widest font-semibold mb-3">
                Active Conditions
              </div>
              <div className="grid grid-cols-2 gap-2">
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

            {/* Tip */}
            <div className="text-center text-[11px] text-white/20 leading-relaxed px-4">
              All calculations are estimates based on coefficient modeling.
              Actual range varies with driving style and road conditions.
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-xs text-white/20">
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
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-md bg-white/8 flex items-center justify-center">
          <Icon size={13} className="text-white/50" />
        </div>
        <h3 className="text-sm font-semibold text-white/70">{title}</h3>
      </div>
      {badge && (
        <span className="text-[10px] text-white/30 bg-white/5 border border-white/8 px-2 py-0.5 rounded-full font-medium">
          {badge}
        </span>
      )}
    </div>
  )
}

function ConditionPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-2.5 py-1.5 bg-white/3 rounded-lg border border-white/6">
      <span className="text-[10px] text-white/30 font-medium">{label}</span>
      <span className="text-[10px] text-white/70 font-semibold">{value}</span>
    </div>
  )
}
