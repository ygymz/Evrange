export default function LoadingScreen() {
  return (
    <div className="min-h-screen z-50 bg-surface flex flex-col items-center justify-center">
      <div className="relative">
        {/* Battery Terminal (Top) */}
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-border rounded-t-sm" />
        
        {/* Battery Body */}
        <div className="relative w-12 h-24 border-2 border-border rounded-lg p-0.5 flex flex-col justify-end bg-surface-card overflow-hidden">
          {/* Liquid Fill */}
          <div 
            className="w-full bg-accent rounded-sm origin-bottom fill-glow"
            style={{ animation: 'batteryFill 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite' }}
          />
        </div>
      </div>
      
      {/* Loading Text */}
      <div className="mt-6 flex items-center gap-2">
         <span className="text-xs font-bold tracking-[0.2em] text-ink-tertiary uppercase animate-pulse">
           TrueRange
         </span>
      </div>

      <style>{`
        @keyframes batteryFill {
          0% { height: 0%; opacity: 0.6; }
          40% { height: 100%; opacity: 1; }
          80% { height: 100%; opacity: 0; }
          100% { height: 0%; opacity: 0; }
        }
        .fill-glow {
          box-shadow: 0 0 15px var(--accent);
        }
      `}</style>
    </div>
  )
}
