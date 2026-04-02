import { useState } from 'react'
import PropTypes from 'prop-types'
import ExampleChips from './ExampleChips'
import AnalyzeButton from './AnalyzeButton'

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
        <label className="block text-xl font-extrabold text-slate-800 mb-2">
          Enter SMILES String
        </label>
        <p className="text-base font-medium text-slate-600 mb-5">
          SMILES is a standard notation for molecular structures
        </p>
        <textarea
          value={smiles}
          onChange={(event) => setSmiles(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., CC(=O)Oc1ccccc1C(=O)O"
          className="min-h-[160px] w-full resize-none rounded-xl border border-gray-300 bg-white px-5 py-5 font-mono text-[1.1rem] leading-relaxed text-gray-800 shadow-inner outline-none transition-all duration-200 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 disabled:bg-gray-50 disabled:text-gray-500"
          disabled={isLoading}
        />
      </div>

      {error ? (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4">
          <p className="text-sm font-semibold text-red-800">{error}</p>
        </div>
      ) : null}


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
