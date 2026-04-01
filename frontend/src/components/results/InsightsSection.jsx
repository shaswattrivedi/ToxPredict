import PropTypes from 'prop-types'
import Card from '../ui/Card'
import Section from '../ui/Section'
import RadarChart from '../RadarChart'
import SHAPChart from '../SHAPChart'

/**
 * InsightsSection component
 * Displays risk profile chart and SHAP explainability insights
 */
function InsightsSection({ assayResults, topAssay, shapFeatures }) {
  return (
    <div className="space-y-8">
      {/* Risk Profile Chart */}
      <Section title="Risk Profile Overview" subtitle="Toxicity predictions across all 12 biological assay endpoints">
        <Card>
          <div className="md:hidden">
            <RadarChart assayResults={assayResults} height={280} />
          </div>
          <div className="hidden md:block">
            <RadarChart assayResults={assayResults} height={380} />
          </div>
        </Card>
      </Section>

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
