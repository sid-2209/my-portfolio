'use client';

import { forwardRef, InputHTMLAttributes } from 'react';

interface FormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'error' | 'success';
  inputSize?: 'sm' | 'md' | 'lg';
  className?: string;
  containerClassName?: string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  variant = 'default',
  inputSize = 'md',
  className = '',
  containerClassName = '',
  id,
  ...props
}, ref) => {
  const baseInputClasses = "w-full border rounded-lg bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2";
  
  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-3 py-2 text-sm", 
    lg: "px-4 py-3 text-base"
  };

  const variantClasses = {
    default: "border-gray-300 focus:border-blue-500 focus:ring-blue-200",
    error: "border-red-300 focus:border-red-500 focus:ring-red-200",
    success: "border-green-300 focus:border-green-500 focus:ring-green-200"
  };

  const inputClasses = `${baseInputClasses} ${sizeClasses[inputSize]} ${variantClasses[variant]} ${className}`;
  
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-gray-800">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={`${inputClasses} ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''}`}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

FormInput.displayName = 'FormInput';

export default FormInput;
