import { useMemo, useState } from 'react'
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

function getQEDVerdict(qed) {
  if (qed >= 0.67) {
    return 'This compound has strong drug-like properties - structurally similar to many approved medications.'
  }
  if (qed >= 0.34) {
    return 'This compound has moderate drug-like properties - some optimization may be needed for clinical use.'
  }
  return 'This compound has poor drug-like properties - significant structural modification would be required for pharmaceutical development.'
}

function getCombinedVerdict(lipinskiPass, qed, violations) {
  if (lipinskiPass && qed >= 0.67) {
    return '✓ This compound has excellent drug-like properties and passes all oral bioavailability criteria - a strong candidate profile for further development, independent of its toxicity findings.'
  }

  if (lipinskiPass && qed >= 0.34) {
    return `✓ This compound passes oral bioavailability criteria with moderate drug-likeness (QED: ${qed.toFixed(3)}). Structural optimization could improve its pharmaceutical profile.`
  }

  if (lipinskiPass && qed < 0.34) {
    return `⚠️ While this compound passes Lipinski criteria, its low QED score (${qed.toFixed(3)}) suggests poor overall drug-likeness. Significant optimization would be needed.`
  }

  return `✗ This compound fails ${violations.length} Lipinski rule(s): ${violations.join(', ')}. Poor predicted oral bioavailability - likely unsuitable as an oral drug without structural modification.`
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
  const [showLipinskiTip, setShowLipinskiTip] = useState(false)
  const [showQEDTip, setShowQEDTip] = useState(false)

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

  const molecularWeight = Number(drugLikeness.molecular_weight || 0)
  const logP = Number(drugLikeness.log_p || 0)
  const hBondDonors = Number(drugLikeness.h_bond_donors || 0)
  const hBondAcceptors = Number(drugLikeness.h_bond_acceptors || 0)
  const qedScore = Number(drugLikeness.qed_score || 0)
  const qedPct = Math.max(0, Math.min(100, qedScore * 100))

  const mwPass = molecularWeight <= 500
  const logPPass = logP <= 5
  const hbdPass = hBondDonors <= 5
  const hbaPass = hBondAcceptors <= 10

  const lipinskiPass = Boolean(drugLikeness.lipinski_pass)
  const violations = Array.isArray(drugLikeness.violations) ? drugLikeness.violations : []

  const qedColor = qedScore >= 0.67 ? 'text-green-600' : qedScore >= 0.34 ? 'text-amber-600' : 'text-red-600'
  const qedBarColor = qedScore >= 0.67 ? 'bg-green-500' : qedScore >= 0.34 ? 'bg-amber-500' : 'bg-red-500'

  const combinedVerdict = getCombinedVerdict(lipinskiPass, qedScore, violations)

  return (
    <div className="space-y-6">
      {/* Overall Risk Summary */}
      <section className={`rounded-2xl p-6 border-2 ${styles.card}`}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Content Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Risk Badge */}
            <div className="flex flex-wrap items-center gap-3">
              <span className={`rounded-full px-5 py-2 text-xl font-bold ${styles.badge} shadow-md`}>
                {String(overallRisk).toUpperCase()}
              </span>
              {cached ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700">
                  <span>⚡</span> Cached
                </span>
              ) : null}
            </div>

            {/* Key Info */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-900">
                <span className="text-red-600 font-bold">{toxicCount}/12</span> assays flagged as toxic
              </p>
              {highestAssay ? (
                <p className="text-sm text-gray-700">
                  Primary concern: <span className="font-semibold">{highestAssay.display_name}</span> ({
                    (Number(highestAssay.probability || 0) * 100).toFixed(0)}% probability
                  )
                </p>
              ) : null}
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

      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="text-base font-semibold text-gray-900">Drug-likeness Profile</h3>
        <p className="text-xs text-gray-500">How suitable is this compound as a potential drug?</p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <div className="relative flex items-center gap-2">
              <h4 className="text-sm font-medium text-gray-900">Lipinski's Rule of Five</h4>
              <button
                type="button"
                className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 text-xs text-gray-600"
                onMouseEnter={() => setShowLipinskiTip(true)}
                onMouseLeave={() => setShowLipinskiTip(false)}
              >
                ?
              </button>
              {showLipinskiTip ? (
                <div className="absolute left-0 top-7 z-50 max-w-sm rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-600 shadow-lg">
                  Established in 1997 by Pfizer scientist Christopher Lipinski, these 5 rules
                  predict whether a compound can be absorbed when taken orally. A compound that
                  passes all rules is considered "drug-like" - likely to survive digestion and
                  reach the bloodstream. Most approved oral drugs satisfy these rules.
                </div>
              ) : null}
            </div>

            {/* Disclaimer */}
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 mt-4">
              <p className="text-xs text-blue-800 font-medium">
                ⚠️ <span>In vitro predictions only</span> — Do not represent clinical toxicity at therapeutic doses
              </p>
            </div>
          </div>

          {/* Score Card */}
          <div className={`rounded-xl border-2 p-5 text-center shadow-sm ${styles.scoreCard}`}>
            <p className="text-xs font-semibold text-gray-700 mb-2">ENSEMBLE SCORE</p>
            <p className={`text-5xl font-black ${styles.score}`}>{scorePct.toFixed(0)}</p>
            <p className="text-xs text-gray-700 font-medium mt-1">% Risk</p>
            
            <div className="mt-4 pt-4 border-t-2 border-gray-300 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded bg-white/70 p-2">
                  <p className="text-gray-600 text-[10px] font-medium">Nuclear Receptors</p>
                  <p className="text-lg font-bold text-gray-900">{nrToxic}/6</p>
                </div>
                <div className="rounded bg-white/70 p-2">
                  <p className="text-gray-600 text-[10px] font-medium">Stress Response</p>
                  <p className="text-lg font-bold text-gray-900">{srToxic}/6</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Narrative */}
      {narrative ? (
        <section className="rounded-2xl border border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50 p-6 shadow-sm">
          <div className="flex gap-3">
            <span className="text-2xl shrink-0">📖</span>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900">AI-Generated Biological Narrative</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-800 italic">{narrative}</p>
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
