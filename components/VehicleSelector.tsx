'use client'

import { ChevronDown, Zap } from 'lucide-react'
import { useState } from 'react'
import { VEHICLES, Vehicle } from '@/lib/calculator'

interface Props {
  selected: Vehicle
  onSelect: (v: Vehicle) => void
}

export default function VehicleSelector({ selected, onSelect }: Props) {
  const [open, setOpen] = useState(false)

  const handleSelect = (v: Vehicle) => {
    onSelect(v)
    setOpen(false)
  }

  return (
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
              {selected.battery} kWh · {selected.baseWh} Wh/km
            </div>
          </div>
        </div>
        <ChevronDown
          size={16}
          className={`text-ink-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-surface-card border border-border rounded-xl z-50 overflow-hidden shadow-lg shadow-black/5 dark:shadow-black/50">
          <div className="p-1">
            {VEHICLES.map((v) => (
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
          </div>
        </div>
      )}
    </div>
  )
}
