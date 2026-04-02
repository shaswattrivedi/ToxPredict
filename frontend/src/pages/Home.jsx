import { useEffect, useState } from 'react'

import { usePrediction, useExamples } from '../hooks/usePrediction'
import MoleculeViewer from '../components/MoleculeViewer'
import TopRiskDrivers from '../components/TopRiskDrivers'
import CompoundSummary from '../components/CompoundSummary'
import Card from '../components/Card'
import Container from '../components/Container'
import Header from '../components/Header'
import Hero from '../components/Hero'
import InputCard from '../components/InputCard'
import RiskSummary from '../components/RiskSummary'
import AssayGrid from '../components/AssayGrid'
import InsightsSection from '../components/InsightsSection'

function Home() {
  const { predict, data, isLoading, isError, error } = usePrediction()
  const { data: examples } = useExamples()
  const [showResults, setShowResults] = useState(false)
  const [scrollTrigger, setScrollTrigger] = useState(0)
  const [activeTab, setActiveTab] = useState('summary')

  const handleSubmit = (smiles) => {
    setActiveTab('summary')
    predict(smiles)
    setShowResults(true)
    setScrollTrigger(prev => prev + 1)
  }

  useEffect(() => {
    if (showResults && scrollTrigger > 0) {
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' })
      }, 100);
    }
  }, [showResults, scrollTrigger])

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
    `rounded-full px-6 py-2.5 text-sm font-bold tracking-wide transition-all duration-300 ${
      activeTab === tab
        ? 'bg-[#4b3cff] text-white shadow-md'
        : 'text-gray-300 hover:bg-white/20 hover:text-white'
    }`

  return (
    <div className="relative min-h-[100dvh] bg-gradient-to-br from-[#1d1f3b] via-[#1a1b2e] to-[#121321] text-gray-100 isolate">
      {/* Subtle Chemical Overlay */}
      <div className="fixed inset-0 z-[-1] pointer-events-none opacity-40 bg-chemical-pattern transition-opacity duration-1000 transform-gpu" aria-hidden="true" />
      
      <div className="relative z-10 flex flex-col min-h-[100dvh] transform-gpu">
        <Header title="ToxPredict" tagline="Drug Toxicity Prediction with Explainability" />

        <main className={`flex-1 flex flex-col w-full transition-all duration-500`}>
          {/* Landing viewport exactly preserved */}
          <div className="min-h-[100dvh] flex flex-col justify-center pt-28 pb-12">
            <Container className="max-w-7xl w-full mx-auto">
              {/* Hero Section - Strict two-column layout */}
              <div className="px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full">
                <div className="text-left flex flex-col justify-center">
                  <h1 className="text-6xl md:text-7xl font-extrabold leading-tight tracking-tighter mb-4 drop-shadow-xl">
                    Drug Safety, <br/>
                    <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Reimagined.</span>
                  </h1>
                  <p className="text-lg md:text-xl text-gray-300 mt-2 max-w-lg mb-8 leading-relaxed font-small tracking-wide drop-shadow-sm">
                    Proactive toxicity intelligence. High-throughput molecular analysis from SMILES in seconds.
                  </p>
                </div>
                <div className="w-full box-system-font">
                  <InputCard
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    examples={examples || []}
                  />
                </div>
              </div>
            </Container>
          </div>

          {(isLoading || isError || data) && (
            <div id="results-section" className="px-4 pb-6 sm:px-6 min-h-[100dvh] flex flex-col pt-12">
              <Container className="max-w-7xl w-full mx-auto">
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
                <div className="w-fit mx-auto rounded-full border border-white/20 bg-white/10 backdrop-blur-md p-2 shadow-lg">
                  <div className="flex flex-wrap justify-center gap-2">
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
                    <div className="lg:col-span-1 flex flex-col space-y-6">
                      <MoleculeViewer
                        imageB64={data.molecule_image_b64}
                        smiles={data.smiles}
                        structuralAlerts={data.structural_alerts}
                        hasStructuralAlerts={data.has_structural_alerts}
                        cached={data.cached}
                      />
                      {topAssay && (
                        <TopRiskDrivers
                          shapFeatures={data.top_shap_features}
                          assayDisplayName={topAssay.display_name}
                          assayName={topAssay.assay_name}
                        />
                      )}
                    </div>
                    <div className="lg:col-span-2 flex flex-col space-y-6">
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
          </Container>
        </div>
        )}
      </main>

      {/* Footer */}
      {showResults && (
        <footer className="mt-auto shrink-0 border-t border-gray-800 bg-black/20 backdrop-blur-md py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm font-medium text-gray-400">
              ToxPredict © 2026 | Track A - CodeCure Hackathon @ IIT BHU SPIRIT
            </p>
          </div>
        </footer>
      )}
      </div>
    </div>
  )
}

export default Home
