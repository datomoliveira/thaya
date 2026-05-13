/**
 * SpiralBinding — Modern Smart Notebook style with EXACTLY 9 discs.
 * Reinforced fixed positioning to ensure elements stay pinned during scroll.
 */
export default function SpiralBinding() {
  const discs = Array.from({ length: 9 });

  return (
    <>
      {/* 1. LEFT SIDE DISCS (Discbound style) */}
      <div
        className="fixed left-0 inset-y-0 z-[100] flex flex-col justify-around py-12 sm:py-20 pointer-events-none"
        style={{ width: 'var(--notebook-disc-width)', willChange: 'transform' }}
      >
        {discs.map((_, i) => (
          <div
            key={i}
            className="relative flex items-center justify-center"
            style={{ height: '8%' }}
          >
            <div
              style={{
                width: 'var(--disc-size)',
                height: 'var(--disc-size)',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 30%, #2a2a2a 0%, #000000 100%)',
                boxShadow: '4px 4px 10px rgba(0,0,0,0.8), inset 2px 2px 5px rgba(0,0,0,0.9)',
                border: '1px solid #000',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div style={{ width: '25%', height: '25%', borderRadius: '50%', background: '#000' }} />
              <div 
                style={{
                  position: 'absolute',
                  right: '-15%',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '40%',
                  height: '35%',
                  background: '#000',
                  borderRadius: '2px',
                  boxShadow: 'inset 2px 0 5px rgba(0,0,0,0.9)',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 2. LEFT SIDE BINDING STRIP */}
      <div
        className="fixed left-0 inset-y-0 z-[90] pointer-events-none"
        style={{
          width: 'calc(var(--notebook-disc-width) - 10px)',
          background: 'linear-gradient(90deg, #050505 0%, #1a1a1a 70%, #0f0f0f 100%)',
          boxShadow: '8px 0 20px rgba(0,0,0,0.7)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          willChange: 'transform'
        }}
      />

      <div
        className="fixed right-0 inset-y-0 z-[100] pointer-events-none flex items-center justify-center"
        style={{ width: 'var(--notebook-strap-width)', willChange: 'transform' }}
      >
        <div
          style={{
            width: '70%',
            height: '100%',
            background: 'linear-gradient(90deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
            boxShadow: '-2px 0 10px rgba(0,0,0,0.7), 2px 0 10px rgba(0,0,0,0.7)',
            borderLeft: '1px solid #000',
            borderRight: '1px solid #000',
            position: 'relative'
          }}
        >
          <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)' }} />
          <div
            className="absolute top-2/3 left-1/2 -translate-x-1/2 flex items-center justify-center"
            style={{
              width: 'min(48px, 150%)',
              height: 'min(48px, 150%)',
              aspectRatio: '1/1',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, #e0e0e0 0%, #777 100%)',
              boxShadow: '0 4px 10px rgba(0,0,0,0.9), inset 1px 1px 3px rgba(255,255,255,0.9)',
              border: '1px solid #444',
              zIndex: 101
            }}
          >
            <span style={{ fontFamily: '"Playfair Display", serif', fontWeight: 900, fontSize: 'clamp(1rem, 4vw, 1.8rem)', color: '#111', textShadow: '1px 1px 0px rgba(255,255,255,0.7)', letterSpacing: '-1px' }}>T</span>
          </div>
        </div>
      </div>

      {/* 4. RED MARGIN LINE */}
      <div
        className="fixed inset-y-0 z-40 pointer-events-none"
        style={{
          left: 'calc(var(--notebook-padding-left) + 4px)',
          width: 2,
          background: 'rgba(179, 45, 32, 0.15)',
          willChange: 'transform'
        }}
      />
    </>
  );
}
