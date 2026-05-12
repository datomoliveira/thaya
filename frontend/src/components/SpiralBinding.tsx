/**
 * SpiralBinding — Modern Discbound notebook style.
 * Includes left-side discs and right-side elastic strap with 'T' logo.
 */
export default function SpiralBinding() {
  // Discs on the left (rounded, modern)
  const discs = Array.from({ length: 15 });

  return (
    <>
      {/* 1. LEFT SIDE DISCS (Discbound style) */}
      <div
        className="fixed left-0 top-0 bottom-0 z-[60] flex flex-col justify-around py-8 pointer-events-none"
        style={{ width: 60 }}
      >
        {discs.map((_, i) => (
          <div
            key={i}
            className="relative flex items-center justify-center"
            style={{ height: '5%' }}
          >
            {/* The Disc */}
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 30%, #4a4a4a 0%, #1a1a1a 100%)',
                boxShadow: '4px 4px 8px rgba(0,0,0,0.6), inset -2px -2px 4px rgba(255,255,255,0.1), inset 2px 2px 4px rgba(0,0,0,0.8)',
                border: '1px solid #000',
                position: 'relative',
              }}
            >
              {/* Disc Slot (the cut in the disc) */}
              <div 
                style={{
                  position: 'absolute',
                  right: -8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 16,
                  height: 12,
                  background: '#1a1a1a',
                  borderRadius: '2px',
                  boxShadow: 'inset 2px 0 4px rgba(0,0,0,0.5)'
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 2. LEFT SIDE PAPER EDGE (The dark strip where discs attach) */}
      <div
        className="fixed left-0 top-0 bottom-0 z-[55] pointer-events-none"
        style={{
          width: 48,
          background: 'linear-gradient(90deg, #1a1a1a 0%, #333 100%)',
          boxShadow: '5px 0 15px rgba(0,0,0,0.4)',
          borderRight: '1px solid rgba(255,255,255,0.1)'
        }}
      />

      {/* 3. RIGHT SIDE ELASTIC STRAP */}
      <div
        className="fixed right-8 top-0 bottom-0 z-[60] pointer-events-none flex items-center justify-center"
        style={{ width: 32 }}
      >
        {/* The black band */}
        <div
          style={{
            width: 24,
            height: '100%',
            background: 'linear-gradient(90deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%)',
            boxShadow: '-2px 0 10px rgba(0,0,0,0.5), 2px 0 10px rgba(0,0,0,0.5)',
            borderLeft: '1px solid #000',
            borderRight: '1px solid #000',
            position: 'relative'
          }}
        >
          {/* Subtle elastic texture */}
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)',
            }}
          />

          {/* THE 'T' LOGO (Thaya) */}
          <div
            className="absolute top-3/4 left-1/2 -translate-x-1/2 flex items-center justify-center"
            style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: 'linear-gradient(145deg, #e0e0e0, #9e9e9e)',
              boxShadow: '0 4px 10px rgba(0,0,0,0.8), inset 2px 2px 5px rgba(255,255,255,0.8), inset -2px -2px 5px rgba(0,0,0,0.4)',
              border: '2px solid #757575',
              zIndex: 61
            }}
          >
            <span
              style={{
                fontFamily: '"Playfair Display", serif',
                fontWeight: 900,
                fontSize: '1.8rem',
                color: '#333',
                textShadow: '1px 1px 1px rgba(255,255,255,0.5)'
              }}
            >
              T
            </span>
          </div>
        </div>
      </div>

      {/* 4. LEFT MARGIN LINE (Red Line on paper) */}
      <div
        className="fixed left-[80px] top-0 bottom-0 z-40 pointer-events-none"
        style={{
          width: 2,
          background: 'rgba(179, 45, 32, 0.25)',
          boxShadow: '0 0 1px rgba(179, 45, 32, 0.1)'
        }}
      />
    </>
  );
}
