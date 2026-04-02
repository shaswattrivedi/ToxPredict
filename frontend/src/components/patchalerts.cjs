const fs = require('fs');
let code = fs.readFileSync('MoleculeViewer.jsx', 'utf8');

const oldAlert = `                <div
                  key={\`\${alert.alert_type}-\${alert.alert_name}-\${index}\`}
                  className="relative group"
                >
                  <div className="rounded-lg bg-red-900/40 border border-red-700/50 p-3 transition-all hover:bg-red-800/50">
                    <div className="flex items-start gap-2">
                      <span className="text-lg mt-0.5">⚠️</span>
                      <div>
                        <p className="text-xs font-semibold text-red-200">{displayType}</p>
                        <p className="text-sm text-white mt-0.5 font-bold">{displayName}</p>
                        <p className="text-xs text-red-300 mt-1">{displayDesc}</p>
                      </div>
                    </div>
                  </div>
                </div>`;

const newAlert = `                <div
                  key={\`\${alert.alert_type}-\${alert.alert_name}-\${index}\`}
                  className="rounded-2xl bg-white border border-red-100 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-red-400"></div>
                  <div className="flex items-start gap-4 pl-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 font-black text-sm shrink-0">!</span>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">{displayType}</p>
                      <p className="text-sm text-gray-900 font-black">{displayName}</p>
                      <p className="text-sm font-medium text-gray-500 mt-2 leading-relaxed">{displayDesc}</p>
                    </div>
                  </div>
                </div>`;

const oldNoAlert = `            <div className="rounded-lg bg-green-900/30 border border-green-700 p-4 text-center">
              <p className="text-sm font-semibold text-green-300">✓ No Structural Alerts Detected</p>
              <p className="text-xs text-green-400 mt-1">Compound structure appears benign</p>
            </div>`;

const newNoAlert = `            <div className="rounded-2xl bg-white border border-gray-200 p-8 text-center shadow-sm hover:shadow-md transition-shadow">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-50 mb-3 border border-green-100 shadow-sm">
                <span className="text-lg font-black text-green-500">✓</span>
              </span>
              <p className="text-sm font-bold text-gray-900">No Structural Alerts Detected</p>
              <p className="text-xs font-medium text-gray-500 mt-1.5">Compound structure appears benign</p>
            </div>`;

code = code.replace(oldAlert, newAlert);
code = code.replace(oldNoAlert, newNoAlert);
fs.writeFileSync('MoleculeViewer.jsx', code);
