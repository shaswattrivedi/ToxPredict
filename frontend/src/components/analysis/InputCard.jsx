import PropTypes from 'prop-types'
import SMILESInput from '../SMILESInput'
import SmallInfoCard from '../ui/SmallInfoCard'

function InputCard({ onSubmit, isLoading, examples }) {
  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-xl transition-all duration-200 hover:shadow-2xl">
      <SmallInfoCard>
        <p className="text-sm text-gray-600">
          Execute in silico toxicity analysis
        </p>
      </SmallInfoCard>
      <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3 transition-all duration-200">
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
