'use client';

export default function MinimalistDivider() {
  return (
    <div className="w-full max-w-full md:max-w-4xl lg:max-w-[45vw] mx-auto px-4 md:px-0 my-16">
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </div>
  );
}