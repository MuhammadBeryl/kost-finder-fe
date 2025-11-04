'use client';

import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  fullWidth = false,
  className,
  ...props
}: ButtonProps) {
  const base =
    'px-4 py-2.5 font-semibold rounded-xl transition-all duration-300 shadow-md focus:ring-2 focus:ring-offset-2 text-sm';
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-400',
    outline:
      'border border-gray-400 text-gray-800 hover:bg-gray-100 focus:ring-gray-400',
  };

  return (
    <button
      {...props}
      className={clsx(base, variants[variant], fullWidth && 'w-full', className)}
    >
      {children}
    </button>
  );
}
