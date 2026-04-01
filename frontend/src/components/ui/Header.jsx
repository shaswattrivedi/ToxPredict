import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

function Header({ title }) {
  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
      <header className="h-14 w-full max-w-4xl rounded-full border border-gray-200/50 bg-gradient-to-r from-blue-50/80 via-white/80 to-emerald-50/80 shadow-lg backdrop-blur-md">
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
        <div className="mx-auto flex h-full w-full items-center justify-between px-8">
          <Link to="/" className="flex items-center animate-fade-in-up hover:opacity-80 transition-opacity">
            <h1 className="text-lg font-bold tracking-tight text-gray-800">{title}</h1>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              to="/about"
              className="text-sm font-semibold text-gray-600 transition-colors hover:text-gray-900"
            >
              About Us
            </Link>
          </div>
        </div>
      </header>
    </div>
  )
}

Header.propTypes = {
  title: PropTypes.string,
}

Header.defaultProps = {
  title: 'ToxPredict',
}

export default Header
