'use client'

import { ChevronDown, Zap, Settings2 } from 'lucide-react'
import { useState } from 'react'
import { VEHICLES, Vehicle } from '@/lib/calculator'

interface Props {
  selected: Vehicle
  customBattery: number
  customBaseWh: number
  onSelect: (v: Vehicle) => void
  onCustomBattery: (val: number) => void
  onCustomBaseWh: (val: number) => void
}

export default function VehicleSelector({
  selected,
  customBattery,
  customBaseWh,
  onSelect,
  onCustomBattery,
  onCustomBaseWh,
}: Props) {
  const [open, setOpen] = useState(false)

  const presets = VEHICLES.filter((v) => !v.custom)
  const customVehicle = VEHICLES.find((v) => v.custom)!

  const handleSelect = (v: Vehicle) => {
    onSelect(v)
    setOpen(false)
  }

  return (
    <div className="space-y-4">
      {/* Dropdown */}
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border hover:border-border-hover bg-surface-card transition-all duration-150 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center">
              <Zap size={15} className="text-accent" />
            </div>
            <div>
              <div className="text-sm font-semibold text-ink">{selected.name}</div>
              <div className="num text-xs text-ink-tertiary">
                {selected.custom
                  ? `${customBattery} kWh · ${customBaseWh} Wh/km`
                  : `${selected.battery} kWh · ${selected.baseWh} Wh/km`}
              </div>
            </div>
          </div>
          <ChevronDown
            size={16}
            className={`text-ink-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown Menu */}
        {open && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-border rounded-xl z-50 overflow-hidden shadow-lg shadow-black/5">
            <div className="p-1">
              {presets.map((v) => (
                <button
                  key={v.id}
                  onClick={() => handleSelect(v)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-100 text-left ${
                    selected.id === v.id
                      ? 'bg-accent-light text-accent'
                      : 'hover:bg-surface text-ink-secondary hover:text-ink'
                  }`}
                >
                  <span className="text-sm font-medium">{v.name}</span>
                  <span className="num text-xs text-ink-tertiary">
                    {v.battery} kWh · {v.baseWh} Wh/km
                  </span>
                </button>
              ))}

              <div className="border-t border-border my-1" />

              <button
                onClick={() => handleSelect(customVehicle)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-100 text-left ${
                  selected.id === 'custom'
                    ? 'bg-accent-light text-accent'
                    : 'hover:bg-surface text-ink-secondary hover:text-ink'
                }`}
              >
                <Settings2 size={14} className="shrink-0" />
                <span className="text-sm font-medium">Custom Vehicle</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom inputs */}
      {selected.custom && (
        <div className="grid grid-cols-2 gap-3 animate-fade-in">
          <div>
            <label className="block text-[11px] text-ink-tertiary mb-1.5 font-medium uppercase tracking-wider">
              Battery (kWh)
            </label>
            <input
              type="number"
              min={10}
              max={200}
              value={customBattery}
              onChange={(e) => onCustomBattery(Number(e.target.value))}
              onBlur={() => onCustomBattery(Math.max(10, Math.min(200, customBattery)))}
              className="num w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-ink text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] text-ink-tertiary mb-1.5 font-medium uppercase tracking-wider">
              Consumption (Wh/km)
            </label>
            <input
              type="number"
              min={80}
              max={400}
              value={customBaseWh}
              onChange={(e) => onCustomBaseWh(Number(e.target.value))}
              onBlur={() => onCustomBaseWh(Math.max(80, Math.min(400, customBaseWh)))}
              className="num w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-ink text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
            />
          </div>
        </div>
      )}
    </div>
  )
}
