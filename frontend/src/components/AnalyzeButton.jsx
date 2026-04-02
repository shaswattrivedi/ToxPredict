import PropTypes from 'prop-types'

function AnalyzeButton({ isLoading }) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="w-full justify-center flex items-center gap-3 relative overflow-hidden rounded-2xl bg-[#4b3cff] px-4 py-4 text-lg font-bold tracking-wide text-white shadow-[0_4px_14px_0_rgba(75,60,255,0.39)] transition-all duration-300 hover:shadow-[0_6px_20px_rgba(75,60,255,0.23)] hover:-translate-y-0.5 active:-translate-y-0 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:shadow-none"
    >
      {isLoading && (
        <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      <span className="relative z-10 transition-opacity duration-300">
        Analyze Compound
      </span>
    </button>
  )
}

AnalyzeButton.propTypes = {
  isLoading: PropTypes.bool.isRequired,
}

export default AnalyzeButton
