# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build — static export to out/
npm run lint     # ESLint
```

The app uses `output: 'export'` in next.config.js — all pages are statically generated. There is no server-side rendering or API routes.

## Architecture

Single-page Next.js 14 app (App Router) — a physics-based EV range calculator. Everything is client-side ('use client' throughout).

### Core calculation engine: `lib/calculator.ts`

Two calculation paths dispatched by `calculateRange()`:

- **Physics model** (preset vehicles with `physics` params): First-principles computation using aerodynamic drag (Fd = ½ρACdv²), rolling resistance (Frr = Crr·m·g), drivetrain efficiency, HVAC power draw, and regen braking. Computes per driving mode (city/highway/rough) at different effective speeds and Crr values, then takes weighted average.
- **Legacy coefficient model** (custom vehicles without `physics`): Simpler multiplier-based estimation using `baseWh` and scaling factors.

Key physics details: wind modeled as velocity shift on drag term (not flat %), HVAC as watt draw (speed-dependent Wh/km impact), city mode includes stop-start kinetic energy cycling with partial regen recovery, air density varies with temperature.

### State management: `app/page.tsx`

All calculator state lives in the root page component via `useState` hooks. State is persisted to localStorage under key `ev-range-hero-state` and hydrated on mount. The `useMemo`-wrapped `calculateRange()` call recomputes on any input change.

### Component hierarchy

`page.tsx` owns all state and passes it down as props:
- `VehicleSelector` — vehicle picker + custom battery/baseWh inputs
- `SliderControl` — reusable slider (speed, temperature)
- `DrivingMixControl` — three linked sliders that must total 100%
- `FactorControls` — climate, wind, load, rim size controls
- `RangeDisplay` — animated output ring, efficiency metrics

### Design system

Warm minimal light theme defined in `tailwind.config.js`:
- Fonts: Bricolage Grotesque (body), JetBrains Mono (numbers — applied via `.num` class)
- Colors: `surface`, `border`, `ink` (with secondary/tertiary/muted), `accent` (teal)
- Cards: `.card` and `.card-strong` classes in `globals.css`
- Custom slider and toggle styles in `globals.css`

### Path alias

`@/*` maps to project root (e.g., `@/lib/calculator`, `@/components/...`).
