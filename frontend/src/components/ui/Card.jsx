import PropTypes from 'prop-types'

/**
 * Reusable Card component
 * Provides consistent styling for all card elements
 */
function Card({ children, className = '', hover = true, padding = 'p-8' }) {
  const baseClasses = 'w-full rounded-3xl bg-gray-50 border border-gray-200 transition-all duration-300'
  const hoverClass = hover ? '' : ''
  const shadowClass = 'shadow-2xl'

  const fullClassName = `${baseClasses} ${shadowClass} ${hoverClass} ${padding} ${className}`

  return <div className={fullClassName}>{children}</div>
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  hover: PropTypes.bool,
  padding: PropTypes.string,
}

Card.defaultProps = {
  className: '',
  hover: true,
  padding: 'p-6',
}

export default Card
