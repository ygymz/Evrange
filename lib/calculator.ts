export interface Vehicle {
  id: string
  name: string
  battery: number   // kWh
  baseWh: number    // Wh/km base consumption
  custom?: boolean
}

export interface DrivingMix {
  city: number      // percentage 0-100
  highway: number   // percentage 0-100
  rough: number     // percentage 0-100
}

export interface CalculatorInputs {
  vehicle: Vehicle
  speed: number         // km/h
  temperature: number   // °C
  drivingMix: DrivingMix
  climateControl: boolean
  windDirection: 'headwind' | 'tailwind' | 'none'
  extraLoad: number     // kg
  rimSize: '18' | '20'
}

export interface CalculatorResult {
  range: number         // km
  efficiency: number    // Wh/km
  batteryHealthPct: number
  efficiencyLabel: 'Excellent' | 'Good' | 'Fair' | 'Poor'
}

export const VEHICLES: Vehicle[] = [
  { id: 'tesla-m3-lr',  name: 'Tesla Model 3 LR',    battery: 75.0,  baseWh: 145 },
  { id: 'togg-t10x',    name: 'TOGG T10X V2',         battery: 88.5,  baseWh: 191 },
  { id: 'ioniq6',       name: 'Hyundai IONIQ 6',      battery: 77.4,  baseWh: 139 },
  { id: 'zoe',          name: 'Renault Zoe',           battery: 52.0,  baseWh: 165 },
  { id: 'custom',       name: 'Custom Vehicle',        battery: 75.0,  baseWh: 160, custom: true },
]

export function calculateRange(inputs: CalculatorInputs): CalculatorResult {
  const { vehicle, speed, temperature, drivingMix, climateControl, windDirection, extraLoad, rimSize } = inputs

  let consumption = vehicle.baseWh

  // ── Speed Factor ──────────────────────────────────────────────────────────
  // Aerodynamic drag scales roughly with v^1.9; normalize at 90 km/h
  const speedRef = 90
  const speedFactor = Math.pow(speed / speedRef, 1.9)
  consumption *= speedFactor

  // ── Thermal Factor ────────────────────────────────────────────────────────
  // Below 5°C battery resistance increases significantly
  let thermalFactor = 1.0
  if (temperature < 5) {
    // Up to ~35% penalty at -20°C
    thermalFactor = 1 + (5 - temperature) * 0.015
  } else if (temperature > 35) {
    // Mild penalty above 35°C (pack cooling)
    thermalFactor = 1 + (temperature - 35) * 0.005
  }
  consumption *= thermalFactor

  // Climate control (fixed additional consumption)
  if (climateControl) {
    // Heating is more costly below 5°C
    const hvacCost = temperature < 5 ? 35 : 22  // Wh/km equivalent
    consumption += hvacCost
  }

  // ── Driving Mix Factor ────────────────────────────────────────────────────
  const cityFactor    = 1.0 - 0.15   // -15% (regen braking credit)
  const highwayFactor = 1.0 + 0.25   // +25%
  const roughFactor   = 1.0 + 0.10   // +10%

  const cityW    = drivingMix.city    / 100
  const highwayW = drivingMix.highway / 100
  const roughW   = drivingMix.rough   / 100

  const mixFactor =
    cityW    * cityFactor +
    highwayW * highwayFactor +
    roughW   * roughFactor

  consumption *= mixFactor

  // ── Wind Factor ───────────────────────────────────────────────────────────
  if (windDirection === 'headwind') {
    consumption *= 1.10  // ~10% penalty
  } else if (windDirection === 'tailwind') {
    consumption *= 0.93  // ~7% saving
  }

  // ── Load Factor ───────────────────────────────────────────────────────────
  // ~0.5 Wh/km per 10 kg of extra load
  consumption += (extraLoad / 10) * 0.5

  // ── Rim Factor ────────────────────────────────────────────────────────────
  if (rimSize === '20') {
    consumption *= 1.04  // Performance rims, ~4% more drag
  }

  // ── Range Calculation ─────────────────────────────────────────────────────
  const range = Math.round((vehicle.battery * 1000) / consumption)

  // ── Battery Health Proxy ──────────────────────────────────────────────────
  // Shows how efficiently the pack is being utilized (% of theoretical max)
  const theoreticalMax = Math.round((vehicle.battery * 1000) / vehicle.baseWh)
  const batteryHealthPct = Math.min(100, Math.round((range / theoreticalMax) * 100))

  // ── Efficiency Label ──────────────────────────────────────────────────────
  const efficiencyLabel =
    consumption < 160 ? 'Excellent' :
    consumption < 200 ? 'Good' :
    consumption < 250 ? 'Fair' : 'Poor'

  return {
    range,
    efficiency: Math.round(consumption),
    batteryHealthPct,
    efficiencyLabel,
  }
}

export function getRangeColor(range: number, maxRange: number): string {
  const ratio = range / maxRange
  if (ratio > 0.65) return 'text-green-400'
  if (ratio > 0.35) return 'text-orange-400'
  return 'text-red-400'
}

export function getRangeGlow(range: number, maxRange: number): string {
  const ratio = range / maxRange
  if (ratio > 0.65) return 'glow-green'
  if (ratio > 0.35) return 'glow-orange'
  return 'glow-red'
}
