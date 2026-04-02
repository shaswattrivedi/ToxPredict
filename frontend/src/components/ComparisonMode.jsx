import { useMemo, useState } from 'react'
import {
  RadarChart as RechartsRadar,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'

import { predictToxicity } from '../api/toxicity'

const assayColumns = [
  'NR-AR',
  'NR-AR-LBD',
  'NR-AhR',
  'NR-Aromatase',
  'NR-ER',
  'NR-ER-LBD',
  'NR-PPAR-gamma',
  'SR-ARE',
  'SR-ATAD5',
  'SR-HSE',
  'SR-MMP',
  'SR-p53',
]

const assayDisplayNames = {
  'NR-AR': 'Androgen Receptor',
  'NR-AR-LBD': 'Androgen Receptor LBD',
  'NR-AhR': 'Aryl Hydrocarbon Receptor',
  'NR-Aromatase': 'Aromatase',
  'NR-ER': 'Estrogen Receptor Alpha',
  'NR-ER-LBD': 'Estrogen Receptor LBD',
  'NR-PPAR-gamma': 'PPAR Gamma',
  'SR-ARE': 'Antioxidant Response',
  'SR-ATAD5': 'Genotoxicity (ATAD5)',
  'SR-HSE': 'Heat Shock Response',
  'SR-MMP': 'Mitochondrial Membrane',
  'SR-p53': 'p53 Tumor Suppressor',
}

const EXAMPLES = {
  aspirin: 'CC(=O)Oc1ccccc1C(=O)O',
  pyrene: 'c1ccc2c(c1)ccc1cccc3ccc2c1c3',
}

function shortAssayName(assayCode) {
  const fullName = assayDisplayNames[assayCode] || assayCode
  return fullName
    .replace(/Receptor/gi, '')
    .replace(/Response/gi, '')
    .replace(/Tumor Suppressor/gi, 'p53')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseApiError(error, fallback) {
  const detail = error?.response?.data?.detail
  if (typeof detail === 'string') {
    return detail
  }
  if (typeof detail?.detail === 'string') {
    return detail.detail
  }
  if (typeof error?.message === 'string') {
    return error.message
  }
  return fallback
}

function riskBadgeClasses(risk) {
  if (risk === 'High') {
    return 'bg-red-100 border border-red-200 text-red-800'
  }
  if (risk === 'Medium') {
    return 'bg-amber-100 border border-amber-200 text-amber-800'
  }
  return 'bg-emerald-100 border border-emerald-200 text-emerald-800'
}

function getRelativeCellClasses(valueA, valueB, preference = 'lower') {
  if (valueA === valueB) {
    return {
      a: 'bg-gray-50 text-gray-700 border border-gray-200',
      b: 'bg-gray-50 text-gray-700 border border-gray-200',
    }
  }

  const aBetter = preference === 'higher' ? valueA > valueB : valueA < valueB

  return {
    a: aBetter
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      : 'bg-red-50 text-red-700 border border-red-200',
    b: aBetter
      ? 'bg-red-50 text-red-700 border border-red-200'
      : 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  }
}

function ComparisonMode() {
  const [smilesA, setSmilesA] = useState('')
  const [smilesB, setSmilesB] = useState('')
  const [resultA, setResultA] = useState(null)
  const [resultB, setResultB] = useState(null)
  const [errorA, setErrorA] = useState('')
  const [errorB, setErrorB] = useState('')
  const [isComparing, setIsComparing] = useState(false)

  const compareData = useMemo(() => {
    if (!resultA || !resultB) {
      return []
    }

    return assayColumns.map((assay) => ({
      assay: shortAssayName(assay),
      probabilityA:
        resultA.assay_results.find((r) => r.assay_name === assay)?.probability * 100 || 0,
      probabilityB:
        resultB.assay_results.find((r) => r.assay_name === assay)?.probability * 100 || 0,
    }))
  }, [resultA, resultB])

  const handleCompare = async () => {
    const left = smilesA.trim()
    const right = smilesB.trim()

    setErrorA('')
    setErrorB('')
    setResultA(null)
    setResultB(null)

    if (!left) {
      setErrorA('Please enter a valid SMILES string for Compound A.')
    }
    if (!right) {
      setErrorB('Please enter a valid SMILES string for Compound B.')
    }
    if (!left || !right) {
      return
    }

    setIsComparing(true)

    const [responseA, responseB] = await Promise.allSettled([
      predictToxicity(left),
      predictToxicity(right),
    ])

    if (responseA.status === 'fulfilled' && responseB.status === 'fulfilled') {
      setResultA(responseA.value)
      setResultB(responseB.value)
    } else {
      if (responseA.status === 'rejected') {
        setErrorA(parseApiError(responseA.reason, 'Invalid SMILES for Compound A.'))
      }
      if (responseB.status === 'rejected') {
        setErrorB(parseApiError(responseB.reason, 'Invalid SMILES for Compound B.'))
      }
    }

    setIsComparing(false)
  }

  const hasResults = Boolean(resultA && resultB)

  const riskRank = {
    Low: 1,
    Medium: 2,
    High: 3,
  }

  const overallScoreA = (resultA?.overall_risk_score || 0) * 100
  const overallScoreB = (resultB?.overall_risk_score || 0) * 100
  const flaggedA = resultA?.toxic_assay_count || 0
  const flaggedB = resultB?.toxic_assay_count || 0
  const lipinskiA = Boolean(resultA?.drug_likeness?.lipinski_pass)
  const lipinskiB = Boolean(resultB?.drug_likeness?.lipinski_pass)
  const qedA = resultA?.drug_likeness?.qed_score || 0
  const qedB = resultB?.drug_likeness?.qed_score || 0

  const riskCellClass = getRelativeCellClasses(
    riskRank[resultA?.overall_risk] || 99,
    riskRank[resultB?.overall_risk] || 99,
    'lower',
  )
  const scoreCellClass = getRelativeCellClasses(overallScoreA, overallScoreB, 'lower')
  const flaggedCellClass = getRelativeCellClasses(flaggedA, flaggedB, 'lower')
  const lipinskiCellClass = getRelativeCellClasses(Number(lipinskiA), Number(lipinskiB), 'higher')
  const qedCellClass = getRelativeCellClasses(qedA, qedB, 'higher')

  return (
    <div className="w-full rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transform-gpu">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-0 md:divide-x md:divide-gray-200">
        <div className="md:pr-10">
          <label className="block text-xl font-extrabold text-slate-800 mb-2">Compound A</label>
          <p className="text-base font-medium text-slate-600 mb-5">First molecular structure</p>
          <textarea
            value={smilesA}
            onChange={(event) => {
              setSmilesA(event.target.value)
              setErrorA('')
            }}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault()
                handleCompare()
              }
            }}
            disabled={isComparing}
            placeholder="Enter SMILES for Compound A"
            className="min-h-[160px] w-full resize-none rounded-xl border border-gray-300 bg-white px-5 py-5 font-mono text-[1.1rem] leading-relaxed text-gray-800 shadow-inner outline-none transition-all duration-200 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 disabled:bg-gray-50 disabled:text-gray-500"
          />
          {errorA ? (
            <div className="mt-2 rounded-xl bg-red-50 border border-red-200 p-4">
              <p className="text-sm font-semibold text-red-800">{errorA}</p>
            </div>
          ) : null}
          <div className="flex flex-col items-center justify-center gap-3 mt-8 md:mb-0 mb-6">
            <p className="text-[14px] font-bold text-slate-500">Try Examples:</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSmilesA(EXAMPLES.aspirin)
                  setErrorA('')
                }}
                disabled={isComparing}
                className="rounded-full bg-blue-100 px-4 py-2 text-[14px] font-bold text-blue-700 transition hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Aspirin
              </button>
              <button
                type="button"
                onClick={() => {
                  setSmilesA(EXAMPLES.pyrene)
                  setErrorA('')
                }}
                disabled={isComparing}
                className="rounded-full bg-blue-100 px-4 py-2 text-[14px] font-bold text-blue-700 transition hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Pyrene
              </button>
            </div>
          </div>
        </div>

        <div className="md:pl-10">
          <label className="block text-xl font-extrabold text-slate-800 mb-2">Compound B</label>
          <p className="text-base font-medium text-slate-600 mb-5">Second molecular structure</p>
          <textarea
            value={smilesB}
            onChange={(event) => {
              setSmilesB(event.target.value)
              setErrorB('')
            }}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault()
                handleCompare()
              }
            }}
            disabled={isComparing}
            placeholder="Enter SMILES for Compound B"
            className="min-h-[160px] w-full resize-none rounded-xl border border-gray-300 bg-white px-5 py-5 font-mono text-[1.1rem] leading-relaxed text-gray-800 shadow-inner outline-none transition-all duration-200 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 disabled:bg-gray-50 disabled:text-gray-500"
          />
          {errorB ? (
            <div className="mt-2 rounded-xl bg-red-50 border border-red-200 p-4">
              <p className="text-sm font-semibold text-red-800">{errorB}</p>
            </div>
          ) : null}
          <div className="flex flex-col items-center justify-center gap-3 mt-8 mb-0">
            <p className="text-[14px] font-bold text-slate-500">Try Examples:</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSmilesB(EXAMPLES.aspirin)
                  setErrorB('')
                }}
                disabled={isComparing}
                className="rounded-full bg-blue-100 px-4 py-2 text-[14px] font-bold text-blue-700 transition hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Aspirin
              </button>
              <button
                type="button"
                onClick={() => {
                  setSmilesB(EXAMPLES.pyrene)
                  setErrorB('')
                }}
                disabled={isComparing}
                className="rounded-full bg-blue-100 px-4 py-2 text-[14px] font-bold text-blue-700 transition hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Pyrene
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 mb-2 flex justify-center">
        <button
          onClick={handleCompare}
          disabled={isComparing}
          className="flex items-center justify-center gap-2 relative overflow-hidden rounded-xl bg-[#4b3cff] px-8 py-3 text-base font-bold tracking-wide text-white shadow-[0_4px_14px_0_rgba(75,60,255,0.39)] transition-all duration-300 hover:shadow-[0_6px_20px_rgba(75,60,255,0.23)] hover:-translate-y-0.5 active:-translate-y-0 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:shadow-none"
        >
          {isComparing && (
            <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          <span className="relative z-10 transition-opacity duration-300">
            Compare Compounds
          </span>
        </button>
      </div>

      {isComparing ? (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {['Compound A', 'Compound B'].map((name) => (
            <div key={name} className="rounded-2xl border border-gray-200 bg-gray-50 p-6 flex flex-col items-center justify-center min-h-[160px]">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-900">{name}</p>
              <p className="text-[11px] text-gray-500 mt-1">Running prediction pipeline...</p>
            </div>
          ))}
        </div>
      ) : null}

      {hasResults ? (
        <div className="mt-6 space-y-6">
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="min-w-full text-sm text-gray-800">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-gray-400">Metric</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-gray-400">Compound A</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-gray-400">Compound B</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                <tr>
                  <td className="px-4 py-3 font-semibold text-gray-600">Overall Risk</td>
                  <td className={`px-4 py-3 ${riskCellClass.a}`}>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${riskBadgeClasses(resultA.overall_risk)}`}>
                      {resultA.overall_risk}
                    </span>
                  </td>
                  <td className={`px-4 py-3 ${riskCellClass.b}`}>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${riskBadgeClasses(resultB.overall_risk)}`}>
                      {resultB.overall_risk}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-gray-600">Ensemble Score</td>
                  <td className={`px-4 py-3 font-semibold ${scoreCellClass.a}`}>{overallScoreA.toFixed(1)}%</td>
                  <td className={`px-4 py-3 font-semibold ${scoreCellClass.b}`}>{overallScoreB.toFixed(1)}%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-gray-600">Flagged Assays</td>
                  <td className={`px-4 py-3 font-semibold ${flaggedCellClass.a}`}>{flaggedA}/12</td>
                  <td className={`px-4 py-3 font-semibold ${flaggedCellClass.b}`}>{flaggedB}/12</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-gray-600">Lipinski</td>
                  <td className={`px-4 py-3 font-semibold ${lipinskiCellClass.a}`}>{lipinskiA ? 'Pass' : 'Fail'}</td>
                  <td className={`px-4 py-3 font-semibold ${lipinskiCellClass.b}`}>{lipinskiB ? 'Pass' : 'Fail'}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-gray-600">QED Score</td>
                  <td className={`px-4 py-3 font-semibold ${qedCellClass.a}`}>{qedA.toFixed(2)}</td>
                  <td className={`px-4 py-3 font-semibold ${qedCellClass.b}`}>{qedB.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-3">Assay Probability Comparison</h3>
            <ResponsiveContainer width="100%" height={360}>
              <RechartsRadar data={compareData} outerRadius="78%">
                <PolarGrid stroke="#D1D5DB" />
                <PolarAngleAxis dataKey="assay" tick={{ fill: '#4B5563', fontSize: 11, fontWeight: 700 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#9CA3AF', fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    color: '#e5e7eb',
                  }}
                />
                <Radar
                  dataKey="probabilityA"
                  fill="#EF4444"
                  fillOpacity={0.2}
                  stroke="#EF4444"
                  strokeWidth={2}
                  name="Compound A"
                />
                <Radar
                  dataKey="probabilityB"
                  fill="#3B82F6"
                  fillOpacity={0.2}
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Compound B"
                />
                <Legend wrapperStyle={{ color: '#4B5563' }} />
              </RechartsRadar>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default ComparisonMode
