/**
 * Reusable Card Component
 * Premium Apple-style design with rounded corners and soft shadows
 */
export default function Card({ children, className = '', onClick, hover = true }) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl bg-white
        shadow-md hover:shadow-lg
        transition-shadow duration-300
        border border-gray-100
        ${hover ? 'hover:border-gray-200 cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
