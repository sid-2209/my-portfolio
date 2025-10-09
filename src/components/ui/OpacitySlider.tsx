'use client';

import { useTheme } from '../../contexts/ThemeContext';

export default function OpacitySlider() {
  const { backgroundOpacity, setBackgroundOpacity } = useTheme();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBackgroundOpacity(parseInt(e.target.value));
  };

  // Calculate opacity percentage for display
  const opacityPercentage = Math.round((0.33 + (backgroundOpacity * 0.134)) * 100);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {/* Slider Container */}
      <div className="relative flex items-center gap-2">
        {/* Custom Slider with integrated fill */}
        <div className="relative flex-1 h-4 flex items-center">
          {/* Tiny marker dots embedded in track - positioned at exact endpoints */}
          <div className="absolute inset-0 flex justify-between items-center pointer-events-none z-[5]">
            {[0, 1, 2, 3, 4, 5].map((marker) => (
              <div
                key={marker}
                className={`
                  w-[3px] h-[3px] rounded-full transition-colors duration-150
                  ${marker <= backgroundOpacity ? 'bg-white/80' : 'bg-white/20'}
                `}
              />
            ))}
          </div>

          <input
            type="range"
            min="0"
            max="5"
            step="1"
            value={backgroundOpacity}
            onChange={handleChange}
            style={{
              background: backgroundOpacity > 0
                ? `linear-gradient(0.25turn,
                    #f1a7b1 0%,
                    #f3c6b4 ${(backgroundOpacity / 5) * 25}%,
                    #f5e7c2 ${(backgroundOpacity / 5) * 50}%,
                    #b7e1b7 ${(backgroundOpacity / 5) * 75}%,
                    #87c4e3 ${(backgroundOpacity / 5) * 100}%,
                    rgba(255, 255, 255, 0.08) ${(backgroundOpacity / 5) * 100}%,
                    rgba(255, 255, 255, 0.08) 100%)`
                : 'rgba(255, 255, 255, 0.08)'
            }}
            className="
              w-full h-[4px] rounded-full appearance-none cursor-pointer
              backdrop-blur-sm
              border border-white/15
              transition-all duration-150
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:shadow-[0_1px_3px_rgba(0,0,0,0.2)]
              [&::-webkit-slider-thumb]:transition-all
              [&::-webkit-slider-thumb]:duration-150
              [&::-webkit-slider-thumb]:relative
              [&::-webkit-slider-thumb]:z-10
              hover:[&::-webkit-slider-thumb]:shadow-[0_2px_4px_rgba(0,0,0,0.25)]
              active:[&::-webkit-slider-thumb]:scale-95
              [&::-moz-range-thumb]:w-4
              [&::-moz-range-thumb]:h-4
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-white
              [&::-moz-range-thumb]:border-0
              [&::-moz-range-thumb]:shadow-[0_1px_3px_rgba(0,0,0,0.2)]
              [&::-moz-range-thumb]:transition-all
              [&::-moz-range-thumb]:duration-150
              [&::-moz-range-thumb]:relative
              [&::-moz-range-thumb]:z-10
              hover:[&::-moz-range-thumb]:shadow-[0_2px_4px_rgba(0,0,0,0.25)]
              active:[&::-moz-range-thumb]:scale-95
            "
            aria-label="Background opacity"
            aria-valuemin={0}
            aria-valuemax={5}
            aria-valuenow={backgroundOpacity}
            aria-valuetext={`Background opacity ${opacityPercentage}%`}
          />
        </div>

        {/* Value Display */}
        <span className="text-white/70 text-xs font-mono min-w-[24px] text-right michroma">
          {backgroundOpacity}
        </span>
      </div>
    </div>
  );
}
