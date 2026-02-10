import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="space-y-2">
                {label && (
                    <label className="text-sm font-medium text-gray-300 ml-1">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={`
            w-full rounded-xl bg-gray-800 border-2 border-gray-700 
            px-4 py-3 text-white placeholder:text-gray-500
            focus:border-avengers-gold focus:outline-none focus:ring-4 focus:ring-avengers-gold/10
            transition-all duration-200
            ${error ? 'border-red-500 focus:border-red-500' : ''}
            ${className}
          `}
                    {...props}
                />
                {error && (
                    <p className="text-sm text-red-500 ml-1 font-medium">{error}</p>
                )}
            </div>
        );
    }
);
