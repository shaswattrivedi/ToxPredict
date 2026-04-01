import { useState } from 'react'
import PropTypes from 'prop-types'
import ExampleChips from './analysis/ExampleChips'
import AnalyzeButton from './analysis/AnalyzeButton'

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
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Enter SMILES String
        </label>
        <p className="text-xs text-gray-600 mb-3">
          SMILES is a standard notation for molecular structures
        </p>
        <textarea
          value={smiles}
          onChange={(event) => setSmiles(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., CC(=O)Oc1ccccc1C(=O)O"
          className="min-h-[120px] w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 font-mono text-sm text-gray-900 outline-none transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50 disabled:text-gray-500"
          disabled={isLoading}
        />
      </div>

      {error ? (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3">
          <p className="text-sm font-medium text-red-700">⚠️ {error}</p>
        </div>
      ) : null}

      <p className="text-xs text-gray-500">💡 Tip: Press Ctrl+Enter to analyze</p>

      <ExampleChips examples={examples} onSelect={fillExample} isLoading={isLoading} />

      <AnalyzeButton isLoading={isLoading} />
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
  ),
}

SMILESInput.defaultProps = {
  examples: [],
}

export default SMILESInput
