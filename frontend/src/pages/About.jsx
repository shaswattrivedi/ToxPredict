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
    <div className="relative min-h-screen bg-gradient-to-br from-[#1d1f3b] via-[#1a1b2e] to-[#121321] text-gray-100">
      {/* Subtle Chemical Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40 bg-chemical-pattern transition-opacity duration-1000" aria-hidden="true" />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header title="ToxPredict" tagline="Drug Toxicity Prediction with Explainability" />

        <main className="flex-1 pt-20">
        <Container className="max-w-4xl mx-auto px-4 py-8">
          <div className="w-full rounded-3xl border border-gray-200 bg-gray-50 p-8 md:p-12 shadow-2xl transition-all duration-300 text-gray-900">
          <header className="mb-8">
            <h1 className="mt-3 text-4xl font-bold text-gray-900 text-center tracking-tight">About ToxPredict</h1>
            <p className="mt-2 text-base text-gray-600 text-center">
              Computational drug toxicity prediction for pharmaceutical research
            </p>
          </header>

          <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-3 mt-8">The Problem</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Drug development fails at a rate of over 90% in clinical trials, with unexpected
          toxicity being a leading cause. Traditional toxicity testing is expensive,
          time-consuming, and relies on animal models. ToxPredict enables early computational
          screening of candidate compounds - before expensive laboratory testing - by predicting
          whether a molecule will trigger toxic responses across 12 validated biological pathways.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-3 mt-8">How It Works</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-gray-600 leading-relaxed">
          <li>Input: User provides a SMILES molecular structure string</li>
          <li>
            Feature extraction: RDKit converts SMILES to Morgan fingerprints (2048-bit) + 20
            physicochemical descriptors
          </li>
          <li>
            Stage 1 prediction: 12 XGBoost classifiers predict toxicity probability for each
            biological assay independently
          </li>
          <li>
            Stage 2 ensemble: A calibrated logistic regression meta-model aggregates all 12
            predictions into an overall risk score
          </li>
          <li>
            Explanation: SHAP TreeExplainer identifies molecular features driving the prediction
            with biological narrative generation
          </li>
        </ol>
      </section>

      <section className="mt-8 rounded border-l-4 border-amber-400 bg-amber-50 p-4">
        <h2 className="text-lg font-semibold text-amber-800">
          Important Caveat: In Vitro vs Clinical Toxicity
        </h2>
        <p className="mt-2 text-sm text-amber-700 leading-relaxed">
          ToxPredict predicts toxicity as measured in the Tox21 high-throughput screening assays.
          These assays expose cells to fixed concentrations (typically 1-100 uM) that may differ
          substantially from therapeutic plasma concentrations in humans.
        </p>
        <p className="mt-3 text-sm text-amber-700 leading-relaxed">
          A compound flagged as toxic in Tox21 assays is not necessarily harmful at clinical doses.
          Aspirin, for example, triggers mitochondrial stress response assays (SR-MMP) and
          antioxidant response assays (SR-ARE) at assay concentrations - while remaining safe and
          beneficial at its standard therapeutic dose of 325mg.
        </p>
        <p className="mt-3 text-sm text-amber-700 leading-relaxed">
          This tool is intended for early-stage computational screening and research purposes. All
          predictions should be validated experimentally before any clinical or regulatory
          conclusions are drawn.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-3 mt-8">Model Performance</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          12 independent XGBoost classifiers trained on the Tox21 dataset with scale_pos_weight
          correction for class imbalance.
        </p>

        <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Assay</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Biological Target</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">ROC-AUC</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Risk Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {PERFORMANCE_ROWS.map((row) => (
                <tr key={row[0]}>
                  <td className="px-3 py-2 font-medium text-gray-800">{row[0]}</td>
                  <td className="px-3 py-2 text-gray-600">{row[1]}</td>
                  <td className="px-3 py-2 text-gray-600">{row[2]}</td>
                  <td className="px-3 py-2 text-gray-600">{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 font-semibold text-gray-900">Mean ROC-AUC: 0.835 across 12 assays</p>
        <p className="font-semibold text-gray-900">Ensemble Meta-model ROC-AUC: 0.916</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-3 mt-8">What is SHAP Explainability?</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          SHAP (SHapley Additive exPlanations) is a mathematically grounded method for explaining
          machine learning predictions. Derived from cooperative game theory (Shapley values,
          Nobel Prize 2012), SHAP assigns each molecular feature a contribution score for a
          specific prediction. Positive values indicate the feature increases toxicity risk;
          negative values indicate it reduces risk. The sum of all SHAP values exactly equals the
          difference between the model&apos;s prediction and its baseline - making SHAP the only
          explainability method with this mathematical guarantee.
        </p>
      </section>

      <section className="mt-8 rounded border bg-gray-50 p-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Model Limitations & Applicability Domain</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          These models were trained on the Tox21 dataset (~7,800 drug-like compounds). Predictions
          are most reliable for:
        </p>
        <ul className="mt-2 space-y-1 text-sm text-gray-600 leading-relaxed">
          <li>• Molecular weight: 100-600 Da</li>
          <li>• logP: -2 to +7</li>
          <li>• Drug-like compounds satisfying Lipinski&apos;s Rule of Five</li>
        </ul>
        <p className="mt-3 text-sm text-gray-600 leading-relaxed">
          Predictions may be unreliable for:
        </p>
        <ul className="mt-2 space-y-1 text-sm text-gray-600 leading-relaxed">
          <li>• Organometallic compounds (not represented in training data)</li>
          <li>• Peptides, proteins, and biologics</li>
          <li>• Compounds significantly outside the training distribution</li>
          <li>• Mixtures or salts without proper standardization</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-3 mt-8">Technology Stack</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-800">ML / Backend</h3>
            <div className="space-y-2 text-sm text-gray-600">
              {BACKEND_STACK.map(([name, description]) => (
                <div key={name} className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="font-medium text-gray-800">{name}</span>
                  <span>{description}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-800">Frontend / Infra</h3>
            <div className="space-y-2 text-sm text-gray-600">
              {FRONTEND_STACK.map(([name, description]) => (
                <div key={name} className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="font-medium text-gray-800">{name}</span>
                  <span>{description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-3 mt-8">Dataset</h2>
        <p className="text-sm font-medium text-gray-800">Primary: Tox21 Dataset (Kaggle)</p>
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">
          ~7,800 chemical compounds tested across 12 nuclear receptor and stress response
          biological assays by the US National Toxicology Program. Significant class imbalance
          (5:1 to 34:1 negative:positive ratio) handled via XGBoost scale_pos_weight parameter.
          NaN values treated as "not tested" rather than "non-toxic" - each model trained only on
          compounds with confirmed labels for that specific assay.
        </p>
      </section>
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
