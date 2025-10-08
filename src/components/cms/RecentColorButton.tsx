'use client';

interface RecentColorButtonProps {
  color?: string;
  onClick: () => void;
  empty?: boolean;
}

export default function RecentColorButton({ color, onClick, empty = false }: RecentColorButtonProps) {
  if (empty || !color) {
    return (
      <button
        disabled
        className="w-7 h-7 rounded-md border-2 border-dashed border-gray-300 bg-gray-50 cursor-not-allowed opacity-50"
        title="No recent color"
      />
    );
  }

  return (
    <button
      onClick={onClick}
      className="w-7 h-7 rounded-md border-2 border-gray-300 hover:border-blue-500 hover:scale-110 transition-all shadow-sm active:scale-95"
      style={{ backgroundColor: color }}
      title={`Apply ${color}`}
    />
  );
}
