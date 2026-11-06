// Diagnóstico: elementos de um bloco com tamanho/estilo diferente entre site atual e front novo
import { chromium } from 'playwright'
const [site, caminho, seletor] = process.argv.slice(2)
const b = await chromium.launch()
const medir = async (url, h = {}) => {
  const c = await b.newContext({ viewport: { width: 1440, height: 900 } })
  const hdr = h
  if (Object.keys(hdr).length) await c.route('http://front:3000/**', (r) => r.continue({ headers: { ...r.request().headers(), ...hdr } }))
  const p = await c.newPage()
  await p.goto(url, { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {})
  await p.waitForTimeout(1500)
  const r = await p.evaluate((sel) => [...document.querySelectorAll(`${sel}, ${sel} *`)].filter((e) => !["STYLE","SCRIPT"].includes(e.tagName)).slice(0, 400).map((e) => { const x = e.getBoundingClientRect(); const s = getComputedStyle(e); return { el: `${e.tagName.toLowerCase()}.${[...e.classList].slice(0, 2).join('.')}`, h: Math.round(x.height), w: Math.round(x.width), mt: s.marginTop, mb: s.marginBottom, pt: s.paddingTop, pb: s.paddingBottom, lh: s.lineHeight, fs: s.fontSize, ff: s.fontFamily.slice(0, 20), d: s.display } }), seletor)
  await c.close()
  return r
}
const a = await medir(`${process.env.LIFERAY_URL}/web/${site}${caminho === '/' ? '' : caminho}`)
const n = await medir(`http://front:3000${caminho}`, { 'X-Forwarded-Host': `${site}.localhost` })
console.log(`elementos: ${a.length} × ${n.length}`)
let mostrados = 0
for (let i = 0; i < Math.max(a.length, n.length) && mostrados < 60; i++) {
  const x = a[i], y = n[i]
  if (!x || !y || x.el !== y.el) { console.log('ESTRUTURA', i, x?.el, '×', y?.el); mostrados++; continue }
  const dif = Object.keys(x).filter((k) => x[k] !== y[k])
  if (dif.length) { console.log(x.el.padEnd(45), dif.map((k) => `${k}: ${x[k]} → ${y[k]}`).join(' | ')); mostrados++ }
}
await b.close()
