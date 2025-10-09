'use client';

import { useTheme } from '../../contexts/ThemeContext';

export default function FadeToggle() {
  const { fadeEnabled, setFadeEnabled } = useTheme();

  const handleToggle = () => {
    setFadeEnabled(!fadeEnabled);
  };

  return (
    <div className="flex items-center justify-end gap-2">
      {/* Toggle Switch */}
      <button
        onClick={handleToggle}
        className="relative inline-flex items-center cursor-pointer focus:outline-none group"
        aria-label={`Fade ${fadeEnabled ? 'enabled' : 'disabled'}`}
        role="switch"
        aria-checked={fadeEnabled}
      >
        {/* Track */}
        <div
          className={`
            relative w-[36px] h-[20px] rounded-full
            backdrop-blur-md
            border border-white/20
            shadow-[0_1px_3px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.15)]
            transition-all duration-500 ease-out
            flex items-center
            ${
              fadeEnabled
                ? 'bg-gradient-to-r from-[#f1a7b1] via-[#f3c6b4] via-[#f5e7c2] via-[#b7e1b7] to-[#87c4e3]'
                : 'bg-white/10'
            }
          `}
        >
          {/* Knob */}
          <div
            className={`
              absolute left-[2px]
              w-4 h-4
              bg-white
              rounded-full
              shadow-[0_1px_3px_rgba(0,0,0,0.2)]
              transition-all duration-500 ease-out
              ${fadeEnabled ? 'translate-x-[16px]' : 'translate-x-0'}
              group-hover:shadow-[0_2px_4px_rgba(0,0,0,0.25)]
              group-active:scale-95
            `}
          />
        </div>
      </button>

      {/* Label */}
      <span
        className="text-white/90 text-sm font-bold michroma select-none"
      >
        Fade
      </span>
    </div>
  );
}
