export default function LoadingScreen() {
  return (
    <div className="min-h-screen z-50 bg-surface flex flex-col items-center justify-center px-10">
      {/* Container for the line */}
      <div className="w-full max-w-[400px] relative h-[2px]">
        {/* Background Track (dimly visible) */}
        <div className="absolute inset-0 bg-border/20 rounded-full" />
        
        {/* The Filling Animated Line */}
        <div 
          className="absolute inset-y-0 left-0 bg-accent rounded-full origin-left"
          style={{ 
            width: '100%',
            animation: 'fillLine 3.5s cubic-bezier(0.65, 0, 0.35, 1) forwards',
          }}
        />
      </div>
      
      <div className="mt-12 text-center">
         <span className="text-[10px] font-bold tracking-[0.8em] text-ink-muted uppercase select-none">
           TrueRange
         </span>
      </div>

      <style>{`
        @keyframes fillLine {
          0% { transform: scaleX(0); opacity: 0; }
          10% { opacity: 1; }
          70% { transform: scaleX(1); opacity: 1; }
          90% { transform: scaleX(1); opacity: 0; }
          100% { transform: scaleX(1); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
