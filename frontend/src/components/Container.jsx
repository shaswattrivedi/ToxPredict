import PropTypes from 'prop-types'

/**
 * Container component
 * Provides max-width and centered layout wrapper
 */
function Container({ children, className = '' }) {
  const baseClasses = 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8'
  return <div className={`${baseClasses} ${className}`}>{children}</div>
}

Container.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
}

Container.defaultProps = {
  className: '',
}

export default Container
