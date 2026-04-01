import PropTypes from 'prop-types'

/**
 * SmallInfoCard component - Nested small card for structuring content
 * Used inside larger cards to improve visual hierarchy
 */
function SmallInfoCard({ children, className = '' }) {
  const baseClasses = 'rounded-lg border border-gray-200 bg-gray-50 p-3'
  return <div className={`${baseClasses} ${className}`}>{children}</div>
}

SmallInfoCard.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
}

SmallInfoCard.defaultProps = {
  className: '',
}

export default SmallInfoCard
