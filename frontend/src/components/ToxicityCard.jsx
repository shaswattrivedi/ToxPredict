import { useState } from 'react'
import PropTypes from 'prop-types'

const ASSAY_TOOLTIPS = {
  'NR-AR': 'Tests activation of the androgen receptor - involved in male hormone (testosterone) signaling. Activation may indicate endocrine disruption.',
  'NR-AR-LBD': "Tests direct binding to the androgen receptor ligand binding domain - the molecular 'lock' that testosterone fits into.",
  'NR-AhR': 'Aryl Hydrocarbon Receptor - activated by polycyclic aromatics and dioxins. Strong link to carcinogenicity.',
  'NR-Aromatase': 'Tests inhibition of aromatase - the enzyme that converts testosterone to estrogen. Relevant to hormonal cancers.',
  'NR-ER': 'Tests estrogen receptor alpha activation. Estrogen mimics (like DDT) activate this pathway.',
  'NR-ER-LBD': 'Direct binding to the estrogen receptor ligand binding domain.',
  'NR-PPAR-gamma': 'PPAR-gamma activation - disrupts fat metabolism and adipogenesis pathways.',
  'SR-ARE': 'Antioxidant Response Element - activates when cells detect oxidative stress from reactive compounds.',
  'SR-ATAD5': 'DNA damage marker - ATAD5 reporter activates when the compound causes genotoxic stress.',
  'SR-HSE': 'Heat Shock Element - activates when compounds cause protein misfolding or cellular stress.',
  'SR-MMP': "Mitochondrial Membrane Potential - disruption indicates the compound is damaging the cell's power plant.",
  'SR-p53': 'p53 tumor suppressor activation - a primary cellular response to DNA damage.',
}

const RISK_STYLES = {
  High: {
    card: 'border-red-300 bg-gradient-to-br from-red-50 to-rose-50 shadow-sm hover:shadow-md',
    badge: 'bg-red-100 text-red-700 border border-red-200 font-semibold',
    bar: 'bg-red-500',
    icon: '🔴',
  },
  Medium: {
    card: 'border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm hover:shadow-md',
    badge: 'bg-amber-100 text-amber-700 border border-amber-200 font-semibold',
    bar: 'bg-amber-500',
    icon: '🟠',
  },
  Low: {
    card: 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 shadow-sm hover:shadow-md',
    badge: 'bg-green-100 text-green-700 border border-green-200 font-semibold',
    bar: 'bg-green-500',
    icon: '🟢',
  },
}

function ToxicityCard({ assay }) {
  const [showTooltip, setShowTooltip] = useState(false)

  const styles = RISK_STYLES[assay.risk_level] || RISK_STYLES.Low
  const tooltipText = ASSAY_TOOLTIPS[assay.assay_name] || 'No assay metadata available.'
  const probabilityPercent = Math.max(0, Math.min(100, assay.probability * 100))

  return (
    <div
      className={`rounded-xl border p-5 transition-all duration-200 hover:scale-[1.02] cursor-pointer ${styles.card}`}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{styles.icon}</span>
            <h3 className="truncate text-sm font-semibold text-gray-900">{assay.display_name}</h3>
            <button
              type="button"
              className="ml-auto flex-shrink-0 relative inline-flex cursor-help items-center text-gray-400 hover:text-gray-600 transition"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              ℹ️
              {showTooltip ? (
                <div className="absolute left-0 top-6 z-50 max-w-xs rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-xl border border-gray-800">
                  {tooltipText}
                </div>
              ) : null}
            </button>
          </div>
          <p className="text-xs text-gray-600 font-mono">{assay.assay_name}</p>
        </div>

        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${styles.badge}`}>
          {assay.risk_level}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-gray-700">Toxicity Probability</label>
          <span className="text-sm font-bold text-gray-900">{probabilityPercent.toFixed(1)}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 border border-gray-300">
          <div
            className={`h-full rounded-full transition-all duration-500 ${styles.bar}`}
            style={{ width: `${probabilityPercent}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-300/50 text-xs text-gray-600">
        Confidence: <span className="font-semibold">{assay.confidence}</span>
      </div>
    </div>
  )
}

ToxicityCard.propTypes = {
  assay: PropTypes.shape({
    assay_name: PropTypes.string.isRequired,
    display_name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    is_toxic: PropTypes.bool.isRequired,
    probability: PropTypes.number.isRequired,
    risk_level: PropTypes.string.isRequired,
    confidence: PropTypes.string.isRequired,
  }).isRequired,
}

export default ToxicityCard
