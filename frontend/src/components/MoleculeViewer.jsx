import { useState } from 'react'
import PropTypes from 'prop-types'

const OVERALL_RISK_STYLES = {
  HIGH: 'bg-red-500 text-white animate-pulse',
  MEDIUM: 'bg-amber-500 text-white',
  LOW: 'bg-green-500 text-white',
}

function MoleculeViewer({
  imageB64,
  smiles,
  overallRisk,
  overallScore,
  toxicCount,
  processingTimeMs,
  drugLikeness,
  structuralAlerts,
  hasStructuralAlerts,
  cached,
}) {
  const [copyState, setCopyState] = useState('Copy SMILES')
  const [hoveredAlertIndex, setHoveredAlertIndex] = useState(null)

  const riskKey = String(overallRisk || '').toUpperCase()
  const riskClass = OVERALL_RISK_STYLES[riskKey] || OVERALL_RISK_STYLES.LOW

  const smilesText = smiles || ''
  const shortSmiles = smilesText.length > 40 ? `${smilesText.slice(0, 40)}...` : smilesText

  const qed = Number(drugLikeness?.qed_score ?? 0)
  const qedPercent = Math.max(0, Math.min(100, qed * 100))
  const qedBarClass = qed > 0.6 ? 'bg-green-500' : qed > 0.4 ? 'bg-amber-500' : 'bg-red-500'

  const handleCopySmiles = async () => {
    try {
      await navigator.clipboard.writeText(smilesText)
      setCopyState('Copied!')
      window.setTimeout(() => setCopyState('Copy SMILES'), 2000)
    } catch (_error) {
      setCopyState('Copy failed')
      window.setTimeout(() => setCopyState('Copy SMILES'), 2000)
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="relative rounded-lg border border-gray-200 bg-white p-4">
        {cached ? (
          <span className="absolute right-3 top-3 rounded-full bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-600">
            ⚡ Cached result
          </span>
        ) : null}

        <div className="mx-auto flex min-h-[180px] w-full max-w-[280px] items-center justify-center overflow-hidden rounded border border-gray-200 bg-white">
          {imageB64 ? (
            <img
              src={`data:image/png;base64,${imageB64}`}
              alt="Molecule structure"
              className="h-auto w-full object-contain"
            />
          ) : (
            <span className="text-xs text-gray-500">Structure unavailable</span>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <p className="flex-1 truncate font-mono text-xs text-gray-600" title={smilesText}>
            {shortSmiles || 'No SMILES provided'}
          </p>
          <button
            type="button"
            onClick={handleCopySmiles}
            className="rounded border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
          >
            {copyState}
          </button>
        </div>
      </div>

      <div className="space-y-2 text-center">
        <div className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${riskClass}`}>
          Overall Risk: {riskKey || 'LOW'}
        </div>
        <p className="text-sm text-gray-700">{toxicCount} of 12 assays flagged</p>
        <p className="text-xs text-gray-500">Ensemble score: {Number(overallScore || 0).toFixed(2)}</p>
        <p className="text-xs text-gray-500">Analyzed in {Number(processingTimeMs || 0).toFixed(0)}ms</p>
      </div>

      <div className="mt-2 rounded border border-blue-200 bg-blue-50 p-2">
        <p className="text-xs text-blue-700">
          <span className="mr-1 text-blue-500">ℹ️</span>
          ⚠️ Predictions reflect in vitro toxicity at Tox21 assay concentrations and do not represent clinical risk at therapeutic doses. Context-dependent interpretation is required.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 p-3">
        <h3 className="text-sm font-medium text-gray-900">Drug-likeness Assessment</h3>

        <div className="mt-2">
          {drugLikeness?.lipinski_pass ? (
            <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
              ✓ Lipinski compliant
            </span>
          ) : (
            <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
              ✗ {(drugLikeness?.violations || []).length} Lipinski violation(s)
            </span>
          )}
        </div>

        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
            <span>QED Score: {Number(drugLikeness?.qed_score ?? 0).toFixed(3)}/1.0</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded bg-gray-200">
            <div className={`h-full rounded ${qedBarClass}`} style={{ width: `${qedPercent}%` }} />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-700">
          <p>MW: {Number(drugLikeness?.molecular_weight ?? 0)} Da</p>
          <p>logP: {Number(drugLikeness?.log_p ?? 0)}</p>
          <p>HBD: {Number(drugLikeness?.h_bond_donors ?? 0)}</p>
          <p>HBA: {Number(drugLikeness?.h_bond_acceptors ?? 0)}</p>
        </div>

        <p className="mt-3 text-xs italic text-gray-600">{drugLikeness?.interpretation || ''}</p>
      </div>

      <div className="rounded-lg border border-gray-200 p-3">
        {hasStructuralAlerts ? (
          <>
            <h3 className="text-sm font-medium text-amber-700">⚠️ Structural Alerts</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {structuralAlerts.map((alert, index) => (
                <div
                  key={`${alert.alert_type}-${alert.alert_name}-${index}`}
                  className="relative"
                  onMouseEnter={() => setHoveredAlertIndex(index)}
                  onMouseLeave={() => setHoveredAlertIndex(null)}
                >
                  <span className="cursor-help rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                    {alert.alert_type}: {alert.alert_name}
                  </span>
                  {hoveredAlertIndex === index ? (
                    <div className="absolute left-0 top-7 z-50 max-w-xs rounded bg-gray-900 px-3 py-2 text-xs text-white shadow-lg">
                      {alert.description}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-xs text-green-600">✓ No structural alerts detected</p>
        )}
      </div>
    </div>
  )
}

MoleculeViewer.propTypes = {
  imageB64: PropTypes.string,
  smiles: PropTypes.string.isRequired,
  overallRisk: PropTypes.string.isRequired,
  overallScore: PropTypes.number.isRequired,
  toxicCount: PropTypes.number.isRequired,
  processingTimeMs: PropTypes.number.isRequired,
  drugLikeness: PropTypes.shape({
    lipinski_pass: PropTypes.bool.isRequired,
    violations: PropTypes.arrayOf(PropTypes.string).isRequired,
    qed_score: PropTypes.number.isRequired,
    molecular_weight: PropTypes.number.isRequired,
    log_p: PropTypes.number.isRequired,
    h_bond_donors: PropTypes.number.isRequired,
    h_bond_acceptors: PropTypes.number.isRequired,
    interpretation: PropTypes.string.isRequired,
  }).isRequired,
  structuralAlerts: PropTypes.arrayOf(
    PropTypes.shape({
      alert_type: PropTypes.string.isRequired,
      alert_name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
    }),
  ).isRequired,
  hasStructuralAlerts: PropTypes.bool.isRequired,
  cached: PropTypes.bool.isRequired,
}

MoleculeViewer.defaultProps = {
  imageB64: '',
}

export default MoleculeViewer
