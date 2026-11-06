// Diagnóstico: posição de cada bloco (item de layout / fragmento) no site atual × front novo
import { chromium } from 'playwright'
const [site, caminho = '/'] = process.argv.slice(2)
const b = await chromium.launch()
const medir = async (url, h = {}) => {
  const c = await b.newContext({ viewport: { width: 1440, height: 900 } })
  const hdr = h
  if (Object.keys(hdr).length) await c.route('http://front:3000/**', (r) => r.continue({ headers: { ...r.request().headers(), ...hdr } }))
  const p = await c.newPage()
  await p.goto(url, { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {})
  await p.waitForTimeout(1500)
  const r = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-layout-structure-item-id]')].map((e) => { const x = e.getBoundingClientRect(); return [e.getAttribute('data-layout-structure-item-id'), [Math.round(x.top + scrollY), Math.round(x.height), e.className.split(' ')[0].replace('lfr-layout-structure-item-', '').slice(0, 40)]] })))
  const extra = await p.evaluate(() => ({ body: getComputedStyle(document.body).cssText.length, mainPad: getComputedStyle(document.querySelector('#main-content') || document.body).paddingTop, main: Math.round(document.querySelector('#main-content')?.getBoundingClientRect().top ?? -1) }))
  await c.close()
  return { r, extra }
}
const a = await medir(`${process.env.LIFERAY_URL}/web/${site}${caminho === '/' ? '' : caminho}`)
const n = await medir(`http://front:3000${caminho}`, { 'X-Forwarded-Host': `${site}.localhost` })
console.log('main-content', a.extra, n.extra)
for (const [id, [t, h, nome]] of Object.entries(a.r)) {
  const m = n.r[id]
  if (!m) { console.log('FALTA', nome, t, h); continue }
  if (m[0] !== t || m[1] !== h) console.log(`${nome.padEnd(40)} topo ${t}→${m[0]}  altura ${h}→${m[1]}`)
}
await b.close()
