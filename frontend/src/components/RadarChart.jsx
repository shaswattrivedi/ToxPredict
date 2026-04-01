import PropTypes from 'prop-types'
import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'

function shortenAssayName(name) {
  return String(name)
    .replace(/Receptor/gi, '')
    .replace(/Response/gi, '')
    .replace(/Tumor Suppressor/gi, 'p53')
    .replace(/\s+/g, ' ')
    .trim()
}

function getRiskColor(probability) {
  if (probability > 70) {
    return '#EF4444'
  }
  if (probability > 40) {
    return '#F59E0B'
  }
  return '#22C55E'
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) {
    return null
  }

  const data = payload[0].payload
  const riskClass =
    data.risk_level === 'High'
      ? 'bg-red-100 text-red-700'
      : data.risk_level === 'Medium'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-green-100 text-green-700'

  return (
    <div className="rounded border border-gray-200 bg-white p-2 text-sm shadow">
      <p className="font-medium text-gray-900">{data.assay}</p>
      <p className="text-xs text-gray-600">{data.probability.toFixed(1)}%</p>
      <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${riskClass}`}>
        {data.risk_level}
      </span>
    </div>
  )
}

function CustomAngleTick(props) {
  const { x, y, payload, probabilityMap } = props
  const probability = probabilityMap[payload.value] ?? 0
  const color = getRiskColor(probability)

  return (
    <text x={x} y={y} fill={color} fontSize={10} textAnchor="middle" dominantBaseline="central">
      {shortenAssayName(payload.value)}
    </text>
  )
}

function RadarChart({ assayResults, height }) {
  const data = (assayResults || []).map((r) => ({
    assay: r.display_name,
    probability: Number(r.probability) * 100,
    risk_level: r.risk_level,
    category: r.category,
  }))

  if (!data.length) {
    return (
      <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-gray-200 bg-white">
        <p className="text-sm text-gray-400">No assay data available</p>
      </div>
    )
  }

  const maxProbability = Math.max(...data.map((d) => d.probability))
  const radarColor = maxProbability > 70 ? '#EF4444' : maxProbability > 40 ? '#F59E0B' : '#22C55E'

  const probabilityMap = data.reduce((acc, item) => {
    acc[item.assay] = item.probability
    return acc
  }, {})

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">Toxicity Risk Profile</h3>
        <p className="text-sm text-gray-600 mt-1">All 12 biological assay endpoints visualized simultaneously</p>
      </div>

      <ResponsiveContainer width="100%" height={height || 400}>
        <RechartsRadar cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid gridType="polygon" stroke="#E5E7EB" />
          <PolarAngleAxis
            dataKey="assay"
            tick={(props) => <CustomAngleTick {...props} probabilityMap={probabilityMap} />}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tickCount={4}
            tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 500 }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Radar
            name="Toxicity Risk"
            dataKey="probability"
            stroke={radarColor}
            fill={radarColor}
            fillOpacity={0.15}
            strokeWidth={2.5}
          />
          <Legend content={() => null} />
        </RechartsRadar>
      </ResponsiveContainer>

      {/* Risk Legend */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-center">
          <span className="text-lg">🔴</span>
          <p className="text-xs font-semibold text-red-900 mt-1">High Risk</p>
          <p className="text-xs text-red-700 mt-0.5">{'>'}70%</p>
        </div>
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-center">
          <span className="text-lg">🟠</span>
          <p className="text-xs font-semibold text-amber-900 mt-1">Medium Risk</p>
          <p className="text-xs text-amber-700 mt-0.5">40-70%</p>
        </div>
        <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-center">
          <span className="text-lg">🟢</span>
          <p className="text-xs font-semibold text-green-900 mt-1">Low Risk</p>
          <p className="text-xs text-green-700 mt-0.5">{'<'}40%</p>
        </div>
      </div>
    </div>
  )
}

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(PropTypes.object),
}

CustomTooltip.defaultProps = {
  active: false,
  payload: [],
}

CustomAngleTick.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  payload: PropTypes.shape({ value: PropTypes.string.isRequired }).isRequired,
  probabilityMap: PropTypes.objectOf(PropTypes.number).isRequired,
}

RadarChart.propTypes = {
  assayResults: PropTypes.arrayOf(
    PropTypes.shape({
      assay_name: PropTypes.string.isRequired,
      display_name: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      probability: PropTypes.number.isRequired,
      risk_level: PropTypes.string.isRequired,
    }),
  ).isRequired,
  height: PropTypes.number,
}

RadarChart.defaultProps = {
  height: 380,
}

export default RadarChart
