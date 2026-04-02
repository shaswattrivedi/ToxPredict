import Header from '../components/Header'
import Container from '../components/Container'
import ComparisonMode from '../components/ComparisonMode'

function Compare() {
  return (
    <div className="relative min-h-[100dvh] bg-gradient-to-br from-[#1d1f3b] via-[#1a1b2e] to-[#121321] text-gray-100 isolate">
      {/* Subtle Chemical Overlay */}
      <div className="fixed inset-0 z-[-1] pointer-events-none opacity-40 bg-chemical-pattern transition-opacity duration-1000 transform-gpu" aria-hidden="true" />
      
      <div className="relative z-10 flex flex-col min-h-[100dvh] transform-gpu">
        <Header title="ToxPredict" />

        <main className="flex-1 pt-20 pb-16 flex flex-col items-center">
          <Container className="max-w-6xl w-full mx-auto px-4 mt-8 py-8">
            <header className="mb-12 text-center pb-4">
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-white drop-shadow-sm">Compound Comparison</h1>
              <p className="mt-4 text-xs md:text-sm uppercase font-bold text-gray-300 tracking-wider">
                Compare toxicity profiles and properties of two chemical structures
              </p>
            </header>

            <ComparisonMode />
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

export default Compare