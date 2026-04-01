import PropTypes from 'prop-types'

function AnalyzeButton({ isLoading }) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="w-full relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-bold tracking-wide text-white shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none"
    >
      <span className="relative z-10">{isLoading ? 'Analyzing Structure...' : 'Analyze Compound'}</span>
    </button>
  )
}

AnalyzeButton.propTypes = {
  isLoading: PropTypes.bool.isRequired,
}

export default AnalyzeButton
