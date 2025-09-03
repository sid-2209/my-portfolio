'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'minimal' | 'with-text';
  text?: string;
  className?: string;
  containerClassName?: string;
}

export default function LoadingSpinner({
  size = 'md',
  variant = 'default',
  text,
  className = '',
  containerClassName = ''
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  };

  const borderClasses = {
    sm: "border-2",
    md: "border-2",
    lg: "border-3", 
    xl: "border-4"
  };

  const spinnerClasses = `animate-spin rounded-full ${sizeClasses[size]} ${borderClasses[size]} border-gray-200 border-t-gray-800 ${className}`;

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center justify-center ${containerClassName}`}>
        <div className={spinnerClasses}></div>
      </div>
    );
  }

  if (variant === 'with-text') {
    return (
      <div className={`text-center ${containerClassName}`}>
        <div className={`${spinnerClasses} mx-auto mb-4`}></div>
        {text && (
          <>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading</h3>
            <p className="text-gray-600">{text}</p>
          </>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={`bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200 ${containerClassName}`}>
      <div className={`${spinnerClasses} mx-auto mb-6`}></div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Content</h3>
      <p className="text-gray-600">Please wait while we fetch your content...</p>
    </div>
  );
}
