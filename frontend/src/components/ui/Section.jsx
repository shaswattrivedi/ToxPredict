import PropTypes from 'prop-types'

/**
 * Section component
 * Provides consistent vertical spacing and layout wrapper
 */
function Section({ children, className = '', title, subtitle }) {
  const baseClasses = 'py-8 sm:py-12'

  return (
    <section className={`${baseClasses} ${className}`}>
      {title && (
        <div className="mb-6 sm:mb-8 border-b border-gray-200/60 pb-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">{title}</h2>
          {subtitle && <p className="mt-1.5 text-gray-500 font-medium text-sm sm:text-sm">{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  )
}

Section.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
}

Section.defaultProps = {
  className: '',
  title: '',
  subtitle: '',
}

export default Section
