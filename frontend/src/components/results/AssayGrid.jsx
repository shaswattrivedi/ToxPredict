import PropTypes from 'prop-types'
import Section from '../ui/Section'
import ToxicityCard from '../ToxicityCard'

/**
 * AssayGrid component
 * Displays assay results grouped by category
 */
function AssayGrid({ nrAssays, srAssays }) {
  return (
    <div className="space-y-8">
      {/* Nuclear Receptors Section */}
      <Section
        title="Nuclear Receptors (NR)"
        subtitle="Hormone pathway activation assays (6 endpoints)"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {nrAssays.map((assay) => (
            <ToxicityCard key={assay.assay_name} assay={assay} />
          ))}
        </div>
      </Section>

      {/* Stress Response Section */}
      <Section
        title="Stress Response (SR)"
        subtitle="Cellular stress indicators (6 endpoints)"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {srAssays.map((assay) => (
            <ToxicityCard key={assay.assay_name} assay={assay} />
          ))}
        </div>
      </Section>
    </div>
  )
}

AssayGrid.propTypes = {
  nrAssays: PropTypes.arrayOf(PropTypes.object).isRequired,
  srAssays: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default AssayGrid
