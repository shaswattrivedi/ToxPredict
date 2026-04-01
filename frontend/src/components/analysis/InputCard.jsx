import PropTypes from 'prop-types'
import SMILESInput from '../SMILESInput'

function InputCard({ onSubmit, isLoading, examples }) {
  return (
    <div className="w-full rounded-2xl border border-gray-200/60 bg-white/80 p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
      <div className="rounded-xl border border-gray-200/50 bg-gray-50/50 p-4 transition-all duration-200">
        <SMILESInput onSubmit={onSubmit} isLoading={isLoading} examples={examples} />
      </div>
    </div>
  )
}

InputCard.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  examples: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      smiles: PropTypes.string.isRequired,
      description: PropTypes.string,
      expected_risk: PropTypes.string,
    }),
  ),
}

InputCard.defaultProps = {
  examples: [],
}

export default InputCard
