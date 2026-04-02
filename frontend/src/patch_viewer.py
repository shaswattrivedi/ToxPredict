import os

file_path = '/Users/shaswat/ToxPredict/ToxPredict/frontend/src/components/MoleculeViewer.jsx'

with open(file_path, 'r') as f:
    content = f.read()

if "import { useState, useEffect } from 'react'" not in content:
    content = content.replace("import PropTypes from 'prop-types'", "import { useState, useEffect } from 'react'\nimport PropTypes from 'prop-types'")

content = content.replace(
"""function MoleculeViewer({
  imageB64,
  drugLikeness,
  structuralAlerts,
  hasStructuralAlerts,
  cached,""",
"""function MoleculeViewer({
  imageB64,
  smiles,
  drugLikeness,
  structuralAlerts,
  hasStructuralAlerts,
  cached,""")

effect_code = """
  const [compoundName, setCompoundName] = useState('')

  useEffect(() => {
    if (!smiles) {
      setCompoundName('Molecule Structure')
      return
    }

    const fetchName = async () => {
      try {
        const response = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(smiles)}/synonyms/JSON`)
        if (response.ok) {
          const data = await response.json()
          if (data.InformationList?.Information?.[0]?.Synonym?.[0]) {
            setCompoundName(data.InformationList.Information[0].Synonym[0])
            return
          }
        }
        setCompoundName('Unidentified Compound')
      } catch (err) {
        console.error(err)
        setCompoundName('Molecule Structure')
      }
    }
    fetchName()
  }, [smiles])
"""

if "const [compoundName" not in content:
    content = content.replace(
        "const qed = Number(drugLikeness?.qed_score ?? 0)",
        effect_code + "\n  const qed = Number(drugLikeness?.qed_score ?? 0)"
    )

# Also rename the molecule structure card header to use compoundName
if "Molecule Image" in content:
    content = content.replace(
"""          {/* Molecule Image */}
          <div className="mx-auto flex min-h-[240px]""",
"""          {/* Molecule Image */}
          {compoundName && (
            <h3 className="text-xl font-extrabold text-gray-900 mb-2 text-center tracking-tight border-b border-gray-100 pb-2">{compoundName}</h3>
          )}
          <div className="mx-auto flex min-h-[240px]"""
    )


start_str = "        {/* Drug-likeness Card */}"
end_str = "        {/* Structural Alerts Card */}"

drug_likeness_box = ""
if start_str in content and end_str in content:
    start_idx = content.find(start_str)
    end_idx = content.find(end_str)
    drug_likeness_box = content[start_idx:end_idx]
    content = content[:start_idx] + content[end_idx:]

with open(file_path, 'w') as f:
    f.write(content)

with open('drug_likeness.txt', 'w') as f:
    f.write(drug_likeness_box)
    
print("MoleculeViewer patched, drug_likeness saved to drug_likeness.txt")
