import React from 'react';
import PropTypes from 'prop-types';

const FEATURE_SHORT_NAMES = {
  "MolLogP": "Lipophilicity",
  "TPSA": "Polar surface area",
  "MolWt": "Molecular weight",
  "NumAromaticRings": "Aromatic rings",
  "NumAliphaticRings": "Aliphatic rings",
  "FractionCSP3": "Sp3 fraction",
  "NumHDonors": "H-bond donors",
  "NumHBA": "H-bond acceptors",
  "NumHBD": "H-bond donors",
  "NumRotatableBonds": "Rotatable bonds",
  "HeavyAtomCount": "Heavy atoms",
  "RingCount": "Ring count",
  "fr_aldehyde": "Aldehyde groups",
  "fr_epoxide": "Epoxide groups",
  "fr_halogen": "Halogen atoms",
  "fr_NH0": "Tertiary amines",
  "fr_NH1": "Secondary amines",
  "fr_NH2": "Primary amines",
};

const getFeatureName = (name) => {
  if (FEATURE_SHORT_NAMES[name]) return FEATURE_SHORT_NAMES[name];
  if (name?.startsWith('morgan_bit_')) {
    return `Structural bit #${name.split('_')[2]}`;
  }
  return name;
};

const getShortInsight = (insight, direction) => {
  if (!insight) return "Relevant molecular property";
  
  const isInc = direction === 'increases_toxicity';
  const prefix = isInc ? "Increases risk via" : "Decreases risk via";

  const lower = insight.toLowerCase();
  if (lower.includes("lipophilicity")) return `${prefix} high lipophilicity`;
  if (lower.includes("substructure pattern")) return `${prefix} a specific substructure alert`;
  if (lower.includes("molecular weight") || lower.includes("large molecule")) return `${prefix} molecular size/weight`;
  if (lower.includes("heavy atom count") || lower.includes("molecular complexity")) return `${prefix} molecular complexity`;
  if (lower.includes("aromatic")) return `${prefix} aromatic rings`;
  if (lower.includes("polar") || lower.includes("tpsa")) return `${prefix} polar surface area`;
  if (lower.includes("hydrogen bond")) return `${prefix} hydrogen bonding`;
  if (lower.includes("sp3")) return `${prefix} Sp3 carbon fraction`;
  
  const words = insight.split(' ');
  return words.length > 5 ? words.slice(0, 5).join(' ') + '...' : insight;
};

const TopRiskDrivers = ({ shapFeatures, assayDisplayName, assayName }) => {
  if (!shapFeatures || shapFeatures.length === 0) {
    return (
      <div className="w-full rounded-3xl border border-gray-200 bg-gray-50 p-8 shadow-2xl transition-all duration-300 min-h-[200px] flex items-center justify-center">
        <p className="text-gray-500 font-medium">Analysis data unavailable</p>
      </div>
    );
  }

  const top3 = [...shapFeatures].sort((a, b) => a.rank - b.rank).slice(0, 3);
  const maxAbsShap = Math.max(...top3.map(f => Math.abs(f.shap_value)));
  
  const isNuclearReceptor = assayName && assayName.startsWith('NR-');
  const badgeClass = isNuclearReceptor ? 'text-blue-600 bg-blue-50' : 'text-amber-600 bg-amber-50';

  return (
    <div className="w-full flex-1 flex flex-col rounded-3xl border border-gray-200 bg-gray-50 p-8 shadow-2xl transition-all duration-300 min-h-[200px]">
      <div className="flex flex-col items-start mb-6">
        <h3 className="text-sm font-bold text-gray-900 mb-3">
          Top Risk Drivers
        </h3>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${badgeClass}`}>
          {assayDisplayName}
        </span>
      </div>

      <div className="flex flex-col justify-around flex-1 space-y-4">
        {top3.map((feature, idx) => {
          const isIncrease = feature.direction === 'increases_toxicity';
          const barWidth = maxAbsShap > 0 ? (Math.abs(feature.shap_value) / maxAbsShap) * 100 : 0;

          return (
            <div key={idx} className="flex items-start gap-4 border-b border-gray-200/50 pb-4 last:border-0 last:pb-0">
              <div className="mt-1.5 shrink-0">
                <div className={`w-2.5 h-2.5 rounded-full ${isIncrease ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'}`}></div>
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-900">
                    {getFeatureName(feature.feature_name)}
                  </span>
                  <span className={`text-sm font-mono font-bold ${isIncrease ? 'text-red-600' : 'text-green-600'}`}>
                    {feature.shap_value > 0 ? '+' : ''}{feature.shap_value.toFixed(2)}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${isIncrease ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${barWidth}%` }}
                  ></div>
                </div>
                <p className="text-[11px] font-medium text-gray-500 mt-1.5">
                  {getShortInsight(feature.insight, feature.direction)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

TopRiskDrivers.propTypes = {
  shapFeatures: PropTypes.array,
  assayDisplayName: PropTypes.string,
  assayName: PropTypes.string,
};

export default TopRiskDrivers;