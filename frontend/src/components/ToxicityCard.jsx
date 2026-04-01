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
    card: 'border-red-300 bg-red-50 dark:bg-red-950/30',
    badge: 'bg-red-100 text-red-700 border border-red-200',
    bar: 'bg-red-500',
  },
  Medium: {
    card: 'border-amber-300 bg-amber-50 dark:bg-amber-950/30',
    badge: 'bg-amber-100 text-amber-700 border border-amber-200',
    bar: 'bg-amber-500',
  },
  Low: {
    card: 'border-green-300 bg-green-50 dark:bg-green-950/30',
    badge: 'bg-green-100 text-green-700 border border-green-200',
    bar: 'bg-green-500',
  },
}

function ToxicityCard({ assay }) {
  const [showTooltip, setShowTooltip] = useState(false)

  const styles = RISK_STYLES[assay.risk_level] || RISK_STYLES.Low
  const tooltipText = ASSAY_TOOLTIPS[assay.assay_name] || 'No assay metadata available.'
  const probabilityPercent = Math.max(0, Math.min(100, assay.probability * 100))

  return (
    <div
      className={`rounded-lg border p-4 transition-transform duration-150 hover:scale-[1.02] ${styles.card}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="relative min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-sm font-medium text-gray-900">{assay.display_name}</h3>
            <span
              className="relative inline-flex cursor-help items-center text-sm text-gray-500"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              ℹ
              {showTooltip ? (
                <div className="absolute left-0 top-5 z-50 max-w-xs rounded bg-gray-900 px-3 py-2 text-xs text-white shadow-lg">
                  {tooltipText}
                </div>
              ) : null}
            </span>
          </div>
          <p className="text-xs text-gray-500">{assay.assay_name}</p>
        </div>

        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles.badge}`}>
          {assay.risk_level}
        </span>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs text-gray-600">
          <span>Toxicity probability</span>
          <span className="font-medium text-gray-700">{probabilityPercent.toFixed(1)}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded bg-gray-200">
          <div
            className={`h-full rounded ${styles.bar}`}
            style={{ width: `${probabilityPercent}%` }}
          />
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-500">Confidence: {assay.confidence}</p>
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
