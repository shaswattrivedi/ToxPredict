import { useState } from 'react'
import PropTypes from 'prop-types'

function SMILESInput({ onSubmit, isLoading, examples }) {
  const [smiles, setSmiles] = useState('')
  const [error, setError] = useState('')

  const validate = (value) => {
    const cleaned = value.trim()

    if (!cleaned) {
      return 'Please enter a SMILES string'
    }

    if (cleaned.length < 2) {
      return 'SMILES string too short'
    }

    return ''
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const cleaned = smiles.trim()
    const validationError = validate(cleaned)

    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    onSubmit(cleaned)
  }

  const handleKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault()
      handleSubmit(event)
    }
  }

  const fillExample = (exampleSmiles) => {
    setSmiles(exampleSmiles)
    setError('')
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3">
      <textarea
        value={smiles}
        onChange={(event) => setSmiles(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter SMILES string (e.g. CC(=O)Oc1ccccc1C(=O)O)"
        className="min-h-[80px] w-full resize-y rounded-lg border border-gray-300 bg-white px-4 py-3 font-mono text-sm text-gray-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        disabled={isLoading}
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <p className="text-xs text-gray-400">Press Ctrl+Enter to analyze</p>

      <div className="flex flex-wrap gap-2">
        {examples.map((example) => (
          <button
            key={example.name}
            type="button"
            title={`${example.description} | Expected risk: ${example.expected_risk}`}
            onClick={() => fillExample(example.smiles)}
            className="rounded-full border border-gray-300 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 transition hover:border-gray-400 hover:bg-gray-100"
            disabled={isLoading}
          >
            {example.name}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400">
        SMILES (Simplified Molecular-Input Line-Entry System) is a standard text notation for representing molecular structures.
      </p>

      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
      >
        {isLoading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Analyzing...
          </>
        ) : (
          'Analyze Compound'
        )}
      </button>
    </form>
  )
}

SMILESInput.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  examples: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      smiles: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      expected_risk: PropTypes.string.isRequired,
    }),
  ).isRequired,
}

export default SMILESInput
