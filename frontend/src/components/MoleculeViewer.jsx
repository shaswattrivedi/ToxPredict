import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

const OVERALL_RISK_STYLES = {
  HIGH: 'bg-red-600 text-white shadow-lg shadow-red-200 animate-pulse',
  MEDIUM: 'bg-amber-600 text-white shadow-lg shadow-amber-200',
  LOW: 'bg-green-600 text-white shadow-lg shadow-green-200',
}

function MoleculeViewer({
  imageB64,
  smiles,
  structuralAlerts,
  hasStructuralAlerts,
  cached,
}) {
  
  const [compoundName, setCompoundName] = useState('Fetching Name...')

  useEffect(() => {
    let isMounted = true

    const fetchName = async () => {
      setCompoundName('Fetching Name...')
      if (!smiles) {
        if (isMounted) setCompoundName('Unknown Compound')
        return
      }
      try {
        const response = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(smiles)}/synonyms/JSON`)
        if (response.ok) {
          const data = await response.json()
          if (data.InformationList?.Information?.[0]?.Synonym) {
            const synonyms = data.InformationList.Information[0].Synonym;
            const alphabeticSynonym = synonyms.find(s => /[A-Za-z]/.test(s)) || synonyms[0];
            if (isMounted) setCompoundName(alphabeticSynonym.toUpperCase());
            return
          }
        }
        if (isMounted) setCompoundName('Unknown Compound')
      } catch (err) {
        console.error(err)
        if (isMounted) setCompoundName('Unknown Compound')
      }
    }

    fetchName()

    return () => { isMounted = false }
  }, [smiles])

  return (
    <div className="space-y-4">
      {/* Molecule Structure Card */}
      <div className="w-full rounded-3xl border border-gray-200 bg-gray-50 p-8 shadow-2xl transition-all duration-300">
        {cached ? (
          <div className="mb-3 flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-gray-500 bg-white rounded-full w-fit px-3 py-1 shadow-sm border border-gray-200">
            <div className="h-1.5 w-1.5 rounded-full bg-gray-400"></div>
            <span>Cached</span>
          </div>
        ) : null}

        {/* Molecule Image */}
        {compoundName && (
          <h3 className="text-xl font-extrabold text-gray-900 mb-2 text-center tracking-tight border-b border-gray-100 pb-2">{compoundName}</h3>
        )}
        <div className="mx-auto flex min-h-[240px] w-full max-w-sm flex-col items-center justify-center p-4 transition-all duration-300 hover:drop-shadow-xl drop-shadow-md">
          {imageB64 ? (
            <img
              src={`data:image/png;base64,${imageB64}`}
              alt="Molecule structure"
              className="h-auto w-full object-contain transition-transform duration-300 hover:scale-[1.05]"
            />
          ) : (
            <span className="text-sm font-medium text-gray-500">Structure unavailable</span>
          )}
        </div>
      </div>

      {/* Structural Alerts Card */}
      <div className="w-full rounded-3xl border border-gray-200 bg-gray-50 p-8 shadow-2xl transition-all duration-300">
        <h3 className="text-sm font-bold text-gray-900 mb-5">Structural Alerts</h3>
        
        {hasStructuralAlerts ? (
          <div className="space-y-4">
            {structuralAlerts.map((alert, index) => {
              const formatName = (str) => str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              const typeMap = { 'brenk': 'Brenk Library Alert (Reactive/Toxicophore)', 'BRENK': 'Brenk Library Alert (Reactive/Toxicophore)' };
              const displayType = typeMap[alert.alert_type?.toLowerCase()] || formatName(alert.alert_type || '');
              const displayName = formatName(alert.alert_name || '');
              const displayDesc = alert.description || 'Compound contains a structural motif that has been flagged as potentially toxic or reactive.';

              return (
              <div
                key={`${alert.alert_type}-${alert.alert_name}-${index}`}
                className="border-b border-gray-200 last:border-0 py-5 first:pt-0 last:pb-0"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500 shadow-sm shrink-0">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-base font-bold text-gray-900">{displayName}</p>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-md mb-1">{displayType}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-600 leading-relaxed">{displayDesc}</p>
                  </div>
                </div>
              </div>
            )})}
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-gray-200 p-8 text-center shadow-sm hover:shadow-md transition-shadow">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-50 mb-3 border border-green-100 shadow-sm">
              <span className="text-lg font-black text-green-500">✓</span>
            </span>
            <p className="text-sm font-bold text-gray-900">No Structural Alerts Detected</p>
            <p className="text-xs font-medium text-gray-500 mt-1.5">Compound structure appears benign</p>
          </div>
        )}
      </div>
    </div>
  )
}

MoleculeViewer.propTypes = {
  imageB64: PropTypes.string,
  smiles: PropTypes.string.isRequired,
  structuralAlerts: PropTypes.arrayOf(
    PropTypes.shape({
      alert_type: PropTypes.string.isRequired,
      alert_name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
    }),
  ).isRequired,
  hasStructuralAlerts: PropTypes.bool.isRequired,
  cached: PropTypes.bool.isRequired,
}

MoleculeViewer.defaultProps = {
  imageB64: '',
}

export default MoleculeViewer
