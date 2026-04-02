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
      <section className="w-full rounded-3xl border border-gray-200 bg-gray-50 p-8 shadow-2xl transition-all duration-300">
        <div className="mb-6 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold text-sm">
              NR
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900">Nuclear Receptors</h2>
              <p className="mt-1 text-sm font-medium text-gray-500">Hormone pathway activation assays (7 endpoints)</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {nrAssays.map((assay) => (
            <ToxicityCard key={assay.assay_name} assay={assay} />
          ))}
        </div>
      </section>

      {/* Stress Response Section */}
      <section className="w-full rounded-3xl border border-gray-200 bg-gray-50 p-8 shadow-2xl transition-all duration-300">
        <div className="mb-6 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700 font-bold text-sm">
              SR
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900">Stress Response</h2>
              <p className="mt-1 text-sm font-medium text-gray-500">Cellular stress indicators (5 endpoints)</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {srAssays.map((assay) => (
            <ToxicityCard key={assay.assay_name} assay={assay} />
          ))}
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
