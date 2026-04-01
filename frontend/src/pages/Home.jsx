import { useEffect } from 'react'

import { usePrediction, useExamples } from '../hooks/usePrediction'
import SMILESInput from '../components/SMILESInput'
import ToxicityCard from '../components/ToxicityCard'
import SHAPChart from '../components/SHAPChart'
import MoleculeViewer from '../components/MoleculeViewer'
import RadarChart from '../components/RadarChart'
import CompoundSummary from '../components/CompoundSummary'

function Home() {
  const { predict, data, isLoading, isError, error } = usePrediction()
  const { data: examples } = useExamples()

  const handleSubmit = (smiles) => {
    predict(smiles)
  }

  useEffect(() => {
    if (data && window.innerWidth < 768) {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [data])

  const topAssay =
    data?.assay_results?.length > 0
      ? data.assay_results.reduce(
          (max, r) => (r.probability > max.probability ? r : max),
          data.assay_results[0],
        )
      : null

  const nrAssays = data?.assay_results?.filter((r) => r.category === 'Nuclear Receptor') || []
  const srAssays = data?.assay_results?.filter((r) => r.category === 'Stress Response') || []

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-10 w-full border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold">🧬 ToxPredict</h1>
          <p className="hidden text-xs text-gray-400 md:block">
            Track A - CodeCure AI Hackathon @ IIT BHU SPIRIT 2026
          </p>
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-purple-600" />
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-6 md:col-span-1">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Drug Toxicity Predictor</h2>
              <p className="mt-1 mb-6 text-sm text-gray-500">
                Enter a SMILES molecular structure to predict toxicity across 12 biological assays
                using a two-stage ML ensemble with SHAP explainability.
              </p>
            </div>

            <SMILESInput
              onSubmit={handleSubmit}
              isLoading={isLoading}
              examples={examples || []}
            />

            {data ? (
              <MoleculeViewer
                imageB64={data.molecule_image_b64}
                smiles={data.smiles}
                overallRisk={data.overall_risk}
                overallScore={data.overall_risk_score}
                toxicCount={data.toxic_assay_count}
                processingTimeMs={data.processing_time_ms}
                drugLikeness={data.drug_likeness}
                structuralAlerts={data.structural_alerts}
                hasStructuralAlerts={data.has_structural_alerts}
                cached={data.cached}
              />
            ) : null}
          </div>

          <div id="results-section" className="md:col-span-2">
            {isLoading ? (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 12 }).map((_, idx) => (
                    <div
                      key={`skeleton-${idx}`}
                      className="h-36 animate-pulse rounded-lg border border-gray-200 bg-gray-100"
                    />
                  ))}
                </div>
                <p className="mt-4 animate-pulse text-center text-sm text-gray-400">
                  Analyzing molecular structure...
                </p>
              </>
            ) : null}

            {isError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="font-medium text-red-700">
                  ⚠️ {error?.response?.data?.detail?.detail || 'Invalid SMILES string'}
                </p>
                <p className="mt-2 text-sm text-gray-600">Please check your SMILES and try again.</p>
                <p className="mt-1 text-sm text-gray-500">
                  Example: CC(=O)Oc1ccccc1C(=O)O (Aspirin)
                </p>
              </div>
            ) : null}

            {!data && !isLoading && !isError ? (
              <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
                <p className="text-6xl">🔬</p>
                <p className="mt-4 text-lg text-gray-400">Enter a SMILES string to begin</p>
                <p className="mt-2 text-sm text-gray-300">
                  Results will show toxicity predictions across 12 assays with AI-powered molecular
                  explanations.
                </p>
              </div>
            ) : null}

            {data ? (
              <div className="space-y-6">
                <section>
                  <CompoundSummary
                    overallRisk={data.overall_risk}
                    overallScore={data.overall_risk_score}
                    toxicCount={data.toxic_assay_count}
                    assayResults={data.assay_results}
                    narrative={data.narrative}
                    smiles={data.smiles}
                    cached={data.cached}
                    drugLikeness={data.drug_likeness}
                  />
                </section>

                <section>
                  <h3 className="mb-1 text-lg font-semibold">Risk Profile Overview</h3>
                  <p className="mb-3 text-xs text-gray-500">
                    All 12 assay endpoints visualized simultaneously
                  </p>
                  <div className="md:hidden">
                    <RadarChart assayResults={data.assay_results} height={280} />
                  </div>
                  <div className="hidden md:block">
                    <RadarChart assayResults={data.assay_results} />
                  </div>
                </section>

                <section className="mt-6">
                  <h4 className="mb-2 text-sm font-medium text-gray-600">Nuclear Receptors (NR)</h4>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {nrAssays.map((assay) => (
                      <ToxicityCard key={assay.assay_name} assay={assay} />
                    ))}
                  </div>

                  <h4 className="mt-4 mb-2 text-sm font-medium text-gray-600">
                    Stress Response Pathways (SR)
                  </h4>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {srAssays.map((assay) => (
                      <ToxicityCard key={assay.assay_name} assay={assay} />
                    ))}
                  </div>
                </section>

                <section className="mt-6 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50 p-4">
                  <h3 className="text-base font-semibold">🧠 AI Biological Narrative</h3>
                  {topAssay ? (
                    <span className="mt-1 inline-block rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                      Explaining: {topAssay.display_name}
                    </span>
                  ) : null}
                  <p className="mt-2 text-sm leading-relaxed text-gray-700 italic">{data.narrative}</p>
                </section>

                <section className="mt-6">
                  <SHAPChart
                    shapFeatures={data.top_shap_features}
                    assayName={topAssay?.assay_name || ''}
                    assayDisplayName={topAssay?.display_name || 'Top Assay'}
                  />
                </section>

                <section className="mt-6 grid grid-cols-3 gap-3">
                  <div className="rounded-lg border bg-white p-3 text-center">
                    <p className="text-lg">🔬</p>
                    <p className="text-2xl font-bold">12</p>
                    <p className="mt-1 text-xs text-gray-500">Assays Analyzed</p>
                  </div>
                  <div className="rounded-lg border bg-white p-3 text-center">
                    <p className="text-lg">⚠️</p>
                    <p className="text-2xl font-bold">{data.toxic_assay_count}</p>
                    <p className="mt-1 text-xs text-gray-500">Flagged Toxic</p>
                  </div>
                  <div className="rounded-lg border bg-white p-3 text-center">
                    <p className="text-lg">🎯</p>
                    <p className="text-2xl font-bold">{data.overall_risk_score.toFixed(2)}</p>
                    <p className="mt-1 text-xs text-gray-500">Ensemble Score</p>
                  </div>
                </section>
              </div>
            ) : null}
          </div>
        </div>
      </main>

      <footer className="mt-12 border-t py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-gray-400">
          <p>
            ToxPredict - Built for CodeCure AI Hackathon, SPIRIT 2026 @ IIT BHU Varanasi
          </p>
          <p className="mt-1">
            Two-stage XGBoost ensemble | Mean ROC-AUC: 0.835 (12 assays) | Meta-model ROC-AUC:
            0.916
          </p>
          <p className="mt-1">Trained on Tox21 Dataset (~7,800 compounds)</p>
          <p className="mt-2 space-x-4">
            <a
              href="https://github.com/shaswattrivedi/ToxPredict"
              target="_blank"
              rel="noreferrer"
              className="text-blue-500 hover:text-blue-600"
            >
              GitHub Repo
            </a>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="text-blue-500 hover:text-blue-600"
            >
              API Docs
            </a>
          </p>
          <p className="mx-auto mt-2 max-w-2xl text-center text-xs text-gray-300">
            Predictions reflect in vitro toxicity at Tox21 assay concentrations and do not
            represent clinical risk at therapeutic doses. Context-dependent interpretation is
            required.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Home
