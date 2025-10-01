'use client';

import { useState, useRef, KeyboardEvent } from 'react';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  validateTag?: (tag: string) => boolean;
  className?: string;
  label?: string;
}

export default function TagInput({
  value,
  onChange,
  placeholder = "Enter tags separated by commas",
  maxTags,
  validateTag,
  className = '',
  label
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (tagText: string) => {
    const trimmedTag = tagText.trim();

    // Validation checks
    if (!trimmedTag) return;
    if (value.includes(trimmedTag.toLowerCase())) return; // Prevent duplicates
    if (maxTags && value.length >= maxTags) return;
    if (validateTag && !validateTag(trimmedTag)) return;

    // Add tag and clear input
    onChange([...value, trimmedTag]);
    setInputValue('');
  };

  const removeTag = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Check for comma - if found, add tag from text before comma
    if (newValue.includes(',')) {
      const parts = newValue.split(',');
      const tagToAdd = parts[0];
      const remaining = parts.slice(1).join(',');

      addTag(tagToAdd);
      setInputValue(remaining);
    } else {
      setInputValue(newValue);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        addTag(inputValue);
        break;

      case 'Backspace':
        if (!inputValue && value.length > 0) {
          // Remove last tag if input is empty
          removeTag(value.length - 1);
        }
        break;

      case 'Escape':
        setInputValue('');
        break;
    }
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
    // Add tag if there's text when input loses focus
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-gray-700 text-sm font-medium mb-2">
          {label}
        </label>
      )}

      <div
        onClick={handleContainerClick}
        className={`
          w-full min-h-[48px] border rounded-lg px-3 py-2 bg-white cursor-text
          flex flex-wrap items-center gap-2 transition-all duration-200
          ${isInputFocused
            ? 'border-blue-500 ring-2 ring-blue-200'
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        {/* Render existing tags as chips */}
        {value.map((tag, index) => (
          <div
            key={index}
            className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm font-medium"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(index);
              }}
              className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
              aria-label={`Remove ${tag} tag`}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}

        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsInputFocused(true)}
          onBlur={handleInputBlur}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-gray-900 placeholder-gray-500"
          disabled={Boolean(maxTags && value.length >= maxTags)}
        />
      </div>

      {/* Helper text */}
      <p className="text-xs text-gray-500 mt-1">
        Press comma, Enter, or Tab to add a tag. Press backspace to remove the last tag.
        {maxTags && ` (${value.length}/${maxTags})`}
      </p>
    </div>
  );
}