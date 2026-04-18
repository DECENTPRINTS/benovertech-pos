/**
 * Reusable Button Component
 * Premium Apple-style button with variants
 */
export default function Button({
  children,
  variant = 'primary', // primary, secondary, ghost, danger
  size = 'md', // sm, md, lg
  className = '',
  ...props
}) {
  const baseStyles = 'font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary: 'bg-black text-white hover:bg-gray-800 focus:ring-black',
    secondary: 'bg-gray-100 text-black hover:bg-gray-200 focus:ring-gray-400',
    accent: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg focus:ring-orange-500',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${className}
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      {...props}
    >
      {children}
    </button>
  );
}
