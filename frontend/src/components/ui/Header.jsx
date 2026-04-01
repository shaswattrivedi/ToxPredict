import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

function Header({ title, tagline }) {
  return (
    <header className="fixed top-0 z-20 h-14 w-full border-b border-gray-200 bg-white/70 backdrop-blur">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 600ms ease-out forwards;
        }
      `}</style>
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 animate-fade-in-up hover:opacity-80 transition-opacity">
          <span className="text-base"></span>
          <h1 className="text-lg font-semibold tracking-tight text-gray-800">{title}</h1>
        </Link>
        <div className="flex items-center gap-6">
          <p className="hidden text-xs text-gray-500 md:block">{tagline}</p>
          <Link
            to="/about"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            About Us
          </Link>
        </div>
      </div>
    </header>
  )
}

Header.propTypes = {
  title: PropTypes.string,
  tagline: PropTypes.string,
}

Header.defaultProps = {
  title: 'ToxPredict',
  tagline: 'Drug Toxicity Prediction with Explainability',
}

export default Header
