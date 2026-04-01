import PropTypes from 'prop-types'

/**
 * Hero component - Main heading section
 * Displays centered title and subtitle with animations
 */
function Hero({ title, subtitle, children }) {
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 py-8 text-center">
      <style>{`
        @keyframes fadeInHeading {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInSubtitle {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-heading {
          animation: fadeInHeading 600ms ease-out forwards;
        }
        .animate-fade-in-subtitle {
          animation: fadeInSubtitle 600ms ease-out 200ms forwards;
          opacity: 0;
        }
      `}</style>
      <h1 className="animate-fade-in-heading text-center text-4xl font-bold leading-tight tracking-tight text-gray-900 md:text-5xl">
        {title}
      </h1>
      {subtitle && (
        <p className="animate-fade-in-subtitle mx-auto max-w-2xl text-center text-base leading-relaxed text-gray-500">
          {subtitle}
        </p>
      )}
      {children}
    </section>
  )
}

Hero.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: PropTypes.node,
}

Hero.defaultProps = {
  subtitle: '',
  children: null,
}

export default Hero
