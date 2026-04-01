import { useMemo, useState } from 'react'
import PropTypes from 'prop-types'

const RISK_STYLES = {
  High: {
    card: 'border-l-4 border-red-500 bg-red-50',
    badge: 'bg-red-500 text-white',
    score: 'text-red-600',
    thisRow: 'bg-red-100',
  },
  Medium: {
    card: 'border-l-4 border-amber-500 bg-amber-50',
    badge: 'bg-amber-500 text-white',
    score: 'text-amber-600',
    thisRow: 'bg-amber-100',
  },
  Low: {
    card: 'border-l-4 border-green-500 bg-green-50',
    badge: 'bg-green-500 text-white',
    score: 'text-green-600',
    thisRow: 'bg-green-100',
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
    <div className="space-y-4">
      <section className={`rounded-xl border p-4 ${styles.card}`}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-4 py-1 text-lg font-bold ${styles.badge}`}>
                OVERALL RISK: {String(overallRisk).toUpperCase()}
              </span>
              {cached ? (
                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
                  ⚡ Cached
                </span>
              ) : null}
            </div>

            <p className="mt-1 text-sm text-gray-700">
              {toxicCount} of 12 assays flagged. Primary concern: {highestAssay?.display_name || 'N/A'} ({
                highestAssay ? `${(Number(highestAssay.probability || 0) * 100).toFixed(0)}%` : '0%'
              })
            </p>

            <p className="mt-2 text-xs italic text-gray-500">
              {narrativePreview || 'Narrative summary unavailable.'}
            </p>

            <p className="mt-2 text-xs font-medium text-blue-600">
              ⚠️ In vitro result - does not represent clinical toxicity at therapeutic doses
            </p>
          </div>

          <div className="rounded-lg border border-white/60 bg-white/70 p-3 text-center">
            <p className={`text-4xl font-bold ${styles.score}`}>{scorePct.toFixed(0)}%</p>
            <p className="text-xs text-gray-500">Ensemble Risk Score</p>
            <div className="mt-3 space-y-1 text-left text-xs text-gray-600">
              <p>NR: {nrToxic} of 7 flagged</p>
              <p>SR: {srToxic} of 5 flagged</p>
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

            <div className="mt-2">
              {lipinskiPass ? (
                <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                  ✓ Drug-like (Lipinski Compliant)
                </span>
              ) : (
                <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                  ✗ Not Drug-like ({violations.length} violations)
                </span>
              )}
            </div>

            <div className="mt-3 space-y-3 text-sm">
              <div>
                <p className="font-medium text-gray-700">
                  {mwPass ? '✓' : '✗'} Molecular Weight ≤ 500 Da{' '}
                  <span className={mwPass ? 'text-green-600' : 'text-red-600'}>
                    ({molecularWeight.toFixed(2)} Da)
                  </span>
                </p>
                <p className="text-xs text-gray-400">Smaller molecules are absorbed more easily by the gut</p>
              </div>

              <div>
                <p className="font-medium text-gray-700">
                  {logPPass ? '✓' : '✗'} Lipophilicity (logP) ≤ 5{' '}
                  <span className={logPPass ? 'text-green-600' : 'text-red-600'}>
                    (logP = {logP.toFixed(3)})
                  </span>
                </p>
                <p className="text-xs text-gray-400">
                  logP measures fat-solubility. Too high = can't dissolve in blood. Too low =
                  can't cross cell membranes.
                </p>
              </div>

              <div>
                <p className="font-medium text-gray-700">
                  {hbdPass ? '✓' : '✗'} H-bond Donors ≤ 5{' '}
                  <span className={hbdPass ? 'text-green-600' : 'text-red-600'}>
                    ({hBondDonors} donors)
                  </span>
                </p>
                <p className="text-xs text-gray-400">
                  OH and NH groups that form hydrogen bonds with water. Too many = molecule is
                  "sticky" and gets trapped
                </p>
              </div>

              <div>
                <p className="font-medium text-gray-700">
                  {hbaPass ? '✓' : '✗'} H-bond Acceptors ≤ 10{' '}
                  <span className={hbaPass ? 'text-green-600' : 'text-red-600'}>
                    ({hBondAcceptors} acceptors)
                  </span>
                </p>
                <p className="text-xs text-gray-400">
                  Oxygen and nitrogen atoms. Too many = poor membrane penetration and low oral
                  bioavailability
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="relative flex items-center gap-2">
              <h4 className="text-sm font-medium text-gray-900">QED Drug-likeness Score</h4>
              <button
                type="button"
                className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 text-xs text-gray-600"
                onMouseEnter={() => setShowQEDTip(true)}
                onMouseLeave={() => setShowQEDTip(false)}
              >
                ?
              </button>
              {showQEDTip ? (
                <div className="absolute left-0 top-7 z-50 max-w-sm rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-600 shadow-lg">
                  QED (Quantitative Estimate of Drug-likeness) was developed by
                  GlaxoSmithKline scientists in 2012. It combines 8 molecular properties -
                  including molecular weight, lipophilicity, hydrogen bonding, and structural
                  complexity - into a single score from 0 to 1. Think of it as a single-number
                  answer to "how much does this molecule look like an approved drug?"
                </div>
              ) : null}
            </div>

            <p className={`mt-2 text-4xl font-bold ${qedColor}`}>{qedScore.toFixed(3)}/1.0</p>

            <div className="mt-3">
              <div className="h-2 w-full overflow-hidden rounded bg-gray-200">
                <div className={`h-full rounded ${qedBarColor}`} style={{ width: `${qedPct}%` }} />
              </div>
              <div className="mt-1 flex justify-between text-[11px] text-gray-400">
                <span>Poor (0-0.34)</span>
                <span>Moderate (0.34-0.67)</span>
                <span>Drug-like (0.67-1.0)</span>
              </div>
            </div>

            <div className="mt-3 space-y-1 text-xs text-gray-600">
              <p className="font-medium">Reference compounds for context:</p>
              <p className="grid grid-cols-[1fr_auto] gap-3">
                <span>Aspirin (pain relief)</span>
                <span>QED: 0.55</span>
              </p>
              <p className="grid grid-cols-[1fr_auto] gap-3">
                <span>Ibuprofen (anti-inflammatory)</span>
                <span>QED: 0.67</span>
              </p>
              <p className="grid grid-cols-[1fr_auto] gap-3">
                <span>Caffeine (stimulant)</span>
                <span>QED: 0.53</span>
              </p>
              <p className={`grid grid-cols-[1fr_auto] gap-3 rounded px-2 py-1 ${styles.thisRow}`}>
                <span className="font-medium">This compound</span>
                <span className="font-medium">QED: {qedScore.toFixed(3)}</span>
              </p>
            </div>

            <p className="mt-2 text-xs italic text-gray-600">{getQEDVerdict(qedScore)}</p>
          </div>
        </div>

        <div className="mt-4 rounded border bg-gray-50 p-3">
          <p className="text-sm font-medium text-gray-700">{combinedVerdict}</p>
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
