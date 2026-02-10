import { type SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: { value: string; label: string }[];
    error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, options, error, ...props }, ref) => {
        return (
            <div className="space-y-2">
                {label && (
                    <label className="text-sm font-medium text-gray-300 ml-1">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        className={`
              w-full rounded-xl bg-gray-800 border-2 border-gray-700 
              px-4 py-3 text-white appearance-none
              focus:border-avengers-gold focus:outline-none focus:ring-4 focus:ring-avengers-gold/10
              transition-all duration-200
              ${error ? 'border-red-500 focus:border-red-500' : ''}
              ${className}
            `}
                        {...props}
                    >
                        <option value="" disabled>Seçiniz...</option>
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        ▼
                    </div>
                </div>
                {error && (
                    <p className="text-sm text-red-500 ml-1 font-medium">{error}</p>
                )}
            </div>
        );
    }
);
