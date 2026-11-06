// Diagnóstico: avalia uma expressão JS na página do front novo e no site atual
import { chromium } from 'playwright'
const [site, caminho, expr] = process.argv.slice(2)
const b = await chromium.launch()
for (const [nome, url, hdr] of [['ATUAL', `${process.env.LIFERAY_URL}/web/${site}${caminho === '/' ? '' : caminho}`, null], ['NOVO', `http://front:3000${caminho}`, `${site}.localhost`]]) {
  const c = await b.newContext({ viewport: { width: 1440, height: 900 } })
  if (hdr) await c.route('http://front:3000/**', (r) => r.continue({ headers: { ...r.request().headers(), 'x-forwarded-host': hdr } }))
  const p = await c.newPage()
  p.on('pageerror', (e) => console.log(nome, 'pageerror', e.message.slice(0, 160)))
  await p.goto(url, { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {})
  await p.waitForTimeout(2000)
  console.log(nome, await p.evaluate(expr).catch((e) => 'erro: ' + e.message))
  await c.close()
}
await b.close()
