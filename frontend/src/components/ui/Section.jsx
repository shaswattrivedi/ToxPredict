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
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="mt-2 text-gray-600 text-sm sm:text-base">{subtitle}</p>}
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
