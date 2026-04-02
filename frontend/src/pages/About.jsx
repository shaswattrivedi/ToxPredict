import { Link } from 'react-router-dom'
import Header from '../components/ui/Header'
import Container from '../components/ui/Container'

const PERFORMANCE_ROWS = [
  ['NR-AR', 'Androgen Receptor', '0.759', 'Nuclear Receptor'],
  ['NR-AR-LBD', 'Androgen Receptor LBD', '0.799', 'Nuclear Receptor'],
  ['NR-AhR', 'Aryl Hydrocarbon Receptor', '0.899', 'Nuclear Receptor'],
  ['NR-Aromatase', 'Aromatase', '0.876', 'Nuclear Receptor'],
  ['NR-ER', 'Estrogen Receptor Alpha', '0.690', 'Nuclear Receptor'],
  ['NR-ER-LBD', 'Estrogen Receptor LBD', '0.807', 'Nuclear Receptor'],
  ['NR-PPAR-gamma', 'PPAR Gamma', '0.856', 'Nuclear Receptor'],
  ['SR-ARE', 'Antioxidant Response', '0.853', 'Stress Response'],
  ['SR-ATAD5', 'Genotoxicity (ATAD5)', '0.876', 'Stress Response'],
  ['SR-HSE', 'Heat Shock Response', '0.790', 'Stress Response'],
  ['SR-MMP', 'Mitochondrial Membrane', '0.938', 'Stress Response'],
  ['SR-p53', 'p53 Tumor Suppressor', '0.873', 'Stress Response'],
]

const BACKEND_STACK = [
  ['XGBoost', '12 gradient-boosted toxicity classifiers'],
  ['Scikit-learn', 'Ensemble stacking meta-model'],
  ['RDKit', 'Molecular feature extraction & visualization'],
  ['SHAP', 'TreeExplainer for prediction attribution'],
  ['FastAPI', 'High-performance ML serving API'],
  ['Pydantic', 'Request/response validation'],
]

const FRONTEND_STACK = [
  ['React 18 + Vite', 'Interactive prediction interface'],
  ['Recharts', 'SHAP bar charts and radar visualization'],
  ['Tailwind CSS', 'Utility-first styling'],
  ['React Query', 'API state management'],
  ['Render', 'Backend cloud deployment'],
  ['Vercel', 'Frontend CDN deployment'],
]

function About() {
  return (
    <div className="relative min-h-[100dvh] bg-gradient-to-br from-[#1d1f3b] via-[#1a1b2e] to-[#121321] text-gray-100 isolate">
      {/* Subtle Chemical Overlay */}
      <div className="fixed inset-0 z-[-1] pointer-events-none opacity-40 bg-chemical-pattern transition-opacity duration-1000 transform-gpu" aria-hidden="true" />
      
      <div className="relative z-10 flex flex-col min-h-[100dvh] transform-gpu">
        <Header title="ToxPredict" tagline="Drug Toxicity Prediction with Explainability" />

        <main className="flex-1 pt-20 pb-16">
        <Container className="max-w-6xl mx-auto px-4 py-8">
          <header className="mb-12 text-center pb-4">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-white drop-shadow-sm">About ToxPredict</h1>
            <p className="mt-4 text-xs md:text-sm uppercase font-bold text-gray-300 tracking-wider">
              Computational drug toxicity prediction for pharmaceutical research
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            
            {/* The Problem Section */}
            <div className="col-span-1 lg:col-span-2 flex flex-col rounded-3xl border border-gray-200 bg-white/95 backdrop-blur shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group p-8 md:p-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-6 w-1.5 bg-blue-600 rounded-full"></div>
                <h2 className="text-base font-bold text-gray-900 uppercase tracking-widest group-hover:text-blue-700 transition-colors">The Problem</h2>
              </div>
              <p className="text-sm md:text-base leading-relaxed text-gray-700 font-medium">
                Drug development fails at a rate of over 90% in clinical trials, with unexpected
                toxicity being a leading cause. Traditional toxicity testing is expensive,
                time-consuming, and relies on animal models. ToxPredict enables early computational
                screening of candidate compounds - before expensive laboratory testing - by predicting
                whether a molecule will trigger toxic responses across 12 validated biological pathways.
              </p>
            </div>

            {/* How It Works Section */}
            <div className="col-span-1 rounded-3xl border border-gray-200 bg-white/95 backdrop-blur shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group p-8 md:p-10 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-6 w-1.5 bg-indigo-600 rounded-full"></div>
                <h2 className="text-base font-bold text-gray-900 uppercase tracking-widest group-hover:text-indigo-700 transition-colors">How It Works</h2>
              </div>
              <ol className="list-decimal space-y-4 pl-5 text-sm md:text-base text-gray-700 leading-relaxed font-medium marker:text-indigo-400 marker:font-bold">
                <li><strong className="text-gray-900">Input:</strong> User provides a SMILES molecular structure string</li>
                <li>
                  <strong className="text-gray-900">Feature extraction:</strong> RDKit converts SMILES to Morgan fingerprints (2048-bit) + 20 physicochemical descriptors
                </li>
                <li>
                  <strong className="text-gray-900">Stage 1 prediction:</strong> 12 XGBoost classifiers predict toxicity probability for each biological assay independently
                </li>
                <li>
                  <strong className="text-gray-900">Stage 2 ensemble:</strong> A calibrated logistic regression meta-model aggregates all 12 predictions into an overall risk score
                </li>
                <li>
                  <strong className="text-gray-900">Explanation:</strong> SHAP TreeExplainer identifies molecular features driving the prediction with biological narrative generation
                </li>
              </ol>
            </div>

            {/* SHAP Explainability Section */}
            <div className="col-span-1 rounded-3xl border border-gray-200 bg-white/95 backdrop-blur shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group p-8 md:p-10 flex flex-col">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-6 w-1.5 bg-purple-600 rounded-full"></div>
                <h2 className="text-base font-bold text-gray-900 uppercase tracking-widest group-hover:text-purple-700 transition-colors">What is SHAP Explainability?</h2>
              </div>
              <p className="text-sm md:text-base leading-relaxed text-gray-700 font-medium">
                SHAP (SHapley Additive exPlanations) is a tool that breaks down exactly how our AI models arrive at their conclusions. Instead of treating the model as a "black box," SHAP analyzes a molecule and assigns a specific score to each of its chemical features.
                <br/><br/>
                These scores show you the underlying drivers behind the prediction: positive values highlight the specific functional groups or properties that increase a compound&apos;s toxicity risk, while negative values point to the traits that make it safer. This transparency helps researchers trust and verify the computational results before moving to the lab.
              </p>
            </div>

            {/* Dataset Section */}
            <div className="col-span-1 rounded-3xl border border-gray-200 bg-white/95 backdrop-blur shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group p-8 md:p-10 flex flex-col">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-6 w-1.5 bg-emerald-600 rounded-full"></div>
                <h2 className="text-base font-bold text-gray-900 uppercase tracking-widest group-hover:text-emerald-700 transition-colors">Dataset</h2>
              </div>
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-4 px-3 py-1.5 bg-emerald-50 rounded-lg inline-block w-max">Primary: Tox21 Dataset (Kaggle)</p>
              <ul className="space-y-4 text-sm md:text-base text-gray-700 leading-relaxed font-medium list-disc pl-5 marker:text-emerald-500">
                <li>
                  <strong className="text-gray-900 text-sm">Scale &amp; Scope:</strong> Approximately 7,800 distinct chemical compounds rigorously tested across 12 different nuclear receptor and stress response biological pathways.
                </li>
                <li>
                  <strong className="text-gray-900 text-sm">Origin:</strong> Ground-truth data generated by the US National Toxicology Program, ensuring high-quality experimental validations.
                </li>
                <li>
                  <strong className="text-gray-900 text-sm">Data Integrity:</strong> Missing values are strictly treated as "untested" rather than presumed safe. Each specific pathway model is trained exclusively on compounds with confirmed laboratory results.
                </li>
                <li>
                  <strong className="text-gray-900 text-sm">Imbalance Handling:</strong> Severe class imbalances (ranging from 5:1 to 34:1 negative-to-positive ratios) were actively managed using weighted loss functions during training to prevent biased predictions.
                </li>
              </ul>
            </div>

            {/* Model Limitations Section */}
            <div className="col-span-1 rounded-3xl border border-gray-200 bg-white/95 backdrop-blur shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group p-8 md:p-10 flex flex-col">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-6 w-1.5 bg-rose-600 rounded-full"></div>
                <h2 className="text-base font-bold text-gray-900 uppercase tracking-widest group-hover:text-rose-700 transition-colors">Applicability Domain</h2>
              </div>
              <p className="text-sm md:text-base leading-relaxed text-gray-700 font-medium mb-4">
                These models were trained on the Tox21 dataset (~7,800 drug-like compounds). <strong className="text-gray-900">Predictions are most reliable for:</strong>
              </p>
              <ul className="space-y-3 text-sm md:text-base text-gray-700 leading-relaxed font-medium list-disc pl-5 marker:text-emerald-500 mb-6">
                <li>Molecular weight: 100-600 Da</li>
                <li>logP: -2 to +7</li>
                <li>Drug-like compounds satisfying Lipinski&apos;s Rule of Five</li>
              </ul>
              <p className="text-sm md:text-base leading-relaxed text-gray-700 font-medium mb-4">
                <strong className="text-gray-900">Predictions may be unreliable for:</strong>
              </p>
              <ul className="space-y-3 text-sm md:text-base text-gray-700 leading-relaxed font-medium list-disc pl-5 marker:text-rose-500">
                <li>Organometallic compounds (not represented in training data)</li>
                <li>Peptides, proteins, and biologics</li>
                <li>Compounds significantly outside the training distribution</li>
                <li>Mixtures or salts without proper standardization</li>
              </ul>
            </div>

            {/* Caveat Section (Warning Card) */}
            <div className="col-span-1 lg:col-span-2 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group p-8 md:p-10 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-6 w-1.5 bg-amber-500 rounded-full"></div>
                <h2 className="text-base font-bold text-amber-900 uppercase tracking-widest">Important Caveat: In Vitro vs Clinical Toxicity</h2>
              </div>
              <p className="text-sm md:text-base text-amber-900/90 leading-relaxed font-medium mb-4">
                ToxPredict predicts toxicity as measured in the Tox21 high-throughput screening assays.
                These assays expose cells to fixed concentrations (typically 1-100 uM) that may differ
                substantially from therapeutic plasma concentrations in humans.
              </p>
              <p className="text-sm md:text-base text-amber-900/90 leading-relaxed font-medium mb-4">
                A compound flagged as toxic in Tox21 assays is not necessarily harmful at clinical doses.
                Aspirin, for example, triggers mitochondrial stress response assays (SR-MMP) and
                antioxidant response assays (SR-ARE) at assay concentrations - while remaining safe and
                beneficial at its standard therapeutic dose of 325mg.
              </p>
              <div className="mt-2 bg-amber-100/50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm md:text-base text-amber-900 leading-relaxed font-bold">
                  This tool is intended for early-stage computational screening and research purposes. All
                  predictions should be validated experimentally before any clinical or regulatory
                  conclusions are drawn.
                </p>
              </div>
            </div>

            {/* Model Performance Section */}
            <div className="col-span-1 lg:col-span-2 rounded-3xl border border-gray-200 bg-white/95 backdrop-blur shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group p-8 md:p-10 flex flex-col">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-6 w-1.5 bg-teal-600 rounded-full"></div>
                <h2 className="text-base font-bold text-gray-900 uppercase tracking-widest group-hover:text-teal-700 transition-colors">Model Performance</h2>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-teal-50 border border-teal-100 rounded-2xl p-5">
                <p className="text-sm md:text-base leading-relaxed text-teal-900 font-medium">
                  12 independent XGBoost classifiers trained on the Tox21 dataset with <code className="text-xs font-bold bg-white text-teal-800 border border-teal-200 px-2 py-1 rounded">scale_pos_weight</code> correction for class imbalance.
                </p>
                <div className="flex flex-col gap-2 shrink-0 md:text-right">
                  <p className="text-sm font-bold text-gray-800 tracking-wide uppercase">Mean ROC-AUC: <span className="text-teal-700 font-black text-base ml-1">0.835</span></p>
                  <p className="text-sm font-bold text-gray-800 tracking-wide uppercase">Meta-model ROC-AUC: <span className="text-blue-600 font-black text-base ml-1">0.916</span></p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs uppercase font-bold text-gray-500 tracking-wider">Assay</th>
                      <th className="px-5 py-4 text-left text-xs uppercase font-bold text-gray-500 tracking-wider">Biological Target</th>
                      <th className="px-5 py-4 text-left text-xs uppercase font-bold text-gray-500 tracking-wider">ROC-AUC</th>
                      <th className="px-5 py-4 text-left text-xs uppercase font-bold text-gray-500 tracking-wider">Risk Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {PERFORMANCE_ROWS.map((row) => (
                      <tr key={row[0]} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 font-bold text-gray-900">{row[0]}</td>
                        <td className="px-5 py-4 font-medium text-gray-700">{row[1]}</td>
                        <td className="px-5 py-4 font-bold text-teal-600">{row[2]}</td>
                        <td className="px-5 py-4 font-medium text-gray-600">
                          <span className="inline-flex items-center rounded-md bg-gray-100 border border-gray-200 px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold text-gray-600">
                            {row[3]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Technology Stack Section */}
            <div className="col-span-1 lg:col-span-2 rounded-3xl border border-gray-200 bg-white/95 backdrop-blur shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group p-8 md:p-10 flex flex-col">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-6 w-1.5 bg-gray-900 rounded-full"></div>
                <h2 className="text-base font-bold text-gray-900 uppercase tracking-widest">Technology Stack</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-2xl bg-gray-50 p-6 border border-gray-200 hover:border-blue-300 transition-colors hidden-card">
                  <h3 className="mb-5 text-xs font-bold uppercase tracking-widest text-gray-500 pb-2 border-b border-gray-200">ML / Backend</h3>
                  <div className="space-y-4 text-sm font-medium text-gray-600">
                    {BACKEND_STACK.map(([name, description]) => (
                      <div key={name} className="grid grid-cols-[120px_1fr] gap-4">
                        <span className="font-bold text-gray-900">{name}</span>
                        <span className="text-gray-600">{description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-gray-50 p-6 border border-gray-200 hover:border-indigo-300 transition-colors">
                  <h3 className="mb-5 text-xs font-bold uppercase tracking-widest text-gray-500 pb-2 border-b border-gray-200">Frontend / Infra</h3>
                  <div className="space-y-4 text-sm font-medium text-gray-600">
                    {FRONTEND_STACK.map(([name, description]) => (
                      <div key={name} className="grid grid-cols-[120px_1fr] gap-4">
                        <span className="font-bold text-gray-900">{name}</span>
                        <span className="text-gray-600">{description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </Container>
      </main>
      {/* Footer */}
      <footer className="mt-auto shrink-0 border-t border-gray-800 bg-black/20 backdrop-blur-md py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-gray-400">
            ToxPredict © 2026 | Track A - CodeCure Hackathon @ IIT BHU SPIRIT
          </p>
        </div>
      </footer>
      </div>
    </div>
  )
}

export default About
