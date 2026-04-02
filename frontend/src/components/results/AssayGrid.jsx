import PropTypes from 'prop-types'
import Section from '../ui/Section'
import ToxicityCard from '../ToxicityCard'

/**
 * AssayGrid component
 * Displays assay results grouped by category
 */
function AssayGrid({ nrAssays, srAssays }) {
  return (
    <div className="space-y-10">
      {/* Nuclear Receptors Section */}
      <section className="w-full rounded-3xl border border-gray-200 bg-white/95 backdrop-blur p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
        <div className="flex gap-4">
          <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-widest">Nuclear Receptors</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {nrAssays.map((assay) => (
                <ToxicityCard key={assay.assay_name} assay={assay} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stress Response Section */}
      <section className="w-full rounded-3xl border border-gray-200 bg-white/95 backdrop-blur p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
        <div className="flex gap-4">
          <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-widest">Stress Response</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {srAssays.map((assay) => (
                <ToxicityCard key={assay.assay_name} assay={assay} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

AssayGrid.propTypes = {
  nrAssays: PropTypes.arrayOf(PropTypes.object).isRequired,
  srAssays: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default AssayGrid
