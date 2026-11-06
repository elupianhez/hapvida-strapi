// Diagnóstico: requisições de uma página do site atual (filtro por regex)
import { chromium } from 'playwright'
const [site, filtro, ...caminhos] = process.argv.slice(2)
const b = await chromium.launch()
const vistos = new Set()
for (const c of caminhos) {
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
  p.on('request', (r) => { const u = r.url().replace(process.env.LIFERAY_URL, ''); if (new RegExp(filtro).test(u) && !vistos.has(r.method() + u)) { vistos.add(r.method() + u); console.log(c, r.method(), r.resourceType(), u.slice(0, 220)) } })
  await p.goto(`${process.env.LIFERAY_URL}/web/${site}${c}`, { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {})
}
await b.close()
