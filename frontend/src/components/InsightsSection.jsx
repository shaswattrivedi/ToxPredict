import PropTypes from 'prop-types'
import Card from './Card'
import Section from './Section'
import RadarChart from './RadarChart'
import SHAPChart from './SHAPChart'

/**
 * InsightsSection component
 * Displays risk profile chart and SHAP explainability insights
 */
function InsightsSection({ assayResults, topAssay, shapFeatures }) {
  return (
    <div className="space-y-8">
      {/* Risk Profile Chart */}
      <section className="w-full rounded-3xl border border-gray-200 bg-white/95 backdrop-blur p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
        <div className="md:hidden w-full flex justify-center">
          <RadarChart assayResults={assayResults} height={320} />
        </div>
        <div className="hidden md:flex w-full justify-center">
          <RadarChart assayResults={assayResults} height={520} />
        </div>
      </section>

      {/* SHAP Feature Importance */}
      <SHAPChart
        shapFeatures={shapFeatures}
        assayName={topAssay?.assay_name || ''}
        assayDisplayName={topAssay?.display_name || 'Top Assay'}
      />
    </div>
  )
}

InsightsSection.propTypes = {
  assayResults: PropTypes.arrayOf(PropTypes.object).isRequired,
  topAssay: PropTypes.shape({
    assay_name: PropTypes.string,
    display_name: PropTypes.string,
  }),
  shapFeatures: PropTypes.arrayOf(PropTypes.object).isRequired,
}

InsightsSection.defaultProps = {
  topAssay: null,
}

export default InsightsSection
