import PropTypes from 'prop-types'
import SMILESInput from '../SMILESInput'

function InputCard({ onSubmit, isLoading, examples }) {
  return (
    <div className="w-full rounded-3xl border border-gray-200 bg-gray-50 p-8 shadow-2xl transition-all duration-300">
      <SMILESInput onSubmit={onSubmit} isLoading={isLoading} examples={examples} />
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
