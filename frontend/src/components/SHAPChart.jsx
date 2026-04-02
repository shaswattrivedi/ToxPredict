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
    <section className="w-full rounded-3xl border border-gray-200 bg-white/95 backdrop-blur p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Molecular Drivers</h3>
              <p className="text-[10px] uppercase font-bold text-gray-500 mt-1 tracking-wider">{assayDisplayName} — Top 10 Features</p>
            </div>
            <div className="text-[10px] uppercase font-bold text-gray-400 bg-white border border-gray-200 px-2 py-1 rounded-md tracking-widest font-mono">
              Assay: {assayName}
            </div>
          </div>

          {/* Legend */}
          <div className="mb-6 flex gap-4 bg-white/50 border border-gray-200 p-2.5 rounded-xl w-fit drop-shadow-sm">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-6 rounded bg-red-500 shadow-sm" />
              <span className="text-[10px] uppercase font-bold text-gray-700 tracking-wider">Increases Toxicity</span>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <div className="h-2.5 w-6 rounded bg-green-500 shadow-sm" />
              <span className="text-[10px] uppercase font-bold text-gray-700 tracking-wider">Reduces Toxicity</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={Math.max(400, features.length * 45)}>
            <BarChart
              data={features}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 140, bottom: 40 }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="4 3" opacity={0.2} />
              <ReferenceLine x={0} stroke="#D1D5DB" strokeWidth={1.5} />
              <XAxis
                type="number"
                tickFormatter={(v) => Number(v).toFixed(2)}
                tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 'bold' }}
                label={{
                  value: 'Reduces Toxicity ← | → Increases Toxicity',
                  position: 'insideBottom',
                  offset: -30,
                  style: { fontSize: 10, fill: '#6B7280', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' },
                }}
              />
              <YAxis
                dataKey="displayName"
                type="category"
                width={135}
                tick={{ fontSize: 11, fill: '#374151', fontWeight: 'bold' }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} isAnimationActive={true} animationDuration={500} barSize={24}>
                {features.map((entry) => (
                  <Cell
                    key={`${entry.fullName}-${entry.rank}`}
                    fill={entry.direction === 'increases_toxicity' ? '#EF4444' : '#22C55E'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Interpretation */}
          <div className="mt-4 rounded-xl bg-blue-50/80 border border-blue-200/60 p-4 shadow-sm">
            <p className="text-xs text-blue-900 leading-relaxed font-medium">
              <span className="font-bold uppercase text-[10px] tracking-wider text-blue-800 mr-2">How to interpret:</span> 
              Positive SHAP values (red) increase the probability of toxicity for this assay. Negative values (green) decrease it. The feature value shows the actual molecular property computed for your compound.
            </p>
          </div>
        </div>
      </div>
    </section>
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
