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
  physics: PhysicsParams
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
  extraLoad: number     // kg
  rimSize: '18' | '19' | '20'
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
    id: 'tesla-my-juniper-rwd',
    name: 'Tesla Model Y Juniper RWD',
    battery: 60.0,
    baseWh: 139,
    physics: { mass: 1921, cd: 0.22, frontalArea: 2.62, crr: 0.009, drivetrainEff: 0.91, regenEff: 0.65, hasHeatPump: true },
  },
  {
    id: 'tesla-my-juniper-lr',
    name: 'Tesla Model Y Juniper LR AWD',
    battery: 79.0,
    baseWh: 153,
    physics: { mass: 1992, cd: 0.22, frontalArea: 2.62, crr: 0.009, drivetrainEff: 0.91, regenEff: 0.65, hasHeatPump: true },
  },
  {
    id: 'tesla-my-juniper-perf',
    name: 'Tesla Model Y Juniper Perf.',
    battery: 79.0,
    baseWh: 162,
    physics: { mass: 2033, cd: 0.22, frontalArea: 2.62, crr: 0.010, drivetrainEff: 0.91, regenEff: 0.65, hasHeatPump: true },
  },
  {
    id: 'tesla-my-legacy-sr',
    name: 'Tesla Model Y Legacy RWD',
    battery: 57.0,
    baseWh: 157,
    physics: { mass: 1984, cd: 0.23, frontalArea: 2.62, crr: 0.009, drivetrainEff: 0.90, regenEff: 0.60, hasHeatPump: true },
  },
  {
    id: 'tesla-my-legacy-lr',
    name: 'Tesla Model Y Legacy LR AWD',
    battery: 75.0,
    baseWh: 169,
    physics: { mass: 2003, cd: 0.23, frontalArea: 2.62, crr: 0.009, drivetrainEff: 0.90, regenEff: 0.60, hasHeatPump: true },
  },
  {
    id: 'byd-sealion-7',
    name: 'BYD Sealion 7 Standard (RWD)',
    battery: 71.8,
    baseWh: 175,
    physics: { mass: 2160, cd: 0.28, frontalArea: 2.62, crr: 0.009, drivetrainEff: 0.90, regenEff: 0.65, hasHeatPump: true },
  },
  {
    id: 'byd-seal-rwd',
    name: 'BYD Seal Design RWD',
    battery: 61.5,
    baseWh: 157,
    physics: { mass: 1922, cd: 0.219, frontalArea: 2.30, crr: 0.009, drivetrainEff: 0.92, regenEff: 0.65, hasHeatPump: true },
  },
  {
    id: 'byd-dolphin-comfort',
    name: 'BYD Dolphin Comfort',
    battery: 60.4,
    baseWh: 166,
    physics: { mass: 1658, cd: 0.301, frontalArea: 2.33, crr: 0.009, drivetrainEff: 0.90, regenEff: 0.65, hasHeatPump: true },
  },
  {
    id: 'ioniq6-sr',
    name: 'Hyundai Ioniq 6 SR (RWD)',
    battery: 53.0,
    baseWh: 137,
    physics: { mass: 1775, cd: 0.21, frontalArea: 2.36, crr: 0.009, drivetrainEff: 0.92, regenEff: 0.70, hasHeatPump: true },
  },
  {
    id: 'ioniq5-sr',
    name: 'Hyundai Ioniq 5 SR (RWD)',
    battery: 63.0,
    baseWh: 160,
    physics: { mass: 1880, cd: 0.288, frontalArea: 2.55, crr: 0.009, drivetrainEff: 0.91, regenEff: 0.70, hasHeatPump: true },
  },
  {
    id: 'mercedes-cla-250',
    name: 'Mercedes CLA 250+ (Yeni)',
    battery: 85.0,
    baseWh: 141,
    physics: { mass: 2055, cd: 0.21, frontalArea: 2.29, crr: 0.009, drivetrainEff: 0.92, regenEff: 0.70, hasHeatPump: true },
  },
  {
    id: 'mercedes-glb-250',
    name: 'Mercedes GLB 250+ (Yeni)',
    battery: 85.0,
    baseWh: 160,
    physics: { mass: 2270, cd: 0.28, frontalArea: 2.64, crr: 0.009, drivetrainEff: 0.91, regenEff: 0.70, hasHeatPump: true },
  },
  {
    id: 'bmw-ix3-new',
    name: 'BMW iX3 (Yeni - NA5)',
    battery: 108.7,
    baseWh: 169,
    physics: { mass: 2360, cd: 0.24, frontalArea: 2.60, crr: 0.009, drivetrainEff: 0.91, regenEff: 0.65, hasHeatPump: true },
  },
  {
    id: 'togg-t10x-lr',
    name: 'Togg T10X Uzun Menzil',
    battery: 85.0,
    baseWh: 199,
    physics: { mass: 2126, cd: 0.298, frontalArea: 2.66, crr: 0.010, drivetrainEff: 0.89, regenEff: 0.60, hasHeatPump: false },
  },
  {
    id: 'togg-t10f-lr',
    name: 'Togg T10F Uzun Menzil',
    battery: 85.0,
    baseWh: 167,
    physics: { mass: 2000, cd: 0.226, frontalArea: 2.33, crr: 0.009, drivetrainEff: 0.90, regenEff: 0.65, hasHeatPump: false },
  },
  {
    id: 'renault-megane',
    name: 'Renault Megane E-Tech',
    battery: 60.0,
    baseWh: 157,
    physics: { mass: 1708, cd: 0.29, frontalArea: 2.24, crr: 0.009, drivetrainEff: 0.91, regenEff: 0.65, hasHeatPump: true },
  },
]

// ── HVAC Auxiliary Power (watts) ────────────────────────────────────────────
function hvacPower(tempC: number, hasHeatPump: boolean): number {
  const targetC = 22
  const deltaT = targetC - tempC

  if (deltaT > 0) {
    // Heating logic: Base load + deltaT slope
    const heatingRequired = 200 + deltaT * 110 // Watts

    if (hasHeatPump) {
      // Heat pump COP (Coefficient of Performance) scales linearly with tempC
      // COP is usually ~3.5 at 15°C and drops to ~1.0 at -15°C
      const cop = Math.max(1.0, 1.2 + (tempC + 15) * 0.075)
      return heatingRequired / cop
    }
    return heatingRequired
  } else if (deltaT < 0) {
    // Cooling logic (A/C is generally more efficient and scales slower)
    const coolingDelta = Math.abs(deltaT)
    const coolingRequired = 150 + coolingDelta * 60
    return Math.min(3000, coolingRequired) // Capped at 3kW for AC max output
  }
  
  // Just fan running at target temp
  return 100
}

// ── Thermal Battery Penalty ─────────────────────────────────────────────────
function thermalBatteryFactor(tempC: number): number {
  if (tempC <= 20) {
    // Cold temps increase internal resistance and lower deliverable energy curve
    return 1 + Math.pow(20 - tempC, 1.5) * 0.0015
  }
  if (tempC > 35) {
    // Extreme heat requires battery active cooling overhead
    return 1 + Math.pow(tempC - 35, 1.2) * 0.003
  }
  return 1.0
}

// ── Per-Mode Consumption (Wh/km) ────────────────────────────────────────────
function modeConsumption(
  vKmh: number,
  physics: PhysicsParams,
  totalMass: number,
  tempC: number,
  pAux: number,
): number {
  const v = kmhToMs(vKmh)
  if (v <= 0) return 0

  const rho = airDensity(tempC)

  // Aerodynamic drag force
  const Fd = 0.5 * rho * physics.frontalArea * physics.cd * v * v

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
  const { vehicle, speed, temperature, drivingMix, climateControl, extraLoad, rimSize } = inputs
  const p = vehicle.physics

  // Effective Crr (rim size modifier): 19" baseline, 18" slightly better, 20" worse
  const rimFactor = rimSize === '20' ? 1.08 : rimSize === '18' ? 0.96 : 1.0
  const baseCrr = p.crr * rimFactor
  const totalMass = p.mass + extraLoad

  // Auxiliary power: HVAC + always-on parasitic loads
  const pAux = (climateControl ? hvacPower(temperature, p.hasHeatPump) : 0) + PARASITIC_LOAD

  // Build per-mode physics params with adjusted Crr
  const makePhysics = (crr: number): PhysicsParams => ({ ...p, crr })

  // City: capped effective speed, base Crr, stop-start cycling with regen
  const citySpeed = Math.min(speed, 50)
  const cityPhysics = makePhysics(baseCrr)
  let cityWh = modeConsumption(citySpeed, cityPhysics, totalMass, temperature, pAux)
  // Stop-start acceleration energy: ½mv² per stop, partially recovered by regen
  const vCity = kmhToMs(citySpeed)
  const kineticPerStop = 0.5 * totalMass * vCity * vCity   // joules
  const netKineticPerStop = kineticPerStop * (1 - p.regenEff) / p.drivetrainEff  // net after regen + drivetrain loss
  const cyclingWhPerKm = (netKineticPerStop * CITY_STOPS_PER_KM) / 3600  // Wh/km
  cityWh += cyclingWhPerKm

  // Highway: full speed, base Crr
  const highwayPhysics = makePhysics(baseCrr)
  const highwayWh = modeConsumption(speed, highwayPhysics, totalMass, temperature, pAux)

  // Rough: reduced speed, higher Crr
  const roughSpeed = speed * 0.85
  const roughPhysics = makePhysics(baseCrr * 1.5)
  const roughWh = modeConsumption(roughSpeed, roughPhysics, totalMass, temperature, pAux)

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

// ── Public API ──────────────────────────────────────────────────────────────
export function calculateRange(inputs: CalculatorInputs): CalculatorResult {
  return calculateRangePhysics(inputs)
}
