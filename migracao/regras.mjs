// Diagnóstico: regras CSS que se aplicam a um elemento (propriedade filtrada), no site atual e no front novo
import { chromium } from 'playwright'
const [site, caminho, seletor, prop] = process.argv.slice(2)
const b = await chromium.launch()
const ver = async (url, h = {}) => {
  const c = await b.newContext({ viewport: { width: 1440, height: 900 } })
  const hdr = h
  if (Object.keys(hdr).length) await c.route('http://front:3000/**', (r) => r.continue({ headers: { ...r.request().headers(), ...hdr } }))
  const p = await c.newPage()
  await p.goto(url, { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {})
  const r = await p.evaluate(([sel, prop]) => {
    const el = document.querySelector(sel)
    if (!el) return ['elemento não encontrado']
    const out = [`style inline: ${el.getAttribute('style') || '-'}`, `pai: ${el.parentElement.outerHTML.slice(0, 200)}`]
    const andar = (rules, origem) => {
      for (const r of rules) {
        if (r.cssRules && !r.selectorText) andar(r.cssRules, origem)
        else if (r.selectorText) { try { if (el.matches(r.selectorText) && r.style.getPropertyValue(prop) !== '' ) out.push(`${origem}: ${r.selectorText.slice(0, 120)} { ${prop}: ${r.style.getPropertyValue(prop)} }`) } catch {} }
      }
    }
    for (const s of document.styleSheets) { try { andar(s.cssRules, (s.href || 'inline:' + (s.ownerNode?.textContent || '').slice(0, 40).replace(/\s+/g, ' '))) } catch {} }
    return out
  }, [seletor, prop])
  await c.close()
  return r
}
console.log('ATUAL\n ' + (await ver(`${process.env.LIFERAY_URL}/web/${site}${caminho === '/' ? '' : caminho}`)).join('\n '))
console.log('NOVO\n ' + (await ver(`http://front:3000${caminho}`, { 'X-Forwarded-Host': `${site}.localhost` })).join('\n '))
await b.close()
