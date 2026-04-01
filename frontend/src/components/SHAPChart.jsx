import PropTypes from 'prop-types'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const FEATURE_DISPLAY_NAMES = {
  MolLogP: 'Lipophilicity (logP)',
  TPSA: 'Polar surface area',
  MolWt: 'Molecular weight',
  NumAromaticRings: 'Aromatic ring count',
  NumAliphaticRings: 'Aliphatic ring count',
  FractionCSP3: 'Sp3 carbon fraction',
  NumHDonors: 'H-bond donors',
  NumHBA: 'H-bond acceptors',
  NumHBD: 'H-bond donors',
  NumRotatableBonds: 'Rotatable bonds',
  HeavyAtomCount: 'Heavy atom count',
  RingCount: 'Ring count',
  NumAromaticHeterocycles: 'Aromatic heterocycles',
  NumSaturatedRings: 'Saturated rings',
  fr_aldehyde: 'Aldehyde groups',
  fr_epoxide: 'Epoxide groups',
  fr_halogen: 'Halogen atoms',
  fr_NH0: 'Tertiary amines',
  fr_NH1: 'Secondary amines',
  fr_NH2: 'Primary amines',
  NumRadicalElectrons: 'Radical electrons',
}

function formatFeatureName(featureName) {
  if (featureName.startsWith('morgan_bit_')) {
    const bit = featureName.split('_').at(-1)
    return `Structural bit #${bit}`
  }
  return FEATURE_DISPLAY_NAMES[featureName] || featureName
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) {
    return null
  }

  const item = payload[0].payload
  const shapValue = Number(item.value || 0)
  const valueColor = shapValue >= 0 ? 'text-red-600' : 'text-green-600'
  const signed = `${shapValue >= 0 ? '+' : ''}${shapValue.toFixed(3)}`

  return (
    <div className="max-w-xs rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
      <p className="text-sm font-medium text-gray-900">{item.fullName}</p>
      <p className={`mt-1 text-sm font-semibold ${valueColor}`}>SHAP value: {signed}</p>
      <p className="mt-1 text-xs text-gray-600">Feature value: {String(item.featureValue)}</p>
      <p className="mt-2 text-xs italic text-gray-600">{item.insight}</p>
    </div>
  )
}

function SHAPChart({ shapFeatures, assayName, assayDisplayName }) {
  const features = [...(shapFeatures || [])]
    .sort((a, b) => Number(a.rank) - Number(b.rank))
    .slice(0, 10)
    .map((feature) => ({
      displayName: formatFeatureName(feature.feature_name),
      fullName: feature.feature_name,
      value: Number(feature.shap_value),
      direction: feature.direction,
      featureValue: feature.feature_value,
      insight: feature.insight,
      rank: feature.rank,
    }))

  if (!features.length) {
    return (
      <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-gray-200 bg-white">
        <p className="text-sm text-gray-400">SHAP explanation unavailable</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
      <div>
        <h3 className="text-base font-semibold text-gray-900">Molecular Drivers - {assayDisplayName}</h3>
        <p className="text-xs text-gray-500">
          Red bars increase toxicity risk. Green bars reduce it. Values are SHAP attributions.
        </p>
        <p className="mt-1 text-[11px] text-gray-400">Assay: {assayName}</p>
      </div>

      <ResponsiveContainer width="100%" height={Math.max(320, features.length * 38)}>
        <BarChart
          data={features}
          layout="vertical"
          margin={{ top: 5, right: 60, left: 160, bottom: 5 }}
        >
          <CartesianGrid horizontal={false} strokeDasharray="3 3" opacity={0.3} />
          <ReferenceLine x={0} stroke="#9CA3AF" strokeDasharray="4 3" />
          <XAxis
            type="number"
            tickFormatter={(v) => Number(v).toFixed(2)}
            label={{
              value: '<- reduces toxicity | increases toxicity ->',
              position: 'insideBottom',
              offset: -2,
              style: { fontSize: 11, fill: '#6B7280' },
            }}
          />
          <YAxis dataKey="displayName" type="category" width={155} tick={{ fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(107, 114, 128, 0.08)' }} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {features.map((entry) => (
              <Cell
                key={`${entry.fullName}-${entry.rank}`}
                fill={entry.direction === 'increases_toxicity' ? '#EF4444' : '#22C55E'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
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

SHAPChart.propTypes = {
  shapFeatures: PropTypes.arrayOf(
    PropTypes.shape({
      feature_name: PropTypes.string.isRequired,
      shap_value: PropTypes.number.isRequired,
      direction: PropTypes.string.isRequired,
      feature_value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      rank: PropTypes.number.isRequired,
      insight: PropTypes.string.isRequired,
    }),
  ).isRequired,
  assayName: PropTypes.string.isRequired,
  assayDisplayName: PropTypes.string.isRequired,
}

export default SHAPChart
