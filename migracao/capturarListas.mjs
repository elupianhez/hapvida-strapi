// Copia (uma vez) as listas que os formulários consultam: estados e cidades da ouvidoria → front/lib/dados/ouvidoria
import fs from 'node:fs'
const O = (process.env.LIFERAY_URL || '').replace(/\/+$/, '')
const destino = '../front/lib/dados/ouvidoria'
fs.mkdirSync(destino, { recursive: true })
const estados = await (await fetch(`${O}/o/ouvidoria/get-states`)).text()
fs.writeFileSync(`${destino}/estados.txt`, estados)
const ufs = [...estados.matchAll(/([A-Z]{2})=/g)].map((m) => m[1])
const cidades = {}
for (const uf of ufs) cidades[uf] = await (await fetch(`${O}/o/ouvidoria/get-cities?uf=${uf}`)).text()
fs.writeFileSync(`${destino}/cidades.json`, JSON.stringify(cidades))
console.log(`${ufs.length} estados, exemplo ${ufs[0]}: ${cidades[ufs[0]].slice(0, 80)}`)
