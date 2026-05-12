/**
 * SpiralBinding — the metallic spiral rings on the left side of the notebook.
 * Fixed-positioned, so it stays visible as the user scrolls.
 */
export default function SpiralBinding() {
  // Generate enough rings to fill any screen height
  const rings = Array.from({ length: 40 });

  return (
    <>
      {/* The metallic backing strip */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          width: 52,
          zIndex: 40,
          background: 'linear-gradient(180deg, #9E9E9E 0%, #757575 30%, #9E9E9E 60%, #757575 100%)',
          boxShadow: '4px 0 12px rgba(0,0,0,0.6), inset -3px 0 6px rgba(0,0,0,0.4), inset 2px 0 4px rgba(255,255,255,0.15)',
          pointerEvents: 'none',
        }}
      />

      {/* Rings */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          width: 52,
          zIndex: 41,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 24,
          gap: 22,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {rings.map((_, i) => (
          <div
            key={i}
            style={{
              width: 36,
              height: 20,
              borderRadius: '50%',
              border: '3.5px solid #424242',
              background: 'linear-gradient(145deg, #e0e0e0 0%, #9e9e9e 40%, #616161 100%)',
              boxShadow: '0 2px 5px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.5), inset 0 -1px 2px rgba(0,0,0,0.4)',
              flexShrink: 0,
            }}
          />
        ))}
      </div>

      {/* Red margin line */}
      <div
        style={{
          position: 'fixed',
          left: 68,
          top: 0,
          bottom: 0,
          width: 2,
          background: 'rgba(179, 45, 32, 0.3)',
          zIndex: 39,
          pointerEvents: 'none',
        }}
      />
    </>
  );
}
