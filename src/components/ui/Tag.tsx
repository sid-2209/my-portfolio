interface TagProps {
  label: string;
  variant?: 'default' | 'primary' | 'secondary';
  className?: string;
}

export default function Tag({ label, variant = 'default', className = '' }: TagProps) {
  const variantClasses = {
    default: 'bg-blue-100 text-blue-800',
    primary: 'bg-purple-100 text-purple-800',
    secondary: 'bg-gray-100 text-gray-800'
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${variantClasses[variant]} ${className}`}
    >
      {label}
    </span>
  );
}
