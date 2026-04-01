import { useState } from 'react'
import PropTypes from 'prop-types'

const OVERALL_RISK_STYLES = {
  HIGH: 'bg-red-600 text-white shadow-lg shadow-red-200 animate-pulse',
  MEDIUM: 'bg-amber-600 text-white shadow-lg shadow-amber-200',
  LOW: 'bg-green-600 text-white shadow-lg shadow-green-200',
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
    } catch {
      setCopyState('Copy failed')
      window.setTimeout(() => setCopyState('Copy SMILES'), 2000)
    }
  }

  return (
    <div className="space-y-4">
      {/* Molecule Structure Card */}
      <div className="rounded-2xl border border-gray-200 bg-white/5 backdrop-blur-md border-white/10 p-6 shadow-sm">
        {cached ? (
          <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-gray-500 bg-gray-100/80 rounded-full w-fit px-2.5 py-1 backdrop-blur-sm border border-gray-200/50">
            <div className="h-1.5 w-1.5 rounded-full bg-gray-400"></div>
            <span>Cached</span>
          </div>
        ) : null}

        {/* Molecule Image */}
        <div className="mx-auto mb-1 flex min-h-[200px] w-full max-w-xs flex-col items-center justify-center overflow-hidden rounded-xl border border-gray-200/60 bg-gradient-to-b from-white to-gray-50/50 p-4 shadow-sm">
          {imageB64 ? (
            <img
              src={`data:image/png;base64,${imageB64}`}
              alt="Molecule structure"
              className="mb-2 h-auto w-full object-contain transition-transform duration-300 hover:scale-[1.03]"
            />
          ) : (
            <span className="text-sm text-gray-500">Structure unavailable</span>
          )}
          <div className="flex flex-col gap-1 items-center mt-2 w-full text-center">
            <p className="text-[10px] uppercase font-bold text-red-400">
              ● Red Highlight: High Toxicity Contribution (Morgan FP)
            </p>
            <p className="text-[10px] uppercase font-bold text-green-400">
              ● Green Highlight: Low Toxicity Contribution (Morgan FP)
            </p>
            <p className="text-[9px] uppercase tracking-wider font-semibold text-gray-400 mt-1">
              Standard CPK (Un-highlighted O=Red, N=Blue)
            </p>
          </div>
        </div>

        {/* SMILES Display */}
        <div className="rounded-lg bg-white/5 border border-white/20 p-3 mb-3">
          <p className="text-xs font-semibold text-gray-300 mb-1.5">SMILES Notation:</p>
          <div className="flex items-center gap-2">
            <code
              className="flex-1 overflow-auto text-xs text-gray-300 font-mono break-all"
              title={smilesText}
            >
              {shortSmiles || 'No SMILES provided'}
            </code>
            <button
              type="button"
              onClick={handleCopySmiles}
              className="shrink-0 rounded-lg border border-gray-300 bg-white/10 backdrop-blur-md px-2.5 py-1.5 text-xs font-medium text-gray-300 transition hover:bg-gray-100 active:scale-95"
            >
              {copyState}
            </button>
          </div>
        </div>
      </div>

      {/* Risk Summary Card */}
      <div className="rounded-2xl border border-gray-200 bg-white/5 backdrop-blur-md border-white/10 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Overall Assessment</h3>
        
        <div className="space-y-3">
          {/* Risk Badge */}
          <div>
            <p className="text-xs font-semibold text-gray-300 mb-2">Overall Risk Level</p>
            <div className={`inline-flex rounded-full px-5 py-2 text-base font-bold ${riskClass}`}>
              {riskKey === 'HIGH' && '🔴'} {riskKey === 'MEDIUM' && '🟠'} {riskKey === 'LOW' && '🟢'} {riskKey || 'LOW'}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
              <p className="text-xs text-gray-600">Flagged Assays</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{toxicCount}/12</p>
            </div>
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
              <p className="text-xs text-gray-600">Ensemble Score</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{Number(overallScore || 0).toFixed(2)}</p>
            </div>
          </div>

          {/* Processing Time */}
          <p className="text-xs text-gray-600 text-center">⏱️ Analyzed in {Number(processingTimeMs || 0).toFixed(0)}ms</p>
        </div>
      </div>

      {/* Disclaimer Card */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
        <div className="flex gap-3">
          <span className="text-lg shrink-0"></span>
          <div className="text-xs text-blue-800">
            <p className="font-semibold mb-1">In Vitro Testing Context</p>
            <p className="leading-relaxed">
              Predictions reflect toxicity at Tox21 assay concentrations. Clinical risk assessment requires dose-response data and pharmacokinetics.
            </p>
          </div>
        </div>
      </div>

      {/* Drug-likeness Card */}
      <div className="rounded-2xl border border-gray-200 bg-white/5 backdrop-blur-md border-white/10 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Drug-likeness Profile</h3>

        {/* Lipinski Compliance */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-300">Lipinski Rule of Five</p>
            {drugLikeness?.lipinski_pass ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                <span>✓</span> Compliant
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                <span>✗</span> {(drugLikeness?.violations || []).length} Violation(s)
              </span>
            )}
          </div>
        </div>

        {/* QED Score */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-300">QED Score</p>
            <span className="text-sm font-bold text-gray-900">{Number(drugLikeness?.qed_score ?? 0).toFixed(3)}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 border border-gray-300">
            <div
              className={`h-full rounded-full transition-all ${qedBarClass}`}
              style={{ width: `${qedPercent}%` }}
            />
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-gray-50 p-3 border border-gray-200">
            <p className="text-xs text-gray-600 font-semibold">Molecular Weight</p>
            <p className="mt-1 text-sm font-bold text-gray-900">{Number(drugLikeness?.molecular_weight ?? 0).toFixed(1)} Da</p>
            <p className="text-xs text-gray-500 mt-0.5">≤ 500</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 border border-gray-200">
            <p className="text-xs text-gray-600 font-semibold">LogP</p>
            <p className="mt-1 text-sm font-bold text-gray-900">{Number(drugLikeness?.log_p ?? 0).toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-0.5">≤ 5</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 border border-gray-200">
            <p className="text-xs text-gray-600 font-semibold">H-Bond Donors</p>
            <p className="mt-1 text-sm font-bold text-gray-900">{Number(drugLikeness?.h_bond_donors ?? 0)}</p>
            <p className="text-xs text-gray-500 mt-0.5">≤ 5</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 border border-gray-200">
            <p className="text-xs text-gray-600 font-semibold">H-Bond Acceptors</p>
            <p className="mt-1 text-sm font-bold text-gray-900">{Number(drugLikeness?.h_bond_acceptors ?? 0)}</p>
            <p className="text-xs text-gray-500 mt-0.5">≤ 10</p>
          </div>
        </div>

        {drugLikeness?.interpretation ? (
          <p className="mt-4 text-xs italic text-gray-300 bg-gray-50 rounded-lg p-3 border border-gray-200">
            {drugLikeness.interpretation}
          </p>
        ) : null}
      </div>

      {/* Structural Alerts Card */}
      <div className="rounded-2xl border border-gray-200 bg-white/10 backdrop-blur-md/10 backdrop-blur-md p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-100 mb-4">Structural Alerts</h3>
        
        {hasStructuralAlerts ? (
          <div className="space-y-2">
            {structuralAlerts.map((alert, index) => {
              const formatName = (str) => str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              const typeMap = { 'brenk': 'Brenk Library Alert (Reactive/Toxicophore)', 'BRENK': 'Brenk Library Alert (Reactive/Toxicophore)' };
              const displayType = typeMap[alert.alert_type?.toLowerCase()] || formatName(alert.alert_type || '');
              const displayName = formatName(alert.alert_name || '');
              const displayDesc = alert.description || 'Compound contains a structural motif that has been flagged as potentially toxic or reactive.';

              return (
              <div
                key={`${alert.alert_type}-${alert.alert_name}-${index}`}
                className="relative group"
              >
                <div className="rounded-lg bg-red-900/40 border border-red-700/50 p-3 transition-all hover:bg-red-800/50">
                  <div className="flex items-start gap-2">
                    <span className="text-lg mt-0.5">⚠️</span>
                    <div>
                      <p className="text-xs font-semibold text-red-200">{displayType}</p>
                      <p className="text-sm text-white mt-0.5 font-bold">{displayName}</p>
                      <p className="text-xs text-red-300 mt-1">{displayDesc}</p>
                    </div>
                  </div>
                </div>
              </div>
            )})}
          </div>
        ) : (
          <div className="rounded-lg bg-green-900/30 border border-green-700 p-4 text-center">
            <p className="text-sm font-semibold text-green-300">✓ No Structural Alerts Detected</p>
            <p className="text-xs text-green-400 mt-1">Compound structure appears benign</p>
          </div>
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
