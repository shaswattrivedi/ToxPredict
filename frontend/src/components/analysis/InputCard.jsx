import PropTypes from 'prop-types'
import SMILESInput from '../SMILESInput'

function InputCard({ onSubmit, isLoading, examples }) {
  return (
    <div className="w-full rounded-2xl border border-blue-100/70 bg-white/85 p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
      <div className="rounded-xl border border-blue-100/70 bg-gradient-to-br from-blue-50/50 to-white p-4 transition-all duration-200">
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
