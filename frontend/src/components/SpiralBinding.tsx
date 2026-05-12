/**
 * SpiralBinding — Ultra-modern Smart Notebook (Discbound) style.
 * Includes high-fidelity discs on the left and a premium elastic strap on the right.
 */
export default function SpiralBinding() {
  // 12-15 discs depending on viewport height
  const discs = Array.from({ length: 15 });

  return (
    <>
      {/* 1. LEFT SIDE DISCS (Discbound style) */}
      <div
        className="fixed left-0 top-0 bottom-0 z-[60] flex flex-col justify-around py-6 pointer-events-none"
        style={{ width: 64 }}
      >
        {discs.map((_, i) => (
          <div
            key={i}
            className="relative flex items-center justify-center group"
            style={{ height: '6%' }}
          >
            {/* The Disc - High-Fidelity 3D look */}
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #333 0%, #111 100%)',
                boxShadow: `
                  6px 6px 12px rgba(0,0,0,0.7), 
                  inset -2px -2px 5px rgba(255,255,255,0.05), 
                  inset 3px 3px 6px rgba(0,0,0,0.9)
                `,
                border: '1.5px solid #000',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {/* Central Hole/Detail of the Disc */}
              <div 
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: '#000',
                  boxShadow: 'inset 0 0 4px rgba(255,255,255,0.1)'
                }}
              />
              
              {/* Disc Slot (The notch that grips the paper) */}
              <div 
                style={{
                  position: 'absolute',
                  right: -10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 20,
                  height: 14,
                  background: '#111',
                  borderRadius: '3px',
                  boxShadow: 'inset 3px 0 6px rgba(0,0,0,0.8)',
                  borderRight: '1px solid rgba(255,255,255,0.05)'
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 2. LEFT SIDE BINDING STRIP (The spine) */}
      <div
        className="fixed left-0 top-0 bottom-0 z-[55] pointer-events-none"
        style={{
          width: 52,
          background: 'linear-gradient(90deg, #0f0f0f 0%, #222 70%, #1a1a1a 100%)',
          boxShadow: '8px 0 20px rgba(0,0,0,0.6)',
          borderRight: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        {/* Spine Texture */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.1,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")'
        }} />
      </div>

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
            background: 'linear-gradient(90deg, #111 0%, #222 50%, #111 100%)',
            boxShadow: '-4px 0 15px rgba(0,0,0,0.6), 4px 0 15px rgba(0,0,0,0.6)',
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
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
            }}
          />
          
          {/* Vertical threading detail */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: 1,
            background: 'rgba(255,255,255,0.05)',
            transform: 'translateX(-50%)'
          }} />

          {/* THE 'T' BRANDING (Thaya) — Metallic Emblem */}
          <div
            className="absolute top-2/3 left-1/2 -translate-x-1/2 flex items-center justify-center"
            style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, #f0f0f0 0%, #888 100%)',
              boxShadow: `
                0 6px 15px rgba(0,0,0,0.9), 
                inset 2px 2px 5px rgba(255,255,255,0.9), 
                inset -3px -3px 8px rgba(0,0,0,0.5)
              `,
              border: '2px solid #555',
              zIndex: 61
            }}
          >
            <span
              style={{
                fontFamily: '"Playfair Display", serif',
                fontWeight: 900,
                fontSize: '2rem',
                color: '#222',
                textShadow: '1px 1px 0px rgba(255,255,255,0.6)',
                letterSpacing: '-1px'
              }}
            >
              T
            </span>
            {/* Subtle metallic shine */}
            <div style={{
              position: 'absolute',
              top: '15%',
              left: '15%',
              width: '25%',
              height: '25%',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.4)',
              filter: 'blur(4px)'
            }} />
          </div>
        </div>
      </div>

      {/* 4. RED MARGIN LINE (Consistent with lined paper) */}
      <div
        className="fixed left-[84px] top-0 bottom-0 z-40 pointer-events-none"
        style={{
          width: 2,
          background: 'rgba(179, 45, 32, 0.2)',
          boxShadow: '0 0 1px rgba(179, 45, 32, 0.05)'
        }}
      />
    </>
  );
}
