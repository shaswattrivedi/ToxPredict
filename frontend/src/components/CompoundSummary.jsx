import { useMemo } from 'react'
import PropTypes from 'prop-types'

const RISK_STYLES = {
  High: {
    card: 'border border-red-300 bg-gradient-to-br from-red-50 to-rose-50 shadow-sm',
    badge: 'bg-gradient-to-r from-red-600 to-red-700 text-white',
    score: 'text-red-600',
    thisRow: 'bg-red-100',
    scoreCard: 'border-red-300 bg-red-50',
  },
  Medium: {
    card: 'border border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm',
    badge: 'bg-gradient-to-r from-amber-600 to-amber-700 text-white',
    score: 'text-amber-600',
    thisRow: 'bg-amber-100',
    scoreCard: 'border-amber-300 bg-amber-50',
  },
  Low: {
    card: 'border border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 shadow-sm',
    badge: 'bg-gradient-to-r from-green-600 to-green-700 text-white',
    score: 'text-green-600',
    thisRow: 'bg-green-100',
    scoreCard: 'border-green-300 bg-green-50',
  },
}

function getBooleanToxic(assay) {
  if (typeof assay.is_toxic === 'boolean') {
    return assay.is_toxic
  }
  return Number(assay.probability || 0) >= 0.5
}

function CompoundSummary({
  overallRisk,
  overallScore,
  toxicCount,
  assayResults,
  narrative,
  smiles,
  cached,
}) {
  const styles = RISK_STYLES[overallRisk] || RISK_STYLES.Low
  const scorePct = Math.max(0, Math.min(100, Number(overallScore || 0) * 100))
  const riskKey = String(overallRisk || '').toUpperCase()

  const highestAssay = useMemo(() => {
    if (!Array.isArray(assayResults) || assayResults.length === 0) {
      return null
    }
    return assayResults.reduce(
      (max, r) => (Number(r.probability || 0) > Number(max.probability || 0) ? r : max),
      assayResults[0],
    )
  }, [assayResults])

  const nrToxic = useMemo(
    () => assayResults.filter((r) => r.category === 'Nuclear Receptor' && getBooleanToxic(r)).length,
    [assayResults],
  )

  const srToxic = useMemo(
    () => assayResults.filter((r) => r.category === 'Stress Response' && getBooleanToxic(r)).length,
    [assayResults],
  )

  return (
    <div className="space-y-6">
      {/* Overall Risk Summary */}
      <section className={`rounded-2xl p-6 border ${styles.card} hover:shadow-md transition-shadow`}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Content Column */}
          <div className="lg:col-span-2 flex flex-col justify-center space-y-5">
            {/* Risk Badge */}
            <div className="flex flex-col items-start gap-1">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-widest pl-1">
                Overall Risk Assessment
              </span>
              <div className="flex items-center gap-4">
                <h2 className={`mt-1 text-5xl font-black ${riskKey === 'HIGH' ? 'text-red-500' : riskKey === 'MEDIUM' ? 'text-amber-500' : 'text-green-500'}`}>
                  {String(overallRisk).toUpperCase()}
                </h2>
                {cached ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md border border-gray-600/50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-300 shadow-sm mt-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-400"></div> Cached
                  </span>
                ) : null}
              </div>
            </div>

            {/* Key Info */}
            <div className="grid grid-cols-2 gap-6 bg-white/10 backdrop-blur-md border border-gray-600/40 p-6 rounded-2xl text-sm shadow-lg">
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Endpoints Triggered</p>
                <p className="text-gray-200 font-medium">
                  <span className={`${toxicCount > 0 ? 'text-red-400 font-bold text-xl' : 'text-green-400 font-bold text-xl'}`}>{toxicCount}</span> / 12 Assays
                </p>
              </div>
              {highestAssay ? (
                <div>
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Primary Concern</p>
                  <p className="text-gray-200 font-medium">
                    {highestAssay.display_name} <span className="text-gray-500 font-bold ml-1">({(Number(highestAssay.probability || 0) * 100).toFixed(0)}%)</span>
                  </p>
                </div>
              ) : null}
            </div>
            
            <p className="text-xs font-medium text-gray-500 bg-white/60 p-2 rounded-md border border-gray-100 flex items-center gap-2">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">i</span>
              In vitro computational result - does not represent clinical toxicity at therapeutic doses.
            </p>
          </div>

          {/* Score Card */}
          <div className="flex flex-col justify-center items-center rounded-xl bg-white/10 backdrop-blur-md border border-gray-200/60 p-6 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Ensemble Score</p>
            <div className="flex items-baseline gap-1 my-2">
              <p className={`text-5xl font-black ${styles.score}`}>{scorePct.toFixed(0)}</p>
              <p className={`text-sm font-bold ${styles.score}`}>%</p>
            </div>

            <div className="mt-4 w-full grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 text-center">
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400">Nuclear</p>
                <p className="text-sm font-bold text-gray-800">{nrToxic}/7</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400">Stress</p>
                <p className="text-sm font-bold text-gray-800">{srToxic}/5</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="relative h-9 overflow-visible rounded-lg border border-gray-100 bg-white/10 backdrop-blur-md">
            <div className="flex h-full w-full overflow-hidden rounded-lg">
              <div className="flex w-1/3 items-center justify-center bg-green-500/20 text-[11px] font-bold text-green-300">
                LOW
              </div>
              <div className="flex w-1/3 items-center justify-center bg-amber-500/20 text-[11px] font-bold text-amber-300 border-x border-gray-500/30">
                MEDIUM
              </div>
              <div className="flex w-1/3 items-center justify-center bg-red-500/20 text-[11px] font-bold text-red-300">
                HIGH
              </div>
            </div>
            <div
              className={`absolute -top-3 text-xl transition-all duration-300 ${riskKey === 'LOW' ? 'text-green-400' : riskKey === 'MEDIUM' ? 'text-amber-400' : 'text-red-500'}`}
              style={{ left: `calc(${riskKey === 'LOW' ? 16.66 : riskKey === 'MEDIUM' ? 50 : 83.33}% - 8px)` }}
              aria-label="Current ensemble score marker"
            >
              ▼
            </div>
          </div>
        </div>
      </section>

      {/* Narrative */}
      {narrative ? (
        <section className="rounded-2xl border border-gray-600/40 bg-white/10 backdrop-blur-md p-8 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
          <div className="flex gap-4">
            <div className="flex-1 pl-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-4">Predictive Biological Narrative</h3>
              <ul className="text-sm leading-relaxed text-gray-200 font-medium space-y-3 list-disc marker:text-indigo-400 pl-4">
                {narrative.split('.').map(s => s.trim()).filter(Boolean).map((sentence, idx) => (
                  <li key={idx}>{sentence}.</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      <p className="sr-only">SMILES: {smiles}</p>
    </div>
  )
}

CompoundSummary.propTypes = {
  overallRisk: PropTypes.oneOf(['High', 'Medium', 'Low']).isRequired,
  overallScore: PropTypes.number.isRequired,
  toxicCount: PropTypes.number.isRequired,
  assayResults: PropTypes.arrayOf(
    PropTypes.shape({
      assay_name: PropTypes.string.isRequired,
      display_name: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      probability: PropTypes.number.isRequired,
      risk_level: PropTypes.string,
      is_toxic: PropTypes.bool,
    }),
  ).isRequired,
  narrative: PropTypes.string.isRequired,
  smiles: PropTypes.string.isRequired,
  cached: PropTypes.bool.isRequired,
  drugLikeness: PropTypes.shape({
    lipinski_pass: PropTypes.bool.isRequired,
    violations: PropTypes.arrayOf(PropTypes.string).isRequired,
    qed_score: PropTypes.number.isRequired,
    molecular_weight: PropTypes.number.isRequired,
    log_p: PropTypes.number.isRequired,
    h_bond_donors: PropTypes.number.isRequired,
    h_bond_acceptors: PropTypes.number.isRequired,
    interpretation: PropTypes.string,
  }).isRequired,
}

export default CompoundSummary
