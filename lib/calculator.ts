export interface PhysicsParams {
  mass: number          // kg (curb weight)
  cd: number            // drag coefficient
  frontalArea: number   // m²
  crr: number           // rolling resistance coefficient
  drivetrainEff: number // 0.85–0.92
  regenEff: number      // 0.60–0.70 fraction of kinetic energy recovered
  hasHeatPump: boolean
}

export interface Vehicle {
  id: string
  name: string
  battery: number   // kWh
  baseWh: number    // Wh/km — display-only reference (WLTP-like)
  custom?: boolean
  physics?: PhysicsParams
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

// ── Physics Constants ───────────────────────────────────────────────────────
const G = 9.81              // m/s²
const RHO_REF = 1.225       // kg/m³ at 15 °C, sea level
const WIND_SPEED = 4.17     // m/s (~15 km/h assumed wind)
const PARASITIC_LOAD = 250  // W — always-on systems (BMS, 12V, infotainment, lights)
const CITY_STOPS_PER_KM = 2 // average stop-start cycles per km in city driving

function airDensity(tempC: number): number {
  return RHO_REF * (288.15 / (273.15 + tempC))
}

function kmhToMs(kmh: number): number {
  return kmh / 3.6
}

// ── Vehicle Database ────────────────────────────────────────────────────────
export const VEHICLES: Vehicle[] = [
  {
    id: 'tesla-m3-lr',
    name: 'Tesla Model 3 LR',
    battery: 75.0,
    baseWh: 145,
    physics: { mass: 1830, cd: 0.23, frontalArea: 2.22, crr: 0.009, drivetrainEff: 0.91, regenEff: 0.65, hasHeatPump: true },
  },
  {
    id: 'togg-t10x',
    name: 'TOGG T10X V2',
    battery: 88.5,
    baseWh: 191,
    physics: { mass: 2130, cd: 0.298, frontalArea: 2.65, crr: 0.010, drivetrainEff: 0.88, regenEff: 0.60, hasHeatPump: true },
  },
  {
    id: 'ioniq6',
    name: 'Hyundai IONIQ 6',
    battery: 77.4,
    baseWh: 139,
    physics: { mass: 1950, cd: 0.21, frontalArea: 2.17, crr: 0.008, drivetrainEff: 0.92, regenEff: 0.65, hasHeatPump: true },
  },
  {
    id: 'zoe',
    name: 'Renault Zoe',
    battery: 52.0,
    baseWh: 165,
    physics: { mass: 1502, cd: 0.29, frontalArea: 2.19, crr: 0.010, drivetrainEff: 0.87, regenEff: 0.55, hasHeatPump: false },
  },
  {
    id: 'custom',
    name: 'Custom Vehicle',
    battery: 75.0,
    baseWh: 160,
    custom: true,
  },
]

// ── HVAC Auxiliary Power (watts) ────────────────────────────────────────────
function hvacPower(tempC: number, hasHeatPump: boolean): number {
  if (tempC < -10) return hasHeatPump ? 2000 : 4000
  if (tempC < 5)   return hasHeatPump ? 1200 : 3000
  if (tempC > 35)  return 1000
  if (tempC > 25)  return 800
  return 300
}

// ── Thermal Battery Penalty ─────────────────────────────────────────────────
function thermalBatteryFactor(tempC: number): number {
  if (tempC < 5)  return 1 + (5 - tempC) * 0.008
  if (tempC > 40) return 1 + (tempC - 40) * 0.003
  return 1.0
}

// ── Per-Mode Consumption (Wh/km) ────────────────────────────────────────────
function modeConsumption(
  vKmh: number,
  physics: PhysicsParams,
  totalMass: number,
  tempC: number,
  windDirection: 'headwind' | 'tailwind' | 'none',
  pAux: number,
): number {
  const v = kmhToMs(vKmh)
  if (v <= 0) return 0

  const rho = airDensity(tempC)

  // Wind adjusts effective velocity for drag only
  let vDrag = v
  if (windDirection === 'headwind') vDrag = v + WIND_SPEED
  else if (windDirection === 'tailwind') vDrag = Math.max(0, v - WIND_SPEED)

  // Aerodynamic drag force
  const Fd = 0.5 * rho * physics.frontalArea * physics.cd * vDrag * vDrag

  // Rolling resistance force
  const Frr = physics.crr * totalMass * G

  // Wheel power (use actual speed for distance-based work)
  const Pwheel = (Fd + Frr) * v

  // Battery power
  const Pbatt = Pwheel / physics.drivetrainEff + pAux

  // Convert W to Wh/km: P(W) / v(m/s) = J/m → /3.6 = Wh/km
  return (Pbatt / v) / 3.6
}

// ── Physics-Based Range ─────────────────────────────────────────────────────
function calculateRangePhysics(inputs: CalculatorInputs): CalculatorResult {
  const { vehicle, speed, temperature, drivingMix, climateControl, windDirection, extraLoad, rimSize } = inputs
  const p = vehicle.physics!

  // Effective Crr (rim size modifier)
  const baseCrr = rimSize === '20' ? p.crr * 1.08 : p.crr
  const totalMass = p.mass + extraLoad

  // Auxiliary power: HVAC + always-on parasitic loads
  const pAux = (climateControl ? hvacPower(temperature, p.hasHeatPump) : 0) + PARASITIC_LOAD

  // Build per-mode physics params with adjusted Crr
  const makePhysics = (crr: number): PhysicsParams => ({ ...p, crr })

  // City: capped effective speed, base Crr, stop-start cycling with regen
  const citySpeed = Math.min(speed, 50)
  const cityPhysics = makePhysics(baseCrr)
  let cityWh = modeConsumption(citySpeed, cityPhysics, totalMass, temperature, windDirection, pAux)
  // Stop-start acceleration energy: ½mv² per stop, partially recovered by regen
  const vCity = kmhToMs(citySpeed)
  const kineticPerStop = 0.5 * totalMass * vCity * vCity   // joules
  const netKineticPerStop = kineticPerStop * (1 - p.regenEff) / p.drivetrainEff  // net after regen + drivetrain loss
  const cyclingWhPerKm = (netKineticPerStop * CITY_STOPS_PER_KM) / 3600  // Wh/km
  cityWh += cyclingWhPerKm

  // Highway: full speed, base Crr
  const highwayPhysics = makePhysics(baseCrr)
  const highwayWh = modeConsumption(speed, highwayPhysics, totalMass, temperature, windDirection, pAux)

  // Rough: reduced speed, higher Crr
  const roughSpeed = speed * 0.85
  const roughPhysics = makePhysics(baseCrr * 1.5)
  const roughWh = modeConsumption(roughSpeed, roughPhysics, totalMass, temperature, windDirection, pAux)

  // Weighted average
  const cityW = drivingMix.city / 100
  const highwayW = drivingMix.highway / 100
  const roughW = drivingMix.rough / 100

  let consumption = cityW * cityWh + highwayW * highwayWh + roughW * roughWh

  // Thermal battery penalty (cold/hot reduces deliverable capacity)
  consumption *= thermalBatteryFactor(temperature)

  // ── Range & Outputs ─────────────────────────────────────────────────────
  const range = Math.round((vehicle.battery * 1000) / consumption)

  const theoreticalMax = Math.round((vehicle.battery * 1000) / vehicle.baseWh)
  const batteryHealthPct = Math.min(100, Math.round((range / theoreticalMax) * 100))

  const efficiencyLabel: CalculatorResult['efficiencyLabel'] =
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

// ── Legacy Coefficient Model (Custom Vehicles) ──────────────────────────────
function calculateRangeLegacy(inputs: CalculatorInputs): CalculatorResult {
  const { vehicle, speed, temperature, drivingMix, climateControl, windDirection, extraLoad, rimSize } = inputs

  let consumption = vehicle.baseWh

  // Speed factor — aero drag scales roughly with v^1.9; normalize at 90 km/h
  const speedFactor = Math.pow(speed / 90, 1.9)
  consumption *= speedFactor

  // Thermal factor
  let thermalFactor = 1.0
  if (temperature < 5) {
    thermalFactor = 1 + (5 - temperature) * 0.015
  } else if (temperature > 35) {
    thermalFactor = 1 + (temperature - 35) * 0.005
  }
  consumption *= thermalFactor

  // Climate control
  if (climateControl) {
    consumption += temperature < 5 ? 35 : 22
  }

  // Driving mix
  const cityFactor    = 1.0 - 0.15
  const highwayFactor = 1.0 + 0.25
  const roughFactor   = 1.0 + 0.10

  const mixFactor =
    (drivingMix.city / 100) * cityFactor +
    (drivingMix.highway / 100) * highwayFactor +
    (drivingMix.rough / 100) * roughFactor

  consumption *= mixFactor

  // Wind
  if (windDirection === 'headwind') consumption *= 1.10
  else if (windDirection === 'tailwind') consumption *= 0.93

  // Load
  consumption += (extraLoad / 10) * 0.5

  // Rim
  if (rimSize === '20') consumption *= 1.04

  // Range
  const range = Math.round((vehicle.battery * 1000) / consumption)

  const theoreticalMax = Math.round((vehicle.battery * 1000) / vehicle.baseWh)
  const batteryHealthPct = Math.min(100, Math.round((range / theoreticalMax) * 100))

  const efficiencyLabel: CalculatorResult['efficiencyLabel'] =
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

// ── Public API ──────────────────────────────────────────────────────────────
export function calculateRange(inputs: CalculatorInputs): CalculatorResult {
  if (inputs.vehicle.physics) {
    return calculateRangePhysics(inputs)
  }
  return calculateRangeLegacy(inputs)
}
