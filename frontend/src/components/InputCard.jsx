import PropTypes from 'prop-types'
import SMILESInput from './SMILESInput'

function InputCard({ onSubmit, isLoading, examples }) {
  return (
    <div className="w-full rounded-3xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group transform-gpu">
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
