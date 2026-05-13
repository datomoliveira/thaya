/**
 * SpiralBinding — Modern Smart Notebook style with EXACTLY 9 discs.
 * Includes high-fidelity black discs on the left and a premium elastic strap on the right.
 */
export default function SpiralBinding() {
  // Exactly 9 discs as requested
  const discs = Array.from({ length: 9 });

  return (
    <>
      {/* 1. LEFT SIDE DISCS (Discbound style) */}
      <div
        className="fixed left-0 top-0 bottom-0 z-[60] flex flex-col justify-around py-20 pointer-events-none"
        style={{ width: 64 }}
      >
        {discs.map((_, i) => (
          <div
            key={i}
            className="relative flex items-center justify-center"
            style={{ height: '8%' }}
          >
            {/* The Disc - Pure Black 3D look */}
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 30%, #2a2a2a 0%, #000000 100%)',
                boxShadow: `
                  6px 6px 14px rgba(0,0,0,0.8), 
                  inset -1px -1px 3px rgba(255,255,255,0.05), 
                  inset 4px 4px 8px rgba(0,0,0,0.9)
                `,
                border: '1px solid #000',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {/* Central Hole Detail */}
              <div 
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: '#000',
                  boxShadow: 'inset 0 0 5px rgba(255,255,255,0.05)'
                }}
              />
              
              {/* Disc Slot (The notch) */}
              <div 
                style={{
                  position: 'absolute',
                  right: -12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 22,
                  height: 16,
                  background: '#000',
                  borderRadius: '3px',
                  boxShadow: 'inset 4px 0 8px rgba(0,0,0,0.9)',
                  borderRight: '1px solid rgba(255,255,255,0.03)'
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 2. LEFT SIDE BINDING STRIP */}
      <div
        className="fixed left-0 top-0 bottom-0 z-[55] pointer-events-none"
        style={{
          width: 52,
          background: 'linear-gradient(90deg, #050505 0%, #1a1a1a 70%, #0f0f0f 100%)',
          boxShadow: '10px 0 25px rgba(0,0,0,0.7)',
          borderRight: '1px solid rgba(255,255,255,0.05)'
        }}
      />

      {/* 3. RIGHT SIDE ELASTIC STRAP */}
      <div
        className="fixed right-6 top-0 bottom-0 z-[60] pointer-events-none flex items-center justify-center"
        style={{ width: 36 }}
      >
        {/* The high-quality woven band */}
        <div
          style={{
            width: 28,
            height: '100%',
            background: 'linear-gradient(90deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
            boxShadow: '-4px 0 15px rgba(0,0,0,0.7), 4px 0 15px rgba(0,0,0,0.7)',
            borderLeft: '1px solid #000',
            borderRight: '1px solid #000',
            position: 'relative'
          }}
        >
          {/* Woven Texture */}
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)',
            }}
          />

          {/* THE 'T' BRANDING (Thaya) */}
          <div
            className="absolute top-2/3 left-1/2 -translate-x-1/2 flex items-center justify-center"
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, #e0e0e0 0%, #777 100%)',
              boxShadow: `
                0 8px 20px rgba(0,0,0,0.9), 
                inset 2px 2px 6px rgba(255,255,255,0.9), 
                inset -3px -3px 10px rgba(0,0,0,0.5)
              `,
              border: '2px solid #444',
              zIndex: 61
            }}
          >
            <span
              style={{
                fontFamily: '"Playfair Display", serif',
                fontWeight: 900,
                fontSize: '2.2rem',
                color: '#111',
                textShadow: '1px 1px 0px rgba(255,255,255,0.7)',
                letterSpacing: '-1.5px'
              }}
            >
              T
            </span>
          </div>
        </div>
      </div>

      {/* 4. RED MARGIN LINE */}
      <div
        className="fixed left-[84px] top-0 bottom-0 z-40 pointer-events-none"
        style={{
          width: 2,
          background: 'rgba(179, 45, 32, 0.15)',
        }}
      />
    </>
  );
}
