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
          className="w-full flex items-center justify-between px-4 py-3 glass-card hover:border-white/20 transition-all duration-200 text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Zap size={16} className="text-blue-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{selected.name}</div>
              <div className="text-xs text-white/40">
                {selected.custom
                  ? `${customBattery} kWh · ${customBaseWh} Wh/km`
                  : `${selected.battery} kWh · ${selected.baseWh} Wh/km`}
              </div>
            </div>
          </div>
          <ChevronDown
            size={16}
            className={`text-white/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown Menu */}
        {open && (
          <div className="absolute top-full left-0 right-0 mt-2 glass-card-strong z-50 overflow-hidden shadow-2xl">
            <div className="p-1">
              {presets.map((v) => (
                <button
                  key={v.id}
                  onClick={() => handleSelect(v)}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-150 text-left ${
                    selected.id === v.id
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'hover:bg-white/5 text-white/70 hover:text-white'
                  }`}
                >
                  <span className="text-sm font-medium">{v.name}</span>
                  <span className="text-xs text-white/40">
                    {v.battery} kWh · {v.baseWh} Wh/km
                  </span>
                </button>
              ))}

              <div className="border-t border-white/5 my-1" />

              <button
                onClick={() => handleSelect(customVehicle)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-150 text-left ${
                  selected.id === 'custom'
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'hover:bg-white/5 text-white/70 hover:text-white'
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
            <label className="block text-xs text-white/40 mb-1.5 font-medium uppercase tracking-wider">
              Battery (kWh)
            </label>
            <input
              type="number"
              min={10}
              max={200}
              value={customBattery}
              onChange={(e) => onCustomBattery(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1.5 font-medium uppercase tracking-wider">
              Consumption (Wh/km)
            </label>
            <input
              type="number"
              min={80}
              max={400}
              value={customBaseWh}
              onChange={(e) => onCustomBaseWh(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-all"
            />
          </div>
        </div>
      )}
    </div>
  )
}
