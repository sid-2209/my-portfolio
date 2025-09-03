'use client';

import { forwardRef, TextareaHTMLAttributes } from 'react';

interface FormTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  containerClassName?: string;
}

const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(({
  label,
  error,
  helperText,
  variant = 'default',
  size = 'md',
  className = '',
  containerClassName = '',
  id,
  ...props
}, ref) => {
  const baseTextareaClasses = "w-full border rounded-lg bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 resize-none";
  
  const sizeClasses = {
    sm: "px-3 py-2 text-sm h-16",
    md: "px-3 py-2 text-sm h-20", 
    lg: "px-4 py-3 text-base h-24"
  };

  const variantClasses = {
    default: "border-gray-300 focus:border-blue-500 focus:ring-blue-200",
    error: "border-red-300 focus:border-red-500 focus:ring-red-200",
    success: "border-green-300 focus:border-green-500 focus:ring-green-200"
  };

  const textareaClasses = `${baseTextareaClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;
  
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-semibold text-gray-800">
          {label}
        </label>
      )}
      
      <textarea
        ref={ref}
        id={textareaId}
        className={textareaClasses}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

FormTextarea.displayName = 'FormTextarea';

export default FormTextarea;
