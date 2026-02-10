import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    children: ReactNode;
}

export function Button({
    className,
    variant = 'primary',
    size = 'md',
    children,
    ...props
}: ButtonProps) {
    const variants = {
        primary: 'bg-avengers-red text-white hover:bg-red-700 shadow-lg shadow-red-900/20',
        secondary: 'bg-avengers-blue text-white hover:bg-blue-900 shadow-lg shadow-blue-900/20',
        outline: 'border-2 border-avengers-gold text-avengers-gold hover:bg-avengers-gold/10',
        ghost: 'text-gray-400 hover:text-white hover:bg-white/5',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg font-bold',
    };

    return (
        <button
            className={cn(
                'rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-display tracking-wide',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
