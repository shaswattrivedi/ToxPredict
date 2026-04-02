const fs = require('fs')

let file = '/Users/shaswat/ToxPredict/ToxPredict/frontend/src/components/CompoundSummary.jsx'
let content = fs.readFileSync(file, 'utf8')

let t_idx = content.indexOf('<p className="sr-only">SMILES: {smiles}</p>')
if (t_idx === -1) { console.log('not found'); process.exit(1); }

let addition = `        {/* Drug-likeness Horizontal Card */}
        <section className="rounded-3xl border border-gray-200 bg-gray-50 p-8 shadow-2xl transition-all duration-300 mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-widest">Drug-likeness Profile</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                
                {/* Left Side: Lipinski & QED */}
                <div className="space-y-6">
                  {/* Lipinski Compliance */}
                  <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <p className="text-sm font-bold text-gray-900">Lipinski Rule of Five</p>
                    {drugLikeness?.lipinski_pass ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 shadow-sm">
                        <span>✓</span> Compliant
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 shadow-sm">
                        <span>✗</span> {(drugLikeness?.violations || []).length} Violation(s)
                      </span>
                    )}
                  </div>

                  {/* QED Score */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-bold text-gray-900">QED Score</p>
                      <span className="text-lg font-bold text-gray-900">{Number(drugLikeness?.qed_score ?? 0).toFixed(3)}</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 border border-gray-300 shadow-inner">
                      <div
                        className={\`h-full rounded-full transition-all \${qedBarClass}\`}
                        style={{ width: \`\${qedPercent}%\` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Properties Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white p-4 border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
                    <p className="text-xs text-gray-800 font-bold">Molecular Weight</p>
                    <p className="mt-1 text-base font-black text-gray-900">{Number(drugLikeness?.molecular_weight ?? 0).toFixed(1)} Da</p>
                    <p className="mt-1 text-[10px] font-medium text-gray-500">≤ 500</p>
                  </div>
                  <div className="rounded-xl bg-white p-4 border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
                    <p className="text-xs text-gray-800 font-bold">LogP</p>
                    <p className="mt-1 text-base font-black text-gray-900">{Number(drugLikeness?.log_p ?? 0).toFixed(2)}</p>
                    <p className="mt-1 text-[10px] font-medium text-gray-500">≤ 5</p>
                  </div>
                  <div className="rounded-xl bg-white p-4 border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
                    <p className="text-xs text-gray-800 font-bold">H-Bond Donors</p>
                    <p className="mt-1 text-base font-black text-gray-900">{Number(drugLikeness?.h_bond_donors ?? 0)}</p>
                    <p className="mt-1 text-[10px] font-medium text-gray-500">≤ 5</p>
                  </div>
                  <div className="rounded-xl bg-white p-4 border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
                    <p className="text-xs text-gray-800 font-bold">H-Bond Acceptors</p>
                    <p className="mt-1 text-base font-black text-gray-900">{Number(drugLikeness?.h_bond_acceptors ?? 0)}</p>
                    <p className="mt-1 text-[10px] font-medium text-gray-500">≤ 10</p>
                  </div>
                </div>

              </div>

              {drugLikeness?.interpretation ? (
                <p className="mt-6 text-sm font-medium italic text-gray-700 bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  {drugLikeness.interpretation}
                </p>
              ) : null}

            </div>
          </div>
        </section>\n\n`

content = content.substring(0, t_idx) + addition + content.substring(t_idx)
fs.writeFileSync(file, content)
console.log('done')
