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
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-2">
        <h3 className="text-base font-semibold text-gray-900">Toxicity Risk Profile</h3>
        <p className="text-xs text-gray-500">Across all 12 biological assay endpoints</p>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <RechartsRadar cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid gridType="polygon" />
          <PolarAngleAxis
            dataKey="assay"
            tick={(props) => <CustomAngleTick {...props} probabilityMap={probabilityMap} />}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tickCount={4}
            tick={{ fontSize: 9, fill: '#9CA3AF' }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Radar
            name="Toxicity Risk"
            dataKey="probability"
            stroke={radarColor}
            fill={radarColor}
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Legend content={() => null} />
        </RechartsRadar>
      </ResponsiveContainer>

      <div className="mt-1 flex items-center justify-center gap-4 text-xs text-gray-600">
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-red-500" /> High risk ({'>'}70%)
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber-500" /> Medium risk (40-70%)
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-green-500" /> Low risk ({'<'}40%)
        </span>
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
