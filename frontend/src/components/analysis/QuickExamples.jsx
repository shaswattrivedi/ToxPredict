import PropTypes from 'prop-types'

/**
 * QuickExamples component - Example compound buttons
 * Allows quick population of input field with common compounds
 */
function QuickExamples({ onSelectExample, isLoading, examples = [] }) {
  const defaultExamples = [
    { name: '🌡️ Aspirin', smiles: 'CC(=O)Oc1ccccc1C(=O)O' },
    { name: '☕ Caffeine', smiles: 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C' },
    { name: '🚬 Nicotine', smiles: 'CN1CCC[C@H]1c2cccnc2' },
  ]

  const displayExamples = examples.length > 0 ? examples : defaultExamples

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Try with common compounds:</p>
      <div className="flex flex-wrap gap-2">
        {displayExamples.map((example) => (
          <button
            key={example.name}
            onClick={() => onSelectExample(example.smiles)}
            disabled={isLoading}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 hover:text-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-sm"
          >
            {example.name}
          </button>
        ))}
      </div>
    </div>
  )
}

QuickExamples.propTypes = {
  onSelectExample: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  examples: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      smiles: PropTypes.string,
    }),
  ),
}

QuickExamples.defaultProps = {
  isLoading: false,
  examples: [],
}

export default QuickExamples
