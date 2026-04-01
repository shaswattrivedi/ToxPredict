import PropTypes from 'prop-types'

function AnalyzeButton({ isLoading }) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="w-full relative overflow-hidden rounded-2xl bg-[#4b3cff] px-4 py-4 text-lg font-bold tracking-wide text-white shadow-[0_4px_14px_0_rgba(75,60,255,0.39)] transition-all duration-300 hover:shadow-[0_6px_20px_rgba(75,60,255,0.23)] hover:-translate-y-0.5 active:-translate-y-0 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:shadow-none"
    >
      <span className="relative z-10">{isLoading ? 'Analyzing Structure...' : 'Analyze Compound'}</span>
    </button>
  )
}

AnalyzeButton.propTypes = {
  isLoading: PropTypes.bool.isRequired,
}

export default AnalyzeButton
