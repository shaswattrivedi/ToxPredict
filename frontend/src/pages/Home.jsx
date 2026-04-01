import { useEffect, useState } from 'react'

import { usePrediction, useExamples } from '../hooks/usePrediction'
import MoleculeViewer from '../components/MoleculeViewer'
import CompoundSummary from '../components/CompoundSummary'
import Card from '../components/ui/Card'
import Container from '../components/ui/Container'
import Header from '../components/ui/Header'
import Hero from '../components/ui/Hero'
import InputCard from '../components/analysis/InputCard'
import RiskSummary from '../components/results/RiskSummary'
import AssayGrid from '../components/results/AssayGrid'
import InsightsSection from '../components/results/InsightsSection'

function Home() {
  const { predict, data, isLoading, isError, error } = usePrediction()
  const { data: examples } = useExamples()
  const [showResults, setShowResults] = useState(false)
  const [activeTab, setActiveTab] = useState('assays')

  const handleSubmit = (smiles) => {
    setActiveTab('assays')
    predict(smiles)
    setShowResults(true)
  }

  useEffect(() => {
    if (data && showResults && window.innerWidth < 768) {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [data, showResults])

  const topAssay =
    data?.assay_results?.length > 0
      ? data.assay_results.reduce(
          (max, r) => (r.probability > max.probability ? r : max),
          data.assay_results[0],
        )
      : null

  const nrAssays = data?.assay_results?.filter((r) => r.category === 'Nuclear Receptor') || []
  const srAssays = data?.assay_results?.filter((r) => r.category === 'Stress Response') || []

  const tabClasses = (tab) =>
    `rounded-lg px-4 py-2 text-sm font-semibold transition ${
      activeTab === tab
        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm'
        : 'bg-white text-gray-600 hover:bg-gray-50'
    }`

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 text-gray-900">
      {/* Subtle Chemical Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-60 bg-chemical-pattern mix-blend-multiply transition-opacity duration-1000" aria-hidden="true" />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header title="ToxPredict" tagline="Drug Toxicity Prediction with Explainability" />

        <main className="flex-1 pt-20">
        <Container className="max-w-6xl">
          {/* Hero Section - strict order: title, subtitle, input card */}
          <div className="px-4 py-8 sm:px-6">
            <Hero
              title="Predict Chemical Toxicity Instantly"
              subtitle="High-throughput molecular analysis from SMILES input. Get safety insights in seconds."
            >
              <div className="mx-auto w-full max-w-2xl">
                <InputCard
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                  examples={examples || []}
                />
              </div>
            </Hero>
          </div>

          <div id="results-section" className="px-4 pb-6 sm:px-6">
            {/* Loading State */}
            {isLoading ? (
              <div className="space-y-8 animate-fade-in">
                <div className="h-64 animate-pulse rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200" />
                <div className="space-y-4">
                  <div className="h-32 animate-pulse rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200" />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <div
                        key={`skeleton-${idx}`}
                        className="h-40 animate-pulse rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200"
                      />
                    ))}
                  </div>
                </div>
                <p className="animate-pulse text-center text-sm text-gray-500 font-medium">
                  Analyzing molecular structure...
                </p>
              </div>
            ) : null}

            {/* Error State */}
            {isError ? (
              <Card className="border border-red-200 bg-gradient-to-br from-red-50 to-rose-50">
                <div className="flex items-start gap-4">
                  <span className="mt-1 shrink-0 text-3xl"></span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 text-lg">
                      {error?.response?.data?.detail?.detail || 'Invalid SMILES string'}
                    </h3>
                    <p className="mt-2 text-sm text-red-700 leading-relaxed">
                      Please verify your SMILES format and try again.
                    </p>
                    <div className="mt-4 rounded-lg bg-white/50 border border-red-200 p-3">
                      <p className="text-xs text-red-600 font-mono font-semibold">
                        Example: CC(=O)Oc1ccccc1C(=O)O (Aspirin)
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ) : null}

            {/* Results Content */}
            {data ? (
              <div className="space-y-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className={tabClasses('summary')} onClick={() => setActiveTab('summary')}>
                      Summary
                    </button>
                    <button type="button" className={tabClasses('assays')} onClick={() => setActiveTab('assays')}>
                      Assays
                    </button>
                    <button type="button" className={tabClasses('insights')} onClick={() => setActiveTab('insights')}>
                      Insights
                    </button>
                  </div>
                </div>

                {activeTab === 'summary' ? (
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-1">
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
                    </div>
                    <div className="space-y-6 lg:col-span-2">
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

                      <RiskSummary
                        overallRisk={data.overall_risk}
                        overallScore={data.overall_risk_score}
                        toxicCount={data.toxic_assay_count}
                        cached={data.cached}
                      />
                    </div>
                  </div>
                ) : null}

                {activeTab === 'assays' ? (
                  <AssayGrid
                    assayResults={data.assay_results}
                    nrAssays={nrAssays}
                    srAssays={srAssays}
                  />
                ) : null}

                {activeTab === 'insights' ? (
                  <InsightsSection
                    assayResults={data.assay_results}
                    topAssay={topAssay}
                    shapFeatures={data.top_shap_features}
                  />
                ) : null}
              </div>
            ) : null}
          </div>
        </Container>
      </main>

      {/* Footer */}
      <footer className="mt-auto shrink-0 border-t border-gray-200/60 bg-white/80 backdrop-blur-md py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-gray-500">
            ToxPredict © 2026 | Track A - CodeCure Hackathon @ IIT BHU SPIRIT
          </p>
        </div>
      </footer>
      </div>
    </div>
  )
}

export default Home
