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

function getNarrativePreview(narrative) {
  const cleaned = String(narrative || '').trim()
  if (!cleaned) {
    return ''
  }

  const firstTwo = cleaned
    .split('. ')
    .filter(Boolean)
    .slice(0, 2)
    .join('. ')
    .trim()

  if (!firstTwo) {
    return ''
  }

  return firstTwo.endsWith('.') ? `${firstTwo}..` : `${firstTwo}...`
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

  const narrativePreview = getNarrativePreview(narrative)

  return (
    <div className="space-y-6">
      {/* Overall Risk Summary */}
      <section className={`rounded-2xl p-6 border ${styles.card} hover:shadow-md transition-shadow`}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Content Column */}
          <div className="lg:col-span-2 flex flex-col justify-center space-y-5">
            {/* Risk Badge */}
            <div className="flex flex-wrap items-center gap-3">
              <span className={`rounded-md px-4 py-1.5 text-sm uppercase tracking-widest font-bold ${styles.badge} shadow-sm`}>
                {String(overallRisk).toUpperCase()} RISK
              </span>
              {cached ? (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-white border border-gray-200 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500 shadow-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-400"></div> Cached
                </span>
              ) : null}
            </div>

            {/* Key Info */}
            <div className="grid grid-cols-2 gap-4 border-l-2 border-gray-200/50 pl-4 py-1 text-sm bg-white/40 p-3 rounded-r-lg">
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Endpoints Triggered</p>
                <p className="text-gray-900 font-medium">
                  <span className={`${toxicCount > 0 ? 'text-red-600 font-bold text-base' : 'text-gray-900 font-bold text-base'}`}>{toxicCount}</span> / 12 Assays
                </p>
              </div>
              {highestAssay ? (
                <div>
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Primary Concern</p>
                  <p className="text-gray-900 font-medium">
                    {highestAssay.display_name} <span className="text-gray-500">({(Number(highestAssay.probability || 0) * 100).toFixed(0)}%)</span>
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
          <div className="flex flex-col justify-center items-center rounded-xl bg-white border border-gray-200/60 p-6 shadow-sm">
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
          <div className="relative h-7 overflow-visible rounded-md border border-gray-200 bg-white">
            <div className="flex h-full w-full overflow-hidden rounded-md">
              <div className="flex w-[40%] items-center justify-center bg-green-100 text-[11px] font-semibold text-green-700">
                LOW (0-40%)
              </div>
              <div className="flex w-[30%] items-center justify-center bg-amber-100 text-[11px] font-semibold text-amber-700">
                MEDIUM (40-70%)
              </div>
              <div className="flex w-[30%] items-center justify-center bg-red-100 text-[11px] font-semibold text-red-700">
                HIGH (70-100%)
              </div>
            </div>
            <div
              className="absolute -top-2 text-sm text-gray-700"
              style={{ left: `calc(${scorePct}% - 6px)` }}
              aria-label="Current ensemble score marker"
            >
              ▼
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            LOW = model predicts no significant activity | MEDIUM = borderline signals present |
            HIGH = predicted toxic activity at assay concentration
          </p>
        </div>
      </section>

      {/* Narrative */}
      {narrative ? (
        <section className="rounded-2xl border border-gray-200/50 bg-white p-6 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
          <div className="flex gap-4">
            <div className="flex-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 ml-1">Predictive Biological Narrative</h3>
              <p className="text-[15px] leading-[1.65] text-gray-800 font-medium pl-1 border-l-2 border-indigo-100 ml-1">{narrative}</p>
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
