import PropTypes from 'prop-types'

function ExampleChips({ examples, onSelect, isLoading }) {
  if (!examples || examples.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 mt-8 mb-6">
      <p className="text-[14px] font-bold text-slate-500">Try Examples:</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {examples.map((example) => (
          <button
            key={example.name}
            type="button"
            onClick={() => onSelect(example.smiles)}
            title={`${example.description}\n\nExpected risk: ${example.expected_risk}`}
            disabled={isLoading}
            className="rounded-full bg-blue-100 px-4 py-2 text-[14px] font-bold text-blue-700 transition hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {example.name}
          </button>
        ))}
      </div>
    </div>
  )
}

ExampleChips.propTypes = {
  examples: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      smiles: PropTypes.string.isRequired,
      description: PropTypes.string,
      expected_risk: PropTypes.string,
    }),
  ),
  onSelect: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
}

ExampleChips.defaultProps = {
  examples: [],
}

export default ExampleChips
