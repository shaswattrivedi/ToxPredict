import PropTypes from 'prop-types'

/**
 * Reusable Card component
 * Provides consistent styling for all card elements
 */
function Card({ children, className = '', hover = true, padding = 'p-6' }) {
  const baseClasses = 'rounded-2xl bg-white border border-gray-200'
  const hoverClass = hover ? 'hover:shadow-lg transition-shadow duration-200' : ''
  const shadowClass = 'shadow-md'

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
