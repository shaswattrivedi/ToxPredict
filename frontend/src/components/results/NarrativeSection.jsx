import PropTypes from 'prop-types'
import Card from '../ui/Card'

/**
 * NarrativeSection component
 * Displays AI-generated biological narrative for the top assay
 */
function NarrativeSection({ narrative, topAssay }) {
  return (
    <Card className="border border-blue-200 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="flex items-start gap-4">
        <span className="mt-1 shrink-0 text-2xl">🧠</span>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">Predictive Biological Narrative</h3>
          {topAssay && (
            <div className="mt-3">
              <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                Top Assay: {topAssay.display_name}
              </span>
            </div>
          )}
          <p className="mt-4 text-sm leading-relaxed text-gray-700 italic">{narrative}</p>
        </div>
      </div>
    </Card>
  )
}

NarrativeSection.propTypes = {
  narrative: PropTypes.string.isRequired,
  topAssay: PropTypes.shape({
    display_name: PropTypes.string,
    assay_name: PropTypes.string,
  }),
}

NarrativeSection.defaultProps = {
  topAssay: null,
}

export default NarrativeSection
