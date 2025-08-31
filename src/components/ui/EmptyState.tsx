interface EmptyStateProps {
  message: string;
  className?: string;
}

export default function EmptyState({ message, className = '' }: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <p className="text-gray-500 text-lg">{message}</p>
    </div>
  );
}
