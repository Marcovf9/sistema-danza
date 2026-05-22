/**
 * Spinner de carga reutilizable.
 * @param {string} color  - clase Tailwind de color del borde (default: 'border-indigo-600')
 * @param {string} size   - clase Tailwind de tamaño (default: 'h-8 w-8')
 * @param {string} className - clases adicionales para el contenedor
 */
const LoadingSpinner = ({
  color = 'border-indigo-600',
  size = 'h-8 w-8',
  className = 'flex justify-center p-12',
}) => (
  <div className={className}>
    <div className={`animate-spin rounded-full ${size} border-b-2 ${color}`} />
  </div>
);

export default LoadingSpinner;
