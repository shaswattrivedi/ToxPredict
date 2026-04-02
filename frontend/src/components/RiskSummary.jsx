import PropTypes from 'prop-types'
import Card from './Card'

/**
 * RiskSummary component
 * Displays overall risk assessment and key metrics
 */
function RiskSummary({
  overallRisk,
  overallScore,
  toxicCount,
  totalAssays = 12,
  cached = false,
}) {
  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low':
      case 'safe':
        return 'from-green-500 to-emerald-600'
      case 'medium':
      case 'moderate':
        return 'from-amber-500 to-amber-600'
      case 'high':
        return 'from-red-500 to-rose-600'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const getRiskBgColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low':
      case 'safe':
        return 'bg-green-50/50 border-green-200/50'
      case 'medium':
      case 'moderate':
        return 'bg-amber-50/50 border-amber-200/50'
      case 'high':
        return 'bg-red-50/50 border-red-200/50'
      default:
        return 'bg-gray-50/50 border-gray-200/50'
    }
  }

  const getRiskTextColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low':
      case 'safe':
        return 'text-green-900'
      case 'medium':
      case 'moderate':
        return 'text-amber-900'
      case 'high':
        return 'text-red-900'
      default:
        return 'text-gray-900'
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className={`${getRiskBgColor(overallRisk)} border rounded-t-2xl p-6`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Overall Risk Assessment
            </p>
            <h2 className={`mt-2 text-4xl font-bold ${getRiskTextColor(overallRisk)}`}>
              {overallRisk?.toUpperCase()}
            </h2>
          </div>
          <div className={`rounded-full bg-gradient-to-br ${getRiskColor(overallRisk)} p-4 text-white`}>
            <p className="text-2xl font-bold">{overallScore.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-4">
            <p className="text-2xl font-bold text-blue-900">{toxicCount}</p>
            <p className="mt-1 text-xs font-medium text-blue-700 uppercase tracking-wide">
              Assays Flagged
            </p>
          </div>
          <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-4">
            <p className="text-2xl font-bold text-purple-900">{totalAssays}</p>
            <p className="mt-1 text-xs font-medium text-purple-700 uppercase tracking-wide">
              Total Assays
            </p>
          </div>
        </div>

        {cached && (
          <div className="flex items-center gap-2 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2">
            <div className="h-1.5 w-1.5 rounded-full bg-gray-400"></div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Loaded from cache
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}

RiskSummary.propTypes = {
  overallRisk: PropTypes.oneOf(['Safe', 'Moderate', 'High']).isRequired,
  overallScore: PropTypes.number.isRequired,
  toxicCount: PropTypes.number.isRequired,
  totalAssays: PropTypes.number,
  cached: PropTypes.bool,
}

RiskSummary.defaultProps = {
  totalAssays: 12,
  cached: false,
}

export default RiskSummary
