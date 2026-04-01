import PropTypes from 'prop-types'

function AnalyzeButton({ isLoading }) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isLoading ? 'Analyzing...' : 'Analyze Compound'}
    </button>
  )
}

AnalyzeButton.propTypes = {
  isLoading: PropTypes.bool.isRequired,
}

export default AnalyzeButton
