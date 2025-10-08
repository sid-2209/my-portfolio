'use client';

export default function VoidBloomToggle() {
  return (
    <>
      {/* Void / Bloom Options - Bottom Right Corner */}
      <div className="fixed bottom-8 right-8 z-40 flex items-center gap-2 text-sm michroma">
        <button
          className="text-white/80 hover:text-white transition-colors duration-300 font-bold"
          onClick={() => {}}
        >
          void
        </button>
        <span className="text-white/40 font-bold">/</span>
        <button
          className="relative hover:scale-105 transition-transform duration-300"
          onClick={() => {}}
        >
          <span
            className="font-bold"
            style={{
              background: 'linear-gradient(0.25turn, #f1a7b1, #f3c6b4, #f5e7c2, #b7e1b7, #87c4e3)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              backgroundSize: '200% 100%',
              animation: 'gradientShift 3s ease infinite'
            }}
          >
            bloom
          </span>
        </button>
      </div>

      {/* Gradient Animation Keyframes */}
      <style jsx>{`
        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </>
  );
}
