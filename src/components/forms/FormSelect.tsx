'use client';

import { forwardRef, SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface FormSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  variant?: 'default' | 'error' | 'success';
  selectSize?: 'sm' | 'md' | 'lg';
  className?: string;
  containerClassName?: string;
  placeholder?: string;
}

const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(({
  label,
  options,
  error,
  helperText,
  variant = 'default',
  selectSize = 'md',
  className = '',
  containerClassName = '',
  placeholder,
  id,
  ...props
}, ref) => {
  const baseSelectClasses = "w-full border rounded-lg bg-white text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2";
  
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

  const selectClasses = `${baseSelectClasses} ${sizeClasses[selectSize]} ${variantClasses[variant]} ${className}`;
  
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-semibold text-gray-800">
          {label}
        </label>
      )}
      
      <select
        ref={ref}
        id={selectId}
        className={selectClasses}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

FormSelect.displayName = 'FormSelect';

export default FormSelect;
