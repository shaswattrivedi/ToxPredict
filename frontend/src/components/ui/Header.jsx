import PropTypes from 'prop-types'

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
        <div className="flex items-center gap-2 animate-fade-in-up">
          <span className="text-base">🧬</span>
          <h1 className="text-lg font-semibold tracking-tight text-gray-800">{title}</h1>
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
