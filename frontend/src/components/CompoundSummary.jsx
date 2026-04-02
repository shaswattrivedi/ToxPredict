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
    drugLikeness,
  }) {
    const styles = RISK_STYLES[overallRisk] || RISK_STYLES.Low
    const scorePct = Math.max(0, Math.min(100, Number(overallScore || 0) * 100))
    const riskKey = String(overallRisk || '').toUpperCase()

    const qed = Number(drugLikeness?.qed_score ?? 0)
    const qedPercent = Math.max(0, Math.min(100, qed * 100))
    const qedBarClass = qed > 0.6 ? 'bg-green-500' : qed > 0.4 ? 'bg-amber-500' : 'bg-red-500'

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
                <h2 className={`mt-1 text-5xl font-black ${riskKey === 'HIGH' ? 'text-red-600' : riskKey === 'MEDIUM' ? 'text-amber-600' : 'text-green-600'}`}>
                  {String(overallRisk).toUpperCase()}
                </h2>
                {cached ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-600 shadow-sm mt-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div> Cached
                  </span>
                ) : null}
              </div>
            </div>

            {/* Key Info */}
            <div className={`grid grid-cols-2 gap-6 p-6 rounded-2xl text-sm shadow-md hover:shadow-lg transition-shadow border ${styles.scoreCard}`}>
              <div>
                <p className="text-gray-600 text-xs font-semibold uppercase tracking-wider mb-2">Endpoints Triggered</p>
                <p className="text-gray-800 font-medium">
                  <span className={`${toxicCount > 0 ? 'text-red-600 font-bold text-xl' : 'text-green-600 font-bold text-xl'}`}>{toxicCount}</span> / 12 Assays
                </p>
              </div>
              {highestAssay ? (
                <div>
                  <p className="text-gray-600 text-xs font-semibold uppercase tracking-wider mb-2">Primary Concern</p>
                  <p className="text-gray-800 font-medium">
                    {highestAssay.display_name} <span className="text-gray-600 font-bold ml-1">({(Number(highestAssay.probability || 0) * 100).toFixed(0)}%)</span>
                  </p>
                </div>
              ) : null}
            </div>
            
            <p className="text-xs font-bold text-amber-800 bg-amber-50 p-3 rounded-lg border border-amber-200 flex items-center gap-2 shadow-sm mt-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-black text-amber-600">!</span>
              In vitro computational result - does not represent clinical toxicity at therapeutic doses.
            </p>
          </div>

          {/* Score Card */}
          <div className={`flex flex-col justify-center items-center rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow border ${styles.scoreCard}`}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">Ensemble Score</p>
            <div className="flex items-baseline gap-1 my-2">
              <p className={`text-5xl font-black ${styles.score}`}>{scorePct.toFixed(0)}</p>
              <p className={`text-sm font-bold ${styles.score}`}>%</p>
            </div>

            <div className={`mt-4 w-full grid grid-cols-2 gap-3 border-t pt-4 text-center ${riskKey === 'HIGH' ? 'border-red-200' : riskKey === 'MEDIUM' ? 'border-amber-200' : 'border-green-200'}`}>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-600">Nuclear</p>
                <p className="text-sm font-bold text-gray-900">{nrToxic}/7</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-600">Stress</p>
                <p className="text-sm font-bold text-gray-800">{srToxic}/5</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="relative h-10 overflow-visible rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-full w-full overflow-hidden rounded-xl">
              <div className={`flex w-1/3 items-center justify-center text-xs font-bold transition-colors ${riskKey === 'LOW' ? 'bg-green-500 text-white shadow-inner' : 'bg-green-50 text-green-700'}`}>
                LOW
              </div>
              <div className={`flex w-1/3 items-center justify-center text-xs font-bold border-x border-gray-200 transition-colors ${riskKey === 'MEDIUM' ? 'bg-amber-500 text-white shadow-inner' : 'bg-amber-50 text-amber-700'}`}>
                MEDIUM
              </div>
              <div className={`flex w-1/3 items-center justify-center text-xs font-bold transition-colors ${riskKey === 'HIGH' ? 'bg-red-500 text-white shadow-inner' : 'bg-red-50 text-red-700'}`}>
                HIGH
              </div>
            </div>
            <div
              className={`absolute -top-4 text-2xl transition-all duration-300 drop-shadow-md ${riskKey === 'LOW' ? 'text-green-800' : riskKey === 'MEDIUM' ? 'text-amber-800' : 'text-red-800'}`}
              style={{ left: `calc(${riskKey === 'LOW' ? 16.66 : riskKey === 'MEDIUM' ? 50 : 83.33}% - 10px)` }}
              aria-label="Current ensemble score marker"
            >
              ▼
            </div>
          </div>
        </div>
      </section>

      {/* Narrative */}
      {narrative ? (
        <section className="rounded-3xl border border-gray-200 bg-gray-50 p-8 shadow-2xl transition-all duration-300">
          <div className="flex gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest">Predictive Biological Narrative</h3>
              <ul className="text-sm leading-relaxed text-gray-800 font-medium space-y-3 list-disc marker:text-gray-400 pl-5">
                {narrative.split('.').map(s => s.trim()).filter(Boolean).map((sentence, idx) => (
                  <li key={idx}>{sentence}.</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

              {/* Drug-likeness Horizontal Card */}
        <section className="rounded-3xl border border-gray-200 bg-gray-50 p-8 shadow-2xl transition-all duration-300 mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-widest">Drug-likeness Profile</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                
                {/* Left Side: Lipinski & QED */}
                <div className="space-y-6">
                  {/* Lipinski Compliance */}
                  <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <p className="text-sm font-bold text-gray-900">Lipinski Rule of Five</p>
                    {drugLikeness?.lipinski_pass ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 shadow-sm">
                        <span>✓</span> Compliant
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 shadow-sm">
                        <span>✗</span> {(drugLikeness?.violations || []).length} Violation(s)
                      </span>
                    )}
                  </div>

                  {/* QED Score */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-bold text-gray-900">QED Score</p>
                      <span className="text-lg font-bold text-gray-900">{Number(drugLikeness?.qed_score ?? 0).toFixed(3)}</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 border border-gray-300 shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all ${qedBarClass}`}
                        style={{ width: `${qedPercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Properties Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white p-4 border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
                    <p className="text-xs text-gray-800 font-bold">Molecular Weight</p>
                    <p className="mt-1 text-base font-black text-gray-900">{Number(drugLikeness?.molecular_weight ?? 0).toFixed(1)} Da</p>
                    <p className="mt-1 text-[10px] font-medium text-gray-500">≤ 500</p>
                  </div>
                  <div className="rounded-xl bg-white p-4 border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
                    <p className="text-xs text-gray-800 font-bold">LogP</p>
                    <p className="mt-1 text-base font-black text-gray-900">{Number(drugLikeness?.log_p ?? 0).toFixed(2)}</p>
                    <p className="mt-1 text-[10px] font-medium text-gray-500">≤ 5</p>
                  </div>
                  <div className="rounded-xl bg-white p-4 border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
                    <p className="text-xs text-gray-800 font-bold">H-Bond Donors</p>
                    <p className="mt-1 text-base font-black text-gray-900">{Number(drugLikeness?.h_bond_donors ?? 0)}</p>
                    <p className="mt-1 text-[10px] font-medium text-gray-500">≤ 5</p>
                  </div>
                  <div className="rounded-xl bg-white p-4 border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
                    <p className="text-xs text-gray-800 font-bold">H-Bond Acceptors</p>
                    <p className="mt-1 text-base font-black text-gray-900">{Number(drugLikeness?.h_bond_acceptors ?? 0)}</p>
                    <p className="mt-1 text-[10px] font-medium text-gray-500">≤ 10</p>
                  </div>
                </div>

              </div>

              {drugLikeness?.interpretation ? (
                <p className="mt-6 text-sm font-medium italic text-gray-700 bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  {drugLikeness.interpretation}
                </p>
              ) : null}

            </div>
          </div>
        </section>

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
