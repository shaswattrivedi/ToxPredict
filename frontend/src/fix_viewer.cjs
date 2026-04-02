const fs = require('fs')
let path = '/Users/shaswat/ToxPredict/ToxPredict/frontend/src/components/MoleculeViewer.jsx'
let txt = fs.readFileSync(path, 'utf8')

let target = `    useEffect(() => {
      if (!smiles) {
        setCompoundName('Molecule Structure')
        return
      }

      const fetchName = async () => {
        try {
          const response = await fetch(\`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/\${encodeURIComponent(smiles)}/synonyms/JSON\`)
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

    const qed = Number(drugLikeness?.qed_score ?? 0)
    const qedPercent = Math.max(0, Math.min(100, qed * 100))
    const qedBarClass = qed > 0.6 ? 'bg-green-500' : qed > 0.4 ? 'bg-amber-500' : 'bg-red-500'`

let replacement = `    useEffect(() => {
      let isMounted = true
      if (!smiles) {
        setCompoundName('Molecule Structure')
        return
      }

      const fetchName = async () => {
        try {
          const response = await fetch(\`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/\${encodeURIComponent(smiles)}/synonyms/JSON\`)
          if (response.ok && isMounted) {
            const data = await response.json()
            if (data.InformationList?.Information?.[0]?.Synonym?.[0]) {
              setCompoundName(data.InformationList.Information[0].Synonym[0])
              return
            }
          }
          if (isMounted) setCompoundName('Unidentified Compound')
        } catch (err) {
          console.error(err)
          if (isMounted) setCompoundName('Molecule Structure')
        }
      }
      fetchName()
      return () => { isMounted = false }
    }, [smiles])`

txt = txt.replace(target, replacement)
fs.writeFileSync(path, txt)
console.log("fixed")
